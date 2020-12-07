import { GetActivePokemon, HasElementType } from "game/HelperFunctions";
import { ElementType } from "game/ElementType";
import { HasVolatileStatus, IPokemon } from "game/Pokemon/Pokemon";
import { Turn } from "game/Turn";
import _ from "lodash";
import BattleBehaviour from "game/BattleBehaviour/BattleBehavior";
import { BattleEventType } from "game/BattleEvents";


export enum VolatileStatusType {
    Confusion = 'confusion',
    AquaRing = 'aqua-ring',
    LeechSeed = 'leech-seed',
    Flinch = 'flinch',
    Roosted = 'roosted',
    Substitute = 'substitute'

}

export abstract class VolatileStatus extends BattleBehaviour {
    abstract type: VolatileStatusType

    abstract InflictedMessage(pokemon: IPokemon): string

    OnApply(turn: Turn, pokemon: IPokemon) {

    }
    CanApply(turn: Turn, pokemon: IPokemon) {
        return !HasVolatileStatus(pokemon, this.type)
    }
    Remove(turn: Turn, pokemon: IPokemon) {
        _.remove(pokemon.volatileStatuses, (vStat) =>
            vStat.type === this.type
        );
        this.OnRemoved(turn, pokemon);
    }
    OnRemoved(turn: Turn, pokemon: IPokemon) {

    }
}

export class SubstituteVolatileStatus extends VolatileStatus {
    type = VolatileStatusType.Substitute


    public substituteHealth: number = 999;

    Damage(turn: Turn, pokemon: IPokemon, amount: number) {
        this.substituteHealth -= amount;
        //This is a quick hack to be able to apply the damage animation to the substitute.
        turn.ApplyIndirectDamage(pokemon,0);
        if (this.substituteHealth <= 0) {
            this.Remove(turn, pokemon);
        }
    }
    InflictedMessage(pokemon: IPokemon) {
        return `${pokemon.name} has created a substitute`
    }

    HealthForSubstitute(pokemon: IPokemon) {
        return Math.ceil(pokemon.originalStats.health / 4);
    }

    CanApply(turn: Turn, pokemon: IPokemon) {
        const canApply = super.CanApply(turn, pokemon) && (pokemon.currentStats.health > this.HealthForSubstitute(pokemon));

        //Not ideal here, but works for now. 
        if (!canApply){
            turn.ApplyMessage('But it failed!');
        }
        return canApply;
    }

    OnRemoved(turn: Turn, pokemon: IPokemon) {
        pokemon.hasSubstitute = false;
        turn.AddEvent({
            type:BattleEventType.SubstituteBroken,
            targetPokemonId:pokemon.id            
        });
        turn.AddEvent({
            type:BattleEventType.GenericMessage,
            defaultMessage:`${pokemon.name}'s substitute has broken!`
        })
    }

    OnApply(turn: Turn, pokemon: IPokemon) {
        /*
            Create a substitute that has 1/4 the pokemon's health
            //all damage should go to the substiute until it breaks.
        */

        this.substituteHealth = this.HealthForSubstitute(pokemon);
        pokemon.currentStats.health -= this.HealthForSubstitute(pokemon);
        pokemon.hasSubstitute = true;
        turn.AddEvent({
            type:BattleEventType.SubstituteCreated,
            targetPokemonId:pokemon.id
        });

    }
}

export class RoostedVolatileStatus extends VolatileStatus {
    type = VolatileStatusType.Roosted

    private originalTypes: Array<ElementType> = [];

    InflictedMessage(pokemon: IPokemon) {
        return `${pokemon.name} has roosted!`
    }

    OnApply(turn: Turn, pokemon: IPokemon) {

        this.originalTypes = [...pokemon.elementalTypes];
        //remove the flying element of the pokemon
        _.remove(pokemon.elementalTypes, (elType) => {
            return elType === ElementType.Flying
        });
    }

    OnRemoved(turn: Turn, pokemon: IPokemon) {
        pokemon.elementalTypes = this.originalTypes;
    }

    EndOfTurn(turn: Turn, pokemon: IPokemon) {
        this.Remove(turn, pokemon);
    }

}

export class AquaRingVolatileStatus extends VolatileStatus {
    type: VolatileStatusType = VolatileStatusType.AquaRing;

