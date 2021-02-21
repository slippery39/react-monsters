import BattleBehaviour from "game/BattleBehaviour/BattleBehavior";
import { ElementType } from "game/ElementType";
import { Status } from "game/HardStatus/HardStatus";
import { Pokemon } from "game/Pokemon/Pokemon";
import { Technique } from "game/Techniques/Technique";
import { Turn } from "game/Turn";
import { VolatileStatusType } from "game/VolatileStatus/VolatileStatus";

export abstract class HeldItem extends BattleBehaviour {
    name: string = ""
    description: string = ""
}

export class LeftoversHeldItem extends HeldItem {
    name: string = "Leftovers"
    description = "An item to be held by a Pokémon. The holder's HP is gradually restored during battle."
    EndOfTurn(turn: Turn, pokemon: Pokemon) {
        const healing = Math.ceil(pokemon.originalStats.hp / 16);
        turn.ApplyHealing(pokemon, healing);
        turn.AddMessage(`${pokemon.name} has healed due to its leftovers!`);
    }

}

export class LifeOrbHeldItem extends HeldItem {
    name: string = "Life Orb";
    description = "An item to be held by a Pokémon. It boosts the power of moves, but at the cost of some HP on each hit.";
    OnAfterDamageCalculated(attackingPokemon: Pokemon, move: Technique, defendingPokemon: Pokemon, damage: number, damageInfo: any): number {
        return damage * 1.3;
    }
    OnDamageDealt(turn: Turn, attackingPokemon: Pokemon, defendingPokemon: Pokemon, damageDealt: number) {
        //take recoil damage
        const recoilDamage = attackingPokemon.originalStats.hp / 10;
        turn.ApplyIndirectDamage(attackingPokemon, recoilDamage);
        turn.AddMessage(`${attackingPokemon.name} suffered recoil damage due to its Life Orb`);

    }
}

export class LumBerryHeldItem extends HeldItem {
    name: string = "Lum Berry";
    description = "A Berry to be consumed by Pokémon. If a Pokémon holds one, it can recover from any status condition during battle."

    Update(turn: Turn, pokemon: Pokemon) {

        let hasCured: boolean = false;

        if (pokemon.status !== Status.None) {
            pokemon.status = Status.None;
            hasCured = true;
        }
        const confusions = pokemon.volatileStatuses.filter(vStat => vStat.type === VolatileStatusType.Confusion);
        if (confusions.length > 0) {
            pokemon.volatileStatuses.forEach(vStat => {
                vStat.Remove(turn, pokemon);
                hasCured = true;
            });
        }

        if (hasCured) {
            turn.AddMessage(`${pokemon.name} has been cured of its status effects due to its Lum Berry!`);
            pokemon.heldItem = new NoHeldItem();
        }
    }
}

export class BlackSludge extends HeldItem {
    name: string = "Black Sludge";
    description = "A held item that gradually restores the HP of Poison-type Pokémon. It inflicts damage on all other types."

    EndOfTurn(turn: Turn, pokemon: Pokemon) {

        if (pokemon.elementalTypes.includes(ElementType.Poison)) {
            const healing = Math.ceil(pokemon.originalStats.hp / 16);
            turn.ApplyHealing(pokemon, healing);
            turn.AddMessage(`${pokemon.name} has healed due to its black sludge!`);
        }
        else{
            const damage = Math.ceil(pokemon.originalStats.hp / 8);
            turn.ApplyIndirectDamage(pokemon,damage);
            turn.AddMessage(`${pokemon.name} has been damaged due to is black sludge!`);
        }
    }
}



//Empty held item.
export class NoHeldItem extends HeldItem {

}

function GetHeldItem(name: string): HeldItem {

    switch (name.toLowerCase()) {
        case "leftovers": {
            return new LeftoversHeldItem();
        }
        case "life orb": {
            return new LifeOrbHeldItem();
        }
        case "lum berry": {
            return new LumBerryHeldItem();
        }
        case "black sludge":{
            return new BlackSludge();
        }
        case "none": {
            return new NoHeldItem();
        }
        
        default: {
            throw new Error(`Could not find held item for ${name} in GetHeldItem`);
        }
    }
}


export default GetHeldItem;