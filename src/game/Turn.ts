import { GetBaseDamage, GetDamageModifier } from './DamageFunctions';
import { GetMoveOrder } from './BattleFunctions';
import {
    DamageEvent, FaintedPokemonEvent, HealEvent, SwitchInEvent, SwitchOutEvent, UseItemEvent, UseMoveEvent as UseTechniqueEvent, BattleEventType,
    BattleEvent,
    StatusChangeEvent
} from "./BattleEvents";
import { SwitchPokemonAction, BattleAction, Actions, UseMoveAction, ForcedTechniqueAction } from "./BattleActions";
import GetHardStatus, { Status } from './HardStatus/HardStatus';
import { CalculateStatWithBoost, Pokemon } from './Pokemon/Pokemon';
import { Technique } from './Techniques/Technique';
import { GetActivePokemon, GetPokemonOwner } from './HelperFunctions';
import { Player } from './Player/PlayerBuilder';
import GetAbility from './Ability/Ability';
import { BattleEffect, DoEffect, EffectType, InflictVolatileStatus, TargetType } from './Effects/Effects';
import { SubstituteVolatileStatus, VolatileStatusType } from './VolatileStatus/VolatileStatus';
import { Item } from './Items/Item';
import _ from 'lodash';
import { GetDamageEffect } from './DamageEffects/DamageEffects';
import { EntryHazard } from './EntryHazards/EntryHazard';
import BattleBehaviour from './BattleBehaviour/BattleBehavior';
import { Stat } from './Stat';
import { TypedEvent } from './TypedEvent/TypedEvent';
import { Weather } from './Weather/Weather';
import { FieldEffect } from './FieldEffects/FieldEffects';
import { GetTech } from './Techniques/PremadeTechniques';

export type TurnState = 'awaiting-initial-actions' | 'awaiting-switch-action' | 'turn-finished' | 'game-over' | 'calculating-turn';

export interface Field {
    players: Array<Player>,
    entryHazards?: Array<EntryHazard>,
    weather?: Weather,
    fieldEffects?: Array<FieldEffect>, //for effects like light screen / reflect / wish etc.
}


enum TurnStep {
    PreAction1 = 'pre-action-1',
    Action1 = 'action1',
    PostAction1 = 'post-action-1',
    PreAction2 = 'pre-action-2',
    Action2 = 'action-2',
    PostAction2 = 'post-action-2',
    BeforeEnd = 'before-end',
    End = 'end'
}

interface State {
    type: TurnState,
    winningPlayerId?: number
}

export interface OnGameOverArgs {
    winningPlayer?: Player,
    losingPlayer?: Player,
}

export interface OnNewTurnLogArgs {
    currentTurnLog: Array<BattleEvent>,
    eventsSinceLastTime: Array<BattleEvent>,
    field: Field,
    currentTurnState: TurnState,
    waitingForSwitchIds: Array<number>
    winningPlayerId?: number | undefined
}
export interface OnActionNeededArgs {
    turnId:number,
    playerIDsNeeded: Array<number>,
    currentlyStoredActions: Array<BattleAction>,
}
export interface OnSwitchNeededArgs{
    turnId:number,
    playerIDsNeeded:Array<number>,
    currentlyStoredSwitchActions:Array<BattleAction>
}



export class Turn {
    id: number; //Turn specific property
    field: Field; //Battle specific property

    eventLog: Array<BattleEvent> = [];
    //Events that have occured since the last time it was calculated. (In case the turn stops calculating half way through due to a switch needed)
    eventLogSinceLastAction: Array<BattleEvent> = [];
    nextEventId: number = 1; //next id for when we have a new event.

    initialActions: Array<BattleAction> = [];
    //Cached move order
    private _moveOrder: Array<BattleAction> = [];

    //Stores a list of players who currently have a fainted pokemon, these players will need to switch their pokemon out.
    playersWhoNeedToSwitch: Array<Player> = [];
    //Stores the fainted pokemon actions if a player needs to switch thier pokemon.
    private _switchNeededActions: Array<SwitchPokemonAction> = [];



    //Turn State Variables
    currentBattleStep = TurnStep.PreAction1;
    currentState: State = { type: 'awaiting-initial-actions' }
    turnOver: boolean = false;

    OnTurnFinished = new TypedEvent<{}>();
    OnNewLogReady = new TypedEvent<OnNewTurnLogArgs>();
    OnSwitchNeeded = new TypedEvent<OnSwitchNeededArgs>();
    OnActionNeeded = new TypedEvent<OnActionNeededArgs>();
    OnGameOver = new TypedEvent<OnGameOverArgs>();

    //HACK to see if this fixes an issue, not sure of the exact cause of the issue though
    turnFinishedEventFired: boolean = false;

    //This is used for our AI vs AI battles, processing our game events takes a while due to us using a _deepClone to save state whenever we add an event. Since the AI doesn't need 
    //to use these events we should be able to turn it off to save a lot of time.
    shouldProcessEvents: boolean = false;

