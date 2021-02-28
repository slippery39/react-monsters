
/*
Work in progress for our BattleBehavior class.
This is the class that all classes that need to tap into the turn object will call into.

//Grab all our stuff from HardStatuses, VolatileStatuses and Abilities and Put them in here.
*/

import { UseMoveAction } from "game/BattleActions";
import { Player } from "game/Player/PlayerBuilder";
import { Pokemon } from "game/Pokemon/Pokemon";
import { Technique } from "game/Techniques/Technique";
import { Turn } from "game/Turn";

abstract class BattleBehaviour{

    BeforeAttack(turn:Turn,pokemon:Pokemon){

    }
    //named this way so that it always triggers, even if the pokemon uses a move that misses or not.
    AfterActionStep(turn:Turn,pokemon:Pokemon){

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
    OnTechniqueMissed(turn:Turn,pokemon:Pokemon){
        
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
    ModifyIndirectDamage(turn:Turn,pokemon:Pokemon,damage:number){
        return damage;
    }
    ModifyStatBoostAmount(turn:Turn,pokemon:Pokemon,amount:number,sourcePokemon:Pokemon){
        return amount;
    }
    Update(turn:Turn,pokemon:Pokemon){

    }
    OnPokemonEntry(turn:Turn,pokemon:Pokemon){
        
    }
    ForceAction(turn:Turn,player:Player,pokemon:Pokemon){
        //Force the player to do a specific action in a turn
        //Should have some way to enforce only having 1 Forced action per turn.
    }
    OverrideAction(turn:Turn,player:Player,pokemon:Pokemon,action:UseMoveAction):UseMoveAction{
        //Overrides an action, i.e. for Choice items
        return action;
    }
    OnSwitchedOut(turn:Turn,pokemon:Pokemon){

    }

    
}

export default BattleBehaviour;