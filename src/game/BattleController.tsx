import { Status, Pokemon, Technique, Player } from './interfaces';
import { createCharizard, createBlastoise, createVenusaur } from './premadePokemon';
import _ from 'lodash';
import { GetBaseDamage, GetDamageModifier, GetTypeMod } from './DamageFunctions';
import { GetMoveOrder } from './BattleFunctions';

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
    SwitchIn = 'switch-in',
    SwitchOut = 'switch-out',
    MissedMove = 'missed-move',
    None = 'none' //used in cases where nothing happaned (i.e an attack missed or something)
}

export interface Effect {
    pokemonId: number,
    targetPokemonId: number,
    type: EffectType,
    target: string, //should be enum?,
    targetName: string,
    targetId: number
    targetFinalHealth: number,
    targetDamageTaken: number,
    effectiveness: string,
    message: string
    status?: Status
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
    type: BattleEventType,
    message: string,
    effects: Array<SwitchOutEffect | SwitchInEffect | DamageEffect | HealEffect | MissedMoveEffect>,
}

export interface BattleEventsLog {
    events: Array<BattleEvent>,
    newState?:Array<Player>
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


export class Turn {
    //need to store the state here somehow.
    actions: Array<BattleAction> = [];
    players: Array<Player> = [] //needs to be initial turn state.
    turnLog: Array<BattleEvent> = [];
    turnFinished = false;
    id: Number;

    constructor(turnId: Number, players: Array<Player>) {
        this.id = turnId;
        this.players = players;
    }

    GetTurnLog(): Array<BattleEvent> | undefined {
        if (this.turnFinished === true) {
            //reset the logs.
            this.actions = [];
            console.log('the turn has been finished inside the game');
            console.log(this.turnLog);
            return this.turnLog;
        }
        else {
            return undefined
        }
    }

    SetPlayerAction(action: BattleAction) {
        const actionExistsForPlayer = this.actions.filter(act => act.playerId === action.playerId);
        if (actionExistsForPlayer.length === 0) {
            this.actions.push(action);
        }
        if (this.actions.length === 2) {
            if (!this.turnFinished) {
                this.CalculateTurn();
                this.turnFinished = true;
            }

        }
    }

    GetMoveOrder() {
        return GetMoveOrder(this.players, this.actions);
    }

    CalculateTurn() {
        /*
        const turnLog = {
            turnId:1,
            events:[
                {}//use move etc.
            ]
        }
        */

        if (this.turnFinished === false) {
            const actionOrder = this.GetMoveOrder();
            //lets run the moves.
            //this.StartTurn();            
            this.DoAction(actionOrder[0]);
            //this.CheckStateBasedEffects();
            //if (swutchPokemonNeeded){
            //wait for pokemon to be chosen before continuing the turn.
            //request a pokemon switch.
            //weird behaviour where if a pokemon dies due to its own recoil damage, we would still need to request a switch
            //for the player but still continue the rest of the actions in the turn.
            //to implement this we will have to be able to calculate the turn in steps and track which step we are currently on.              

            this.DoAction(actionOrder[1]);
            //this.CheckStateBasedEffects();
            //this.EndTurn():
            this.turnFinished = true;
        }

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
            message: 'Go Pokemon!'
        }

        const log: BattleEvent = {
            type: BattleEventType.SwitchPokemon,
            message: 'Enough, Come back!',
            effects: [switchOutEffect, switchInEffect]
        }

