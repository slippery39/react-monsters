import _ from "lodash";
import GetAbility from "./Ability/Ability";
import { BattleAction, CreateTechniqueAction, CreateSwitchAction, SwitchPokemonAction, Actions, ForcedTechniqueAction, UseMoveAction } from "./BattleActions";
import BattleBehaviour from "./BattleBehaviour/BattleBehavior";
import { BattleEvent, BattleEventType, DamageEvent, FaintedPokemonEvent, HealEvent, StatusChangeEvent, SwitchInEvent, SwitchOutEvent, UseItemEvent, UseMoveEvent } from "./BattleEvents";
import { GetMoveOrder } from "./BattleFunctions";
import { GetDamageEffect } from "./DamageEffects/DamageEffects";
import { GetDamageModifier, GetBaseDamage } from "./DamageFunctions";
import { BattleEffect, DoEffect, EffectType, InflictVolatileStatus, TargetType } from "./Effects/Effects";
import { EntryHazard } from "./EntryHazards/EntryHazard";
import { FieldEffect } from "./FieldEffects/FieldEffects";
import GetHardStatus, { Status } from "./HardStatus/HardStatus";
import { ClonePlayer, GetActivePokemon, GetAlivePokemon, GetPokemonOwner } from "./HelperFunctions";
import { Item } from "./Items/Item";
import { Player } from "./Player/PlayerBuilder";
import { CalculateStatWithBoost, Pokemon } from "./Pokemon/Pokemon";
import { Stat } from "./Stat";
import { GetTech } from "./Techniques/PremadeTechniques";
import { Technique } from "./Techniques/Technique";
import { TypedEvent } from "./TypedEvent/TypedEvent";
import { VolatileStatusType, SubstituteVolatileStatus } from "./VolatileStatus/VolatileStatus";
import { Weather } from "./Weather/Weather";

/*
This file is for testing out our new updated battle class and what we want from it.
*/

function AutoAssignPokemonIds(players: Array<Player>): void {

    let nextPokemonId = 1;

    players.flat().map(player => {
        return player.pokemon
    }).flat().forEach(pokemon => {
        pokemon.id = nextPokemonId++
    });
}

function AutoAssignItemIds(players: Array<Player>): void {

    let nextItemId = 1;

    players.flat().map(player => {
        return player.items
    }).flat().forEach(item => {
        if (item.id === -1) {
            item.id = nextItemId++;
        }
    });
}

function AutoAssignCurrentPokemonIds(players: Array<Player>): void {
    if (players[0].currentPokemonId === -1) {
        players[0].currentPokemonId = players[0].pokemon[0].id;
    }
    if (players[1].currentPokemonId === -1) {
        players[1].currentPokemonId = players[1].pokemon[0].id;
    }
}

function AutoAssignTechniqueIds(players: Array<Player>): void {

    let nextTechId = 1;

    players.flat().map(player => {
        return player.pokemon
    }).flat().map(pokemon => {
        return pokemon.techniques
    }).flat().forEach(tech => {
        tech.id = nextTechId++;
    });
}


export enum TurnState {
    WaitingForInitialActions = 'awaiting-initial-actions',
    WaitingForSwitchActions = 'awaiting-switch-action',
    TurnFinished = 'turn-finished',
    GameOver = 'game-over',
    CalculatingTurn = 'calculating-turn'
}

export interface Field {
    players: Array<Player>,
    entryHazards: Array<EntryHazard>,
    weather?: Weather,
    fieldEffects?: Array<FieldEffect>, //for effects like light screen / reflect / wish etc.
}


export enum TurnStep {
    PreAction1 = 'pre-action-1',
    Action1 = 'action1',
    PostAction1 = 'post-action-1',
    PreAction2 = 'pre-action-2',
    Action2 = 'action-2',
    PostAction2 = 'post-action-2',
    BeforeEnd = 'before-end',
    End = 'end'
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
    turnId: number,
    playerIDsNeeded: Array<number>,
    currentlyStoredActions: Array<BattleAction>,
}
export interface OnSwitchNeededArgs {
    turnId: number,
    playerIDsNeeded: Array<number>,
    currentlyStoredSwitchActions: Array<BattleAction>
}


