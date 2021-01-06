import { ElementType } from 'game/ElementType';
import { Stats } from './Pokemon';

interface ISpecies {
    name: string,
    baseStats: Stats,
    elementalTypes: Array<ElementType>,
}

export function GetSpecies(name: string): ISpecies {

    const pokemons: Array<ISpecies> = [
        {
            name: "missingno",
            elementalTypes: [ElementType.Flying, ElementType.Normal],
            baseStats: {
                hp: 100,
                attack: 100,
                spAttack: 100,
                spDefense: 100,
                defense: 100,
                speed: 100
            }
        },
        {
            name: 'Charizard',
            elementalTypes: [ElementType.Fire, ElementType.Flying],
            baseStats: {
                hp: 78,
                attack: 84,
                defense: 78,
                spAttack: 109,
                spDefense: 85,
                speed: 100
            },
        },
        {
            name: 'Blastoise',
            elementalTypes: [ElementType.Water],
            baseStats: {
                hp: 79,
                attack: 83,
                defense: 100,
                //spAttack: 85,
                spAttack: 400,
                spDefense: 105,
                speed: 78
            },
        },
        {
            name: 'Venusaur',
            elementalTypes: [ElementType.Grass, ElementType.Poison],
            baseStats: {
                hp: 80,
                attack: 82,
                defense: 83,
                spAttack: 100,
                spDefense: 100,
                speed: 80
            },
        },
        {
            name: "Raichu",
            elementalTypes: [ElementType.Electric],
            baseStats: {
                hp: 60,
                attack: 90,
                defense: 55,
                spAttack: 90,
                spDefense: 80,
                speed: 100
            },
        },
        {
            name: "Alakazam",
            elementalTypes: [ElementType.Psychic],
            baseStats: {
                hp: 55,
                attack: 50,
                defense: 45,
                spAttack: 135,
                spDefense: 85,
                speed: 120
            },
        },
        {
            name: "Gengar",
            elementalTypes: [ElementType.Ghost, ElementType.Poison],
            baseStats: {
                hp: 60,
                attack: 65,
                defense: 60,
                spAttack: 130,
                spDefense: 75,
                speed: 110
            },
        },
        {
            name: "Meganium",
            elementalTypes: [ElementType.Grass],
            baseStats: {
                hp: 80,
                attack: 82,
                defense: 100,
                spAttack: 83,
                spDefense: 100,
                speed: 100
            },
        },
        {
            name: "Typhlosion",
            elementalTypes: [ElementType.Fire],
            baseStats: {
                hp: 74,
                attack: 84,
                defense: 78,
                spAttack: 109,
                spDefense: 85,
                speed: 100
            },
        },
        {
            name: "Feraligatr",
            elementalTypes: [ElementType.Water],
            baseStats: {
                hp: 85,
                attack: 105,
                defense: 100,
                spAttack: 79,
                spDefense: 83,
                speed: 78
            },
        },
        {
            name: "Ampharos",
            elementalTypes: [ElementType.Electric],
            baseStats: {
                hp: 90,
                attack: 75,
                defense: 85,
                spAttack: 115,
                spDefense: 90,
                speed: 55
            },
        },
        {
            name: "Skarmory",
            elementalTypes: [ElementType.Steel],
            baseStats: {
                hp: 65,
                attack: 80,
                defense: 140,
                spAttack: 40,
                spDefense: 70,
                speed: 70
            },
        },
        {
            name: "Blissey",
            elementalTypes: [ElementType.Normal],
            baseStats: {
                hp: 255,
                attack: 10,
                defense: 10,
                spAttack: 75,
                spDefense: 125,
                speed: 55,
            }
            ,
        },
        {
            name: "Sharpedo",
            elementalTypes: [ElementType.Water, ElementType.Dark],
            baseStats: {
                hp: 70,
                attack: 120,
                defense: 40,
                spAttack: 95,
                spDefense: 40,
                speed: 95
            }
        },
        {
            name:"Starmie",
            elementalTypes:[ElementType.Water,ElementType.Psychic],
            baseStats:{
                hp:60,
                attack:75,
                defense:85,
                spAttack:100,
                spDefense:85,
                speed:115
            }
        },
        {
            name:"Dunsparce",
            elementalTypes:[ElementType.Normal],
            baseStats:{
                hp:100,
                attack:70,
                defense:70,
                spAttack:65,
                spDefense:65,
                speed:45
            }
        }
    ];




    const pokemon = pokemons.find(poke => poke.name.toLowerCase() === name.toLowerCase());

    if (pokemon === undefined) {
        throw new Error(`Could not find species for ${name} in call to GetSpecies()`);
    }

    return pokemon;

}
