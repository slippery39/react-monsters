import PokemonImage from "components/PokemonImage/PokemonImage";
import { BattleEventType, GenericMessageEvent } from "game/BattleEvents";
import { IBeforeAttack, ICanApply, IEndOfTurn } from "game/HardStatus/HardStatus"
import { GetActivePokemon, HasElementType } from "game/HelperFunctions";
import { ElementType } from "game/interfaces";
import { HasVolatileStatus, IPokemon, PokemonBuilder } from "game/Pokemon/Pokemon";
import { Turn } from "game/Turn";
import _ from "lodash";


export enum VolatileStatusType {
    Confusion = 'confusion',
    AquaRing = 'aqua-ring',
    LeechSeed = 'leech-seed',
    Flinch = 'flinch',
    Roosted = 'roosted'
    
}

export interface VolatileStatus extends IBeforeAttack, IEndOfTurn, ICanApply {
    type: VolatileStatusType,
    OnApply:(turn:Turn,pokemon:IPokemon)=>void,
    InflictedMessage:(pokemon:IPokemon)=>string
}



abstract class AbstractVolatileStatus implements VolatileStatus {
    abstract type: VolatileStatusType   

    abstract InflictedMessage(pokemon:IPokemon):string
    
    BeforeAttack(turn: Turn, pokemon: IPokemon) {

    }
    EndOfTurn(turn: Turn, pokemon: IPokemon) {

    }
    OnApply(turn:Turn,pokemon:IPokemon){

    }
    CanApply(turn: Turn, pokemon: IPokemon) {
        return !HasVolatileStatus(pokemon,this.type)
    }
}

export class RoostedVolatileStatus extends AbstractVolatileStatus{
    type =  VolatileStatusType.Roosted

    private originalTypes : Array<ElementType> = [];

    InflictedMessage(pokemon:IPokemon){
        return `${pokemon.name} has roosted!`
    }

    OnApply(turn:Turn,pokemon:IPokemon){

        this.originalTypes = [...pokemon.elementalTypes];
        //remove the flying element of the pokemon
        _.remove(pokemon.elementalTypes,(elType)=>{
            return elType === ElementType.Flying
        });
    }

    EndOfTurn(turn:Turn,pokemon:IPokemon){

        //we will also need to make sure this gets applied whenever the pokemon is switched out as well.
        pokemon.elementalTypes = this.originalTypes;   
        _.remove(pokemon.volatileStatuses,(vStat)=>
        vStat.type === this.type
        );
    }   

}

export class AquaRingVolatileStatus extends AbstractVolatileStatus{   
    type:VolatileStatusType = VolatileStatusType.AquaRing;

    InflictedMessage(pokemon: IPokemon): string {
       return `${pokemon.name} has surrounded itself in a veil of water!`
    }
    EndOfTurn(turn:Turn,pokemon:IPokemon){
        //heal 1/16 of hp
        turn.ApplyHealing(pokemon,pokemon.originalStats.health/16);
        const message: GenericMessageEvent ={
            type:BattleEventType.GenericMessage,
            defaultMessage:`${pokemon.name} restored a little health due to aqua veil!`
        }
        turn.AddEvent(message);

    }
}


export class FlinchVolatileStatus extends AbstractVolatileStatus{
    type:VolatileStatusType = VolatileStatusType.Flinch

    InflictedMessage(pokemon:IPokemon):string {
        //hack here. we may need an "on apply" method
        return ``;
    }

    //Not sure if we should apply here or we should apply on attack.
    OnApply(turn:Turn,pokemon:IPokemon){       
    }

    BeforeAttack(turn:Turn,pokemon:IPokemon){
        pokemon.canAttackThisTurn = false;

        const message: GenericMessageEvent ={
            type:BattleEventType.GenericMessage,
            defaultMessage:`${pokemon.name} has flinched!`
        }
        turn.AddEvent(message);
    }

    EndOfTurn(turn:Turn,pokemon:IPokemon){
        //Status gets removed at end of turn.
        _.remove(pokemon.volatileStatuses,(vStat)=>
            vStat.type === this.type
        );
    }
}

export class LeechSeedVolatileStatus extends AbstractVolatileStatus{
    type: VolatileStatusType = VolatileStatusType.LeechSeed;

    InflictedMessage(pokemon: IPokemon): string {
        return `${pokemon.name} has been seeded!`;
    }

    CanApply(turn:Turn, pokemon: IPokemon){
        return super.CanApply(turn,pokemon) && !HasElementType(pokemon,ElementType.Grass);
    }

    EndOfTurn(turn:Turn, pokemon: IPokemon){
        const leechSeedDamage = pokemon.originalStats.health/16;
        //deal the leech seed damage to the pokemon
        //heal the opponent pokemon
        const opponentPlayer = turn.players.find(player=>player.currentPokemonId!== pokemon.id);
        if (opponentPlayer === undefined){
            throw new Error('Could not find player for leech seed end of turn');
        }

        const opponentPokemon = GetActivePokemon(opponentPlayer);
        turn.ApplyDamage(pokemon,leechSeedDamage,{});
        turn.ApplyHealing(opponentPokemon,leechSeedDamage);
        const message: GenericMessageEvent ={
            type:BattleEventType.GenericMessage,
            defaultMessage:`${pokemon.name} had its health drained a little due to leech seed!`
        }
        turn.AddEvent(message);
    }
}


export class ConfusionVolatileStatus extends AbstractVolatileStatus {
    type: VolatileStatusType = VolatileStatusType.Confusion;

    private unconfuseChance: number = 25;
    private damageSelfChance: number = 50

    BeforeAttack(turn: Turn, pokemon: IPokemon) {

        if (pokemon.canAttackThisTurn === false) {
            return;
        }

        if (turn.Roll(this.unconfuseChance)) {
            //the attacking pokemon is no longer confused
            _.remove(pokemon.volatileStatuses, (vstatus) => vstatus.type === 'confusion');
            const unconfuseEvent: GenericMessageEvent = {
                type: BattleEventType.GenericMessage,
                defaultMessage: `${pokemon.name} has snapped out of its confusion!`
            }
            turn.AddEvent(unconfuseEvent);
        }
        else {
            const stillConfusedEvent: GenericMessageEvent = {
                type: BattleEventType.GenericMessage,
                defaultMessage: `${pokemon.name} is confused!`
            }
            turn.AddEvent(stillConfusedEvent);

            if (turn.Roll(this.damageSelfChance)) {
                const confusionHurtEvent: GenericMessageEvent = {
                    type: BattleEventType.GenericMessage,

                    defaultMessage: `${pokemon.name} has hurt itself in its confusion`
                }
                turn.AddEvent(confusionHurtEvent);
                turn.ApplyDamage(pokemon, 40, {});

                //pokemon skips the turn as well
                pokemon.canAttackThisTurn = false;
            }
        }
    }

    InflictedMessage(pokemon: IPokemon): string {
        return `${pokemon.name} is now confused!`
     }    
}


export function GetVolatileStatus(type:VolatileStatusType): VolatileStatus{
    switch(type){
        case VolatileStatusType.Confusion:{
            return new ConfusionVolatileStatus();
        }
        case VolatileStatusType.AquaRing:{
            return new AquaRingVolatileStatus();
        }
        case VolatileStatusType.LeechSeed:{
            return new LeechSeedVolatileStatus();
        }
        case VolatileStatusType.Flinch:{
            return new FlinchVolatileStatus();
        }
        case VolatileStatusType.Roosted:{
            return new RoostedVolatileStatus();
        }
        default:{
            throw new Error(`${type} has not been implemented in GetVolatileStatus`);
        }
    }
}


