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
            hp: 78,
            attack: 84,
            defense: 78,
            spAttack: 109,
            spDefense: 85,
            speed: 100
        },
        ability:"Blaze"
    },
    "blastoise": {
        name: 'Blastoise',
        elementalTypes:[ElementType.Water],
        baseStats: {
            hp: 79,
            attack: 83,
            defense: 100,
            spAttack: 85,
            spDefense: 105,
            speed: 78
        },
        ability:"Torrent"
    },
    "venusaur":{
        name: 'Venusaur',
        elementalTypes:[ElementType.Grass,ElementType.Poison],
        baseStats: {
            hp: 80,
            attack: 82,
            defense: 83,
            spAttack: 100,
            spDefense: 100,
            speed: 80
        },
        ability:"Overgrowth"
    },
    "raichu":{
        name:"Raichu",
        elementalTypes:[ElementType.Electric],
        baseStats:{
            hp:60,
            attack:90,
            defense:55,
            spAttack:90,
            spDefense:80,
            speed:100
        },
        ability:"Lightning Rod"
    },
    "alakazam":{
        name:"Alakazam",
        elementalTypes:[ElementType.Psychic],
        baseStats:{
            hp:55,
            attack:50,
            defense:45,
            spAttack:135,
            spDefense:85,
            speed:120
        },
        ability:"Magic Guard"
    },
    "gengar":{
        name:"Gengar",
        elementalTypes:[ElementType.Ghost,ElementType.Poison],
        baseStats:{
            hp:60,
            attack:65,
            defense:60,
            spAttack:130,
            spDefense:75,
            speed:110
        },
        ability:"Levitate"
    },
    "meganium":{
        name:"Meganium",
        elementalTypes:[ElementType.Grass],
        baseStats:{
            hp:80,
            attack:82,
            defense:100,
            spAttack:83,
            spDefense:100,
            speed:100
        },
        ability:"Overgrowth"
    },
    "typhlosion":{
        name:"Typhlosion",
        elementalTypes:[ElementType.Fire],
        baseStats:{
            hp:74,
             attack:84,
            defense:78,
            spAttack:109,
            spDefense:85,
            speed:100
        },
        ability:"Flash Fire"
    },
    "feraligatr":{
        name:"Feraligatr",
        elementalTypes:[ElementType.Water],
        baseStats:{
            hp:85,
            attack:105,
            defense:100,
            spAttack:79,
            spDefense:83,
            speed:78
        },
        ability:"Sheer Force"
    },
    "ampharos":{
        name:"Ampharos",
        elementalTypes:[ElementType.Electric],
        baseStats:{
            hp:90,
            attack:75,
            defense:85,
            spAttack:115,
            spDefense:90,
            speed:55
        },
        ability:"Static"
    }

}


const pokemon = pokemons[name.toLowerCase()];

if (pokemon === undefined){
    throw new Error(`Could not find species for ${name} in call to GetSpecies()`);
}

return pokemon;

}