    constructor(turnId: number, initialState: Field, shouldProcessEvents: boolean) {
        this.id = turnId;
        if (initialState.entryHazards === undefined) {
            initialState.entryHazards = [];
        }
        this.field = _.cloneDeep(initialState);
        GetActivePokemon(this.field.players[0]).canAttackThisTurn = true;
        GetActivePokemon(this.field.players[1]).canAttackThisTurn = true;
        this.shouldProcessEvents = shouldProcessEvents;
    }


    GetEventLog(): Array<BattleEvent> {
        return this.eventLog;
    }


    SetInitialPlayerAction(action: BattleAction) {
        if (this.currentState.type === 'game-over') {
            return;
        }
        const actionExistsForPlayer = this.initialActions.filter(act => act.playerId === action.playerId);

        if (actionExistsForPlayer.length === 0) {

            if (action.type === Actions.UseTechnique) {

                //if the pp of the used tecnique is 0.. then use struggle

                const actionPokemon = this.GetPokemon(action.pokemonId);

                const technique = actionPokemon.techniques.find(tech => tech.id === (action as UseMoveAction).moveId);
                if (technique === undefined) {
                    throw new Error(`Could not find technique to use in set initial player action action: ${JSON.stringify(action)}, pokemon: ${JSON.stringify(actionPokemon)}, techId: ${action.moveId}`);
                }
                if (technique.currentPP <= 0) {
                    const forcedStruggleAction: ForcedTechniqueAction = {
                        playerId: action.playerId,
                        pokemonId: action.pokemonId,
                        type: Actions.ForcedTechnique,
                        technique: GetTech("struggle")
                    }

                    this.initialActions.push(forcedStruggleAction);
                }
                else {
                    this.GetBehavioursForPokemon(this.GetPokemon(action.pokemonId)).forEach(b => {
                        if (action.type !== Actions.UseTechnique) {
                            return;
                        }
                        action = b.OverrideAction(this, this.GetPlayer(action.playerId), this.GetPokemon(action.pokemonId), action)
                    })
                    this.initialActions.push(action);
                }
            }
            else {
                this.initialActions.push(action);
            }

        }
        else {       
            return;
        }
        if (this.initialActions.length === 2 && this.currentState.type === 'awaiting-initial-actions') {
            this.currentState = {
                type: 'calculating-turn'
            }

            
            
            this.CalculateTurn();
        }
    }

    //Overrides whatever action a player has selected 
    OverridePlayerAction(action: BattleAction) {
        //remove the existing action
        this.initialActions = this.initialActions.filter(act => act.playerId !== action.playerId);
        //push the new action in.
        this.initialActions.push(action);
    }

    StartTurn() {
        //StartTurn() method - place in forced actions
        //StartTurn() method - check which players still need to choose an action
        //StartTurn() method - fire an event with the information needed for players to choose an action
        /*
    Forced Actions i.e. moves that must be repeated like Rollout or Outrage happen here.
    ForcedActions mean's the user won't even get to select any action for their turn.
*/

        const pokemon1 = GetActivePokemon(this.field.players[0]);
        const pokemon2 = GetActivePokemon(this.field.players[1]);

        this.GetBehavioursForPokemon(pokemon1).forEach(b => {
            b.ForceAction(this, GetPokemonOwner(this.field.players, pokemon1), pokemon1);
        });
        this.GetBehavioursForPokemon(pokemon2).forEach(b => {
            b.ForceAction(this, GetPokemonOwner(this.field.players, pokemon2), pokemon2);
        });

        //Check which players still need to choose an action

        const playersWithActions= this.initialActions.map(act => act.playerId);
        const playersWeNeedActionsFor = this.GetPlayers().filter(player=>{
            if (!playersWithActions.includes(player.id)){
                return true
            }
            return false;
        }).map(player=>player.id);


        if (playersWeNeedActionsFor.length > 0) {
            this.OnActionNeeded.emit({
                turnId:this.id,
                playerIDsNeeded: playersWeNeedActionsFor,
                currentlyStoredActions: [...this.initialActions]
            });
        }

    }

    Update() {
        const pokemon1 = GetActivePokemon(this.GetPlayers()[0]);
        const pokemon2 = GetActivePokemon(this.GetPlayers()[1]);
        this.GetBehavioursForPokemon(pokemon1).forEach(b => b.Update(this, pokemon1));
        this.GetBehavioursForPokemon(pokemon2).forEach(b => b.Update(this, pokemon2));
    }

    SetSwitchPromptAction(action: SwitchPokemonAction) {

        if (action.type !== 'switch-pokemon-action') {
            throw new Error(`Invalid action type being processed in SetSwitchPromptAction....`);
        }

        if (this.playersWhoNeedToSwitch.filter(p => p.id === action.playerId).length === 0) {
            throw new Error("Invalid command in SetSwitchPromptPokemonAction, this player should not be switching a pokemon");
        }

        if (this._switchNeededActions.filter((act) => {
            return act.playerId === action.playerId
        }).length > 0) {
            throw new Error(`Player tried to submit 2 switch fainted pokemon actions: id : ${action.playerId}`);
        }
        this._switchNeededActions.push(action);

        const player = this.playersWhoNeedToSwitch.find(p => p.id === action.playerId);
        if (player === undefined) {
            throw new Error('could not find player');
        }

        const index = this.playersWhoNeedToSwitch.indexOf(player);
        this.playersWhoNeedToSwitch = [...this.playersWhoNeedToSwitch];
        this.playersWhoNeedToSwitch.splice(index,1);

   
        if (this.playersWhoNeedToSwitch.length === 0) {
            this._switchNeededActions.forEach(act => {
                const player = this.GetPlayer(act.playerId);
                const pokemon = this.GetPokemon(act.switchPokemonId);
                this.SwitchPokemon(player, pokemon);
            });

            this._switchNeededActions = [];//reset the switch needed actions.

            this.currentState = {
                type: 'calculating-turn'
            };

            
            this.CalculateTurn();
        }
    }

