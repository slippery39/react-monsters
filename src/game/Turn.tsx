import { Player, ElementType } from './interfaces';
import { GetBaseDamage, GetDamageModifier } from './DamageFunctions';
import { GetMoveOrder } from './BattleFunctions';
import { DamageEvent, FaintedPokemonEvent, HealEvent, SwitchInEvent, SwitchOutEvent, UseItemEvent, UseMoveEvent, BattleEventType, StatusChangeEvent, BattleEvent, GenericMessageEvent } from "./BattleEvents";
import { SwitchPokemonAction, BattleAction } from "./BattleActions";
import GetHardStatus, { Status } from './HardStatus/HardStatus';
import { TypedEvent } from './TypedEvent/TypedEvent';
import { ApplyStatBoost, IPokemon } from './Pokemon/Pokemon';
import { HealthRestoreType, TargetType, Technique } from './Techniques/Technique';
import {  GetVolatileStatus} from './VolatileStatus/VolatileStatus';
import { GetActivePokemon } from './HelperFunctions';

export type TurnState = 'awaiting-initial-actions' | 'awaiting-switch-action' | 'turn-finished' | 'game-over' | 'calculating-turn';


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
    playerId?: number, //depreciated
    faintedPlayerIds?: Array<number>,
    nextState?: TurnState,
    winningPlayerId?: number
}


type OnTurnStartArgs = {
}

type OnTurnEndArgs = {
}

type OnSwitchNeededArgs = {
}

export class Turn {
    id: Number;
    players: Array<Player> = [] //needs to be initial turn state.

    eventLog: Array<BattleEvent> = [];
    nextEventId: number = 1; //next id for when we have a new event.

    initialActions: Array<BattleAction> = [];

    //Stores a list of players who currently have a fainted pokemon, these players will need to switch their pokemon out.
    faintedPokemonPlayers: Array<Player> = [];

    //TODO - this is not clean, clean this up, maybe have some sort of Map that maps player to activePokemonId.
    private _activePokemonIdAtStart1 = -1;
    private _activePokemonIdAtStart2 = -1;

    //Cached move order
    private _moveOrder: Array<BattleAction> = [];

    //Stores the fainted pokemon actions if 
    private _switchFaintedActions: Array<SwitchPokemonAction> = [];

    //Turn State Variables
    currentBattleStep = TurnStep.PreAction1;
    currentState: State = { type: 'awaiting-initial-actions' }

    //NEW - Events
    OnTurnEnd: TypedEvent<OnTurnEndArgs> = new TypedEvent<OnTurnEndArgs>();
    OnTurnStart: TypedEvent<OnTurnStartArgs> = new TypedEvent<OnTurnStartArgs>();
    OnSwitchNeeded: TypedEvent<OnSwitchNeededArgs> = new TypedEvent<OnSwitchNeededArgs>();

    constructor(turnId: Number, players: Array<Player>) {
        this.id = turnId;
        this.players = players;

        //this controls some logic in the turn.
        this._activePokemonIdAtStart1 = players[0].currentPokemonId;
        this._activePokemonIdAtStart2 = players[1].currentPokemonId;

        //Reset any flags for if the pokemon can attack this turn or not.
        GetActivePokemon(players[0]).canAttackThisTurn = true;
        GetActivePokemon(players[1]).canAttackThisTurn = true;
    }
    //NEW: Returning a flattened turn log instead
    GetEventLog(): Array<BattleEvent> {
        return this.eventLog;
    }

