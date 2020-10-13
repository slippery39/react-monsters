import {Pokemon, Technique, Player } from './interfaces';
import _ from 'lodash';
import { GetBaseDamage, GetDamageModifier, GetTypeMod } from './DamageFunctions';
import { GetMoveOrder } from './BattleFunctions';


export enum BattleEventType {
    /*
    all events except for the generic event are being depreciated, once we convert everything over to our new event system we will
    remove the event types completely and everything relevant will be moved to an "effect" instead.

    the messages shown will be moved to the UI code instead of being set in the backend.
    */
    GenericEvent = 'generic-event', //all of our events will be generic from now on 
    UseMove = 'use-move',
    SwitchPokemon = 'switch-pokemon',
    CriticalHIt = 'critical-hit',
    UseItem = 'use-item',
    //non user initiated events can happen here too, (like poison damage, pokemon unable to move because of stun,confusion or frozen etc)
    PokemonFainted = 'pokemon-fainted',
    PoisonDamage = 'poison-damage',
    SwitchIn = 'switch-in',
    SwitchOut = 'switch-out',
    
}

export enum EffectType {
    Damage = 'damage',
    Heal = 'heal',
    Switch = 'switch',
    Poisoned = 'poisoned',
    UsedTechnique = 'used-technique',
    StatusChange = 'status-change',
    PokemonFainted = 'pokemon-fainted',
    UseMove = 'use-move',
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
    didCritical:boolean,
    effectivenessAmt:number
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

export interface UseMoveEffect {
    type: EffectType.UseMove,
    userId: number,
    targetId:number,
    didMoveHit:Boolean,
    message:string,
    moveName:string
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
    effects: Array<SwitchOutEffect | SwitchInEffect | DamageEffect | HealEffect | MissedMoveEffect | FaintedPokemonEffect | UseMoveEffect>,
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

    GetPlayer(playerId:number){
        return this.players.find(player=>player.id === playerId);
    }

    GetActivePokemon(playerId:number): Pokemon| undefined{
        const player = this.GetPlayer(playerId);
        const activePokemon = player?.pokemon.find(poke=>poke.id === player.currentPokemonId);
        return activePokemon;
    }

    UseItem(playerId: number, itemId: number) {
        //find the player
        //find the item in the player.
        //figure out the effect of the item
        //-1 the quantity of that item
        //if the quantity is 0 then remove that item completely from the inventory.

        const player = this.GetPlayer(playerId);


        if (player === undefined){
            console.error("could not find player for use item");
            return;
        }
        const item = player?.items.find(item=>item.id === itemId);

        if (item === undefined){
            console.error("could not find item to use for use item");
            return;
        }

        const pokemon = this.GetActivePokemon(playerId);

        if (pokemon === undefined){
            console.error("could not find pokemon to use for use item");
            return;
        }

        //hard coded in here, we will eventually need systems for each item type
        //and we will need to know which item is being used on what pokemon

        let itemEvent : BattleEvent = {
            id:this.eventNum++,
            type:BattleEventType.UseItem,
            message:`Trainer used ${item.name}`,
            effects:[]
        }


        switch (item?.name){
            case "Potion":{     
                

                const itemHealAmount = 20;
                //how do we figure out healing
                //its 20 - (originalStats.health - currentStats.health)
                //Math.min(currentStats.health-originalstats.health,20)
                
                const healing = Math.min(pokemon.currentStats.health - pokemon.originalStats.health,itemHealAmount);
                pokemon.currentStats.health = Math.min(pokemon.originalStats.health,pokemon.currentStats.health+itemHealAmount);
                let itemEffect : HealEffect = {
                    type: EffectType.Heal,
                    targetPokemonId: pokemon.id,
                    targetFinalHealth:pokemon.currentStats.health,
                    totalHealing:healing,
                    message:`${pokemon.name} healed a little!`
                }
                itemEvent.effects.push(itemEffect);
                break;
            }
            case "Super Potion":{

                const itemHealAmount = 60;
                const healing = Math.min(pokemon.currentStats.health - pokemon.originalStats.health,itemHealAmount);

                pokemon.currentStats.health = Math.min(pokemon.originalStats.health,pokemon.currentStats.health+itemHealAmount);
                let itemEffect : HealEffect = {
                    type: EffectType.Heal,
                    targetPokemonId: pokemon.id,
                    targetFinalHealth:pokemon.currentStats.health,
                    totalHealing:healing,
                    message:`${pokemon.name} healed decently!`
                }
                itemEvent.effects.push(itemEffect);
                break;
            }
            case "Hyper Potion":{

                const itemHealAmount = 250;
                const healing = Math.min(pokemon.currentStats.health - pokemon.originalStats.health,itemHealAmount);


                pokemon.currentStats.health = Math.min(pokemon.originalStats.health,pokemon.currentStats.health+itemHealAmount);
                let itemEffect : HealEffect = {
                    type: EffectType.Heal,
                    targetPokemonId: pokemon.id,
                    targetFinalHealth:pokemon.currentStats.health,
                    totalHealing:healing,
                    message:`${pokemon.name} healed alot!`
                }
                itemEvent.effects.push(itemEffect);
                break;
            }
            case "Max Potion":{

                const itemHealAmount = 999;
                const healing = Math.min(pokemon.currentStats.health - pokemon.originalStats.health,itemHealAmount);

                pokemon.currentStats.health = pokemon.originalStats.health;
                let itemEffect : HealEffect = {
                    type: EffectType.Heal,
                    targetPokemonId: pokemon.id,
                    targetFinalHealth:pokemon.currentStats.health,
                    totalHealing:healing,
                    message:`${pokemon.name} healed to max health!`
                }
                itemEvent.effects.push(itemEffect);
                break;
            }
        }
        item.quantity-=1;


        //remove item from inventory.
        if (item.quantity <=0){
            const itemIndex = player.items.indexOf(item);
            player.items.splice(itemIndex,1);
        }

        //todo: check if item quantity is 0 and remove it from inventory.

        this.turnLog.push(itemEvent);

        return {
            pokemonHasFainted: pokemon.currentStats.health === 0,
            defendingPlayerId: pokemon.id
        }
    }