    //Adds a message that will be displayed in the UI.
    AddMessage(message: string) {
        this.AddEvent({
            type: BattleEventType.GenericMessage,
            defaultMessage: message
        }
        );
    }

    GetEntryHazards(): Array<EntryHazard> {
        return this.field.entryHazards === undefined ? [] : this.field.entryHazards
    }
    GetPlayers() {
        return this.field.players;
    }

    //Use this when we need to have a BattleBehaviour operate on a specific pokemon

    //The weather  here is a big issue, we really only want it to run once and not for each pokemon, thats we have these 2 different functions,
    //it is possible the way we are doing things needs to be updated to make sense for weather.
    GetBehavioursForPokemon(pokemon: Pokemon) {
        //const weather = this.field.weather ? [this.field.weather] : [];
        return (
            this.field.fieldEffects!.filter(fe => fe.playerId === this.GetPokemonOwner(pokemon).id) as Array<BattleBehaviour>)
            .concat(pokemon.volatileStatuses as Array<BattleBehaviour>)
            //.concat(weather)
            .concat([GetAbility(pokemon.ability)] as Array<BattleBehaviour>)
            .concat([GetHardStatus(pokemon.status)] as Array<BattleBehaviour>)
            .concat([pokemon.heldItem]);
    }


    private BeforeEndOfTurn() {
        const activePokemon = this.GetPlayers().map(player => this.GetActivePokemon(player.id));
        activePokemon.forEach(pokemon => {
            this.GetBehavioursForPokemon(pokemon).forEach(bBehaviour => {
                if (pokemon.currentStats.hp <= 0) {
                    return; //guard clause against potential deaths at EOT. Otherwise, if for example, poison kills the pokemon you might have something like leftovers which could heal the pokemon which would cause this weird game state.
                }
                bBehaviour.EndOfTurn(this, pokemon)
            });
        })
        //weather gets put here.
        //this is requiring a pokemon when we don't need one....
        //So this is an anti pattern...
        if (this.field.weather !== undefined) {
            this.field.weather.EndOfTurn(this)
        }
    }

    //Any status conditions or whatever that must apply before the pokemon starts to attack.
    private BeforeAttack(pokemon: Pokemon, techUsed: Technique) {

        if (!pokemon.canAttackThisTurn) {
            return;
        }
        this.GetBehavioursForPokemon(pokemon).forEach(b => {
            if (!pokemon.canAttackThisTurn) {
                return;
            }
            b.BeforeAttack(this, pokemon);
        });

        /*
            Our unthaw effect is located here until we figure out a way to do it better.           
        */
        if (techUsed.beforeExecuteEffect?.type === EffectType.StatusRestore && techUsed.beforeExecuteEffect.forStatus === Status.Frozen) {
            if (pokemon.status === Status.Frozen) {
                let statusRestoreEffect: StatusChangeEvent = {
                    type: BattleEventType.StatusChange,
                    status: Status.None,
                    targetPokemonId: pokemon.id,
                    defaultMessage: `${pokemon.name}  has thawed out from using ${techUsed.name}`
                }
                this.AddEvent(statusRestoreEffect);
                pokemon.status = Status.None;
                pokemon.canAttackThisTurn = true;
            }
        }
    }

    private DoAction(action: BattleAction) {
        switch (action.type) {
            case 'switch-pokemon-action': {

                const player = this.GetPlayer(action.playerId);
                const pokemonToSwitchIn = this.GetPokemon(action.switchPokemonId);

                this.SwitchPokemon(player, pokemonToSwitchIn);
                break;
            }
            case 'use-item-action': {

                const player = this.GetPlayer(action.playerId);
                const item = player.items.find(item => {
                    return item.id === action.itemId
                })
                if (item === undefined) {
                    throw new Error('Could not find item to use for use-item-action');
                }

                this.UseItem(player, item);

                break;
            }
            case Actions.UseTechnique: {

                const player = this.GetPlayer(action.playerId);
                const pokemon = this.GetPokemon(action.pokemonId);
                const defendingPokemon = this.GetDefendingPokemon(player);
                const technique = pokemon.techniques.find(move => move.id === action.moveId);

                if (technique === undefined) {
                    throw new Error('Could not find move to use in DoAction')
                }

                this.UseTechnique(pokemon, defendingPokemon, technique);
                break;
            }
            //When we need to force a player to do an action, like outrage / hyperbeam fatigue etc... 
            case Actions.ForcedTechnique: {
                const player = this.GetPlayer(action.playerId);
                const pokemon = this.GetPokemon(action.pokemonId);
                const defendingPokemon = this.GetDefendingPokemon(player);
                const technique = action.technique;

                if (technique === undefined) {
                    throw new Error('Could not find move to use in DoAction')
                }

                this.UseTechnique(pokemon, defendingPokemon, technique);
                break;

            }
        }
    }

