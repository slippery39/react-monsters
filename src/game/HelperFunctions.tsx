import { Player, Pokemon } from "./interfaces";

export function GetActivePokemon(player:Player){
    const pokemon = player.pokemon.find(p=>p.id === player.currentPokemonId);

    if (pokemon === undefined){
        throw new Error(`nvalid pokemon id ${player.currentPokemonId}`);
    }

    return pokemon;
}

export function GetPercentageHealth(pokemon : Pokemon){    
    return ( pokemon.currentStats.health / pokemon.originalStats.health ) * 100
}


