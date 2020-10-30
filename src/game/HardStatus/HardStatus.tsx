import { Turn } from "game/Turn";
import { BattleEventType, CannotAttackEvent, GenericMessageEvent, StatusChangeEvent } from "game/BattleEvents";
import { HasElementType } from "game/HelperFunctions";
import { ElementType, Pokemon, Status } from "game/interfaces";

export interface IBeforeAttack {
    BeforeAttack: (turn: Turn, pokemon: Pokemon) => void
}
export interface ICanApply {
    CanApply: (turn: Turn, pokemon: Pokemon) => boolean
}
export interface IEndOfTurn {
    EndOfTurn: (turn: Turn, pokemon: Pokemon) => void
}

interface HardStatus {
    statusType: Status;
}

class BurnStatus implements HardStatus, IEndOfTurn, ICanApply {

    statusType = Status.Burned;

    CanApply(turn: Turn, pokemon: Pokemon) {
        return !HasElementType(pokemon, ElementType.Fire);
    }
    EndOfTurn(turn: Turn, pokemon: Pokemon) {
        const maxHp = pokemon.originalStats.health;
        const burnDamage = Math.ceil(maxHp / 8);
        const burnMessage: GenericMessageEvent = {
            type: BattleEventType.GenericMessage,
            defaultMessage: `${pokemon.name} is hurt by its burn`
        }
        turn.AddEvent(burnMessage);
        turn.ApplyDamage(pokemon, burnDamage, {});
    }
}

class FrozenStatus implements HardStatus, IBeforeAttack, ICanApply {
    statusType = Status.Frozen
    private thawChance: number = 25;

    CanApply(turn: Turn, pokemon: Pokemon) {
        return !HasElementType(pokemon, ElementType.Ice);
    }

    BeforeAttack(turn: Turn, pokemon: Pokemon) {
        const isFrozenEffect: GenericMessageEvent = {
            type: BattleEventType.GenericMessage,
            defaultMessage: `${pokemon.name} is frozen!`
        }
        turn.AddEvent(isFrozenEffect);

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
}

class SleepStatus implements HardStatus, IBeforeAttack {
    statusType = Status.Sleep;
    private wakeUpChance: number = 25;

    BeforeAttack(turn: Turn, pokemon: Pokemon) {
        const isAsleepEffect: GenericMessageEvent = {
            type: BattleEventType.GenericMessage,
            defaultMessage: `${pokemon.name} is sleeping!`
        }
        turn.AddEvent(isAsleepEffect);
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

class NoneStatus implements HardStatus {
    statusType = Status.None
}

function GetHardStatus(status: Status): any {

    if (status === Status.Paralyzed) {
        return new ParalyzeStatus();
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
    else if (status === Status.None) {
        return new NoneStatus();
    }

    throw new Error(`Status ${status} not implemented for GetStatus`);
}

export default GetHardStatus;