export interface IGame {
    GetEvents: () => Array<BattleEvent>,
    GetEventsSinceLastAction: () => Array<BattleEvent>,
    //move order? - keep this in the turn?
    //initial actions? - keep this in the turn?
    GetCurrentState: () => TurnState,
    //turn over: -> not needed for game.
    field: Field,
    OnTurnFinished: TypedEvent<{}>;
    OnNewLogReady: TypedEvent<OnNewTurnLogArgs>
    OnSwitchNeeded: TypedEvent<OnSwitchNeededArgs>
    OnActionNeeded: TypedEvent<OnActionNeededArgs>
    OnGameOver: TypedEvent<OnGameOverArgs>
    shouldProcessEvents: Boolean
    Clone: () => IGame
    SetInitialPlayerAction: (action: BattleAction) => void
    OverridePlayerAction: (action: BattleAction) => void
    StartTurn: () => void
    Update: () => void
    SetSwitchPromptAction: (action: SwitchPokemonAction) => void;
    AddMessage: (message: string) => void;
    GetPlayers: () => Array<Player>;
    GetBehavioursForPokemon: (pokemon: Pokemon) => Array<BattleBehaviour>;
    SetStatusOfPokemon: (pokemonId: number, status: Status) => void;
    PromptForSwitch: (pokemon: Pokemon) => void;
    ApplyHealing: (pokemon: Pokemon, amount: number) => void;
    ApplyStruggleDamage: (pokemon: Pokemon, damage: number) => void;
    ApplyIndirectDamage: (pokemon: Pokemon, damage: number,message?:string) => void;
    ApplyDamageToSubstitute: (attackingPokemon: Pokemon, defendingPokemon: Pokemon, damage: number) => void;
    ApplyDamage: (attackingPokemon: Pokemon, defendingPokemon: Pokemon, damage: number, damageInfo: any) => void;
    EmitNewTurnLog: () => void;
    SwitchPokemon: (player: Player, pokemonIn: Pokemon) => void;
    UseItem: (player: Player, item: Item) => void;
    UseTechnique: (pokemon: Pokemon, defendingPokemon: Pokemon, technique: Technique) => void;
    Roll: (chance: number) => boolean;
    AddEvent: (effect: BattleEvent) => void;
    GetValidSwitchIns: (player: Player) => Array<Pokemon>;
    GetPokemonOwner: (pokemon: Pokemon) => Player;
    GetMoveOrder: () => Array<BattleAction>;
    GetOtherPokemon:(pokemon:Pokemon)=>Pokemon;
}




interface GameOptions {
    processEvents: boolean
}




class BattleGame implements IGame {
    //note this variable gets set at the start but doesn't get updated at the moment, once we move more of the turn stuff over into here we can deal with that.
    currentTurnId: number = 0;
    nextEventId: number = 1;
    field: Field;
    OnNewTurn = new TypedEvent<{}>();
    OnNewLogReady = new TypedEvent<OnNewTurnLogArgs>();
    OnSwitchNeeded = new TypedEvent<OnSwitchNeededArgs>();
    OnActionNeeded = new TypedEvent<OnActionNeededArgs>();
    OnTurnFinished = new TypedEvent<{}>();
    OnGameOver = new TypedEvent<OnGameOverArgs>();
    shouldProcessEvents: boolean = false;


    eventLog: Array<BattleEvent> = [];
    //Events that have occured since the last time it was calculated. (In case the turn stops calculating half way through due to a switch needed)
    eventsSinceLastAction: Array<BattleEvent> = [];


    //Variables from the turn class
    initialActions: Array<BattleAction> = [];
    //Cached move order
    private _moveOrder: Array<BattleAction> = [];
    //Stores a list of players who currently have a fainted pokemon, these players will need to switch their pokemon out.
    playersWhoNeedToSwitch: Array<Player> = [];
    //Stores the fainted pokemon actions if a player needs to switch thier pokemon.
    private _switchNeededActions: Array<SwitchPokemonAction> = [];

    //Turn State Variables
    currentBattleStep = TurnStep.PreAction1;
    currentState: TurnState = TurnState.WaitingForInitialActions;
    winningPlayerId: number = -1; //removed from the current state;

