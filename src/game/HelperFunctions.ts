import { ElementType } from "./ElementType";
import { Player } from "./Player/PlayerBuilder";
import { IPokemon } from "./Pokemon/Pokemon";

export function GetActivePokemon(player: Player) {
    const pokemon = player.pokemon.find(p => p.id === player.currentPokemonId);

    if (pokemon === undefined) {
        throw new Error(`nvalid pokemon id ${player.currentPokemonId}`);
    }

    return pokemon;
}

export function GetPercentageHealth(pokemon: IPokemon) {
    return (pokemon.currentStats.health / pokemon.originalStats.health) * 100
}


export function IsFainted(pokemon: IPokemon) {
    return pokemon.currentStats.health <= 0;
}

export function HasElementType(pokemon: IPokemon, element: ElementType) {
    return pokemon.elementalTypes.filter(t => t === element).length > 0;
}