    InflictedMessage(pokemon: IPokemon): string {
        return `${pokemon.name} has surrounded itself in a veil of water!`
    }
    EndOfTurn(turn: Turn, pokemon: IPokemon) {
        //heal 1/16 of hp
        turn.ApplyHealing(pokemon, pokemon.originalStats.health / 16);
        turn.ApplyMessage(`${pokemon.name} restored a little health due to aqua veil!`);
    }
}


export class FlinchVolatileStatus extends VolatileStatus {
    type: VolatileStatusType = VolatileStatusType.Flinch

    InflictedMessage(pokemon: IPokemon): string {
        //hack here. we may need an "on apply" method
        return ``;
    }

    //Not sure if we should apply here or we should apply on attack.
    OnApply(turn: Turn, pokemon: IPokemon) {
    }

    BeforeAttack(turn: Turn, pokemon: IPokemon) {
        pokemon.canAttackThisTurn = false;
        turn.ApplyMessage(`${pokemon.name} has flinched`);
    }

    EndOfTurn(turn: Turn, pokemon: IPokemon) {
        _.remove(pokemon.volatileStatuses, (vStat) =>
            vStat.type === this.type
        );
    }
}

export class LeechSeedVolatileStatus extends VolatileStatus {
    type: VolatileStatusType = VolatileStatusType.LeechSeed;

    InflictedMessage(pokemon: IPokemon): string {
        return `${pokemon.name} has been seeded!`;
    }

    CanApply(turn: Turn, pokemon: IPokemon) {
        return super.CanApply(turn, pokemon) && !HasElementType(pokemon, ElementType.Grass);
    }

    EndOfTurn(turn: Turn, pokemon: IPokemon) {
        const leechSeedDamage = pokemon.originalStats.health / 16;
        //deal the leech seed damage to the pokemon
        //heal the opponent pokemon
        const opponentPlayer = turn.players.find(player => player.currentPokemonId !== pokemon.id);
        if (opponentPlayer === undefined) {
            throw new Error('Could not find player for leech seed end of turn');
        }

        const opponentPokemon = GetActivePokemon(opponentPlayer);
        turn.ApplyIndirectDamage(pokemon, leechSeedDamage);
        turn.ApplyHealing(opponentPokemon, leechSeedDamage);
        turn.ApplyMessage(`${pokemon.name} had its health drained a little due to leech seed!`);
    }
}


export class ConfusionVolatileStatus extends VolatileStatus {
    type: VolatileStatusType = VolatileStatusType.Confusion;

    private unconfuseChance: number = 25;
    private damageSelfChance: number = 50

    BeforeAttack(turn: Turn, pokemon: IPokemon) {

        if (pokemon.canAttackThisTurn === false) {
            return;
        }

        if (turn.Roll(this.unconfuseChance)) {
            //the attacking pokemon is no longer confused
            _.remove(pokemon.volatileStatuses, (vstatus) => vstatus.type === 'confusion');
            turn.ApplyMessage(`${pokemon.name} has snapped out of its confusion!`);
        }
        else {
            turn.ApplyMessage(`${pokemon.name} is confused!`);
            if (turn.Roll(this.damageSelfChance)) {
                turn.ApplyMessage(`${pokemon.name} has hurt itself in its confusion`);
                turn.ApplyIndirectDamage(pokemon, 40);
                //pokemon skips the turn as well
                pokemon.canAttackThisTurn = false;
            }
        }
    }

    InflictedMessage(pokemon: IPokemon): string {
        return `${pokemon.name} is now confused!`
    }
}


export function GetVolatileStatus(type: VolatileStatusType): VolatileStatus {
    switch (type) {
        case VolatileStatusType.Confusion: {
            return new ConfusionVolatileStatus();
        }
        case VolatileStatusType.AquaRing: {
            return new AquaRingVolatileStatus();
        }
        case VolatileStatusType.LeechSeed: {
            return new LeechSeedVolatileStatus();
        }
        case VolatileStatusType.Flinch: {
            return new FlinchVolatileStatus();
        }
        case VolatileStatusType.Roosted: {
            return new RoostedVolatileStatus();
        }
        case VolatileStatusType.Substitute: {
            return new SubstituteVolatileStatus();
        }
        default: {
            throw new Error(`${type} has not been implemented in GetVolatileStatus`);
        }
    }
}