    //For testing only
    SetStatusOfPokemon(pokemonId: number, status: Status) {
        this.GetPokemon(pokemonId).status = status;
    }

    PromptForSwitch(pokemon: Pokemon) {
        if (this.currentState.type!=='game-over'){
            const owner = this.GetPokemonOwner(pokemon);
            //TODO - This needs to be a prompt now, not just for fainted pokemon.
            if (this.playersWhoNeedToSwitch.map(p=>p.id).includes(owner.id)){
                return; //make sure player is not added to switch their pokemon twice at the same time.
            }
            else{
                this.playersWhoNeedToSwitch.push(owner);
                this.currentState = { type: 'awaiting-switch-action' }
            }
        }
    }

    private PokemonFainted(pokemon: Pokemon) {
        const faintedPokemonEffect: FaintedPokemonEvent = {
            targetPokemonId: pokemon.id,
            type: BattleEventType.PokemonFainted,
        };
        this.AddEvent(faintedPokemonEffect);

        const owner = this.GetPokemonOwner(pokemon);

        pokemon.status = Status.None;
        pokemon.volatileStatuses = [];

        //game over check.
        if (owner.pokemon.filter(poke => poke.currentStats.hp > 0).length === 0) {
            const winningPlayer = this.GetPlayers().filter(player => player.id !== owner.id)[0];
            this.currentState = {
                type: 'game-over',
                winningPlayerId: winningPlayer.id
            }
        }
        else {
            this.PromptForSwitch(pokemon);
        }
    }

    ApplyHealing(pokemon: Pokemon, amount: number) {
        const itemHealAmount = amount;
        const healing = Math.min(pokemon.originalStats.hp - pokemon.currentStats.hp, itemHealAmount);
        pokemon.currentStats.hp = Math.min(pokemon.originalStats.hp, pokemon.currentStats.hp + itemHealAmount);
        let itemEffect: HealEvent = {
            type: BattleEventType.Heal,
            targetPokemonId: pokemon.id,
            targetFinalHealth: pokemon.currentStats.hp,
            totalHealing: healing,
        }
        this.AddEvent(itemEffect);
    }

    ApplyIndirectDamage(pokemon: Pokemon, damage: number) {


        this.GetBehavioursForPokemon(pokemon).forEach(b => { damage = b.ModifyIndirectDamage(this, pokemon, damage) });

        if (damage === 0) {
            return;
        }
        pokemon.currentStats.hp -= Math.ceil(damage);
        pokemon.currentStats.hp = Math.max(0, pokemon.currentStats.hp);

        const damageEffect: DamageEvent = {
            type: BattleEventType.Damage,
            targetPokemonId: pokemon.id,
            attackerPokemonId: pokemon.id, //this is wrong, we need a way to pass this into this function 
            targetFinalHealth: pokemon.currentStats.hp,
            targetDamageTaken: damage,
            didCritical: false,
            effectivenessAmt: 1
        }
        this.AddEvent(damageEffect);
        if (pokemon.currentStats.hp <= 0) {
            this.PokemonFainted(pokemon);
        }
    }

    ApplyDamageToSubstitute(attackingPokemon: Pokemon, defendingPokemon: Pokemon, damage: number) {
        const substitute = defendingPokemon.volatileStatuses.find(vStat => {
            return vStat.type === VolatileStatusType.Substitute
        }) as SubstituteVolatileStatus;

        if (substitute === undefined){
            console.error("substitute was undefined when we tried to apply damage to it",this);
        }
        substitute.Damage(this, defendingPokemon, damage);

        this.GetBehavioursForPokemon(attackingPokemon).forEach(bBehaviour => {
            bBehaviour.OnDamageDealt(this, attackingPokemon, defendingPokemon, damage);
        });
    }

    ApplyDamage(attackingPokemon: Pokemon, defendingPokemon: Pokemon, damage: number, damageInfo: any) {


        if (damageInfo.typeEffectivenessBonus !== undefined && damageInfo.typeEffectivenessBonus === 0) {
            this.AddMessage("It had no effect!");
            return;
        }

        //Round the damage to prevent decimals from showing up.
        damage = Math.max(1, Math.round(damage));

        if (defendingPokemon.hasSubstitute) {
            this.ApplyDamageToSubstitute(attackingPokemon, defendingPokemon, damage);
            return;
        }

        defendingPokemon.currentStats.hp -= damage
        defendingPokemon.currentStats.hp = Math.max(0, defendingPokemon.currentStats.hp);

        const damageEffect: DamageEvent = {
            type: BattleEventType.Damage,
            targetPokemonId: defendingPokemon.id,
            attackerPokemonId: attackingPokemon.id, //this is wrong, we need a way to pass this into this function 
            targetFinalHealth: defendingPokemon.currentStats.hp,
            targetDamageTaken: damage,
            didCritical: damageInfo.critStrike === undefined ? false : damageInfo.critStrike,
            effectivenessAmt: damageInfo.typeEffectivenessBonus === undefined ? 1 : damageInfo.typeEffectivenessBonus,
        };

        this.AddEvent(damageEffect);

        //Our messages would go here instead;

        if (damageEffect.didCritical) {
            this.AddMessage("It was a critical hit");
        }
        if (damageEffect.effectivenessAmt > 1.0) {
            this.AddMessage("It was super effective");
        }
        else if (damageEffect.effectivenessAmt < 1.0) {
            this.AddMessage("It wasn't very effective");
        }
        else if (damageEffect.effectivenessAmt === 0) {
            this.AddMessage("It had no effect!")
        }

        this.GetBehavioursForPokemon(attackingPokemon).forEach(bBehaviour => {
            bBehaviour.OnDamageDealt(this, attackingPokemon, defendingPokemon, damage);
        });

        if (defendingPokemon.currentStats.hp <= 0) {
            this.PokemonFainted(defendingPokemon)
        }
    }


