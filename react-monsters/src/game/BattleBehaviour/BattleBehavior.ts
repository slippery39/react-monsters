
/*
Work in progress for our BattleBehavior class.
This is the class that all classes that need to tap into the turn object will call into.

//Grab all our stuff from HardStatuses, VolatileStatuses and Abilities and Put them in here.
*/

import { BattleAction, UseMoveAction } from "game/BattleActions";
import { IGame } from "game/BattleGame";
import { DamageModifierInfo } from "game/DamageFunctions";
import { Player } from "game/Player/PlayerBuilder";
import { Pokemon } from "game/Pokemon/Pokemon";
import { Technique } from "game/Techniques/Technique";
    


export interface IBattleBehaviour{
    BeforeAttack:(game: IGame, pokemon: Pokemon)=>void;
    //named this way so that it always triggers, even if the pokemon uses a move that misses or not.
    AfterActionStep:(game: IGame, pokemon: Pokemon)=>void;
    EndOfTurn:(game: IGame, pokemon: Pokemon)=>void;
    OnAfterDamageCalculated:(attackingPokemon: Pokemon, move: Technique, defendingPokemon: Pokemon, damage: number, damageInfo: DamageModifierInfo, game: IGame)=>number;
    OnAfterDamageAttack:(game:IGame,pokemon:Pokemon,defendingPokemon:Pokemon,technique:Technique,newDamage:number)=>void;
    OnDamageDealt:(game: IGame, attackingPokemon: Pokemon, defendingPokemon: Pokemon, damageDealt: number)=>void;
    OnDamageTakenFromTechnique:(game: IGame, attackingPokemon: Pokemon, defendingPokemon: Pokemon, move: Technique, damage: number)=>void;
    ModifyTechnique:(pokemon: Pokemon, technique: Technique)=>Technique;
    ModifyOpponentTechnique:(pokemon:Pokemon,technique:Technique)=>Technique;
    OnTechniqueUsed:(game: IGame, pokemon: Pokemon, move: Technique)=>void;
    OnTechniqueMissed:(game: IGame, pokemon: Pokemon)=>void;
    NegateTechnique:(game: IGame, attackingPokemon: Pokemon, defendingPokemon: Pokemon, move: Technique)=>boolean
    NegateOwnTechnique:(game: IGame, attackingPokemon: Pokemon, defendingPokemon: Pokemon, technique: Technique)=>boolean;
    NegateDamage:(game: IGame, move: Technique, pokemon: Pokemon)=>boolean;
    ModifyDamageTaken:(game: IGame, attackingPokemon: Pokemon, defendingPokemon: Pokemon, move: Technique, originalDamage: number)=>number;
    ModifyIndirectDamage:(game: IGame, pokemon: Pokemon, damage: number)=>number
    ModifyStatBoostAmount:(game: IGame, pokemon: Pokemon, amount: number, sourcePokemon: Pokemon)=>number;
    Update:(game: IGame, pokemon: Pokemon)=>void;
    OnPokemonEntry:(game: IGame, pokemon: Pokemon)=>void;
    ForceAction:(game: IGame, player: Player, pokemon: Pokemon)=>void;
    OverrideAction:(game: IGame, player: Player, pokemon: Pokemon, action: UseMoveAction)=>UseMoveAction;
    OnSwitchedOut:(game: IGame, pokemon: Pokemon)=>void;
    OnOppTechniqueUsed:(game: IGame, pokemon: Pokemon, technique: Technique)=>void;
    ModifyOpponentValidActions:(game:IGame,opponent:Player,validActions:BattleAction[])=>BattleAction[]
    ModifyValidActions:(game:IGame,player:Player,validActions:BattleAction[])=>BattleAction[]
    ModifyDamageCalculationInfo:(game: IGame, damageCalcutionInfo: { pokemon: Pokemon, defendingPokemon: Pokemon, technique: Technique })=>{pokemon:Pokemon,defendingPokemon:Pokemon,technique:Technique}
    OnRemoved:(game:IGame,pokemon:Pokemon)=>void
}


