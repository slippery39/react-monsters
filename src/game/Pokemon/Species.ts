import {ElementType} from 'game/ElementType';
import { Stats } from './Pokemon';


interface SpeciesDB {
    [key:string] : ISpecies
}

interface ISpecies {
    name:string,
    baseStats:Stats,
    elementalTypes:Array<ElementType>,
}


export function GetSpecies(name:string): ISpecies{

const pokemons: SpeciesDB = {

    "missingno":{
        name:"missingno",
        elementalTypes:[ElementType.Flying,ElementType.Normal],
        baseStats:{
            hp:100,
            attack:100,
            spAttack:100,
            spDefense:100,
            defense:100,
            speed:500
        }
    },
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
    },
    "blastoise": {
        name: 'Blastoise',
        elementalTypes:[ElementType.Water],
        baseStats: {
            hp: 79,
            attack: 83,
            defense: 100,
            //spAttack: 85,
            spAttack:400,
            spDefense: 105,
            speed: 78
        },
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
    },
    "skarmory":{
        name:"Skarmory",
        elementalTypes:[ElementType.Steel],
        baseStats:{
            hp:65,
            attack:80,
            defense:140,
            spAttack:40,
            spDefense:70,
            speed:70
        },
    },
    "blissey":{
        name:"Blissey",
        elementalTypes:[ElementType.Normal],
        baseStats:{
            hp:255,
            attack:10,
            defense:10,
            spAttack:75,
            spDefense:125,
            speed:55,
        }
    }

}


const pokemon = pokemons[name.toLowerCase()];

if (pokemon === undefined){
    throw new Error(`Could not find species for ${name} in call to GetSpecies()`);
}

return pokemon;

}
