
/*
Work in progress for our BattleBehavior class.
This is the class that all classes that need to tap into the turn object will call into.

//Grab all our stuff from HardStatuses, VolatileStatuses and Abilities and Put them in here.
*/

import { IPokemon } from "game/Pokemon/Pokemon";
import { Technique } from "game/Techniques/Technique";
import { Turn } from "game/Turn";

abstract class BattleBehaviour{

    BeforeAttack(turn:Turn,pokemon:IPokemon){

    }
    EndOfTurn(turn:Turn,pokemon:IPokemon){

    }
    OnAfterDamageCalculated(attackingPokemon:IPokemon,move:Technique,defendingPokemon:IPokemon,damage:number,damageInfo:any):number{
        return damage;
    }

}

export default BattleBehaviour;