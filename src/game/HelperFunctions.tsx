import { ElementType, Player, Pokemon } from "./interfaces";

export function GetActivePokemon(player: Player) {
    const pokemon = player.pokemon.find(p => p.id === player.currentPokemonId);

    if (pokemon === undefined) {
        throw new Error(`nvalid pokemon id ${player.currentPokemonId}`);
    }

    return pokemon;
}

export function GetPercentageHealth(pokemon: Pokemon) {
    return (pokemon.currentStats.health / pokemon.originalStats.health) * 100
}


export function IsFainted(pokemon: Pokemon) {
    return pokemon.currentStats.health <= 0;
}

export function HasElementType(pokemon: Pokemon, element: ElementType) {
    return pokemon.elementalTypes.filter(t => t === element).length > 0;
}



