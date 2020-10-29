import { Turn } from "../BattleController";
import { BattleEventType, CannotAttackEvent, GenericMessageEvent } from "../BattleEvents";
import { HasElementType } from "../HelperFunctions";
import { ElementType, Pokemon, Status } from "../interfaces";

export interface IBeforeAttack {
    BeforeAttack: (turn: Turn, pokemon: Pokemon) => void
}
export interface ICanApply {
    CanApply: (turn: Turn, pokemon: Pokemon) => void
}
export interface IEndOfTurn {
    EndOfTurn: (turn: Turn, pokemon: Pokemon) => void
}

interface HardStatus{
    statusType:Status;
}

class ParalyzeStatus implements HardStatus, IBeforeAttack, ICanApply {


    statusType = Status.Paralyzed;
    private cantMoveChance: number = 25;

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

class PoisonStatus implements HardStatus, ICanApply, IEndOfTurn {

    statusType = Status.Poison;

    EndOfTurn(turn: Turn, pokemon: Pokemon) {
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
    CanApply(turn: Turn, pokemon: Pokemon) {
        return !HasElementType(pokemon, ElementType.Poison);
    }

}



function GetHardStatus(status: Status) : any {

    if (status === Status.Paralyzed) {
        return new ParalyzeStatus();
    }
    else if (status === Status.Poison){
        return new PoisonStatus();
    }

    throw new Error(`Status ${status} not implemented for GetStatus`);
}

export default GetHardStatus;