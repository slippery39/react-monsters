
/*
Work in progress for our BattleBehavior class.
This is the class that all classes that need to tap into the turn object will call into.

//Grab all our stuff from HardStatuses, VolatileStatuses and Abilities and Put them in here.
*/

import { Pokemon } from "game/Pokemon/Pokemon";
import { Technique } from "game/Techniques/Technique";
import { Turn } from "game/Turn";

abstract class BattleBehaviour{

    BeforeAttack(turn:Turn,pokemon:Pokemon){

    }
    EndOfTurn(turn:Turn,pokemon:Pokemon){

    }
    OnAfterDamageCalculated(attackingPokemon:Pokemon,move:Technique,defendingPokemon:Pokemon,damage:number,damageInfo:any,turn:Turn):number{
        return damage;
    }
    OnDamageDealt(turn:Turn,attackingPokemon:Pokemon,defendingPokemon:Pokemon,damageDealt:number){

    }
    OnDamageTakenFromTechnique(turn:Turn,attackingPokemon:Pokemon,defendingPokemon:Pokemon,move:Technique,damage:number){
        
    }
    ModifyTechnique(pokemon:Pokemon,technique:Technique){
        return technique;
    }
    OnTechniqueUsed(turn: Turn, pokemon: Pokemon, move: Technique) {

    }
    NegateTechnique(turn: Turn, attackingPokemon: Pokemon, defendingPokemon: Pokemon, move: Technique): boolean {
        return false;
    }
    NegateDamage(turn:Turn,move:Technique,pokemon:Pokemon):boolean{
        return false; //by default no abilities should negate damage unless we say so.
    }
    ModifyDamageTaken(turn:Turn,attackingPokemon:Pokemon,defendingPokemon:Pokemon,move:Technique,originalDamage:number){
        return originalDamage;
    }
    Update(turn:Turn,pokemon:Pokemon){

    }
    OnPokemonEntry(turn:Turn,pokemon:Pokemon){
        
    }
    
}

export default BattleBehaviour;