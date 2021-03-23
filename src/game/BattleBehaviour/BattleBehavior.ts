
/*
Work in progress for our BattleBehavior class.
This is the class that all classes that need to tap into the turn object will call into.

//Grab all our stuff from HardStatuses, VolatileStatuses and Abilities and Put them in here.
*/

import { UseMoveAction } from "game/BattleActions";
import { IGame } from "game/BattleGame";
import { Player } from "game/Player/PlayerBuilder";
import { Pokemon } from "game/Pokemon/Pokemon";
import { Technique } from "game/Techniques/Technique";



abstract class BattleBehaviour {

    BeforeAttack(turn: IGame, pokemon: Pokemon) {

    }
    //named this way so that it always triggers, even if the pokemon uses a move that misses or not.
    AfterActionStep(turn: IGame, pokemon: Pokemon) {

    }
    EndOfTurn(turn: IGame, pokemon: Pokemon) {

    }
    OnAfterDamageCalculated(attackingPokemon: Pokemon, move: Technique, defendingPokemon: Pokemon, damage: number, damageInfo: any, turn: IGame): number {
        return damage;
    }
    OnDamageDealt(turn: IGame, attackingPokemon: Pokemon, defendingPokemon: Pokemon, damageDealt: number) {

    }
    OnDamageTakenFromTechnique(turn: IGame, attackingPokemon: Pokemon, defendingPokemon: Pokemon, move: Technique, damage: number) {

    }
    ModifyTechnique(pokemon: Pokemon, technique: Technique) {
        return technique;
    }
    OnTechniqueUsed(turn: IGame, pokemon: Pokemon, move: Technique) {

    }
    OnTechniqueMissed(turn: IGame, pokemon: Pokemon) {

    }
    NegateTechnique(turn: IGame, attackingPokemon: Pokemon, defendingPokemon: Pokemon, move: Technique): boolean {
        return false;
    }
    NegateDamage(turn: IGame, move: Technique, pokemon: Pokemon): boolean {
        return false; //by default no abilities should negate damage unless we say so.
    }
    ModifyDamageTaken(turn: IGame, attackingPokemon: Pokemon, defendingPokemon: Pokemon, move: Technique, originalDamage: number) {
        return originalDamage;
    }
    ModifyIndirectDamage(turn: IGame, pokemon: Pokemon, damage: number) {
        return damage;
    }
    ModifyStatBoostAmount(turn: IGame, pokemon: Pokemon, amount: number, sourcePokemon: Pokemon) {
        return amount;
    }
    Update(turn: IGame, pokemon: Pokemon) {

    }
    OnPokemonEntry(turn: IGame, pokemon: Pokemon) {

    }
    ForceAction(turn: IGame, player: Player, pokemon: Pokemon) {
        //Force the player to do a specific action in a turn
        //Should have some way to enforce only having 1 Forced action per turn.
    }
    OverrideAction(turn: IGame, player: Player, pokemon: Pokemon, action: UseMoveAction): UseMoveAction {
        //Overrides an action, i.e. for Choice items
        return action;
    }
    OnSwitchedOut(turn: IGame, pokemon: Pokemon) {

    }
    OnOppTechniqueUsed(turn: IGame, pokemon: Pokemon, technique: Technique) {

    }


}

export default BattleBehaviour;