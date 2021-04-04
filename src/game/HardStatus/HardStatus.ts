import { BattleEventType, CannotAttackEvent,StatusChangeEvent } from "game/BattleEvents";
import { HasElementType } from "game/HelperFunctions";
import { ElementType } from "game/ElementType";
import { Pokemon } from "game/Pokemon/Pokemon";
import BattleBehaviour, { IBattleBehaviour } from "game/BattleBehaviour/BattleBehavior";
import { Technique } from "game/Techniques/Technique";
import { WeatherType } from "game/Weather/Weather";
import { IGame } from "game/BattleGame";


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


interface IHardStatus {
    statusType:string;
    curedString:String;
    inflictedMessage:String;
    CanApply:(game:IGame,pokemon:Pokemon)=>boolean
}

type NewHardStatus = IBattleBehaviour & IHardStatus;

export abstract class HardStatus extends BattleBehaviour implements NewHardStatus {
    abstract statusType: Status
    abstract curedString:String
    abstract inflictedMessage:String

    CanApply(game:IGame, pokemon: Pokemon) {
        return true;
    }
}


class RestingStatus extends HardStatus{
    statusType = Status.Sleep;
    curedString = 'has woken up!'
    inflictedMessage = 'is taking a rest!'
    counter:number = 0;

    CanApply(){
        return true;
    }
    BeforeAttack(game: IGame, pokemon: Pokemon) {
        game.AddMessage(`${pokemon.name} is sleeping!`);

        if (this.counter >= 2) {
            //Pokemon Wakes Up
            pokemon.status = Status.None;
            pokemon._statusObj = GetHardStatus(Status.None);

            const wakeupEffect: StatusChangeEvent = {
                type: BattleEventType.StatusChange,
                targetPokemonId: pokemon.id,
                status: Status.None,
                defaultMessage: `${pokemon.name} has woken up!`
            }
            game.AddEvent(wakeupEffect);
        }
        else {
            pokemon.canAttackThisTurn = false;
            this.counter++;
        }
    }
}

class ToxicStatus extends HardStatus{
    statusType = Status.Poison;
    curedString= 'has been cured of poison!'
    inflictedMessage = 'has been badly poisoned!'
    counter:number = 1;

    CanApply(game:IGame, pokemon: Pokemon) {
        return !HasElementType(pokemon, ElementType.Steel) && !HasElementType(pokemon,ElementType.Poison);
    }
    EndOfTurn(game:IGame, pokemon: Pokemon) {
                //apply poison damage
        //poison damage is 1/16 of the pokemons max hp
        const maxHp = pokemon.originalStats.hp;
        const poisonDamage = this.counter * Math.ceil(maxHp / 16);
        this.counter++;
        game.AddMessage(`${pokemon.name} is badly hurt by poison.`);
        game.ApplyIndirectDamage(pokemon, poisonDamage)
    }
    OnSwitchedOut(game: IGame, pokemon:Pokemon){
        this.counter = 1;
    }
}

class BurnStatus extends HardStatus{
    

    statusType = Status.Burned;
    curedString= 'has been cured of its burn!'
    inflictedMessage = 'has been burned!'

    CanApply(game:IGame, pokemon: Pokemon) {
        return !HasElementType(pokemon, ElementType.Fire);
    }
    BeforeAttack(game:IGame, pokemon: Pokemon){
        return;
    }
    EndOfTurn(game:IGame, pokemon: Pokemon) {
        const maxHp = pokemon.originalStats.hp;
        const burnDamage = Math.ceil(maxHp / 8);
        game.AddMessage(`${pokemon.name} is hurt by its burn`);
        game.ApplyIndirectDamage(pokemon, burnDamage);
    }
}

class FrozenStatus extends HardStatus{
   
    statusType = Status.Frozen
    curedString= 'has been thawed!'
    inflictedMessage = 'is frozen!'
    private thawChance: number = 20;

    CanApply(game:IGame, pokemon: Pokemon) {
        return !HasElementType(pokemon, ElementType.Ice) && game.field.weather?.name !== WeatherType.Sunny;
    }