    UseTechnique(playerId: number, pokemonId: number, techniqueId: number) {

        /*
        Wrap this in our new generic event with a bunch of effects
        'use-move'
        'missed-move'
        'deal-damage'
        etc

        our UI will figure out what message to display (if applicable for each effect)
        */

      


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


        //Create our event container
        //TODO: move this into its own Creator function
        const usedTechniqueEvent : BattleEvent = {
            id:this.eventNum++,
            type:BattleEventType.GenericEvent,
            effects:[],
            message:"no message needed"
        }
        this.turnLog.push(usedTechniqueEvent);

        const useMoveEffect : UseMoveEffect = {
            type:EffectType.UseMove,
            userId: pokemon.id,
            targetId: defendingPokemon.id,
            didMoveHit: true,
            moveName:move.name,
            message:'used move'
        }

        usedTechniqueEvent.effects.push(useMoveEffect);


        //Check if the move should miss: 
        const randomAmount = Math.round(Math.random() * 100);
        if (move.chance < randomAmount) {
            useMoveEffect.didMoveHit = false;            
            return {
                pokemonHasFainted: defendingPokemon.currentStats.health === 0,
                defendingPlayerId: defendingPlayer.id
            };
        }

        //calculate damage
        const baseDamage = GetBaseDamage(pokemon, defendingPokemon, move);
        const damageModifierInfo = GetDamageModifier(pokemon, defendingPokemon, move);
        const totalDamage = Math.ceil(baseDamage * damageModifierInfo.modValue);

        //apply the damage
        defendingPokemon.currentStats.health -= totalDamage;
        defendingPokemon.currentStats.health = Math.max(0, defendingPokemon.currentStats.health);

        //we need to figure out if it was super effective ornot
        //need to move the super effectiveness calculation function out and call it here to find out? or have the damage calculator return
        //all the variables used in an object?

        //TODO: delete this when ready
        let effectiveLabel = GetEffectivenessMessage(defendingPokemon, move);

        const effectiveness = GetTypeMod(defendingPokemon.elementalTypes, move.elementalType);
       
        //TODO: add didCritical:Boolean field.
        //TODO: add effectivenessAmt : Number field.
        const damageEffect: DamageEffect = {
            type: EffectType.Damage,
            targetPokemonId: defendingPokemon.id,
            attackerPokemonId: pokemon.id,
            targetFinalHealth: defendingPokemon.currentStats.health,
            targetDamageTaken: totalDamage,
            didCritical: damageModifierInfo.critStrike,
            effectivenessAmt:effectiveness,
            effectiveness: GetTypeMod(defendingPokemon.elementalTypes, move.elementalType).toString(),
            message: damageModifierInfo.critStrike ? "It was a critical strike! " + effectiveLabel : effectiveLabel //todo: remove when not needed
        }
        usedTechniqueEvent.effects.push(damageEffect);

        //POKEMON FAINT CHECK, I DON'T KNOW IF THIS SHOULD ACTUALLY HAPPEN HERE
        //check to see if pokemon has fainted.
        if (defendingPokemon.currentStats.health === 0) {
            const faintedPokemonEffect: FaintedPokemonEffect = {
                targetPokemonId: defendingPokemon.id,
                type: EffectType.PokemonFainted,
                message: ''
            }
            usedTechniqueEvent.effects.push(faintedPokemonEffect);
            //TODO: We will leave this in for now as its own event but I believe we should be moving this out of this function
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
            }
            case 'use-item-action': {
                return this.UseItem(action.playerId,action.itemId);
            }
            case 'use-move-action': {
                return this.UseTechnique(action.playerId, action.pokemonId, action.moveId);
            }
        }
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
            effectiveLabel = "";
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