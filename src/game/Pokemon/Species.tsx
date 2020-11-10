import {ElementType} from 'game/interfaces';
import { Stats } from './Pokemon';


interface PokemonDB {
    [key:string] : IPokemonBase
}

interface IPokemonBase {
    name:string,
    baseStats:Stats,
    elementalTypes:Array<ElementType>,
    techniques:Array<string>    
}


export function GetSpecies(name:string): IPokemonBase{

const pokemons: PokemonDB = {
    "charizard":{
        name: 'Charizard',
        elementalTypes:[ElementType.Fire,ElementType.Flying],
        baseStats: {
            health: 78,
            attack: 84,
            defence: 78,
            specialAttack: 109,
            specialDefence: 85,
            speed: 100
        },
        techniques: [
            "fire blast",
            "air slash",
            "focus blast",
            "roost"
        ]
    },
    "blastoise": {
        name: 'Blastoise',
        elementalTypes:[ElementType.Water],
        baseStats: {
            health: 79,
            attack: 83,
            defence: 100,
            specialAttack: 85,
            specialDefence: 105,
            speed: 78
        },
        techniques: [
            "hydro pump",
            "aqua veil"
        ]
    },
    "venusaur":{
        name: 'Venusaur',
        elementalTypes:[ElementType.Grass,ElementType.Poison],
        baseStats: {
            health: 80,
            attack: 82,
            defence: 83,
            specialAttack: 100,
            specialDefence: 100,
            speed: 80
        },
        techniques: [
            'razor leaf',
            'swords dance'
        ]
    }
}


const pokemon = pokemons[name.toLowerCase()];

if (pokemon === undefined){
    throw new Error(`Could not find species for ${name} in call to GetSpecies()`);
}

return pokemon;

}
