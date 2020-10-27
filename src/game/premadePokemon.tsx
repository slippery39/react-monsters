import {Pokemon,ElementType} from './interfaces';

import {GetTech} from "./PremadeTechniques";

interface PokemonDB {
    [key:string] : Pokemon
}


export function GetPokemon(name:string){

const pokemons: PokemonDB = {
    "charizard":{
        id: 1,
        name: 'Charizard',
        elementalTypes:[ElementType.Fire,ElementType.Flying],
        originalStats: {
            health: 300,
            attack: 250,
            defence: 200,
            specialAttack: 250,
            specialDefence: 250,
            speed: 350
        },
        currentStats: {
            health: 300,
            attack: 250,
            defence: 200,
            specialAttack: 250,
            specialDefence: 250,
            speed: 350
        },
        techniques: [
            GetTech("Fireblast"),
            GetTech("Fly"),
            GetTech("Thunder Wave")
        ]
    },
    "blastoise": {
        id: 2,
        name: 'Blastoise',
        elementalTypes:[ElementType.Water],
        originalStats: {
            health: 300,
            attack: 200,
            defence: 200,
            specialAttack: 200,
            specialDefence: 250,
            speed: 350
        },
        currentStats: {
            health: 300,
            attack: 200,
            defence: 200,
            specialAttack: 200,
            specialDefence: 250,
            speed: 350
        },
        techniques: [
            GetTech("Hydro Pump")
        ]
    },
    "venusaur":{
        id: 3,
        name: 'Venusaur',
        elementalTypes:[ElementType.Grass,ElementType.Poison],
        originalStats: {
            health: 300,
            attack: 250,
            defence: 200,
            specialAttack: 250,
            specialDefence: 250,
            speed: 350
        },
        currentStats: {
            health: 300,
            attack: 250,
            defence: 200,
            specialAttack: 250,
            specialDefence: 250,
            speed: 350
        },
        techniques: [
            GetTech("Razor Leaf")
        ]
    }
}

return pokemons[name];

}