    SetInitialPlayerAction(action: BattleAction) {
        const actionExistsForPlayer = this.initialActions.filter(act => act.playerId === action.playerId);
        if (actionExistsForPlayer.length === 0) {
            this.initialActions.push(action);
        }
        if (this.initialActions.length === 2) {
            this.currentState = {
                type: 'calculating-turn'
            }
            this.CalculateTurn();
        }
    }
    //Special Action for when a pokemon faints in the middle of the turn.
    SetSwitchFaintedPokemonAction(action: SwitchPokemonAction) {
        if (this.faintedPokemonPlayers.filter(p => p.id === action.playerId).length === 0) {
            throw new Error("Invalid command in SetSwitchFaintedPokemonAction, this player should not be switching a fainted pokemon");
        }

        //TODO - we need a check to make sure the same player cannot add 2 actions
        if (this._switchFaintedActions.filter((act) => {
            return act.playerId === action.playerId
        }).length > 0) {
            throw new Error(`Player tried to submit 2 switch fainted pokemon actions: id : ${action.playerId}`);
        }
        this._switchFaintedActions.push(action);

        const player = this.faintedPokemonPlayers.find(p => p.id === action.playerId);
        if (player === undefined) {
            throw new Error('could not find player');
        }
        const index = this.faintedPokemonPlayers.indexOf(player);
        this.faintedPokemonPlayers.splice(index, 1);

        if (this.faintedPokemonPlayers.length === 0) {
            this._switchFaintedActions.forEach(act => {
                this.SwitchPokemon(act.playerId, act.switchPokemonId);
            });

            this.currentState = {
                type: this.currentState.nextState!
            };
            //continue calculating the turn
            this.CalculateTurn();
        }
    }

    private BeforeEndOfTurn() {
        const activePokemon = this.players.map(player => this.GetActivePokemon(player.id));

        activePokemon.forEach(pokemon => {

            pokemon.volatileStatuses.forEach(vStat=>{
                vStat.EndOfTurn(this,pokemon);
            })

            const hardStatus = GetHardStatus(pokemon.status);
            hardStatus.EndOfTurn(this, pokemon);
        })
    }

    //Any status conditions or whatever that must apply before the pokemon starts to attack.
    private BeforeAttack(pokemon: IPokemon) {     
        
        if (!pokemon.canAttackThisTurn){
            return;
        }

        pokemon.volatileStatuses.forEach(vStat=>{
            //we need to stop on the first volatile status that makes it so we can't attack.
            if (!pokemon.canAttackThisTurn){
                return;
            }

            vStat.BeforeAttack(this,pokemon);
        })
        
        const hardStatus = GetHardStatus(pokemon.status);
        if (hardStatus.BeforeAttack !== undefined && pokemon.canAttackThisTurn===true) {
            hardStatus.BeforeAttack(this, pokemon);
        }
    }

    private DoAction(action: BattleAction) {
        switch (action.type) {
            case 'switch-pokemon-action': {
                this.SwitchPokemon(action.playerId, action.switchPokemonId);
                break;
            }
            case 'use-item-action': {
                this.UseItem(action.playerId, action.itemId);
                break;
            }
            case 'use-move-action': {
                this.UseTechnique(action.playerId, action.pokemonId, action.moveId);
                break;
            }
        }
    }

    //For testing only
    SetStatusOfPokemon(pokemonId: number, status: Status) {
        this.GetPokemon(pokemonId).status = status;
        //need some way of notifying the service.
    }

    private PokemonFainted(pokemon: IPokemon) {
        const faintedPokemonEffect: FaintedPokemonEvent = {
            targetPokemonId: pokemon.id,
            type: BattleEventType.PokemonFainted,
        };
        this.AddEvent(faintedPokemonEffect);

        const owner = this.GetPokemonOwner(pokemon);

        pokemon.status = Status.None;
        pokemon.volatileStatuses = [];

        //game over check.
        if (owner.pokemon.filter(poke => poke.currentStats.health > 0).length === 0) {
            const winningPlayer = this.players.filter(player => player.id !== owner.id)[0];
            this.currentState = {
                type: 'game-over',
                winningPlayerId: winningPlayer.id
            }
        }
        else {
            this.faintedPokemonPlayers.push(owner);
            this.currentState = { type: 'awaiting-switch-action' }
        }
    }

    ApplyHealing(pokemon:IPokemon,amount:number){
        const itemHealAmount = amount;
        const healing = Math.min(pokemon.originalStats.health - pokemon.currentStats.health, itemHealAmount);
        pokemon.currentStats.health = Math.min(pokemon.originalStats.health, pokemon.currentStats.health + itemHealAmount);
        let itemEffect: HealEvent = {
            type: BattleEventType.Heal,
            targetPokemonId: pokemon.id,
            targetFinalHealth: pokemon.currentStats.health,
            totalHealing: healing,
        }
        this.AddEvent(itemEffect);
    }

