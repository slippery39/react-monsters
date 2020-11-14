import {ElementType} from 'game/ElementType';
import { Stats } from './Pokemon';


interface SpeciesDB {
    [key:string] : ISpecies
}

interface ISpecies {
    name:string,
    baseStats:Stats,
    elementalTypes:Array<ElementType>,
    ability:string
}


export function GetSpecies(name:string): ISpecies{

const pokemons: SpeciesDB = {
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
        ability:"Blaze"
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
        ability:"Torrent"
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
        ability:"Overgrowth"
    }
}


const pokemon = pokemons[name.toLowerCase()];

if (pokemon === undefined){
    throw new Error(`Could not find species for ${name} in call to GetSpecies()`);
}

return pokemon;

}
