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
    return (pokemon.currentStats.hp / pokemon.originalStats.hp) * 100
}


export function IsFainted(pokemon: IPokemon) {
    return pokemon.currentStats.hp <= 0;
}

export function HasElementType(pokemon: IPokemon, element: ElementType) {
    return pokemon.elementalTypes.filter(t => t === element).length > 0;
}

export function GetPokemonOwner(players:Array<Player>,pokemon:IPokemon): Player{
    const owner = players.find(play=>{
        return play.pokemon.filter(poke=>poke.id === pokemon.id).length > 0
    });

    if (owner === undefined){
        throw new Error(`Could not find owner for pokemon of id ${pokemon.id} and name ${pokemon.name}. Please check the call to GetPokemonOwner()`);
    }

    return owner;
}