    ApplyDamage(pokemon: IPokemon, damage: number, damageInfo: any) {

        pokemon.currentStats.health -= damage
        pokemon.currentStats.health = Math.max(0, pokemon.currentStats.health);

        const damageEffect: DamageEvent = {
            type: BattleEventType.Damage,
            targetPokemonId: pokemon.id,
            attackerPokemonId: pokemon.id, //this is wrong, we need a way to pass this into this function 
            targetFinalHealth: pokemon.currentStats.health,
            targetDamageTaken: damage,
            didCritical: damageInfo.critStrike === undefined ? false : damageInfo.critStrike,
            effectivenessAmt: damageInfo.typeEffectivenessBonus === undefined ? 1 : damageInfo.typeEffectivenessBonus
        };

        this.AddEvent(damageEffect);

        if (pokemon.currentStats.health <= 0) {
            this.PokemonFainted(pokemon)
        }
    }

    private AfterAttack(pokemon: IPokemon) {
        //we could put burn effects here.
    }

    private CalculateTurn() {

        const nextStateLookups = [
            {
                current: TurnStep.PreAction1,
                next: TurnStep.Action1
            },
            {
                current: TurnStep.Action1,
                next: TurnStep.PostAction1
            },
            {
                current: TurnStep.PostAction1,
                next: TurnStep.PreAction2
            },
            {
                current: TurnStep.PreAction2,
                next: TurnStep.Action2
            },
            {
                current: TurnStep.Action2,
                next: TurnStep.PostAction2
            },
            {
                current: TurnStep.PostAction2,
                next: TurnStep.BeforeEnd
            },
            {
                current: TurnStep.BeforeEnd,
                next: TurnStep.End
            },
            {
                current: TurnStep.End,
                next: undefined
            }
        ];

        //this needs to be cached.
        const actionOrder = this.GetMoveOrder();

        while (this.currentState.type !== 'awaiting-switch-action' && this.currentState.type !== 'turn-finished' && this.currentState.type !== 'game-over') {

            var startStep = nextStateLookups.find((e) => {
                return e.current === this.currentBattleStep
            });

            if (startStep === undefined) {
                throw new Error("Could not find proper battle step state");
            }

            //figure out if player 1 or player 2 is action 1 or action 2
            let pokemonAtStart1 = undefined;
            let pokemonAtStart2 = undefined;

            //get the proper starting pokeon based on the action order.

            if (actionOrder[0].playerId === this.players[0].id) {
                pokemonAtStart1 = this._activePokemonIdAtStart1;
                pokemonAtStart2 = this._activePokemonIdAtStart2;
            }
            else {
                pokemonAtStart1 = this._activePokemonIdAtStart2;
                pokemonAtStart2 = this._activePokemonIdAtStart1;
            }

            //get the propert current pokemon based on the action order
            const currentPokemon1 = this.GetActivePokemon(actionOrder[0].playerId);
            const currentPokemon2 = this.GetActivePokemon(actionOrder[1].playerId);

            switch (startStep.current) {
                case TurnStep.PreAction1: {
                    //don't need to check here because it should be fine.
                    //TODO: need to store some sort of value to see if the pokemon is able to attack or not.
                    if (actionOrder[0].type !== 'use-move-action') {
                        break;
                    }
                    this.BeforeAttack(currentPokemon1);
                    break;
                }
                case TurnStep.Action1: {

                    if (actionOrder[0].type === 'use-move-action' && !currentPokemon1.canAttackThisTurn) {
                        break;
                    }
                    if (pokemonAtStart1 === currentPokemon1.id) {
                        this.DoAction(actionOrder[0]);
                    }
                    break;
                }
                case TurnStep.PostAction1: {
                    if (actionOrder[0].type !== 'use-move-action') {
                        break;
                    }
                    if (pokemonAtStart1 === currentPokemon1.id) {
                        this.AfterAttack(currentPokemon1)
                    }
                    break;
                }
                case TurnStep.PreAction2: {
                    if (actionOrder[1].type !== 'use-move-action') {
                        break;
                    }
                    if (pokemonAtStart2 === currentPokemon2.id) {
                        this.BeforeAttack(currentPokemon2);
                    }
                    break;
                }
                case TurnStep.Action2: {
                    if (actionOrder[1].type === 'use-move-action' && !currentPokemon2.canAttackThisTurn) {
                        break;
                    }
                    if (pokemonAtStart2 === currentPokemon2.id) {
                        this.DoAction(actionOrder[1]);
                    }
                    break;
                }
                case TurnStep.PostAction2: {
                    if (actionOrder[1].type !== 'use-move-action') {
                        break;
                    }
                    if (pokemonAtStart2 === currentPokemon2.id) {
                        this.AfterAttack(currentPokemon2)
                    }
                    break;
                }
                case TurnStep.BeforeEnd: {
                    this.BeforeEndOfTurn();
                    break;
                }
                case TurnStep.End: {
                    this.EndTurn();
                    break;
                }
                default: {
                    throw new Error('No valid battle step state found for calculate turn');
                }
            }




            //go to the next state
            if (startStep.next !== undefined) {
                this.currentBattleStep = startStep.next;
            }
        }

        //loop has finished lets throw some events based on what has happened.
        //throw events if necessary

        if (this.currentState.type === 'awaiting-switch-action') {
            console.warn('emitting on switch needed event');
            this.OnSwitchNeeded.emit({});
        }
        else if (this.currentState.type === 'turn-finished') {
            console.warn('emitting turn finshed event');
            this.OnTurnEnd.emit({});
        }
    }