    private CalculateTurn() {

        const actionOrder = this.GetMoveOrder();

        const firstAction = actionOrder[0];
        const secondAction = actionOrder[1];
        //get the propert current pokemon based on the action order
        const currentPokemon1 = this.GetActivePokemon(firstAction.playerId);
        const currentPokemon2 = this.GetActivePokemon(secondAction.playerId);

        const preActionStep = (action: BattleAction, currentPokemon: Pokemon) => {
            if (action.type !== Actions.UseTechnique && action.type !== Actions.ForcedTechnique) {
                return;
            }
            let currentTechnique;
            if (action.type === Actions.UseTechnique) {
                currentTechnique = this.GetPokemon(action.pokemonId).techniques.find(tech => tech.id === action.moveId);
            }
            else {
                currentTechnique = action.technique;
            }
            if (currentTechnique === undefined) {
                throw new Error(`Could not find technique: ${JSON.stringify(action)}`);
            }
            this.BeforeAttack(currentPokemon, currentTechnique);
        }

        const actionStep = (action: BattleAction, currentPokemon: Pokemon) => {
            if ((action.type === Actions.UseTechnique || action.type === Actions.ForcedTechnique) && !currentPokemon.canAttackThisTurn) {
                return;
            }
            if ((action.type === Actions.UseTechnique || action.type === Actions.ForcedTechnique) && currentPokemon.id !== action.pokemonId) {
                return;
            }

            this.DoAction(action);
        }

        const nextStateLookups = [
            {
                current: TurnStep.PreAction1,
                next: TurnStep.Action1,
                func: () => preActionStep(firstAction, currentPokemon1)
            },
            {
                current: TurnStep.Action1,
                next: TurnStep.PostAction1,
                func: () => actionStep(firstAction, currentPokemon1)
            },
            {
                current: TurnStep.PostAction1,
                next: TurnStep.PreAction2,
                func: () => { this.GetBehavioursForPokemon(currentPokemon1).forEach(b => b.AfterActionStep(this, currentPokemon1)) }

            },
            {
                current: TurnStep.PreAction2,
                next: TurnStep.Action2,
                func: () => preActionStep(secondAction, currentPokemon2)
            },
            {
                current: TurnStep.Action2,
                next: TurnStep.PostAction2,
                func: () => actionStep(secondAction, currentPokemon2)
            },
            {
                current: TurnStep.PostAction2,
                next: TurnStep.BeforeEnd,
                func: () => { this.GetBehavioursForPokemon(currentPokemon2).forEach(b => b.AfterActionStep(this, currentPokemon2)) }
            },
            {
                current: TurnStep.BeforeEnd,
                next: TurnStep.End,
                func: () => { this.BeforeEndOfTurn() }
            },
            {
                current: TurnStep.End,
                next: undefined,
                func: () => { this.EndTurn() }
            }
        ];

        while (this.currentState.type !== 'awaiting-switch-action' && this.currentState.type !== 'turn-finished' && this.currentState.type !== 'game-over' && this.turnOver === false) {


            var startStep = nextStateLookups.find((e) => {
                return e.current === this.currentBattleStep
            });

            if (startStep === undefined) {
                throw new Error("Could not find proper battle step state");
            }
            startStep.func();


            this.Update();
            //Go to the next state
            if (startStep.next !== undefined) {
                this.currentBattleStep = startStep.next;
            }
        }

        this.EmitNewTurnLog();

        
     
        if (this.currentState.type === 'awaiting-switch-action' && this.turnOver === false) {
            const switchNeededInfo = {
                turnId:this.id,
                playerIDsNeeded:this.playersWhoNeedToSwitch.map(p=>p.id),
                currentlyStoredSwitchActions:this._switchNeededActions
            }
            this.OnSwitchNeeded.emit(switchNeededInfo);
        }
        //THE REASON WAS HERE! FORGOT AN ELSE STATEMENT.... IT IS POSSIBLE THAT OUR ON SWITCH NEEDED EVENT IS HANDLEDED RIGHT AWAY.
        else if (this.currentState.type === 'turn-finished'&& this.turnOver === false)  { 
            

            //When we run our AI vs AI events, this can somehow fire twice for one turn.... the question is why?.... I've written so many console messages and i'm not sure what is going on.
            //It must be some sort of race condition, but it doens't make sense.... This is a simple hack to fix the issue, although the cause of the problem remains unknown.
            //Basically this fires twice, causing an entire turn to be skipped but yet the AI will still try to use a move for the turn that was skipped while at the same time use a move for the current turn as well.
            //this will eventually error out as we will have an invalid technique used (usually due to a pokemon fainting and needing to be switched out)
           // if (this.turnFinishedEventFired === false){
            
            this.turnFinishedEventFired = true;
            this.turnOver = true;    
            this.OnTurnFinished.emit({});          
               
            //}
        }
        else if (this.currentState.type === 'game-over' && this.turnOver === false) {
            const winningPlayer = this.currentState.winningPlayerId ? this.GetPlayer(this.currentState.winningPlayerId!) : undefined;
            const losingPlayer = this.GetPlayers().find(p => p.id !== this.currentState.winningPlayerId);        
            this.turnOver = true;

            this.OnGameOver.emit({
                winningPlayer: winningPlayer,
                losingPlayer: losingPlayer
            });
            
            
        }
    }

