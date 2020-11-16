import { Turn } from "game/Turn";
import { BattleEventType, CannotAttackEvent, GenericMessageEvent, StatusChangeEvent } from "game/BattleEvents";
import { HasElementType } from "game/HelperFunctions";
import { ElementType } from "game/ElementType";
import { IPokemon } from "game/Pokemon/Pokemon";
import BattleBehaviour from "game/BattleBehaviour/BattleBehavior";


export enum Status{
    Poison ='poisoned',
    Paralyzed ='paralyzed',
    Sleep='sleep',
    Burned = 'burned',
    Frozen = 'frozen',
    ToxicPoison = 'toxic-poison',
    Resting = 'sleep-rest',
    None = 'none'
}


export interface ICanApply {
    CanApply: (turn: Turn, pokemon: IPokemon) => boolean
}


interface HardStatus extends ICanApply {
    statusType: Status;
    curedString:string //don't really know what else to call this at the moment but follows the format of  'has been cured of its {status}`
}

class RestingStatus extends BattleBehaviour implements HardStatus{
    statusType = Status.Sleep;
    curedString = 'has woken up!'

    CanApply(){
        return true;
    }

    BeforeAttack(turn: Turn, pokemon: IPokemon) {
        const isAsleepEffect: GenericMessageEvent = {
            type: BattleEventType.GenericMessage,
            defaultMessage: `${pokemon.name} is sleeping!`
        }
        turn.AddEvent(isAsleepEffect);
        if (pokemon.restTurnCount >= 2) {
            //Pokemon Wakes Up
            pokemon.restTurnCount = 0;
            pokemon.status = Status.None;

            const wakeupEffect: StatusChangeEvent = {
                type: BattleEventType.StatusChange,
                targetPokemonId: pokemon.id,
                status: Status.None,
                defaultMessage: `${pokemon.name} has woken up!`
            }
            turn.AddEvent(wakeupEffect);
        }
        else {
            pokemon.canAttackThisTurn = false;
            pokemon.restTurnCount++;
        }
    }
    EndOfTurn(turn:Turn, pokemon:IPokemon){
        
    }
}

class ToxicStatus extends BattleBehaviour implements HardStatus{
    statusType = Status.Poison;
    curedString= 'has been cured of poison!'

    CanApply(turn: Turn, pokemon: IPokemon) {
        return !HasElementType(pokemon, ElementType.Steel);
    }
    BeforeAttack(turn: Turn, pokemon: IPokemon){
        return;
    }
    EndOfTurn(turn: Turn, pokemon: IPokemon) {
                //apply poison damage
        //poison damage is 1/16 of the pokemons max hp
        const maxHp = pokemon.originalStats.health;
        const poisonDamage = pokemon.toxicCount * Math.ceil(maxHp / 16);
        pokemon.currentStats.health -= poisonDamage;
        pokemon.toxicCount++;

        const poisonMessage: GenericMessageEvent = {
            type: BattleEventType.GenericMessage,
            defaultMessage: `${pokemon.name} is badly hurt by poison.`
        }
        turn.AddEvent(poisonMessage);
        turn.ApplyDamage(pokemon, poisonDamage, {})
    }
}

class BurnStatus  extends BattleBehaviour implements HardStatus{
    

    statusType = Status.Burned;
    curedString= 'has been cured of its burn!'

    CanApply(turn: Turn, pokemon: IPokemon) {
        return !HasElementType(pokemon, ElementType.Fire);
    }
    BeforeAttack(turn: Turn, pokemon: IPokemon){
        return;
    }
    EndOfTurn(turn: Turn, pokemon: IPokemon) {
        const maxHp = pokemon.originalStats.health;
        const burnDamage = Math.ceil(maxHp / 8);
        const burnMessage: GenericMessageEvent = {
            type: BattleEventType.GenericMessage,
            defaultMessage: `${pokemon.name} is hurt by its burn`
        }
        turn.AddEvent(burnMessage);
        turn.ApplyDamage(pokemon, burnDamage, {});
    }
}

class FrozenStatus extends BattleBehaviour implements HardStatus{
   
    statusType = Status.Frozen
    curedString= 'has been thawed!'
    private thawChance: number = 25;

    CanApply(turn: Turn, pokemon: IPokemon) {
        return !HasElementType(pokemon, ElementType.Ice);
    }