    BeforeAttack(game:IGame, pokemon: Pokemon) {
        game.AddMessage(`${pokemon.name} is frozen!`);
        if (game.Roll(this.thawChance)) {
            //Pokemon Wakes Up
            pokemon.status = Status.None;

            const thawEffect: StatusChangeEvent = {
                type: BattleEventType.StatusChange,
                targetPokemonId: pokemon.id,
                status: Status.None,
                defaultMessage: `${pokemon.name} is not frozen anymore!`
            }
            game.AddEvent(thawEffect);
        }
        else {
            pokemon.canAttackThisTurn = false;
        }
    }

    OnDamageTakenFromTechnique(game:IGame,attackingPokemon:Pokemon,defendingPokemon:Pokemon,move:Technique,damage:number){
        if (move.elementalType === ElementType.Fire && defendingPokemon.status === Status.Frozen) {
            defendingPokemon.status = Status.None;
            const thawEffect: StatusChangeEvent = {
                type: BattleEventType.StatusChange,
                status: Status.None,
                targetPokemonId: defendingPokemon.id,
                attackerPokemonId: attackingPokemon.id,
                defaultMessage: `${attackingPokemon.name}'s fire attack thawed ${defendingPokemon.name}!`
            }
            game.AddEvent(thawEffect);
        }
    }
}

class SleepStatus extends HardStatus{
    
    
    statusType = Status.Sleep;
    curedString= 'has woken up!'
    inflictedMessage = 'has fallen asleep!'
    turnsToSleep:number = 3;
    counter:number = 3;

    constructor(){
        super();
        this.turnsToSleep = Math.ceil(Math.random()*3);
        this.counter = this.turnsToSleep;
    }

    CanApply(game:IGame, pokemon: Pokemon){
        return true;
    }
    BeforeAttack(game:IGame, pokemon: Pokemon) {
        game.AddMessage(`${pokemon.name} is sleeping!`);
        this.counter--;
        if (this.counter < 0){
            //Pokemon Wakes Up
            pokemon.status = Status.None;
            pokemon._statusObj = GetHardStatus(Status.None);

            const wakeupEffect: StatusChangeEvent = {
                type: BattleEventType.StatusChange,
                targetPokemonId: pokemon.id,
                status: Status.None,
                defaultMessage: `${pokemon.name} has woken up!`
            }
            game.AddEvent(wakeupEffect);
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

    BeforeAttack(game: IGame, pokemon: Pokemon) {
        if (game.Roll(this.cantMoveChance)) {
            const cantAttackEffect: CannotAttackEvent = {
                type: BattleEventType.CantAttack,
                targetPokemonId: pokemon.id,
                reason: Status.Paralyzed
            }
            game.AddEvent(cantAttackEffect);
            pokemon.canAttackThisTurn = false;
            return;
        }
        //do the before logic here.
    }
    CanApply(game: IGame, pokemon: Pokemon) {
        return !HasElementType(pokemon, ElementType.Electric)
    }

}

class PoisonStatus extends HardStatus {    

    statusType = Status.Poison;
    curedString= 'has been cured of poison!'
    inflictedMessage = ' has been poisoned!'

    EndOfTurn(game: IGame, pokemon: Pokemon) {
        //apply poison damage
        //poison damage is 1/16 of the pokemons max hp
        const maxHp = pokemon.originalStats.hp;
        const poisonDamage = Math.ceil(maxHp / 8);
        game.AddMessage(`${pokemon.name} is hurt by poison`);
        game.ApplyIndirectDamage(pokemon, poisonDamage)
    }
    CanApply(game: IGame, pokemon: Pokemon) {
        return !HasElementType(pokemon, ElementType.Poison);
    }
}

class NoneStatus extends HardStatus {

    statusType = Status.None;
    inflictedMessage = '';
    curedString= '';
    CanApply =  (game: IGame, pokemon: Pokemon) =>  true;
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