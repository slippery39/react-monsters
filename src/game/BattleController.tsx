import { Status, Pokemon, Technique, Player } from './interfaces';
import _ from 'lodash';
import { GetBaseDamage, GetDamageModifier, GetTypeMod } from './DamageFunctions';
import { GetMoveOrder } from './BattleFunctions';
import { unwatchFile } from 'fs';
import { type } from 'os';

export enum BattleEventType {
    UseMove = 'use-move',
    SwitchPokemon = 'switch-pokemon',
    CriticalHIt = 'critical-hit',
    UseItem = 'use-item',
    //non user initiated events can happen here too, (like poison damage, pokemon unable to move because of stun,confusion or frozen etc)
    PokemonFainted = 'pokemon-fainted',
    PoisonDamage = 'poison-damage',
    SwitchIn = 'switch-in',
    SwitchOut = 'switch-out'

}

export enum EffectType {
    Damage = 'damage',
    Heal = 'heal',
    Switch = 'switch',
    Poisoned = 'poisoned',
    StatusChange = 'status-change',
    PokemonFainted = 'pokemon-fainted',
    SwitchIn = 'switch-in',
    SwitchOut = 'switch-out',
    MissedMove = 'missed-move',
    None = 'none' //used in cases where nothing happaned (i.e an attack missed or something)
}

export interface DamageEffect {
    type: EffectType.Damage,
    targetPokemonId: number,
    attackerPokemonId: number,
    targetFinalHealth: number,
    targetDamageTaken: number,
    effectiveness: string,
    message: string
}

export interface SwitchOutEffect {
    type: EffectType.SwitchOut,
    switchOutPokemonId: number,
    switchInPokemonId: number,
    message: string
}
export interface SwitchInEffect {
    type: EffectType.SwitchIn,
    switchOutPokemonId: number,
    switchInPokemonId: number,
    message: string
}
export interface HealEffect {
    type: EffectType.Heal,
    targetPokemonId: number,
    targetFinalHealth: number,
    totalHealing: number,
    message: string
}
export interface MissedMoveEffect {
    type: EffectType.MissedMove,
    message: string
}
export interface FaintedPokemonEffect {
    type: EffectType.PokemonFainted,
    targetPokemonId: number,
    message: string
}

/*
EffectType.Damage;
EffectType.Heal;
EffectType.MissedMove;
EffectType.None;
EffectType.Poisoned;
EffectType.StatusChange;
EffectType.Switch;
EffectType.SwitchIn;
EffectType.SwitchOut;
*/

export interface BattleEvent {
    id:number,
    type: BattleEventType,
    message: string,
    effects: Array<SwitchOutEffect | SwitchInEffect | DamageEffect | HealEffect | MissedMoveEffect | FaintedPokemonEffect>,
}

export interface UseMoveAction {
    playerId: number,
    pokemonId: number,
    moveId: number
    type: 'use-move-action'
}

export interface SwitchPokemonAction {
    playerId: number
    switchPokemonId: number
    type: 'switch-pokemon-action'
}

export interface UseItemAction {
    playerId: number
    itemId: number
    type: 'use-item-action'
}

export type BattleAction = UseMoveAction | SwitchPokemonAction | UseItemAction

export type TurnState = 'awaiting-initial-actions' | 'awaiting-switch-action' | 'turn-finished' | 'first-action' | 'second-action'


interface State {
    type: TurnState,
    playerId?: number,
    nextState?: TurnState
}



export class Turn {
    //need to store the state here somehow.
    initialActions: Array<BattleAction> = [];

    players: Array<Player> = [] //needs to be initial turn state.
    turnLog: Array<BattleEvent> = [];
    id: Number;
    eventNum: number = 1; //next id for when we have a new event.


    currentState: State = { type: 'awaiting-initial-actions' }


    constructor(turnId: Number, players: Array<Player>) {
        this.id = turnId;
        this.players = players;

    }



    GetTurnLog(): Array<BattleEvent> {
        return this.turnLog;
    }

    SetInitialPlayerAction(action: BattleAction) {
        const actionExistsForPlayer = this.initialActions.filter(act => act.playerId === action.playerId);
        if (actionExistsForPlayer.length === 0) {
            this.initialActions.push(action);
        }
        if (this.initialActions.length === 2) {
            this.currentState = {
                type:'first-action'
            }
            this.CalculateTurn();
        }
    }

    SetSwitchFaintedPokemonAction(action: SwitchPokemonAction) {
        if (action.playerId !== this.currentState.playerId) {
            console.error("Invalid command in SetSwitchFaintedPokemonAction, this player should not be switching a fainted pokemon");
            return;
        }
        this.SwitchPokemon(action.playerId, action.switchPokemonId);
        this.currentState = {
            type: this.currentState.nextState!
        };
        //continue calculating the turn
        this.CalculateTurn();
    }

