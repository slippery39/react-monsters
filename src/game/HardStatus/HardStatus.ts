import { Turn } from "game/Turn";
import { BattleEventType, CannotAttackEvent,StatusChangeEvent } from "game/BattleEvents";
import { HasElementType } from "game/HelperFunctions";
import { ElementType } from "game/ElementType";
import { Pokemon } from "game/Pokemon/Pokemon";
import BattleBehaviour from "game/BattleBehaviour/BattleBehavior";
import { Technique } from "game/Techniques/Technique";


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

export abstract class HardStatus extends BattleBehaviour {
    abstract statusType: Status
    abstract curedString:String
    abstract inflictedMessage:String

    OnApply(turn:Turn,pokemon:Pokemon){
    }
    CanApply(turn: Turn, pokemon: Pokemon) {
        return true;
    }
}


class RestingStatus extends HardStatus{
    statusType = Status.Sleep;
    curedString = 'has woken up!'
    inflictedMessage = 'is taking a rest!'

    CanApply(){
        return true;
    }

    BeforeAttack(turn: Turn, pokemon: Pokemon) {
        turn.AddMessage(`${pokemon.name} is sleeping!`);

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
    EndOfTurn(turn:Turn, pokemon:Pokemon){
        
    }
}

class ToxicStatus extends HardStatus{
    statusType = Status.Poison;
    curedString= 'has been cured of poison!'
    inflictedMessage = 'has been badly poisoned!'

    CanApply(turn: Turn, pokemon: Pokemon) {
        return !HasElementType(pokemon, ElementType.Steel);
    }
    BeforeAttack(turn: Turn, pokemon: Pokemon){
        return;
    }
    EndOfTurn(turn: Turn, pokemon: Pokemon) {
                //apply poison damage
        //poison damage is 1/16 of the pokemons max hp
        const maxHp = pokemon.originalStats.hp;
        const poisonDamage = pokemon.toxicCount * Math.ceil(maxHp / 16);
        pokemon.toxicCount++;
        turn.AddMessage(`${pokemon.name} is badly hurt by poison.`);
        turn.ApplyIndirectDamage(pokemon, poisonDamage)
    }
}

class BurnStatus extends HardStatus{
    

    statusType = Status.Burned;
    curedString= 'has been cured of its burn!'
    inflictedMessage = 'has been burned!'

    CanApply(turn: Turn, pokemon: Pokemon) {
        return !HasElementType(pokemon, ElementType.Fire);
    }
    BeforeAttack(turn: Turn, pokemon: Pokemon){
        return;
    }
    EndOfTurn(turn: Turn, pokemon: Pokemon) {
        const maxHp = pokemon.originalStats.hp;
        const burnDamage = Math.ceil(maxHp / 8);
        turn.AddMessage(`${pokemon.name} is hurt by its burn`);
        turn.ApplyIndirectDamage(pokemon, burnDamage);
    }
}

class FrozenStatus extends HardStatus{
   
    statusType = Status.Frozen
    curedString= 'has been thawed!'
    inflictedMessage = 'is frozen!'
    private thawChance: number = 25;

    CanApply(turn: Turn, pokemon: Pokemon) {
        return !HasElementType(pokemon, ElementType.Ice);
    }

    BeforeAttack(turn: Turn, pokemon: Pokemon) {
        turn.AddMessage(`${pokemon.name} is frozen!`);
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

    OnDamageTakenFromTechnique(turn:Turn,attackingPokemon:Pokemon,defendingPokemon:Pokemon,move:Technique,damage:number){
        if (move.elementalType === ElementType.Fire && defendingPokemon.status === Status.Frozen) {
            defendingPokemon.status = Status.None;
            const thawEffect: StatusChangeEvent = {
                type: BattleEventType.StatusChange,
                status: Status.None,
                targetPokemonId: defendingPokemon.id,
                attackerPokemonId: attackingPokemon.id,
                defaultMessage: `${attackingPokemon.name}'s fire attack thawed ${defendingPokemon.name}!`
            }
            turn.AddEvent(thawEffect);
        }
    }


    EndOfTurn(turn: Turn, pokemon: Pokemon){
        return;
    }
}

class SleepStatus extends HardStatus{
    
    
    statusType = Status.Sleep;
    curedString= 'has woken up!'
    inflictedMessage = 'has fallen asleep!'
    private wakeUpChance: number = 25;

    CanApply(turn: Turn, pokemon: Pokemon){
        return true;
    }

    EndOfTurn(turn: Turn, pokemon: Pokemon){
        return;
    }
    BeforeAttack(turn: Turn, pokemon: Pokemon) {
        turn.AddMessage(`${pokemon.name} is sleeping!`);
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

class ParalyzeStatus extends HardStatus{
  

    statusType = Status.Paralyzed;
    curedString= 'has been cured of paralysis!'
    inflictedMessage = 'is now paralyzed!'
    private cantMoveChance: number = 25;

    EndOfTurn(turn: Turn, pokemon: Pokemon){
        return;
    }

    BeforeAttack(turn: Turn, pokemon: Pokemon) {
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
    CanApply(turn: Turn, pokemon: Pokemon) {
        return !HasElementType(pokemon, ElementType.Electric)
    }

}

class PoisonStatus extends HardStatus {
    

    statusType = Status.Poison;
    curedString= 'has been cured of poison!'
    inflictedMessage = ' has been poisoned!'

    EndOfTurn(turn: Turn, pokemon: Pokemon) {
        //apply poison damage
        //poison damage is 1/16 of the pokemons max hp
        const maxHp = pokemon.originalStats.hp;
        const poisonDamage = Math.ceil(maxHp / 8);
        turn.AddMessage(`${pokemon.name} is hurt by poison`);
        turn.ApplyIndirectDamage(pokemon, poisonDamage)
    }
    CanApply(turn: Turn, pokemon: Pokemon) {
        return !HasElementType(pokemon, ElementType.Poison);
    }
    BeforeAttack(turn: Turn, pokemon: Pokemon){
        return;
    }

}

class NoneStatus extends HardStatus {

    statusType = Status.None;
    inflictedMessage = '';
    curedString= '';
    BeforeAttack  = (turn: Turn, pokemon: Pokemon) => null;
    CanApply =  (turn: Turn, pokemon: Pokemon) =>  true;
    EndOfTurn =  (turn: Turn, pokemon: Pokemon) => null;
}

function GetHardStatus(status: Status): HardStatus {

    if (status === Status.Paralyzed) {
        return new ParalyzeStatus()
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