    private SwitchPokemon(playerId: number, pokemonInId: number) {
        //not yet implemented, just for practice.
        const player = this.GetPlayer(playerId);
        //const pokemon = this.GetPokemon(pokemonInId);
        const switchOutPokemonId = player.currentPokemonId;
        const switchOutPokemon = this.GetPokemon(switchOutPokemonId);

        //any pokemon switched out should have thier volatile statuses removed
        switchOutPokemon.volatileStatuses = []; //easy peasy

        //current pokemon position is 0
        //find the pokemon to switch in position
        const switchInPokemonPos = player.pokemon.indexOf(player.pokemon.find(p => p.id === pokemonInId)!);
        let pokemonArrCopy = player.pokemon.slice();

        //TODO: i don't think we actualy want to switch the pokemon position in the array anymore?
        pokemonArrCopy[0] = player.pokemon[switchInPokemonPos];
        pokemonArrCopy[switchInPokemonPos] = player.pokemon[0];
        

        player.pokemon = pokemonArrCopy;
        player.currentPokemonId = pokemonArrCopy[0].id;

        const switchOutEffect: SwitchOutEvent = {
            type: BattleEventType.SwitchOut,
            switchOutPokemonId: switchOutPokemonId!,
            switchInPokemonId: pokemonInId,
        }
        this.AddEvent(switchOutEffect);
        const switchInEffect: SwitchInEvent = {
            type: BattleEventType.SwitchIn,
            switchOutPokemonId: switchOutPokemonId!,
            switchInPokemonId: pokemonInId,
        }
        this.AddEvent(switchInEffect);
    }

    private UseItem(playerId: number, itemId: number) {
        const player = this.GetPlayer(playerId);
        const item = player?.items.find(item => item.id === itemId);

        if (item === undefined) {
            console.error("could not find item to use for use item");
            return;
        }

        const pokemon = this.GetActivePokemon(playerId);

        const useItemEffect: UseItemEvent = {
            type: BattleEventType.UseItem,
            itemName: item.name,
            itemId: item.id,
            targetPokemonId: pokemon.id
        }
        this.AddEvent(useItemEffect);

        item.effects.forEach(effect => {
            if (effect.type === 'health-restore') {
                this.ApplyHealing(pokemon,effect.amount);
            }
            else if (effect.type === 'status-restore') {

                //if this is the only effect, and the pokemon has no status to cure

                if (effect.forStatus === 'any' && pokemon.status!==Status.None) {
                    let statusRestoreEffect: StatusChangeEvent = {
                        type: BattleEventType.StatusChange,
                        status:Status.None,
                        targetPokemonId:pokemon.id,
                        defaultMessage: `${pokemon.name} ` + GetHardStatus(pokemon.status).curedString
                    }
                        this.AddEvent(statusRestoreEffect);
                        pokemon.status = Status.None;                    
                }
                else if (effect.forStatus === pokemon.status){
                    let statusRestoreEffect: StatusChangeEvent = {
                        type: BattleEventType.StatusChange,
                        status:Status.None,
                        targetPokemonId:pokemon.id,
                        defaultMessage: `${pokemon.name} ` + GetHardStatus(pokemon.status).curedString
                    }
                    this.AddEvent(statusRestoreEffect);
                    pokemon.status = Status.None;  
                }     
                else if (pokemon.status!== effect.forStatus && item.effects.length === 1){
                    let noEffect: GenericMessageEvent = {
                        type: BattleEventType.GenericMessage,
                        defaultMessage: `It had no effect!`
                    }
                    this.AddEvent(noEffect);
                }           
            }
        });

        item.quantity -= 1;
        //remove item from inventory.
        if (item.quantity <= 0) {
            const itemIndex = player.items.indexOf(item);
            player.items.splice(itemIndex, 1);
        }
    }