    turnOver: boolean = false;


    //performance purposes:
    pokemonCached:Record<string,Pokemon> = {};




    constructor(players: Array<Player>, processEvents: boolean) {
        if (players.length !== 2) {
            throw new Error(`Need exactly 2 players to properly initialize a battle`);
        }
        this.field = {
            players: [ClonePlayer(players[0]), ClonePlayer(players[1])], //TODO: testing non clone deeped vs clone deeped.
            entryHazards: [],
            weather: undefined,
            fieldEffects: []
        }
        this.shouldProcessEvents = processEvents;
    }

    Initialize() {
        AutoAssignPokemonIds(this.field.players);
        AutoAssignCurrentPokemonIds(this.field.players);
        AutoAssignItemIds(this.field.players);
        AutoAssignTechniqueIds(this.field.players);
        this.NextTurn();
    }

    //New Interface Implementation Here
    GetEvents(): Array<BattleEvent> {
        return this.eventLog;
    }
    GetEventsSinceLastAction(): Array<BattleEvent> {
        return this.eventsSinceLastAction;
    }

    GetCurrentState(): TurnState {
        return this.currentState;
    }

    //Double check this one... might be some spicy things here.
    Clone(): IGame {
        const newGame = new BattleGame(this.field.players, this.shouldProcessEvents);
        newGame.initialActions = [...this.initialActions];
        newGame._moveOrder = [...this._moveOrder];
        newGame.playersWhoNeedToSwitch = [...this.playersWhoNeedToSwitch];
        newGame._switchNeededActions = [...this._switchNeededActions];
        newGame.currentBattleStep = this.currentBattleStep;
        newGame.currentState = this.currentState;
        newGame.winningPlayerId = this.winningPlayerId;
        newGame.turnOver = this.turnOver;
        return newGame;
    }

