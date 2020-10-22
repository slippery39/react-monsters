import { Pokemon, Player, Technique, Status } from './interfaces';
import { GetBaseDamage, GetDamageModifier, GetTypeMod } from './DamageFunctions';
import { GetMoveOrder } from './BattleFunctions';
import { BattleEvent, DamageEffect, FaintedPokemonEffect, HealEffect, SwitchInEffect, SwitchOutEffect, UseItemEffect, UseMoveEffect, EffectType, CannotAttackEffect,StatusChangeEffect } from "./BattleEffects";
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

    itemIdCount = 1;
    pokemonIdCount=1;


    currentState: State = { type: 'awaiting-initial-actions' }

    constructor(turnId: Number, players: Array<Player>) {
        this.id = turnId;
        this.players = players;
   
        this.AutoAssignPokemonIds();
        this.AutoAssignCurrentPokemonIds();
        this.AutoAssignItemIds();
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
    //Any status conditions or whatever that must apply before the pokemon starts to attack.
    private BeforeAttack(pokemon:Pokemon): {canAttack:boolean}{



        const event = this.CreateEvent();

        if (pokemon.status === Status.Paralyzed){
            const paralyzeChance = 25;
            const chanceToAttack = this.GetRandomChance();

            if (chanceToAttack<=paralyzeChance){
                const cantAttackEffect : CannotAttackEffect = {
                    type:EffectType.CantAttack,
                    targetPokemonId:pokemon.id,
                    reason:Status.Paralyzed
                }
                event.effects.push(cantAttackEffect);
                this.turnLog.push(event);

                return {canAttack:false}
            }
            //chance to not move
            //add the event to the log if applicable
        }
        else if (pokemon.status === Status.Sleep){            
            //chance to not move
            //add the event to the log if applicable
        }
        else if (pokemon.status === Status.Frozen){
            //chance to not move
            //add the event to the log if applicable
        }
        return {canAttack:true}

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

    //For testing only
    SetStatusOfPokemon(pokemonId:number,status:Status){
        this.GetPokemon(pokemonId).status = status;
        //need some way of notifying the service.
    }

    CalculateTurn() {

        const actionOrder = this.GetMoveOrder();
        if (this.currentState.type === 'first-action') {
            const actionResult = this.DoAction(actionOrder[0]);
            //CheckIfPokemonHasJustFainted() //checks if a pokemon has fainted due to the last action performed.
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

        //i don't think we actualy want to switch the pokemon position anymore?
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



    UseItem(playerId: number, itemId: number) {
        const player = this.GetPlayer(playerId);
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


        item.effects.forEach(effect=>{

            if (effect.type === 'health-restore'){
                const itemHealAmount = effect.amount;
                const healing = Math.min(pokemon.originalStats.health - pokemon.currentStats.health, itemHealAmount);
                pokemon.currentStats.health = Math.min(pokemon.originalStats.health, pokemon.currentStats.health + itemHealAmount);
                let itemEffect: HealEffect = {
                    type: EffectType.Heal,
                    targetPokemonId: pokemon.id,
                    targetFinalHealth: pokemon.currentStats.health,
                    totalHealing: healing,
                }
                itemEvent.effects.push(itemEffect);
            }
        });

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

        const player = this.GetPlayer(playerId);
        const pokemon = this.GetPokemon(pokemonId);
        const move = pokemon.techniques.find(t => t.id === techniqueId);


        const beforeAttackResult = this.BeforeAttack(pokemon);

        if (!beforeAttackResult.canAttack){
            return {
                pokemonHasFainted:false,
                defendingPlayerId:0
            }
        }

        //This should work as long as it stays 1v1;
        const defendingPlayer = this.players.find(p => p !== player);
        if (defendingPlayer === undefined){
            throw new Error(`Could not find defending player`);
        }

        const defendingPokemon = this.GetPokemon(defendingPlayer.currentPokemonId);

        if (move === undefined) {
            throw new Error(`Error in using technique, could not find technique with id ${techniqueId}`);
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
        const randomAmount = this.GetRandomChance();
        if (move.chance < randomAmount) {
            useMoveEffect.didMoveHit = false;
            return {
                pokemonHasFainted: defendingPokemon.currentStats.health === 0,
                defendingPlayerId: defendingPlayer.id
            };
        }


        if (move.damageType === 'physical' || move.damageType === 'special'){
            //this method was extracted by using "extract method" and needs to be refactored. we should probably just return a partial event log.
            const retValue = this.DoDamageMove(pokemon, defendingPokemon, move, usedTechniqueEvent, defendingPlayer);
            this.ApplyMoveEffects(move,pokemon,defendingPokemon,usedTechniqueEvent);
            return retValue;
        }
        else{
            //this method was extracted by using extract method and should be refactored.
            return this.DoStatusMove(move, defendingPokemon, pokemon, usedTechniqueEvent);
        }
  
    }

    private DoStatusMove(move: Technique, defendingPokemon: Pokemon, pokemon: Pokemon, usedTechniqueEvent: BattleEvent) {
        this.ApplyMoveEffects(move, pokemon, defendingPokemon, usedTechniqueEvent);
        return {
            pokemonHasFainted: false,
            defendingPlayerId: -1
        }
    }

    private ApplyMoveEffects(move: Technique, pokemon: Pokemon, defendingPokemon: Pokemon, usedTechniqueEvent: BattleEvent) {
        if (!move.effects) {
            return;
        }
        move.effects.forEach((effect) => {
            const roll = this.GetRandomChance();
            if (effect.chance >= roll) {
                if (effect.type === 'inflict-status') {
                    const targetPokemon = effect.target === 'ally' ? pokemon : defendingPokemon;
                    targetPokemon.status = effect.status;
                    const statusInflictedEffect: StatusChangeEffect = {
                        type: EffectType.StatusChange,
                        status: effect.status,
                        attackerPokemonId: pokemon.id,
                        targetPokemonId: targetPokemon.id
                    };
                    usedTechniqueEvent.effects.push(statusInflictedEffect);
                }
            }
        });
    }

    //refactor this
    private DoDamageMove(pokemon: Pokemon, defendingPokemon: Pokemon, move: Technique, usedTechniqueEvent: BattleEvent, defendingPlayer: Player) {
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
        };
        usedTechniqueEvent.effects.push(damageEffect);

        //POKEMON FAINT CHECK, I DON'T KNOW IF THIS SHOULD ACTUALLY HAPPEN HERE
        //check to see if pokemon has fainted.
        if (defendingPokemon.currentStats.health === 0) {
            const faintedPokemonEffect: FaintedPokemonEffect = {
                targetPokemonId: defendingPokemon.id,
                type: EffectType.PokemonFainted,
            };
            usedTechniqueEvent.effects.push(faintedPokemonEffect);
        }

        return {
            pokemonHasFainted: defendingPokemon.currentStats.health === 0,
            defendingPlayerId: defendingPlayer.id
        };
    }
  
    EndTurn() {
        this.currentState = {
            type: 'turn-finished'
        }
    }
  
    /*
        PRIVATE INTERNAL METHODS
    */
    private GetRandomChance(): number{
        return Math.round(Math.random() * 100);
    }

    private GetPlayer(playerId: number) : Player {
        const player = this.players.find(player=>player.id === playerId);
        if (player === undefined){
            throw new Error(`Could not find player with id ${playerId}`);
        }
        return player;
    }
    private GetPokemon(pokemonId:number):Pokemon{
        const pokemon = this.players.map(player=>{return player.pokemon}).flat().find(pokemon=>pokemon.id === pokemonId);
        if (pokemon === undefined){
            throw new Error(`Could not find pokemon with id ${pokemonId}`);
        }
        return pokemon;
    }

    private GetActivePokemon(playerId: number): Pokemon | undefined {
        const player = this.GetPlayer(playerId);
        const activePokemon = player.pokemon.find(poke => poke.id === player.currentPokemonId);
        if (activePokemon === undefined){
            throw new Error(`Could not find active pokemon for player with id ${playerId}`)
        }
        return activePokemon;
    }
    
    private AutoAssignPokemonIds():void{
        this.players.flat().map(player=>{
            return player.pokemon           
        }).flat().forEach(pokemon=>{
            //quick hack here to see if the id for these entities has already been set, this pattern is repeated in the auto assign item ids and auto assign current pokemon ids functions as well.
            if (pokemon.id===-1){
            pokemon.id = this.pokemonIdCount++
            }
        });
        console.log(this.players);
    }

    private AutoAssignItemIds():void{
        this.players.flat().map(player=>{
            return player.items            
        }).flat().forEach(item=>{
            if (item.id===-1){
            item.id = this.itemIdCount++;
            }
        });
        console.log(this.players);
    }

    private AutoAssignCurrentPokemonIds():void{
        if (this.players[0].currentPokemonId===-1){
        this.players[0].currentPokemonId = this.players[0].pokemon[0].id;
        }
        if (this.players[1].currentPokemonId===-1){
        this.players[1].currentPokemonId = this.players[1].pokemon[0].id;
        }
    }    
    private GetMoveOrder() {
        return GetMoveOrder(this.players, this.initialActions);
    }
    private CreateEvent(): BattleEvent {
        const evt: BattleEvent = {
            id: this.eventNum++,
            effects: []
        }
        return evt;
    }

};