    EmitNewTurnLog() {
        const newTurnLogArgs: OnNewTurnLogArgs = {
            currentTurnLog: [...this.GetEventLog()],
            eventsSinceLastTime: [...this.eventLogSinceLastAction],
            field: /*_.cloneDeep*/(this.field),
            winningPlayerId: this.currentState.winningPlayerId,
            currentTurnState: this.currentState.type,
            waitingForSwitchIds: this.playersWhoNeedToSwitch.map(p => p.id)
        };
        this.eventLogSinceLastAction = []; //clear the cached events
        this.OnNewLogReady.emit(newTurnLogArgs);
    }

    SwitchPokemon(player: Player, pokemonIn: Pokemon) {
        const switchOutPokemonId = player.currentPokemonId;
        const switchOutPokemon = this.GetPokemon(switchOutPokemonId);
        switchOutPokemon.volatileStatuses = []; //easy peasy
        switchOutPokemon.hasSubstitute = false; //need to update this as well.. although lets remove it now and make this a function instead.

        const switchInPokemonPos = player.pokemon.indexOf(pokemonIn);
        if (switchInPokemonPos < 0) {
            throw new Error(`Could not find pokemon ${pokemonIn.id} for player ${player.id}`);
        }

        let pokemonArrCopy = player.pokemon.slice();

        const switchInPokemon = pokemonArrCopy[switchInPokemonPos];
        //check to make sure the pokemon can actually be switched in
        if (switchInPokemon.currentStats.hp === 0) {
            throw new Error(`Error tried to switch in pokemon, but it has no health : ${switchInPokemon.name}. Check the UI code or the AI code for most likely reason.`);
        }
        pokemonArrCopy[0] = player.pokemon[switchInPokemonPos];
        pokemonArrCopy[switchInPokemonPos] = player.pokemon[0];

        player.currentPokemonId = pokemonArrCopy[0].id;

        const switchOutEffect: SwitchOutEvent = {
            type: BattleEventType.SwitchOut,
            switchOutPokemonId: switchOutPokemonId!,
            switchInPokemonId: pokemonIn.id,
        }
        this.AddEvent(switchOutEffect);
        const switchInEffect: SwitchInEvent = {
            type: BattleEventType.SwitchIn,
            switchOutPokemonId: switchOutPokemonId!,
            switchInPokemonId: pokemonIn.id,
        }
        this.AddEvent(switchInEffect);

        const entryPokemon = this.GetPokemon(pokemonIn.id);

        this.GetBehavioursForPokemon(switchOutPokemon).forEach(b => {
            b.OnSwitchedOut(this, switchOutPokemon);
        })

        this.GetEntryHazards().forEach(hazard => {
            hazard.OnPokemonEntry(this, this.GetPokemon(pokemonIn.id));
        });
        this.GetBehavioursForPokemon(entryPokemon).forEach(b => {
            b.OnPokemonEntry(this, entryPokemon);
        });
    }

    UseItem(player: Player, item: Item) {
        const pokemon = this.GetActivePokemon(player.id);
        const useItemEffect: UseItemEvent = {
            type: BattleEventType.UseItem,
            itemName: item.name,
            itemId: item.id,
            targetPokemonId: pokemon.id
        }
        this.AddEvent(useItemEffect);

        item.effects.forEach((effect: BattleEffect) => {
            //we could do a little bit of a hack here, have the source here be the pokemon as well, so that this will always apply?
            DoEffect(this, pokemon, effect, { sourceItem: item });
        }
        );

        item.quantity -= 1;
        //remove item from inventory.
        if (item.quantity <= 0) {
            const itemIndex = player.items.indexOf(item);
            player.items.splice(itemIndex, 1);
        }

    }