    private UseTechnique(playerId: number, pokemonId: number, techniqueId: number) {

        const player = this.GetPlayer(playerId);
        const pokemon = this.GetPokemon(pokemonId);

        console.log(pokemon);

        const move = pokemon.techniques.find(t => t.id === techniqueId);

        //This should work as long as it stays 1v1;

        const defendingPlayer = this.players.find(p => p !== player);
        if (defendingPlayer === undefined) {
            throw new Error(`Could not find defending player`);
        }

        const defendingPokemon = this.GetPokemon(defendingPlayer.currentPokemonId);

        if (move === undefined) {
            throw new Error(`Error in using technique, could not find technique with id ${techniqueId} `);
        }
        const useMoveEffect: UseMoveEvent = {
            type: BattleEventType.UseMove,
            userId: pokemon.id,
            targetId: defendingPokemon.id,
            didMoveHit: true,
            moveName: move.name,
        }
        this.AddEvent(useMoveEffect);

        if (!this.Roll(move.chance)) {
            useMoveEffect.didMoveHit = false;
            return;
        }

        if (move.damageType === 'physical' || move.damageType === 'special') {
            //this method was extracted by using "extract method" and needs to be refactored. we should probably just return a partial event log.
            this.DoDamageMove(pokemon, defendingPokemon, move);
            /*
                On Frozen Pokemon Damaged by Fire Move
                    -UNTHAW THE POKEMON
            */
            //move this into 
            if (move.elementalType === ElementType.Fire && defendingPokemon.status === Status.Frozen) {
                defendingPokemon.status = Status.None;
                const thawEffect: StatusChangeEvent = {
                    type: BattleEventType.StatusChange,
                    status: Status.None,
                    targetPokemonId: defendingPokemon.id,
                    attackerPokemonId: pokemon.id,
                    defaultMessage: `${defendingPokemon.name} is not frozen anymore!`
                }
                this.AddEvent(thawEffect);
            }

            this.ApplyMoveEffects(move, pokemon, defendingPokemon);
        }
        else {
            this.DoStatusMove(move, defendingPokemon, pokemon);
        }

    }

    private DoStatusMove(move: Technique, defendingPokemon: IPokemon, pokemon: IPokemon) {
        this.ApplyMoveEffects(move, pokemon, defendingPokemon);
    }

