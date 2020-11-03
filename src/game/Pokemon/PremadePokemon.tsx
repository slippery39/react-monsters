import {ElementType} from 'game/interfaces';
import { Stats } from './Pokemon';


interface PokemonDB {
    [key:string] : IPokemonBase
}

interface IPokemonBase {
    name:string,
    stats:Stats,
    elementalTypes:Array<ElementType>,
    techniques:Array<string>    
}


export function GetPokemon(name:string): IPokemonBase{

const pokemons: PokemonDB = {
    "charizard":{
        name: 'Charizard',
        elementalTypes:[ElementType.Fire,ElementType.Flying],
        stats: {
            health: 300,
            attack: 250,
            defence: 200,
            specialAttack: 250,
            specialDefence: 250,
            speed: 350
        },
        techniques: [
            "fireblast",
            "fly",
            "thunder wave"
        ]
    },
    "blastoise": {
        name: 'Blastoise',
        elementalTypes:[ElementType.Water],
        stats: {
            health: 300,
            attack: 200,
            defence: 200,
            specialAttack: 200,
            specialDefence: 250,
            speed: 350
        },
        techniques: [
            "hydro pump"
        ]
    },
    "venusaur":{
        name: 'Venusaur',
        elementalTypes:[ElementType.Grass,ElementType.Poison],
        stats: {
            health: 300,
            attack: 250,
            defence: 200,
            specialAttack: 250,
            specialDefence: 250,
            speed: 350
        },
        techniques: [
            'razor leaf',
            'swords dance'
        ]
    }
}

return pokemons[name];

}