    GetMoveOrder() {
        return GetMoveOrder(this.players, this.initialActions);
    }


    EndTurn() {
        this.currentState = {
            type: 'turn-finished'
        }
    }

    CalculateTurn() {

        const actionOrder = this.GetMoveOrder();
        if (this.currentState.type === 'first-action') {
            const actionResult = this.DoAction(actionOrder[0]);
            if (actionResult!.pokemonHasFainted) {
                //TODO: check if a player has won first before prompting to switch
                this.currentState = {
                    type: 'awaiting-switch-action',
                    playerId: actionResult!.defendingPlayerId,
                    nextState: 'turn-finished'
                }
                //go to 'awaiting-switch-action' state
                //set nextState to 'end-turn'
            }
            else {
                this.currentState = {
                    type: 'second-action'
                }
            }
        }
        if (this.currentState.type === 'second-action') {
            const actionResult = this.DoAction(actionOrder[1]);
            if (actionResult!.pokemonHasFainted === true) {
                this.currentState = {
                    type: 'awaiting-switch-action',
                    playerId: actionResult!.defendingPlayerId,
                    nextState: 'turn-finished'
                }
            }
            else {
                this.currentState = {
                    type: 'turn-finished'
                }
            }
        }
        if (this.currentState.type === 'turn-finished') {
            this.EndTurn();
        }



        /*
        if (this.turnFinished === false) {
            const actionOrder = this.GetMoveOrder();
            //lets run the moves.
            //this.StartTurn();            
            this.DoAction(actionOrder[0]);            
            //check if the other pokemon fainted from the move.
            //if they did, then the rest of the events should not happen.
            const pokemonFaintedCheck1 = this.CheckForFaintedPokemon(this.players.find(p=>p.id===actionOrder[1].playerId)!);
            if (pokemonFaintedCheck1){
                //don't finish the turn, but request a switch.
                this.currentState = 'awaiting-switch-action';
                return;
            }      
            this.DoAction(actionOrder[1]);
            this.CheckForFaintedPokemon(this.players.find(p=>p.id===actionOrder[0].playerId)!);
            //this.EndTurn():
            this.turnFinished = true;
        }
        */

        //check state-based effects here (i.e pokemon dying etc)
    }
    SwitchPokemon(playerId: number, pokemonInId: number) {
        //not yet implemented, just for practice.
        const player = this.players.find(p => p.id === playerId);
        const pokemon = player?.pokemon.find(p => p.id === pokemonInId);
        const switchOutPokemonId = player?.currentPokemonId;


        if (player === undefined || pokemon === undefined) {
            console.error('error in switching pokemon');
            //should never get to this point?
            return;
        }

        //current pokemon position is 0

        //find the pokemon to switch in position
        const switchInPokemonPos = player.pokemon.indexOf(player.pokemon.find(p => p.id === pokemonInId)!);
        let pokemonArrCopy = player.pokemon.slice();

        pokemonArrCopy[0] = player.pokemon[switchInPokemonPos];
        pokemonArrCopy[switchInPokemonPos] = player.pokemon[0];

        player.pokemon = pokemonArrCopy;
        player.currentPokemonId = pokemonArrCopy[0].id;

        const switchOutEffect: SwitchOutEffect = {
            type: EffectType.SwitchOut,
            switchOutPokemonId: switchOutPokemonId!,
            switchInPokemonId: pokemonInId,
            message: '',
        }
        const switchInEffect: SwitchInEffect = {
            type: EffectType.SwitchIn,
            switchOutPokemonId: switchOutPokemonId!,
            switchInPokemonId: pokemonInId,
            message: `Go ${player.pokemon[0].name}!`
        }

        const log: BattleEvent = {
            id:this.eventNum++,
            type: BattleEventType.SwitchPokemon,
            message: 'Enough, Come back!',
            effects: [switchOutEffect, switchInEffect]
        }

        this.turnLog.push(log);
        return {
            pokemonHasFainted: false,
            defendingPlayerId: 1
        };

    }
    UseItem(playerId: number, itemId: number) {
        //not implemented yet;
    }