    private ApplyMoveEffects(move: Technique, pokemon: IPokemon, defendingPokemon: IPokemon): void {
        if (!move.effects) {
            return;
        }

        move.effects.forEach((effect) => {
            if (this.Roll(effect.chance)) {
                if (effect.type === 'inflict-status') {

                    const targetPokemon = effect.target === TargetType.Self ? pokemon : defendingPokemon;

                    //cannot apply a status to a pokemon that has one, and cannot apply a status to a fainted pokemon.
                    if (targetPokemon.status !== Status.None || targetPokemon.currentStats.health === 0) {
                        return;
                    }

                    const hardStatus = GetHardStatus(effect.status);
                    if (!hardStatus.CanApply(this, targetPokemon)) {
                        return;
                    }


                    targetPokemon.status = effect.status;

                    const statusInflictedEffect: StatusChangeEvent = {
                        type: BattleEventType.StatusChange,
                        status: effect.status,
                        attackerPokemonId: pokemon.id,
                        targetPokemonId: targetPokemon.id
                    };
                    this.AddEvent(statusInflictedEffect);
                }
                else if (effect.type === 'stat-boost') {
                    const targetPokemon = effect.target ===  TargetType.Self ? pokemon : defendingPokemon;
                    ApplyStatBoost(targetPokemon, effect.stat, effect.amount);

                    let message = ` ${targetPokemon.name} has had its ${effect.stat} boosted!`
                    if (effect.amount < 0) {
                        message = ` ${targetPokemon.name} has had its ${effect.stat} decreased!`
                    }
                    const statChangeEvent: GenericMessageEvent = {
                        type: BattleEventType.GenericMessage,
                        defaultMessage: message
                    }
                    this.AddEvent(statChangeEvent);
                }
                else if (effect.type === 'inflict-volatile-status'){
                    const targetPokemon = effect.target === TargetType.Self? pokemon : defendingPokemon;

                    const vStatus = GetVolatileStatus(effect.status);

                    if (!vStatus.CanApply(this,targetPokemon)){
                        return;
                    }

                    targetPokemon.volatileStatuses.push(vStatus);
                    vStatus.OnApply(this,targetPokemon);

                    const inflictVStatusEvent:GenericMessageEvent ={
                        type:BattleEventType.GenericMessage,
                        defaultMessage:vStatus.InflictedMessage(targetPokemon)
                    }

                    this.AddEvent(inflictVStatusEvent);
                }
                else if (effect.type ==='health-restore'){
                    if (effect.restoreType === HealthRestoreType.Flat){
                        this.ApplyHealing(pokemon,effect.amount);
                    }
                    else if (effect.restoreType === HealthRestoreType.PercentMaxHealth){
                        console.log('attempting percent max health heal');
                    
                        const amount = Math.floor(pokemon.originalStats.health / (100/effect.amount));
                        this.ApplyHealing(pokemon,amount);
                    }
                }
            }
        });
    }

    private DoDamageMove(pokemon: IPokemon, defendingPokemon: IPokemon, move: Technique) {
        const baseDamage = GetBaseDamage(pokemon, defendingPokemon, move);
        const damageModifierInfo = GetDamageModifier(pokemon, defendingPokemon, move);
        const totalDamage = Math.ceil(baseDamage * damageModifierInfo.modValue);
        this.ApplyDamage(defendingPokemon, totalDamage, damageModifierInfo);
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
        effect.id = this.nextEventId++;
        this.eventLog.push(effect);
    }

    private GetPlayer(playerId: number): Player {
        const player = this.players.find(player => player.id === playerId);
        if (player === undefined) {
            throw new Error(`Could not find player with id ${playerId} `);
        }
        return player;
    }
    private GetPokemon(pokemonId: number): IPokemon {
        const pokemon = this.players.map(player => { return player.pokemon }).flat().find(pokemon => pokemon.id === pokemonId);
        if (pokemon === undefined) {
            throw new Error(`Could not find pokemon with id ${pokemonId} `);
        }
        return pokemon;
    }

    private GetActivePokemon(playerId: number): IPokemon {
        const player = this.GetPlayer(playerId);
        const activePokemon = player.pokemon.find(poke => poke.id === player.currentPokemonId);
        if (activePokemon === undefined) {
            throw new Error(`Could not find active pokemon for player with id ${playerId} `)
        }
        return activePokemon;
    }
    private GetPokemonOwner(pokemon: IPokemon) {
        const owner = this.players.filter(player => {
            return player.pokemon.find(poke => poke.id === pokemon.id) !== undefined
        })[0];

        if (owner === undefined) {
            throw Error(`Could not find owner for pokemon ${pokemon.id + ':' + pokemon.name}`)
        }

        return owner;
    }
    

    //this needs to be cached due to potential randomness
    private GetMoveOrder(): Array<BattleAction> {

        if (this._moveOrder.length === 0) {
            this._moveOrder = GetMoveOrder(this.players, this.initialActions)
        }
        return this._moveOrder;

    }
};