    BeforeAttack(turn: Turn, pokemon: IPokemon) {
        const isFrozenEffect: GenericMessageEvent = {
            type: BattleEventType.GenericMessage,
            defaultMessage: `${pokemon.name} is frozen!`
        }
        turn.AddEvent(isFrozenEffect);

        if (turn.Roll(this.thawChance)) {
            //Pokemon Wakes Up
            pokemon.status = Status.None;

            const thawEffect: StatusChangeEvent = {
                type: BattleEventType.StatusChange,
                targetPokemonId: pokemon.id,
                status: Status.None,
                defaultMessage: `${pokemon.name} is not frozen anymore!`
            }
            turn.AddEvent(thawEffect);
        }
        else {
            pokemon.canAttackThisTurn = false;
        }
    }
    EndOfTurn(turn: Turn, pokemon: IPokemon){
        return;
    }
}

class SleepStatus extends BattleBehaviour implements HardStatus {
    
    
    statusType = Status.Sleep;
    curedString= 'has woken up!'
    private wakeUpChance: number = 25;

    CanApply(turn: Turn, pokemon: IPokemon){
        return true;
    }

    EndOfTurn(turn: Turn, pokemon: IPokemon){
        return;
    }
    BeforeAttack(turn: Turn, pokemon: IPokemon) {
        const isAsleepEffect: GenericMessageEvent = {
            type: BattleEventType.GenericMessage,
            defaultMessage: `${pokemon.name} is sleeping!`
        }
        turn.AddEvent(isAsleepEffect);
        if (turn.Roll(this.wakeUpChance)) {
            //Pokemon Wakes Up
            pokemon.status = Status.None;

            const wakeupEffect: StatusChangeEvent = {
                type: BattleEventType.StatusChange,
                targetPokemonId: pokemon.id,
                status: Status.None,
                defaultMessage: `${pokemon.name} has woken up!`
            }
            turn.AddEvent(wakeupEffect);
        }
        else {
            pokemon.canAttackThisTurn = false;
        }
    }
}

class ParalyzeStatus extends BattleBehaviour implements HardStatus {
  

    statusType = Status.Paralyzed;
    curedString= 'has been cured of paralysis!'
    private cantMoveChance: number = 25;

    EndOfTurn(turn: Turn, pokemon: IPokemon){
        return;
    }

    BeforeAttack(turn: Turn, pokemon: IPokemon) {

        if (turn.Roll(this.cantMoveChance)) {
            const cantAttackEffect: CannotAttackEvent = {
                type: BattleEventType.CantAttack,
                targetPokemonId: pokemon.id,
                reason: Status.Paralyzed
            }
            turn.AddEvent(cantAttackEffect);
            pokemon.canAttackThisTurn = false;
            return;
        }
        //do the before logic here.
    }
    CanApply(turn: Turn, pokemon: IPokemon) {
        return !HasElementType(pokemon, ElementType.Electric)
    }

}

class PoisonStatus extends BattleBehaviour implements HardStatus {
    

    statusType = Status.Poison;
    curedString= 'has been cured of poison!'

    EndOfTurn(turn: Turn, pokemon: IPokemon) {
        //apply poison damage
        //poison damage is 1/16 of the pokemons max hp
        const maxHp = pokemon.originalStats.health;
        const poisonDamage = Math.ceil(maxHp / 8);
        pokemon.currentStats.health -= poisonDamage;

        const poisonMessage: GenericMessageEvent = {
            type: BattleEventType.GenericMessage,
            defaultMessage: `${pokemon.name} is hurt by poison`
        }
        turn.AddEvent(poisonMessage);
        turn.ApplyDamage(pokemon, poisonDamage, {})
    }
    CanApply(turn: Turn, pokemon: IPokemon) {
        return !HasElementType(pokemon, ElementType.Poison);
    }
    BeforeAttack(turn: Turn, pokemon: IPokemon){
        return;
    }

}

class NoneStatus extends BattleBehaviour implements HardStatus {

    statusType = Status.None;
    curedString= '';
    BeforeAttack  = (turn: Turn, pokemon: IPokemon) => null;
    CanApply =  (turn: Turn, pokemon: IPokemon) =>  true;
    EndOfTurn =  (turn: Turn, pokemon: IPokemon) => null;
}

function GetHardStatus(status: Status): HardStatus {

    if (status === Status.Paralyzed) {
        return new ParalyzeStatus();
    }
    else if (status === Status.Poison) {
        return new PoisonStatus();
    }
    else if (status === Status.Sleep) {
        return new SleepStatus();
    }
    else if (status === Status.Frozen) {
        return new FrozenStatus();
    }
    else if (status === Status.Burned) {
        return new BurnStatus();
    }
    else if (status === Status.ToxicPoison){
        return new ToxicStatus();
    }
    else if (status === Status.Resting){
        return new RestingStatus();

    }
    else if (status === Status.None) {
        return new NoneStatus();
    }
 

    throw new Error(`Status ${status} not implemented for GetStatus`);
}

export default GetHardStatus;