    SetInitialPlayerAction(action: BattleAction) {
        if (this.currentState === TurnState.GameOver) {
            return;
        }
        const actionExistsForPlayer = this.initialActions.filter(act => act.playerId === action.playerId);

        if (actionExistsForPlayer.length === 0) {

            if (action.type === Actions.UseTechnique) {

                //if the pp of the used tecnique is 0.. then use struggle

                const actionPokemon = this.GetPokemon(action.pokemonId);

                const technique = actionPokemon.techniques.find(tech => tech.id === (action as UseMoveAction).moveId);
                if (technique === undefined) {
                    console.error(`Could not find technique to use in set initial player action action: ${JSON.stringify(action)}, pokemon: ${JSON.stringify(actionPokemon)}, techId: ${action.moveId}`,actionPokemon,action);
                    throw new Error(`Could not find technique to use in set initial player action action: ${JSON.stringify(action)}, pokemon: ${JSON.stringify(actionPokemon)}, techId: ${action.moveId}`);
                }

                //TODO  - right here is where the choice band bug is happening.
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
        if (this.initialActions.length === 2 && this.currentState === TurnState.WaitingForInitialActions) {
            this.currentState = TurnState.CalculatingTurn;
            this.CalculateTurn();
        }
    }
    OverridePlayerAction(action: BattleAction) {
        //remove the existing action
        this.initialActions = this.initialActions.filter(act => act.playerId !== action.playerId);
        //push the new action in.
        this.initialActions.push(action);
    }
    StartTurn() {

        const pokemon1 = GetActivePokemon(this.field.players[0]);
        const pokemon2 = GetActivePokemon(this.field.players[1]);

        pokemon1.canAttackThisTurn = true;
        pokemon2.canAttackThisTurn = true;

        this.GetBehavioursForPokemon(pokemon1).forEach(b => {
            try{
            b.ForceAction(this, GetPokemonOwner(this.field.players, pokemon1), pokemon1);
            }
            catch{
                console.log(this);
                console.log(pokemon1);
                console.log(b);
                throw Error(`error at force action pokemon 1.. trying to check what is causing it`);
            }
        });
        this.GetBehavioursForPokemon(pokemon2).forEach(b => {
            try{
            b.ForceAction(this, GetPokemonOwner(this.field.players, pokemon2), pokemon2);
            }
            catch{
                console.log(this);
                console.log(pokemon2);
                console.log(b);
                throw Error(`error at force action pokemon 2.... trying to see what is causing it`);
            }
        });

        //Check which players still need to choose an action

        const playersWithActions = this.initialActions.map(act => act.playerId);
        const playersWeNeedActionsFor = this.GetPlayers().filter(player => {
            if (!playersWithActions.includes(player.id)) {
                return true
            }
            return false;
        }).map(player => player.id);


        if (playersWeNeedActionsFor.length > 0) {
            this.OnActionNeeded.emit({
                turnId: this.currentTurnId,
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
            console.error("This player should not be switching a pokemon",this,this.field,action);
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

        //TODO : maybe it is here where it is happening?, there is never 2 switch actions in there?
        this.playersWhoNeedToSwitch = this.playersWhoNeedToSwitch.slice();
        _.remove(this.playersWhoNeedToSwitch,(el)=>el.id === player.id);

        if (this.playersWhoNeedToSwitch.length === 0) {
            this._switchNeededActions.forEach(act => {
                const player = this.GetPlayer(act.playerId);
                const pokemon = this.GetPokemon(act.switchPokemonId);
                this.SwitchPokemon(player, pokemon);
            });

            this._switchNeededActions = [];
             if (this.playersWhoNeedToSwitch.length>0){
                 this.CalculateTurn();                
                return;
            }
            else{
                if (this.currentState!==TurnState.GameOver){
                  this.currentState = TurnState.CalculatingTurn;
                }
                this.CalculateTurn();
            }
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

    //Use this when we need to have a BattleBehaviour operate on a specific pokemon

    //The weather  here is a big issue, we really only want it to run once and not for each pokemon, thats we have these 2 different functions,
    //it is possible the way we are doing things needs to be updated to make sense for weather.
    GetBehavioursForPokemon(pokemon: Pokemon):BattleBehaviour[] {
        //const weather = this.field.weather ? [this.field.weather] : [];
        return (
            this.field.fieldEffects!.filter(fe => fe.playerId === this.GetPokemonOwner(pokemon).id) as BattleBehaviour[])
            .concat(pokemon.volatileStatuses as BattleBehaviour[])
            .concat(GetAbility(pokemon.ability))
            .concat(pokemon._statusObj)
            .concat(pokemon.heldItem);
    }


    //For testing only
    SetStatusOfPokemon(pokemonId: number, status: Status) {
        this.GetPokemon(pokemonId).status = status;
        this.GetPokemon(pokemonId)._statusObj = GetHardStatus(status);
    }

    PromptForSwitch(pokemon: Pokemon) {
        if (this.currentState !== TurnState.GameOver) {
            const owner = this.GetPokemonOwner(pokemon);

            if (this.GetValidSwitchIns(owner).length=== 0){ //this should fix the error. not sure why it would be getting prompted here if there are no valid's but who knows.
                return // cannot be prompted to switch if it has no switch ins.
            }
            //TODO - This needs to be a prompt now, not just for fainted pokemon.
            if (this.playersWhoNeedToSwitch.map(p => p.id).includes(owner.id)) {
                return; //make sure player is not added to switch their pokemon twice at the same time.
            }
            else {
                this.playersWhoNeedToSwitch.push(owner);
                this.currentState = TurnState.WaitingForSwitchActions;
            }
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

    //WHy not indirect damage? We had "bugs" where abilities that negate indirect damage made it so 2 pokemon could continue attacking eachother and never die.
    //This is an easy way to fix this. If we had some sort of damage source system we could check whether the indirect damage is from struggle before continuing..
    //but we will leave that for another day.
    ApplyStruggleDamage(pokemon: Pokemon, damage: number) {
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

    ApplyIndirectDamage(pokemon: Pokemon, damage: number,message?:string) {


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
        if (message){
            this.AddMessage(message);
        }
        if (pokemon.currentStats.hp <= 0) {
            this.PokemonFainted(pokemon);
        }
    }


    ApplyDamageToSubstitute(attackingPokemon: Pokemon, defendingPokemon: Pokemon, damage: number) {
        const substitute = defendingPokemon.volatileStatuses.find(vStat => {
            return vStat.type === VolatileStatusType.Substitute
        }) as SubstituteVolatileStatus;

        if (substitute === undefined) {
            console.error("substitute was undefined when we tried to apply damage to it", defendingPokemon);
            throw new Error("substitute was undefined when we tried to apply damage to it");
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

        //There has to be someway to put this into the substitute instead... a redirect damage function?
        if (defendingPokemon.volatileStatuses.find(vStat => vStat.type === VolatileStatusType.Substitute) &&attackingPokemon.ability.toLowerCase()!=="infiltrator")  {
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

    EmitNewTurnLog() {
        if (!this.shouldProcessEvents) {
            return;
        }
        const newTurnLogArgs: OnNewTurnLogArgs = {
            currentTurnLog: [...this.GetEvents()],
            eventsSinceLastTime: [...this.eventsSinceLastAction],
            field: _.cloneDeep(this.field),
            winningPlayerId: this.winningPlayerId,
            currentTurnState: this.currentState,
            waitingForSwitchIds: this.playersWhoNeedToSwitch.map(p => p.id)
        };
        this.eventsSinceLastAction = []; //clear the cached events
        this.OnNewLogReady.emit(newTurnLogArgs);
    }

    SwitchPokemon(player: Player, pokemonIn: Pokemon) {
        const switchOutPokemonId = player.currentPokemonId;
        const switchOutPokemon = this.GetPokemon(switchOutPokemonId);
        switchOutPokemon.volatileStatuses = []; //easy peasy
        switchOutPokemon.hasSubstitute = false; //need to update this as well.. although lets remove it now and make this a function instead.
        switchOutPokemon.techniqueUsedLast = undefined;

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

        this.field.entryHazards.forEach(hazard => {
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

        
        if (technique.currentPP<=0){
            console.log(this);
            console.log(pokemon);
            console.log(technique);
            throw new Error(`pp is less than 0, we should not be using this technique... something is wrong`)
        }

        //edge case for struggle
        if (technique.name.toLowerCase() === "struggle"){
            this.AddMessage(`${pokemon.name} has no usable moves!`);            
        }
    

        const useTechniqueEffect: UseMoveEvent = {
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
        
        if (this.field.weather) {
            technique = this.field.weather.ModifyTechnique(pokemon, technique);
        }
        
        this.GetBehavioursForPokemon(pokemon).forEach(b => {
            technique = b.ModifyTechnique(pokemon, technique);
        })

        //2 turn move should apply here?
        if (technique.twoTurnMove) {

            if (technique.firstTurnStatus === undefined) {
                throw new Error(`Need a first turn status defined if using a twoTurnMove. Move name : ${technique.name}`);
            }
            //all two turn moves should inflict a volatile status on the first turn.
            InflictVolatileStatus(this, pokemon, technique.firstTurnStatus, pokemon);
            return;
        }


        this.GetBehavioursForPokemon(pokemon).forEach(b => {
            b.OnTechniqueUsed(this, pokemon, technique);
        })

        let techniqueNegated = false;
        this.GetBehavioursForPokemon(defendingPokemon).forEach(b => {
            if (techniqueNegated === false) {
                techniqueNegated = b.NegateTechnique(this, pokemon, defendingPokemon, technique);
            }
        });

        this.GetBehavioursForPokemon(pokemon).forEach(b=>{
            if (techniqueNegated === false){
                techniqueNegated = b.NegateOwnTechnique(this,pokemon,defendingPokemon,technique);
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

    Roll(chance: number): boolean {
        const randomChance = this.GetRandomChance();
        if (chance >= 100) {
            return true;
        }
        return chance >= randomChance;
    }
    public AddEvent(effect: BattleEvent) {
        effect.id = this.nextEventId++;
        effect.resultingState = this.shouldProcessEvents? _.cloneDeep(this.field) : this.field;
        this.eventLog.push(effect);
        this.eventsSinceLastAction.push(effect);
    }

    //Slightly different from GetValidActions, this should be used for switch ins that happen as a result of fainting.
    public GetValidSwitchIns(player: Player) {
        return player.pokemon.filter(poke => poke.id !== player.currentPokemonId && poke.currentStats.hp > 0);
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

    private GetRandomChance(): number {
        return Math.round(Math.random() * 100);
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
            const effectSuccess = this.Roll(chance);
            if (effectSuccess) {
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

        const damageModifierInfo = GetDamageModifier(infoForDamageCalculating.pokemon, infoForDamageCalculating.defendingPokemon, infoForDamageCalculating.technique);

        //Note - we are adding in the if crit ignore stat boosts clause into here... until we figure out a cleaner way.
        const baseDamage = GetBaseDamage(infoForDamageCalculating.pokemon, infoForDamageCalculating.defendingPokemon, infoForDamageCalculating.technique, damageModifierInfo.critStrike);

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


    private PokemonFainted(pokemon: Pokemon) {
        const faintedPokemonEffect: FaintedPokemonEvent = {
            targetPokemonId: pokemon.id,
            type: BattleEventType.PokemonFainted,
        };
        this.AddEvent(faintedPokemonEffect);

        const owner = this.GetPokemonOwner(pokemon);

        //TODO - when we update our statuses we would need to update this to use the new method
        pokemon.status = Status.None;
        pokemon._statusObj = GetHardStatus(Status.None);
        pokemon.volatileStatuses = [];

        //Need edge case here for pursuit faints, we should prompt a switch again after pursuit has fainted a pokemon
        let pursuitDeath = false;
        if (this._moveOrder[0].type === Actions.UseTechnique){
            if (this._moveOrder[0].moveName?.toLowerCase() === 'pursuit' && this._moveOrder[1].type==='switch-pokemon-action'){

                //do not prompt a switch again if this pokemon fainted due to pursuit, there should be no switch needed prompts triggered yet in this case.
                //any other switches that might need to happen should still happen.
                if (! (this.playersWhoNeedToSwitch.map(p=>p.id).includes(GetPokemonOwner(this.field.players,pokemon).id)) ){
                    console.log("pursuit death happened!",this,pokemon);
                    pursuitDeath = true;
                    //return;
                }
            }
        }

        //game over check.
        if (owner.pokemon.filter(poke => poke.currentStats.hp > 0).length === 0) {
            const winningPlayer = this.GetPlayers().filter(player => player.id !== owner.id)[0];
            this.currentState = TurnState.GameOver;
            this.winningPlayerId = winningPlayer.id;
        }
        else if (pursuitDeath === false) {


            this.PromptForSwitch(pokemon);
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

        while (this.currentState !== TurnState.WaitingForSwitchActions && this.currentState !== TurnState.TurnFinished && this.currentState !== TurnState.GameOver && this.turnOver === false) {


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



        if (this.currentState === TurnState.WaitingForSwitchActions && this.turnOver === false) {
            const switchNeededInfo = {
                turnId: this.currentTurnId,
                playerIDsNeeded: this.playersWhoNeedToSwitch.map(p => p.id),
                currentlyStoredSwitchActions: this._switchNeededActions
            }
            this.OnSwitchNeeded.emit(switchNeededInfo);
        }
        //THE REASON WAS HERE! FORGOT AN ELSE STATEMENT.... IT IS POSSIBLE THAT OUR ON SWITCH NEEDED EVENT IS HANDLEDED RIGHT AWAY.
        else if (this.currentState === 'turn-finished' && this.turnOver === false) {
            //this.turnOver = true;
            this.OnTurnFinished.emit({});
            //added in here, the turn-finished seems to make something work...
            this.NextTurn();
        }
        else if (this.currentState === 'game-over' && this.turnOver === false) {
            const winningPlayer = this.winningPlayerId!==-1 ? this.GetPlayer(this.winningPlayerId!) : undefined;

            //Potential bug here, what happens if we draw?
            const losingPlayer = this.GetPlayers().find(p => p.id !== this.winningPlayerId);
            this.turnOver = true;

            this.OnGameOver.emit({
                winningPlayer: winningPlayer,
                losingPlayer: losingPlayer
            });
        }
    }

    //should not be needed. this isn't really useful anymore    
    private EndTurn() {
        this.currentState = TurnState.TurnFinished;
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
                pokemon._statusObj = GetHardStatus(Status.None);
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
        
        let pokemon;
        if (this.pokemonCached[pokemonId] === undefined){        
            pokemon = this.GetPlayers().map(player => { return player.pokemon }).flat().find(pokemon => pokemon.id === pokemonId);
            
        }
        else{
            pokemon = this.pokemonCached[pokemonId];
        }      

        
        if (pokemon === undefined) {
            throw new Error(`Could not find pokemon with id ${pokemonId} `);
        }
        this.pokemonCached[pokemonId] = pokemon;
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

    private NextTurn() {
        this.currentTurnId++;
        //Resetting all the variables
        this.initialActions = [];
        this._moveOrder = [];
        this._switchNeededActions = [];

        //this is to bandage fix where for somer reason player's are being prompted to switch when they have no valid switches (i.e. 1 pokemon left). it only errors out 
        //about once every 1000 games, so not ure what is 
        //going to poke around our code base a bit and se
        if (this.playersWhoNeedToSwitch.length>0){
            console.error('weird stuff happening', _.cloneDeep(this));
        }

        this.playersWhoNeedToSwitch = [];
        this.currentState = TurnState.WaitingForInitialActions;
        this.currentBattleStep = TurnStep.PreAction1;
        //Yay
        this.StartTurn();
    }

    //Get the valid actions for a player
    GetValidActions(player: Player): BattleAction[] {
        //valid actions -> using any technique, any items, any switch actions. Will return an array of BattleActions.

        //create each of the valid tech actions:
        const activePokemon = GetActivePokemon(player);
        const validTechniqueActions = activePokemon.techniques.filter(tech=>tech.currentPP>0).map(tech => {
            return CreateTechniqueAction(player, tech);
        });

        const validSwitchActions = GetAlivePokemon(player).filter(poke => poke.id !== GetActivePokemon(player).id).map(poke => {
            return CreateSwitchAction(player, poke.id);
        });
        let validActions:BattleAction[] = [validTechniqueActions, validSwitchActions].flat();

        //Modify these actions here.
        const otherPokemon = this.GetOtherPokemon(GetActivePokemon(player));

        this.GetBehavioursForPokemon(activePokemon).forEach(b=>{
            validActions = b.ModifyValidActions(this,player,validActions);
        });

        this.GetBehavioursForPokemon(otherPokemon).forEach(b=>{
           validActions =  b.ModifyOpponentValidActions(this,player,validActions)
        });

        console.log("valid actions for player " + player.name);
        console.log(validActions);

        if (validActions.filter(act=>act.type===Actions.UseTechnique).length === 0){
            //Struggle may be selected in this case.
            validActions.push({
                playerId: player.id,
                pokemonId: activePokemon.id,
                type: Actions.ForcedTechnique,
                technique: GetTech("struggle")
            })
        }


        return validActions;
    }

    GetPlayers(): Player[] {
        return this.field.players;
    }
    GetPlayerById(id: number) {
        const player = this.field.players.find(p => p.id === id);
        if (player === undefined) {
            throw new Error(`Could not find player with id ${id} in GetPlayerById`);
        }
        return player;
    }
    GetOtherPokemon(pokemon:Pokemon){
        const owner = GetPokemonOwner(this.field.players,pokemon);

        const otherPlayer = this.field.players.find(p=>p.id!==owner.id);

        if (otherPlayer === undefined){
            throw new Error(`Could not find other pokemon`);
        }


        return GetActivePokemon(otherPlayer);
    }

    StartGame() {
        const pokemon1 = GetActivePokemon(this.GetPlayers()[0]);
        const pokemon2 = GetActivePokemon(this.GetPlayers()[1]);
        this.GetBehavioursForPokemon(pokemon1).forEach(b => {
            b.OnPokemonEntry(this, pokemon1)
        });
        this.GetBehavioursForPokemon(pokemon2).forEach(b => {
            b.OnPokemonEntry(this, pokemon2);
        });
        //something like this to emit the turn logs...
        //todo, make this into a function on the turn class.
        if (this.eventsSinceLastAction.length > 0) {
            this.EmitNewTurnLog();
        }
        this.OnNewTurn.emit({});
    }
}

export default BattleGame;


