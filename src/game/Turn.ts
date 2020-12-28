import { ElementType } from './ElementType';
import { GetBaseDamage, GetDamageModifier } from './DamageFunctions';
import { GetMoveOrder } from './BattleFunctions';
import { DamageEvent, FaintedPokemonEvent, HealEvent, SwitchInEvent, SwitchOutEvent, UseItemEvent, UseMoveEvent, BattleEventType, StatusChangeEvent, BattleEvent } from "./BattleEvents";
import { SwitchPokemonAction, BattleAction } from "./BattleActions";
import GetHardStatus, { Status } from './HardStatus/HardStatus';
import { TypedEvent } from './TypedEvent/TypedEvent';
import { IPokemon } from './Pokemon/Pokemon';
import { Technique } from './Techniques/Technique';
import { GetActivePokemon } from './HelperFunctions';
import { Player } from './Player/PlayerBuilder';
import GetAbility from './Ability/Ability';
import { BattleEffect, DoEffect, TargetType } from './Effects/Effects';
import { SubstituteVolatileStatus, VolatileStatusType } from './VolatileStatus/VolatileStatus';
import { Item } from './Items/Item';
import _ from 'lodash';
import { GetDamageEffect } from './DamageEffects/DamageEffects';

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
                const player = this.GetPlayer(act.playerId);
                const pokemon = this.GetPokemon(act.switchPokemonId);
                this.SwitchPokemon(player,pokemon);
            });

            this.currentState = {
                type: this.currentState.nextState!
            };
            //continue calculating the turn
            this.CalculateTurn();
        }
    }
    ApplyMessage(message: string) {
        this.AddEvent({
            type: BattleEventType.GenericMessage,
            defaultMessage: message
        }
        );
    }

    private BeforeEndOfTurn() {
        const activePokemon = this.players.map(player => this.GetActivePokemon(player.id));

        activePokemon.forEach(pokemon => {

            pokemon.volatileStatuses.forEach(vStat => {
                vStat.EndOfTurn(this, pokemon);
            });

            GetAbility(pokemon.ability).EndOfTurn(this, pokemon);
            pokemon.heldItem.EndOfTurn(this, pokemon);

            const hardStatus = GetHardStatus(pokemon.status);
            hardStatus.EndOfTurn(this, pokemon);
        })
    }

    //Any status conditions or whatever that must apply before the pokemon starts to attack.
    private BeforeAttack(pokemon: IPokemon) {

        if (!pokemon.canAttackThisTurn) {
            return;
        }

        pokemon.volatileStatuses.forEach(vStat => {
            //we need to stop on the first volatile status that makes it so we can't attack.
            if (!pokemon.canAttackThisTurn) {
                return;
            }
            //todo: this is temporary garbage code to just check if it works
            vStat.BeforeAttack(this, pokemon);
        })

        const hardStatus = GetHardStatus(pokemon.status);
        if (pokemon.canAttackThisTurn === true) {
            hardStatus.BeforeAttack(this, pokemon);
        }
    }

    private DoAction(action: BattleAction) {
        switch (action.type) {
            case 'switch-pokemon-action': {

                const player = this.GetPlayer(action.playerId);
                const pokemonToSwitchIn = this.GetPokemon(action.switchPokemonId);

                this.SwitchPokemon(player,pokemonToSwitchIn);
                 break;
            }
            case 'use-item-action': {

                const player = this.GetPlayer(action.playerId);
                const item = player.items.find(item=>{
                    return item.id === action.itemId
                })
                if (item === undefined){
                    throw new Error('Could not find item to use for use-item-action');
                }

                this.UseItem(player,item);
  
                break;
            }
            case 'use-move-action': {

                const player = this.GetPlayer(action.playerId);
                const pokemon = this.GetPokemon(action.pokemonId);
                const defendingPokemon = this.GetDefendingPokemon(player);
                const move = pokemon.techniques.find(move=>move.id === action.moveId);

                if (move ===undefined){
                    throw new Error('Could not find move to use in DoAction')
                }

                this.UseTechnique(pokemon,defendingPokemon,move);
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
        if (owner.pokemon.filter(poke => poke.currentStats.hp > 0).length === 0) {
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

    ApplyHealing(pokemon: IPokemon, amount: number) {
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

    ApplyIndirectDamage(pokemon: IPokemon, damage: number) {
        pokemon.currentStats.hp -= damage;
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

    ApplyDamage(attackingPokemon: IPokemon, defendingPokemon: IPokemon, damage: number, damageInfo: any) {

        //TODO: Ability Replacement Damage Logic.

        //damage info will be the same
        if (defendingPokemon.hasSubstitute) {
            const substitute = defendingPokemon.volatileStatuses.find(vStat => {
                return vStat.type === VolatileStatusType.Substitute
            }) as SubstituteVolatileStatus;
            substitute.Damage(this, defendingPokemon, damage);
            GetHardStatus(attackingPokemon.status).OnDamageDealt(this, attackingPokemon, defendingPokemon, damage);
            attackingPokemon.volatileStatuses.forEach(vStat => {
                vStat.OnDamageDealt(this, attackingPokemon, defendingPokemon, damage);
            })
            attackingPokemon.heldItem.OnDamageDealt(this, attackingPokemon, defendingPokemon, damage);
            GetAbility(attackingPokemon.ability).OnDamageDealt(this, attackingPokemon, defendingPokemon, damage);
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
            effectivenessAmt: damageInfo.typeEffectivenessBonus === undefined ? 1 : damageInfo.typeEffectivenessBonus
        };

        this.AddEvent(damageEffect);

        GetHardStatus(attackingPokemon.status).OnDamageDealt(this, attackingPokemon, defendingPokemon, damage);
        attackingPokemon.volatileStatuses.forEach(vStat => {
            vStat.OnDamageDealt(this, attackingPokemon, defendingPokemon, damage);
        })
        attackingPokemon.heldItem.OnDamageDealt(this, attackingPokemon, defendingPokemon, damage);
        GetAbility(attackingPokemon.ability).OnDamageDealt(this, attackingPokemon, defendingPokemon, damage);


        if (defendingPokemon.currentStats.hp <= 0) {
            this.PokemonFainted(defendingPokemon)
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

    SwitchPokemon(player:Player,pokemonIn:IPokemon){
        const switchOutPokemonId = player.currentPokemonId;
        const switchOutPokemon = this.GetPokemon(switchOutPokemonId);
        switchOutPokemon.volatileStatuses = []; //easy peasy

        const switchInPokemonPos = player.pokemon.indexOf(pokemonIn);
        if (switchInPokemonPos < 0) {
            console.log(this.players);
            throw new Error(`Could not find pokemon ${pokemonIn.id} for player ${player.id}`);
        }

        let pokemonArrCopy = player.pokemon.slice();

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
    }

    UseItem(player:Player,item:Item){
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
            DoEffect(this, pokemon, effect,{sourceItem:item});
        }
        );

        item.quantity -= 1;
        //remove item from inventory.
        if (item.quantity <= 0) {
            const itemIndex = player.items.indexOf(item);
            player.items.splice(itemIndex, 1);
        }

    }

 

    //temporary, i want to see how easier this makes testing
    UseTechnique(pokemon:IPokemon,defendingPokemon:IPokemon,move:Technique){
        const useMoveEffect: UseMoveEvent = {
            type: BattleEventType.UseMove,
            userId: pokemon.id,
            targetId: defendingPokemon.id,
            didMoveHit: true,
            moveName: move.name,
        }
        this.AddEvent(useMoveEffect);

        if (!this.Roll(move.accuracy)) {
            useMoveEffect.didMoveHit = false;
            return;
        }

        if (move.damageType === 'physical' || move.damageType === 'special') {
            //this method was extracted by using "extract method" and needs to be refactored. we should probably just return a partial event log.


            let damage:number = this.DoDamageMove(pokemon, defendingPokemon, move);

            
            /*
                On Frozen Pokemon Damaged by Fire Move
                    -UNTHAW THE POKEMON
            */
            //TODO: move this into the "frozen status?";
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

            this.ApplyMoveEffects(move, pokemon, defendingPokemon,damage);
        }
        else {
            this.DoStatusMove(move, defendingPokemon, pokemon);
        }

    }

    private DoStatusMove(move: Technique, defendingPokemon: IPokemon, pokemon: IPokemon) {
        this.ApplyMoveEffects(move, pokemon, defendingPokemon);
    }

    private ApplyMoveEffects(move: Technique, pokemon: IPokemon, defendingPokemon: IPokemon,moveDamage?:number): void {
        if (!move.effects) {
            return;
        }
        move.effects.forEach((effect) => {
            const chance = effect.chance === undefined ? 100 : effect.chance;
            const targetType = effect.target === undefined ? TargetType.Enemy : effect.target;
            var targetPokemon = targetType == TargetType.Self ? pokemon : defendingPokemon;

            
            //quick override for drain effects while we think about the best way to handle this type of effect.
            if (effect.type === 'drain'){
                targetPokemon = pokemon;
            }

            if (this.Roll(chance)) {
                DoEffect(this, targetPokemon, effect, {sourcePokemon:pokemon,sourceTechnique:move,sourceDamage:moveDamage});
            }
        });
    }

    //passing the damage dealt for now,
    private DoDamageMove(pokemon: IPokemon, defendingPokemon: IPokemon, move: Technique) : number {        

        //Easy quick hack for handling eruption, but we need to think of a way to do this non hacky.
        //perhaps we should revamp our whole damage system?
        const ability = GetAbility(pokemon.ability);
        move = ability.ModifyTechnique(pokemon,move);
       

        if (move.damageEffect){
            const damageEffect = GetDamageEffect(move.damageEffect.type);
            move = damageEffect.ModifyTechnique(pokemon,move);
        }

        const baseDamage = GetBaseDamage(pokemon, defendingPokemon, move);
        const damageModifierInfo = GetDamageModifier(pokemon, defendingPokemon, move);
        const totalDamage = Math.ceil(baseDamage * damageModifierInfo.modValue);
    
        //Abilities/Statuses/VolatileStatuses might be able to modify damage
        const newDamage = ability.OnAfterDamageCalculated(pokemon, move, defendingPokemon, totalDamage, damageModifierInfo);

        //
        const defendingAbility = GetAbility(defendingPokemon.ability);
        if (defendingAbility.NegateDamage(this,move,defendingPokemon) === true){
            //no damage will be applied, any messages why will be handled by the ability itslef.
            return 0;
        }   
        //TODO: If defending pokemon has a substitute, apply the damage to the defendingPokemon instead.
        this.ApplyDamage(pokemon, defendingPokemon, newDamage, damageModifierInfo);
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
        effect.id = this.nextEventId++;
        this.eventLog.push(effect);
    }

    private GetDefendingPokemon(attackingPlayer:Player) :IPokemon{
        const defendingPlayer = this.players.find(p => p !== attackingPlayer);
        if (defendingPlayer === undefined) {
            throw new Error(`Could not find defending player`);
        }

        const defendingPokemon = this.GetPokemon(defendingPlayer.currentPokemonId);
        return defendingPokemon;
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