    UseTechnique(playerId: number, pokemonId: number, techniqueId: number) {

        const player = this.players.find(p => p.id === playerId);
        const pokemon = player?.pokemon.find(p => p.id === pokemonId);
        const move = pokemon?.techniques.find(t => t.id === techniqueId);

        //This should work as long as it stays 1v1
        const defendingPlayer = this.players.find(p => p !== player);
        const defendingPokemon = defendingPlayer?.pokemon.find(p => p.id === defendingPlayer.currentPokemonId);


        if (player === undefined || pokemon === undefined || move === undefined || defendingPlayer === undefined || defendingPokemon === undefined) {
            console.error('error in using technique');
            //should never get to this point?
            return;
        }
        //Only Programming Damaging Moves for Now.

        //Check if the move should miss:       
        const randomAmount = Math.round(Math.random() * 100);
        if (move.chance < randomAmount) {
            const missedMoveEffect: MissedMoveEffect = {
                type: EffectType.MissedMove,
                message: 'But it failed!'
            }
            let missedMoveLog: BattleEvent =
            {
                id:this.eventNum++,
                type: BattleEventType.UseMove,
                message: `${pokemon.name} used ${move.name}`,
                effects: [missedMoveEffect]
            }
            this.turnLog.push(missedMoveLog);
            return {
                pokemonHasFainted: defendingPokemon.currentStats.health === 0,
                defendingPlayerId: defendingPlayer.id
            };
        }

        const baseDamage = GetBaseDamage(pokemon, defendingPokemon, move);
        const damageModifierInfo = GetDamageModifier(pokemon, defendingPokemon, move);

        const totalDamage = Math.ceil(baseDamage * damageModifierInfo.modValue);

        //apply the damage
        defendingPokemon.currentStats.health -= totalDamage;
        defendingPokemon.currentStats.health = Math.max(0, defendingPokemon.currentStats.health);



        //we need to figure out if it was super effective ornot
        //need to move the super effectiveness calculation function out and call it here to find out? or have the damage calculator return
        //all the variables used in an object?
        let effectiveLabel = GetEffectivenessMessage(defendingPokemon, move);


        //TODO: Apply Secondary Effects (i.e. Fireblast Burn)
        if (move.secondaryEffects) {
            move.secondaryEffects.map(m => {
                const randomAmount = Math.round(Math.random() * 100);
                if (m.chance <= randomAmount) {
                    //Apply effect here.                   

                }
                return {};
            });
        }

        const damageEffect: DamageEffect = {
            type: EffectType.Damage,
            targetPokemonId: defendingPokemon.id,
            attackerPokemonId: pokemon.id,
            targetFinalHealth: defendingPokemon.currentStats.health,
            targetDamageTaken: totalDamage,
            effectiveness: GetTypeMod(defendingPokemon.elementalTypes, move.elementalType).toString(),
            message: damageModifierInfo.critStrike ? "It was a critical strike! " + effectiveLabel : effectiveLabel
        }
        const log: BattleEvent =
        {
            id:this.eventNum++,
            type: BattleEventType.UseMove,
            message: `${pokemon.name} used ${move.name}`,
            effects: [damageEffect]
        }

        //add a critical strike effect if it crits?
        this.turnLog.push(log);

        //check to see if pokemon has fainted.
        if (defendingPokemon.currentStats.health === 0) {
            const faintedPokemonEffect: FaintedPokemonEffect = {
                targetPokemonId: defendingPokemon.id,
                type: EffectType.PokemonFainted,
                message: ''
            }

            let pokemonFaintedLog: BattleEvent =
            {
                id:this.eventNum++,
                type: BattleEventType.PokemonFainted,
                message: defendingPokemon.name + ' has fainted!',
                effects: [faintedPokemonEffect]
            }

            this.turnLog.push(
                pokemonFaintedLog
            )
        }

        return {
            pokemonHasFainted: defendingPokemon.currentStats.health === 0,
            defendingPlayerId: defendingPlayer.id
        }
    }
    DoAction(action: BattleAction) {
        switch (action.type) {
            case 'switch-pokemon-action': {
                return this.SwitchPokemon(action.playerId, action.switchPokemonId);
                break;
            }
            case 'use-item-action': {
                return { pokemonHasFainted: false, defendingPlayerId: 1 }
                break;
                //this.UseItem(action.playerId,action.itemId);
            }
            case 'use-move-action': {
                return this.UseTechnique(action.playerId, action.pokemonId, action.moveId);
                break;
            }
        }
    }
    CheckDeaths() {
        //check if any pokemon have died.

    }

};

function GetEffectivenessMessage(defendingPokemon: Pokemon, move: Technique) {
    const effectiveness = GetTypeMod(defendingPokemon.elementalTypes, move.elementalType);
    let effectiveLabel = '';
    switch (effectiveness) {
        case 0.25: {
            effectiveLabel = "It wasn't very effective";
            break;
        }
        case 0.5: {
            effectiveLabel = "It wasn't very effective";
            break;
        }
        case 1.0: {
            effectiveLabel = "Normal Effectiveness";
            break;
        }
        case 2.0: {
            effectiveLabel = "It was super effective";
            break;
        }
        case 4.0: {
            effectiveLabel = "It was super effective";
            break;
        }
        default: {
            break;
        }

    }
    return effectiveLabel;
}