        this.turnLog.push(log);

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
                type: BattleEventType.UseMove,
                message: `${pokemon.name} used ${move.name}`,
                effects: [missedMoveEffect]
            }
            this.turnLog.push(missedMoveLog);
            return;
        }

        const baseDamage = GetBaseDamage(pokemon, defendingPokemon, move);
        const damageModifierInfo = GetDamageModifier(pokemon, defendingPokemon, move);

        const totalDamage = Math.ceil(baseDamage * damageModifierInfo.modValue);

        //apply the damage
        defendingPokemon.currentStats.health -= totalDamage;
        defendingPokemon.currentStats.health = Math.max(0, defendingPokemon.currentStats.health);

        //what do we need in the turn log?
        /*
                type: BattleEventType.UseMove,
                message: 'Charizard used fireblast!',
                effects: [{
                    type: EffectType.Damage,
                    target: 'enemy',
                    targetName: 'Blastoise',
                    targetId: 4,
                    targetFinalHealth: 100,
                    effectiveness: 'super',
                    message: 'it was super effective!'
                }],
            },*/

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
            type: BattleEventType.UseMove,
            message: `${pokemon.name} used ${move.name}`,
            effects: [damageEffect]
        }

        //add a critical strike effect if it crits?

        this.turnLog.push(log);
    }




    DoAction(action: BattleAction) {
        switch (action.type) {
            case 'switch-pokemon-action': {                
                this.SwitchPokemon(action.playerId,action.switchPokemonId);
                break;
            }
            case 'use-item-action': {
                break;
                //this.UseItem(action.playerId,action.itemId);
            }
            case 'use-move-action': {
                this.UseTechnique(action.playerId, action.pokemonId, action.moveId);
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


const player1: Player = {
    id: 1,
    name: 'Shayne',
    pokemon: [
        createCharizard(1),
        createVenusaur(2),
        createBlastoise(3)
    ],
    currentPokemonId: 1,
    items: []
}
const player2: Player = {
    id: 2,
    name: 'Bob',
    pokemon: [
        createBlastoise(4),
        createVenusaur(5),
        createCharizard(6)
    ],
    currentPokemonId: 4,
    items: []
}

//In progress
/*
class Battle{
    turns:Array<Turn> = [];
    turnIndex = 0;
    //right now our players is basically our state.
    players:Array<Player> = [player1,player2];


    constructor(){

    }
    GetCurrentTurn(){
        return turns[turnIndex];
    }
    GetPlayers() : Array<Player>{
        return _.cloneDeep(GetCurrentTurn().players);
    }
}
*/

//so now after every turn, we should create a new turn with copies of the players?
let turns: Array<Turn> = [];
let turnIndex = 0;
turns.push(new Turn(1, [player1, player2]));

function GetCurrentTurn() {
    return turns[turnIndex];
}

//gets the player state for the current turn?
export function GetPlayers(): Array<Player> {
    return _.cloneDeep(GetCurrentTurn().players);
}


//Lets set a course of action here.
//So lets expose an interface to the "Front-End that allows us to set actions"
//this is wrapped because we do not want to expose anything about the battle system to the front-end
export function SetPlayerAction(action: BattleAction) {
    turns[turnIndex].SetPlayerAction(action);
}

export function getTurnLog(): BattleEventsLog | undefined {

    //TODO: Mock this turn log, by auto applying actions
    //lets say Charizard uses fireblast and Blastoise uses HydroPump or something.

    const player1 = GetCurrentTurn().players[0];
    const player2 = GetCurrentTurn().players[1];

    const moveId2 = player2.pokemon.find(p => p.id === player2.currentPokemonId)?.techniques[0].id || -1;
    const player2Action: UseMoveAction = {
        type: 'use-move-action',
        playerId: player2.id,
        pokemonId: player2.currentPokemonId,
        moveId: moveId2
    }

    //battle.SetPlayerAction(player1Action);
    GetCurrentTurn().SetPlayerAction(player2Action);

    if (GetCurrentTurn().GetTurnLog() === undefined) {
        return undefined;
    }
    console.log('should be returning the turn log at this point');
    const returnLog = {
        events: GetCurrentTurn().GetTurnLog()!,
        newState:GetPlayers()
    }

    console.log(returnLog);

    //start the next turn
    turnIndex++;
    turns.push(new Turn(turnIndex + 1, [player1, player2]));

    return returnLog;

    /*
    const battleState: BattleEventsLog = {
        events: [
            
            {
                type: BattleEventType.UseMove,
                message: 'Charizard used fireblast!',
                effects: [{
                    type: EffectType.Damage,
                    target: 'enemy',
                    targetName: 'Blastoise',
                    targetId: 4,
                    targetFinalHealth: 100,
                    effectiveness: 'super',
                    message: 'it was super effective!'
                }],
            },
            {
                type: BattleEventType.UseMove,
                message: 'Blastoise used Hydropump!',
                effects: [{
                    type: EffectType.Damage,
                    target: 'enemy',
                    targetName: 'charizard',
                    targetId: 1,
                    targetFinalHealth: 50,
                    effectiveness: 'super',
                    message: 'It was super effective!'
                }],
            },
            {
                type: BattleEventType.UseItem,
                message: 'You used a potion on charizard!', //if a message is blank, then it should skip the message?,
                effects: [{
                    type: EffectType.Heal,
                    target: 'enemy',
                    targetName: 'charizard',
                    targetId: 1,
                    targetFinalHealth: 300,
                    effectiveness: 'none',
                    message: 'Charizard healed a little!'
                }],
            },
            {
                type: BattleEventType.UseMove,
                message: 'Charizard used Poison Blast!',
                effects: [{
                    type: EffectType.Damage,
                    target: 'enemy',
                    targetName: 'Blastoise',
                    targetId: 4,
                    targetFinalHealth: 20,
                    effectiveness: 'Not very effective',
                    message: 'It was not very effective!'
                },
                {
                    type: EffectType.Poisoned,
                    target: 'enemy',
                    targetName: 'Blastoise',
                    targetId: 4,
                    targetFinalHealth: 99999,
                    effectiveness: 'none',
                    message: 'Blastoise was poisoned!'
                }
                ],
            },
            {
                type: BattleEventType.PoisonDamage,
                message: '',
                effects: [{
                    type: EffectType.Damage,
                    target: 'enemy',
                    targetName: 'Blastoise',
                    targetFinalHealth: 10,
                    targetId: 4,
                    effectiveness: 'none',
                    message: 'Blastoise was hurt due to poison!'
                }]
            },
            */
    /*
     {
         type: BattleEventType.SwitchOut,
         message: 'Enough Charizard, Come back!',
         effects: [{
             type: EffectType.SwitchOut,
             targetName: 'Charizard',
             target: 'ally',
             targetId: 1,
             targetFinalHealth: 9999,
             effectiveness: 'none',
             message: ''
         }]
     },
     {
         type: BattleEventType.SwitchIn,
         message: 'Go Venusaur!',
         effects: [
             {
                 type: EffectType.SwitchIn,
                 targetName: 'Venusaur',
                 target: 'ally',
                 targetId: 2,
                 targetFinalHealth: 9999,
                 effectiveness: 'none',
                 message: ''
             }
         ]
     }
     

 ]
}
return battleState;
*/
}