    UseTechnique(pokemon: Pokemon, defendingPokemon: Pokemon, technique: Technique) {
        const useTechniqueEffect: UseTechniqueEvent = {
            type: BattleEventType.UseTechnique,
            userId: pokemon.id,
            targetId: defendingPokemon.id,
            didTechniqueHit: true,
            techniqueName: technique.name,

        }
        this.AddEvent(useTechniqueEffect);

        technique.currentPP -= 1;

        //quick hack for the pressure ability, perhaps we want an OnOppTechniqueUsed event?
        this.GetBehavioursForPokemon(defendingPokemon).forEach(b => {
            b.OnOppTechniqueUsed(this, pokemon, technique);
        })

        //Make sure we only store the technique used last as a technique the pokemon actually has. (in case of forced actions or any metronome type effects)
        if (pokemon.techniques.find(tech => tech.name === technique.name)) {
            pokemon.techniqueUsedLast = technique.name;
        }


        //2 turn move should apply here?
        if (technique.twoTurnMove) {
            if (technique.firstTurnStatus === undefined) {
                throw new Error(`Need a first turn status defined if using a twoTurnMove. Move name : ${technique.name}`);
            }
            //all two turn moves should inflict a volatile status on the first turn.
            InflictVolatileStatus(this, pokemon, technique.firstTurnStatus, pokemon);
            return;
        }



        const ability = GetAbility(pokemon.ability);
        technique = ability.ModifyTechnique(pokemon, technique);

        if (this.field.weather) {
            technique = this.field.weather.ModifyTechnique(pokemon, technique);
        }
        this.GetBehavioursForPokemon(pokemon).forEach(b => {
            technique = b.ModifyTechnique(pokemon, technique);
        })

        this.GetBehavioursForPokemon(pokemon).forEach(b => {
            b.OnTechniqueUsed(this, pokemon, technique);
        })

        let techniqueNegated = false;
        this.GetBehavioursForPokemon(defendingPokemon).forEach(b => {
            if (techniqueNegated === false) {
                techniqueNegated = b.NegateTechnique(this, pokemon, defendingPokemon, technique);
            }
        });

        if (techniqueNegated) {
            useTechniqueEffect.didTechniqueHit = false;
            this.GetBehavioursForPokemon(pokemon).forEach(b => {
                b.OnTechniqueMissed(this, pokemon);
            });
            return;
        }

        let pokemonAccuracyModifier = 1;

        if (pokemon.statBoosts[Stat.Accuracy] !== 0) {
            pokemonAccuracyModifier = Math.ceil(CalculateStatWithBoost(pokemon, Stat.Accuracy) / 100);
        }
        if (!this.Roll(technique.accuracy * pokemonAccuracyModifier)) {
            useTechniqueEffect.didTechniqueHit = false;
            this.GetBehavioursForPokemon(pokemon).forEach(b => {
                b.OnTechniqueMissed(this, pokemon);
            })
            return;
        }

        if (technique.damageType === 'physical' || technique.damageType === 'special') {

            //Before damage effects
            this.ApplyBeforeDamageEffects(technique, pokemon, defendingPokemon);

            let damage: number = this.DoDamageTechnique(pokemon, defendingPokemon, technique);
            if (damage > 0) {
                this.ApplyTechniqueEffects(technique, pokemon, defendingPokemon, damage);
            }
        }
        else {
            this.DoStatusTechnique(technique, defendingPokemon, pokemon);
        }

    }

    private ApplyBeforeDamageEffects(technique: Technique, pokemon: Pokemon, defendingPokemon: Pokemon) {
        if (technique.beforeExecuteEffect === undefined) {
            return;
        }
        DoEffect(this, defendingPokemon, technique.beforeExecuteEffect, { sourcePokemon: pokemon, sourceTechnique: technique });
    }

    private DoStatusTechnique(technique: Technique, defendingPokemon: Pokemon, pokemon: Pokemon) {
        this.ApplyTechniqueEffects(technique, pokemon, defendingPokemon);
    }

    private ApplyTechniqueEffects(technique: Technique, pokemon: Pokemon, defendingPokemon: Pokemon, techniqueDamage?: number): void {
        if (!technique.effects) {
            return;
        }
        technique.effects.forEach((effect) => {
            const chance = effect.chance === undefined ? 100 : effect.chance;
            const targetType = effect.target === undefined ? TargetType.Enemy : effect.target;
            var targetPokemon = targetType === TargetType.Self ? pokemon : defendingPokemon;


            //quick override for drain effects while we think about the best way to handle this type of effect.
            if (effect.type === 'drain') {
                targetPokemon = pokemon;
            }

            if (this.Roll(chance)) {
                DoEffect(this, targetPokemon, effect, { sourcePokemon: pokemon, sourceTechnique: technique, sourceDamage: techniqueDamage });
            }
        });
    }