//Testing out an pojo based battle behaviour system rather than class based.
//This way we can grab this default one here and modify it to suit out needs.
export const CreateBattleBehaviour = ()=>{

    const obj : IBattleBehaviour = {
        BeforeAttack:(game:IGame,pokemon:Pokemon)=>{

        },
        AfterActionStep:(game:IGame,pokemon:Pokemon)=>{

        },
        EndOfTurn:(game:IGame,pokemon:Pokemon)=>{

        },
        OnAfterDamageCalculated:(attackingPokemon: Pokemon, move: Technique, defendingPokemon: Pokemon, damage: number, damageInfo: DamageModifierInfo, game: IGame)=>{
            return damage;   
        },
        OnAfterDamageAttack:(game:IGame,pokemon:Pokemon,defendingPokemon:Pokemon,technique:Technique,newDamage:number)=>{

        },
        OnDamageDealt:(game: IGame, attackingPokemon: Pokemon, defendingPokemon: Pokemon, damageDealt: number)=>{

        },
        OnDamageTakenFromTechnique:(game: IGame, attackingPokemon: Pokemon, defendingPokemon: Pokemon, move: Technique, damage: number)=>{
    
        },
        ModifyTechnique(pokemon: Pokemon, technique: Technique) {
            return technique;
        },
        ModifyOpponentTechnique(pokemon:Pokemon,technique:Technique){
            return technique;
        },
        OnTechniqueUsed(game: IGame, pokemon: Pokemon, move: Technique) {
    
        },
        OnTechniqueMissed(game: IGame, pokemon: Pokemon) {
    
        },
        NegateTechnique(game: IGame, attackingPokemon: Pokemon, defendingPokemon: Pokemon, move: Technique): boolean {
            return false;
        },
        NegateOwnTechnique(game: IGame, attackingPokemon: Pokemon, defendingPokemon: Pokemon, technique: Technique){
            return false;
        },
        NegateDamage(game: IGame, move: Technique, pokemon: Pokemon): boolean {
            return false; //by default no abilities should negate damage unless we say so.
        },
        ModifyDamageTaken(game: IGame, attackingPokemon: Pokemon, defendingPokemon: Pokemon, move: Technique, originalDamage: number) {
            return originalDamage;
        },
        ModifyIndirectDamage(game: IGame, pokemon: Pokemon, damage: number) {
            return damage;
        },
        ModifyStatBoostAmount(game: IGame, pokemon: Pokemon, amount: number, sourcePokemon: Pokemon) {
            return amount;
        },
        Update(game: IGame, pokemon: Pokemon) {
    
        },
        OnPokemonEntry(game: IGame, pokemon: Pokemon) {
    
        },
        ForceAction(game: IGame, player: Player, pokemon: Pokemon) {
            //Force the player to do a specific action in a turn
            //Should have some way to enforce only having 1 Forced action per turn.
        },
        OverrideAction(game: IGame, player: Player, pokemon: Pokemon, action: UseMoveAction): UseMoveAction {
            //Overrides an action, i.e. for Choice items
            return action;
        },
        OnSwitchedOut(game: IGame, pokemon: Pokemon) {
    
        },
        OnOppTechniqueUsed(game: IGame, pokemon: Pokemon, technique: Technique) {
    
        },
        //Can modify which actions are considered valid.
        ModifyOpponentValidActions(game:IGame,opponent:Player,validActions:BattleAction[]):BattleAction[]{
             return validActions;
        },    
        ModifyValidActions(game:IGame,player:Player,validActions:BattleAction[]):BattleAction[]{
            return validActions;
        },
        ModifyDamageCalculationInfo(game: IGame, damageCalcutionInfo: { pokemon: Pokemon, defendingPokemon: Pokemon, technique: Technique }){
            return damageCalcutionInfo;
        },
        //This needs to be implemented in the GameBattle class for each type of battle behaviour for now...
        OnRemoved(game:IGame,pokemon:Pokemon){

        }
    }
    
    return obj;
}


