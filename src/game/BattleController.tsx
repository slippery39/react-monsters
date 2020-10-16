import { Pokemon, Player } from './interfaces';
import { GetBaseDamage, GetDamageModifier, GetTypeMod } from './DamageFunctions';
import { GetMoveOrder } from './BattleFunctions';
import { BattleEvent, DamageEffect, FaintedPokemonEffect, HealEffect, SwitchInEffect, SwitchOutEffect, UseItemEffect, UseMoveEffect, EffectType } from "./BattleEffects";
import { SwitchPokemonAction, BattleAction } from "./BattleActions";

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
                type: 'first-action'
            }
            this.CalculateTurn();
        }
    }

    CreateEvent(): BattleEvent {
        const evt: BattleEvent = {
            id: this.eventNum++,
            effects: []
        }
        return evt;
    }

    //Special Action for when a pokemon faints in the middle of the turn.
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
        }
        const switchInEffect: SwitchInEffect = {
            type: EffectType.SwitchIn,
            switchOutPokemonId: switchOutPokemonId!,
            switchInPokemonId: pokemonInId,
        }


        const log: BattleEvent = this.CreateEvent();
        log.effects = [switchOutEffect, switchInEffect];



        this.turnLog.push(log);
        return {
            pokemonHasFainted: false,
            defendingPlayerId: 1
        };
    }

    GetPlayer(playerId: number) {
        return this.players.find(player => player.id === playerId);
    }

    GetActivePokemon(playerId: number): Pokemon | undefined {
        const player = this.GetPlayer(playerId);
        const activePokemon = player?.pokemon.find(poke => poke.id === player.currentPokemonId);
        return activePokemon;
    }

    UseItem(playerId: number, itemId: number) {
        //find the player
        //find the item in the player.
        //figure out the effect of the item
        //-1 the quantity of that item
        //if the quantity is 0 then remove that item completely from the inventory.

        const player = this.GetPlayer(playerId);


        if (player === undefined) {
            console.error("could not find player for use item");
            return;
        }
        const item = player?.items.find(item => item.id === itemId);

        if (item === undefined) {
            console.error("could not find item to use for use item");
            return;
        }

        const pokemon = this.GetActivePokemon(playerId);

        if (pokemon === undefined) {
            console.error("could not find pokemon to use for use item");
            return;
        }

        //hard coded in here, we will eventually need systems for each item type
        //and we will need to know which item is being used on what pokemon

        let itemEvent: BattleEvent = this.CreateEvent();

        const useItemEffect: UseItemEffect = {
            type: EffectType.UseItem,
            itemName: item.name,
            itemId: item.id,
            targetPokemonId: pokemon.id
        }

        itemEvent.effects.push(useItemEffect);


        switch (item?.name) {
            case "Potion": {
                const itemHealAmount = 20;
                //how do we figure out healing
                //its 20 - (originalStats.health - currentStats.health)
                //Math.min(currentStats.health-originalstats.health,20)

                //so basically you cant over heal
                //so its (pokemon.currentStats.health + itemHealAmount) - pokemon.original

                const healing = Math.min(pokemon.originalStats.health - pokemon.currentStats.health, itemHealAmount);
                pokemon.currentStats.health = Math.min(pokemon.originalStats.health, pokemon.currentStats.health + itemHealAmount);
                let itemEffect: HealEffect = {
                    type: EffectType.Heal,
                    targetPokemonId: pokemon.id,
                    targetFinalHealth: pokemon.currentStats.health,
                    totalHealing: healing,
                }
                itemEvent.effects.push(itemEffect);
                break;
            }
            case "Super Potion": {
                const itemHealAmount = 60;
                const healing = Math.min(pokemon.originalStats.health - pokemon.currentStats.health, itemHealAmount);

                pokemon.currentStats.health = Math.min(pokemon.originalStats.health, pokemon.currentStats.health + itemHealAmount);
                let itemEffect: HealEffect = {
                    type: EffectType.Heal,
                    targetPokemonId: pokemon.id,
                    targetFinalHealth: pokemon.currentStats.health,
                    totalHealing: healing,
                }
                itemEvent.effects.push(itemEffect);
                break;
            }
            case "Hyper Potion": {
                const itemHealAmount = 250;
                const healing = Math.min(pokemon.originalStats.health - pokemon.currentStats.health, itemHealAmount);

                pokemon.currentStats.health = Math.min(pokemon.originalStats.health, pokemon.currentStats.health + itemHealAmount);
                let itemEffect: HealEffect = {
                    type: EffectType.Heal,
                    targetPokemonId: pokemon.id,
                    targetFinalHealth: pokemon.currentStats.health,
                    totalHealing: healing,
                }
                itemEvent.effects.push(itemEffect);
                break;
            }
            case "Max Potion": {

                const itemHealAmount = 999;
                const healing = Math.min(pokemon.originalStats.health - pokemon.currentStats.health, itemHealAmount);

                pokemon.currentStats.health = pokemon.originalStats.health;
                let itemEffect: HealEffect = {
                    type: EffectType.Heal,
                    targetPokemonId: pokemon.id,
                    targetFinalHealth: pokemon.currentStats.health,
                    totalHealing: healing,
                }
                itemEvent.effects.push(itemEffect);
                break;
            }
        }
        item.quantity -= 1;


        //remove item from inventory.
        if (item.quantity <= 0) {
            const itemIndex = player.items.indexOf(item);
            player.items.splice(itemIndex, 1);
        }

        this.turnLog.push(itemEvent);

        return {
            pokemonHasFainted: pokemon.currentStats.health === 0,
            defendingPlayerId: pokemon.id
        }
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

        const usedTechniqueEvent: BattleEvent = this.CreateEvent();
        this.turnLog.push(usedTechniqueEvent);

        const useMoveEffect: UseMoveEffect = {
            type: EffectType.UseMove,
            userId: pokemon.id,
            targetId: defendingPokemon.id,
            didMoveHit: true,
            moveName: move.name,
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

        const effectiveness = GetTypeMod(defendingPokemon.elementalTypes, move.elementalType);

        const damageEffect: DamageEffect = {
            type: EffectType.Damage,
            targetPokemonId: defendingPokemon.id,
            attackerPokemonId: pokemon.id,
            targetFinalHealth: defendingPokemon.currentStats.health,
            targetDamageTaken: totalDamage,
            didCritical: damageModifierInfo.critStrike,
            effectivenessAmt: effectiveness,
        }
        usedTechniqueEvent.effects.push(damageEffect);

        //POKEMON FAINT CHECK, I DON'T KNOW IF THIS SHOULD ACTUALLY HAPPEN HERE
        //check to see if pokemon has fainted.
        if (defendingPokemon.currentStats.health === 0) {
            const faintedPokemonEffect: FaintedPokemonEffect = {
                targetPokemonId: defendingPokemon.id,
                type: EffectType.PokemonFainted,
            }
            usedTechniqueEvent.effects.push(faintedPokemonEffect);
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
                return this.UseItem(action.playerId, action.itemId);
            }
            case 'use-move-action': {
                return this.UseTechnique(action.playerId, action.pokemonId, action.moveId);
            }
        }
    }
};