    //passing the damage dealt for now,
    private DoDamageTechnique(pokemon: Pokemon, defendingPokemon: Pokemon, technique: Technique): number {

        if (technique.damageEffect) {
            const damageEffect = GetDamageEffect(technique.damageEffect.type);
            technique = damageEffect.ModifyTechnique(pokemon, technique, defendingPokemon, this);
        }

        let infoForDamageCalculating = {
            pokemon: pokemon,
            defendingPokemon: defendingPokemon,
            technique: technique
        }
        /*TODO - be able to modify what gets put in here*/
        if (technique.damageEffect) {
            infoForDamageCalculating = GetDamageEffect(technique.damageEffect.type).ModifyDamageCalculationInfo(this, infoForDamageCalculating)
        }

        const baseDamage = GetBaseDamage(infoForDamageCalculating.pokemon, infoForDamageCalculating.defendingPokemon, infoForDamageCalculating.technique);
        const damageModifierInfo = GetDamageModifier(infoForDamageCalculating.pokemon, infoForDamageCalculating.defendingPokemon, infoForDamageCalculating.technique);
        const totalDamage = Math.ceil(baseDamage * damageModifierInfo.modValue);

        //Abilities/Statuses/VolatileStatuses might be able to modify damage
        let newDamage = totalDamage;

        this.GetBehavioursForPokemon(pokemon).forEach(b => {
            newDamage = b.OnAfterDamageCalculated(pokemon, technique, defendingPokemon, newDamage, damageModifierInfo, this);
        });

        //for the weather as well
        if (this.field.weather) {
            newDamage = this.field.weather.OnAfterDamageCalculated(pokemon, technique, defendingPokemon, newDamage, damageModifierInfo, this)
        }

        //
        let damageNegated = false;
        this.GetBehavioursForPokemon(defendingPokemon).forEach(b => {
            if (damageNegated) {
                return;
            }
            if (b.NegateDamage(this, technique, defendingPokemon)) {
                damageNegated = true;
            }
        });
        if (damageNegated) {
            //no damage will be applied, any messages why will be handled by the ability itslef.
            return 0;
        }

        if (technique.damageEffect && damageModifierInfo.typeEffectivenessBonus !== 0) {
            newDamage = GetDamageEffect(technique.damageEffect.type).ModifyDamageDealt(pokemon, newDamage);
        }

        //TODO: If defending pokemon has a substitute, apply the damage to the defendingPokemon instead.

        this.GetBehavioursForPokemon(defendingPokemon).forEach(b => {
            newDamage = b.ModifyDamageTaken(this, pokemon, defendingPokemon, technique, newDamage);
        })
        this.ApplyDamage(pokemon, defendingPokemon, newDamage, damageModifierInfo);
        this.GetBehavioursForPokemon(defendingPokemon).forEach(b => {
            b.OnDamageTakenFromTechnique(this, pokemon, defendingPokemon, technique, newDamage);
        })
        return newDamage;
    }

    private EndTurn() {
        this.currentState = {
            type: 'turn-finished'
        }
    }
    //move this out
    public Roll(chance: number): boolean {
        const randomChance = this.GetRandomChance();
        if (chance >= 100) {
            return true;
        }
        return chance >= randomChance;
    }

    /*
        PRIVATE INTERNAL METHODS
    */
    private GetRandomChance(): number {
        return Math.round(Math.random() * 100);
    }
    public AddEvent(effect: BattleEvent) {
        if (!this.shouldProcessEvents) {
            return;
        }
        effect.id = this.nextEventId++;
        effect.resultingState = _.cloneDeep(this.field); //TODO - potential bottleneck concern here.
        this.eventLog.push(effect);
        this.eventLogSinceLastAction.push(effect);
    }

    public GetValidSwitchIns(player: Player) {
        return player.pokemon.filter(poke => poke.id !== player.currentPokemonId && poke.currentStats.hp > 0);
    }

    private GetDefendingPokemon(attackingPlayer: Player): Pokemon {
        const defendingPlayer = this.GetPlayers().find(p => p !== attackingPlayer);
        if (defendingPlayer === undefined) {
            throw new Error(`Could not find defending player`);
        }

        const defendingPokemon = this.GetPokemon(defendingPlayer.currentPokemonId);
        return defendingPokemon;
    }

    private GetPlayer(playerId: number): Player {
        const player = this.GetPlayers().find(player => player.id === playerId);
        if (player === undefined) {
            throw new Error(`Could not find player with id ${playerId} `);
        }
        return player;
    }
    private GetPokemon(pokemonId: number): Pokemon {
        const pokemon = this.GetPlayers().map(player => { return player.pokemon }).flat().find(pokemon => pokemon.id === pokemonId);
        if (pokemon === undefined) {
            throw new Error(`Could not find pokemon with id ${pokemonId} `);
        }
        return pokemon;
    }

    private GetActivePokemon(playerId: number): Pokemon {
        const player = this.GetPlayer(playerId);
        const activePokemon = player.pokemon.find(poke => poke.id === player.currentPokemonId);
        if (activePokemon === undefined) {
            throw new Error(`Could not find active pokemon for player with id ${playerId} `)
        }
        return activePokemon;
    }
    GetPokemonOwner(pokemon: Pokemon) {
        const owner = this.GetPlayers().filter(player => {
            return player.pokemon.find(poke => poke.id === pokemon.id) !== undefined
        })[0];

        if (owner === undefined) {
            throw Error(`Could not find owner for pokemon ${pokemon.id + ':' + pokemon.name}`)
        }

        return owner;
    }


    //this needs to be cached due to potential randomness
    GetMoveOrder(): Array<BattleAction> {

        if (this._moveOrder.length === 0) {
            this._moveOrder = GetMoveOrder(this.GetPlayers(), this.initialActions)
            //Pursuit happens here? 
        }
        return this._moveOrder;

    }
};
