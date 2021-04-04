
/*
Work in progress for our BattleBehavior class.
This is the class that all classes that need to tap into the turn object will call into.

//Grab all our stuff from HardStatuses, VolatileStatuses and Abilities and Put them in here.
*/

import { BattleAction, UseMoveAction } from "game/BattleActions";
import { IGame } from "game/BattleGame";
import { Player } from "game/Player/PlayerBuilder";
import { Pokemon } from "game/Pokemon/Pokemon";
import { Technique } from "game/Techniques/Technique";



abstract class BattleBehaviour {

    BeforeAttack(game: IGame, pokemon: Pokemon) {

    }
    //named this way so that it always triggers, even if the pokemon uses a move that misses or not.
    AfterActionStep(game: IGame, pokemon: Pokemon) {

    }
    EndOfTurn(game: IGame, pokemon: Pokemon) {

    }
    OnAfterDamageCalculated(attackingPokemon: Pokemon, move: Technique, defendingPokemon: Pokemon, damage: number, damageInfo: any, game: IGame): number {
        return damage;
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


}

export default BattleBehaviour;