abstract class BattleBehaviour implements IBattleBehaviour {

    BeforeAttack(game: IGame, pokemon: Pokemon) {

    }
    //named this way so that it always triggers, even if the pokemon uses a move that misses or not.
    AfterActionStep(game: IGame, pokemon: Pokemon) {

    }
    EndOfTurn(game: IGame, pokemon: Pokemon) {

    }
    OnAfterDamageCalculated(attackingPokemon: Pokemon, move: Technique, defendingPokemon: Pokemon, damage: number, damageInfo: DamageModifierInfo, game: IGame): number {
        return damage;
    }
    OnAfterDamageAttack(game:IGame,pokemon:Pokemon,defendingPokemon:Pokemon,technique:Technique,newDamage:number){

    }
    OnDamageDealt(game: IGame, attackingPokemon: Pokemon, defendingPokemon: Pokemon, damageDealt: number) {

    }
    OnDamageTakenFromTechnique(game: IGame, attackingPokemon: Pokemon, defendingPokemon: Pokemon, move: Technique, damage: number) {

    }
    ModifyTechnique(pokemon: Pokemon, technique: Technique) {
        return technique;
    }
    ModifyOpponentTechnique(pokemon:Pokemon,technique:Technique){
        return technique;
    }
    OnTechniqueUsed(game: IGame, pokemon: Pokemon, move: Technique) {

    }
    OnTechniqueMissed(game: IGame, pokemon: Pokemon) {

    }
    NegateTechnique(game: IGame, attackingPokemon: Pokemon, defendingPokemon: Pokemon, move: Technique): boolean {
        return false;
    }
    NegateOwnTechnique(game: IGame, attackingPokemon: Pokemon, defendingPokemon: Pokemon, technique: Technique){
        return false;
    }
    NegateDamage(game: IGame, move: Technique, pokemon: Pokemon): boolean {
        return false; //by default no abilities should negate damage unless we say so.
    }
    ModifyDamageTaken(game: IGame, attackingPokemon: Pokemon, defendingPokemon: Pokemon, move: Technique, originalDamage: number) {
        return originalDamage;
    }
    ModifyIndirectDamage(game: IGame, pokemon: Pokemon, damage: number) {
        return damage;
    }
    ModifyStatBoostAmount(game: IGame, pokemon: Pokemon, amount: number, sourcePokemon: Pokemon) {
        return amount;
    }
    Update(game: IGame, pokemon: Pokemon) {

    }
    OnPokemonEntry(game: IGame, pokemon: Pokemon) {

    }
    ForceAction(game: IGame, player: Player, pokemon: Pokemon) {
        //Force the player to do a specific action in a turn
        //Should have some way to enforce only having 1 Forced action per turn.
    }
    OverrideAction(game: IGame, player: Player, pokemon: Pokemon, action: UseMoveAction): UseMoveAction {
        //Overrides an action, i.e. for Choice items
        return action;
    }
    OnSwitchedOut(game: IGame, pokemon: Pokemon) {

    }
    OnOppTechniqueUsed(game: IGame, pokemon: Pokemon, technique: Technique) {

    }
    //Can modify which actions are considered valid.
    ModifyOpponentValidActions(game:IGame,opponent:Player,validActions:BattleAction[]):BattleAction[]{
         return validActions;
    }

    ModifyValidActions(game:IGame,player:Player,validActions:BattleAction[]):BattleAction[]{
        return validActions;
    }
    ModifyDamageCalculationInfo(game: IGame, damageCalcutionInfo: { pokemon: Pokemon, defendingPokemon: Pokemon, technique: Technique }){
        return damageCalcutionInfo;
    }
    OnRemoved(game:IGame,pokemon:Pokemon){

    }
}

export default BattleBehaviour;