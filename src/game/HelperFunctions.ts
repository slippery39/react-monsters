import { ElementType } from "./ElementType";
import { Player } from "./Player/PlayerBuilder";
import { Pokemon } from "./Pokemon/Pokemon";
import { Stat } from "./Stat";

export function GetActivePokemon(player: Player) {
    const pokemon = player.pokemon.find(p => p.id === player.currentPokemonId);

    if (pokemon === undefined) {
        throw new Error(`invalid pokemon id ${player.currentPokemonId}`);
    }

    return pokemon;
}

export function GetPercentageHealth(pokemon: Pokemon) {
    return (pokemon.currentStats.hp / pokemon.originalStats.hp) * 100
}


export function ResetStatBoosts(pokemon:Pokemon){
    pokemon.statBoosts[Stat.Attack] = 0;
    pokemon.statBoosts[Stat.Defense] = 0;
    pokemon.statBoosts[Stat.Accuracy] = 0;
    pokemon.statBoosts[Stat.SpecialAttack] = 0;
    pokemon.statBoosts[Stat.SpecialDefense] = 0;
    pokemon.statBoosts[Stat.Speed] = 0;
    pokemon.statBoosts[Stat.Accuracy] = 0;
}


export function IsFainted(pokemon: Pokemon) {
    return pokemon.currentStats.hp <= 0;
}

export function HasElementType(pokemon: Pokemon, element: ElementType) {
    return pokemon.elementalTypes.filter(t => t === element).length > 0;
}

export function GetPokemonOwner(players:Array<Player>,pokemon:Pokemon): Player{
    const owner = players.find(play=>{
        return play.pokemon.filter(poke=>poke.id === pokemon.id).length > 0
    });

    if (owner === undefined){
        throw new Error(`Could not find owner for pokemon of id ${pokemon.id} and name ${pokemon.name}. Please check the call to GetPokemonOwner()`);
    }

    return owner;
}



