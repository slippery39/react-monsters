import { BattleEventType, CannotAttackEvent,StatusChangeEvent } from "game/BattleEvents";
import { HasElementType } from "game/HelperFunctions";
import { ElementType } from "game/ElementType";
import { Pokemon } from "game/Pokemon/Pokemon";
import BattleBehaviour, { CreateBattleBehaviour, IBattleBehaviour } from "game/BattleBehaviour/BattleBehavior";
import { DamageType, Technique } from "game/Techniques/Technique";
import { WeatherType } from "game/Weather/Weather";
import { IGame } from "game/BattleGame";
import { DamageModifierInfo } from "game/DamageFunctions";
import { Stat } from "game/Stat";
import _ from "lodash";



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

export type HardStatus = IBattleBehaviour & IHardStatus;



//Testing the difference between using a POJO vs a class based approach. POJO can be cloned easier with the spread operator as long as you just need a shadllow clone.
//Wherease class based objects cannot be cloned with the spread operator and we would use a _.clone or _.cloneDeep instead. This matters more when dealing with AI simulations as the spread operator
//seems to be faster in cloning operations than _.clone or _.cloneDeep
const RestingStatus:HardStatus & {counter:number} = {...CreateBattleBehaviour(),...{
    statusType:Status.Sleep,
    curedString:'has woken up!',
    inflictedMessage:'is taking a rest',
    counter:0,
    CanApply(){
        return true;
    },
    BeforeAttack(game:IGame,pokemon:Pokemon){
        game.AddMessage(`${pokemon.name} is sleeping!`);

        if (this.counter >= 2) {
            //Pokemon Wakes Up
            game.SetStatusOfPokemon(pokemon.id,Status.None);

            const wakeupEffect: StatusChangeEvent = {
                type: BattleEventType.StatusChange,
                targetPokemonId: pokemon.id,
                status: Status.None,
                defaultMessage: `${pokemon.name} has woken up!`
            }
            game.AddEvent(wakeupEffect)            
        }
        else {
            pokemon.canAttackThisTurn = false;
            this.counter++;
        }
    },
}}

const ToxicStatus:HardStatus & {counter:number} = {...CreateBattleBehaviour(),...{
    statusType:Status.Poison,
    curedString:'has been cured of poison!',
    inflictedMessage:'has been badly poisoned!',
    counter:1,
    CanApply(game:IGame, pokemon: Pokemon) {
        return !HasElementType(pokemon, ElementType.Steel) && !HasElementType(pokemon,ElementType.Poison);
    },
    EndOfTurn(game:IGame, pokemon: Pokemon) {
                //apply poison damage
        //poison damage is 1/16 of the pokemons max hp
        const maxHp = pokemon.originalStats.hp;
        const poisonDamage = this.counter * Math.ceil(maxHp / 16);
        this.counter++;
        game.AddMessage(`${pokemon.name} is badly hurt by poison.`);
        game.ApplyIndirectDamage(pokemon, poisonDamage)
    },
    OnSwitchedOut(game: IGame, pokemon:Pokemon){
        this.counter = 1;        
    }
}};

const SleepStatus:HardStatus &{turnsToSleep:number,counter:number} = {...CreateBattleBehaviour(),...{

    
        statusType:Status.Sleep,
        curedString:'has woken up!',
        inflictedMessage:'has fallen asleep!',
        turnsToSleep:3,
        counter:3,    
        CanApply(game:IGame, pokemon: Pokemon){
            return true;
        },
        BeforeAttack(game:IGame, pokemon: Pokemon) {
            game.AddMessage(`${pokemon.name} is sleeping!`);
            this.counter--;
            if (this.counter < 0){
                //Pokemon Wakes Up
                game.SetStatusOfPokemon(pokemon.id,Status.None);
    
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
};

const BurnStatus:HardStatus = {...CreateBattleBehaviour(),...{
    statusType: Status.Burned,
    curedString:'has been cured of its burn!',
    inflictedMessage: 'has been burned!',
    CanApply(game:IGame, pokemon: Pokemon) {
        return !HasElementType(pokemon, ElementType.Fire);
    },
    BeforeAttack(game:IGame, pokemon: Pokemon){
        return;
    },
    EndOfTurn(game:IGame, pokemon: Pokemon) {
        const maxHp = pokemon.originalStats.hp;
        const burnDamage = Math.ceil(maxHp / 8);
        game.AddMessage(`${pokemon.name} is hurt by its burn`);
        game.ApplyIndirectDamage(pokemon, burnDamage);
    },
    OnAfterDamageCalculated(pokemon: Pokemon, techUsed: Technique, defendingPokemon: Pokemon, damage: number, modifierInfo: DamageModifierInfo, game: IGame){
        if (techUsed.damageType === DamageType.Physical){
            return damage*0.5;
        }
        return damage;
    }   

}}


class FrozenStatus extends BattleBehaviour implements HardStatus{
   
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
            game.SetStatusOfPokemon(pokemon.id,Status.None);

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
            defendingPokemon._statusObj = GetHardStatus(Status.None);
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


const ParalyzeStatus:HardStatus & {cantMoveChance:number} = {...CreateBattleBehaviour(),...{
    statusType:Status.Paralyzed,
    curedString: 'has been cured of paralysis!',
    inflictedMessage: 'is now paralyzed!',
    cantMoveChance:25,
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
    },
    CanApply(game: IGame, pokemon: Pokemon) {
        return !HasElementType(pokemon, ElementType.Electric)
    },
    Update(game:IGame,pokemon:Pokemon){

        if (pokemon.statMultipliers.filter(sm=>sm.tag==="paralyze").length===0){
            pokemon.statMultipliers.push({
                stat:Stat.Speed,
                multiplier:0.5,
                tag:"paralyze"
            })
        }
    },
    OnRemoved(game:IGame,pokemon:Pokemon){
        _.remove(pokemon.statMultipliers,sm=>sm.tag==="paralyze");
    }

}}


class PoisonStatus extends BattleBehaviour implements HardStatus {    

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

class NoneStatus extends BattleBehaviour implements HardStatus {

    statusType = Status.None;
    inflictedMessage = '';
    curedString= '';
    CanApply =  (game: IGame, pokemon: Pokemon) =>  true;
}

function GetHardStatus(status: Status): HardStatus {

    if (status === Status.Paralyzed) {
        return {...ParalyzeStatus}
    }
    else if (status === Status.Poison) {
        return new PoisonStatus();
    }
    else if (status === Status.Sleep) {
        return {...SleepStatus}
    }
    else if (status === Status.Frozen) {
        return new FrozenStatus();
    }
    else if (status === Status.Burned) {
        return {...BurnStatus};
    }
    else if (status === Status.ToxicPoison){
        return {...ToxicStatus};
    }
    else if (status === Status.Resting){
        return {...RestingStatus}; //testing this out.

    }
    else if (status === Status.None) {
        return new NoneStatus();
    }
 

    throw new Error(`Status ${status} not implemented for GetStatus`);
}

export default GetHardStatus;