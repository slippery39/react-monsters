import { ElementType } from 'game/ElementType';
import { Stats } from './Pokemon';

interface ISpecies {
    name: string,
    baseStats: Stats,
    elementalTypes: Array<ElementType>,
    weight:number
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
            },
            weight:3507
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
            weight:90.5
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
            weight:85.5
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
            weight:100
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
            weight:30
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
            weight:48
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
            weight:40.5
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
            weight:100.5
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
            weight:175.3
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
            weight:88.8
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
            weight:61.5
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
            weight:50.5
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
            },
            weight:46.8
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
            },
            weight:88.8
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
            },
            weight:80
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
            },
            weight:14
        },
        {
            name:"Sceptile",
            elementalTypes:[ElementType.Grass],
            baseStats:{
                hp:70,
                attack:85,
                defense:65,
                spAttack:105,
                spDefense:85,
                speed:120
            },
            weight:52.2
        },
        {
            name:"Blaziken",
            elementalTypes:[ElementType.Fire,ElementType.Fighting],
            baseStats:{
                hp:80,
                attack:120,
                defense:70,
                spAttack:110,
                spDefense:70,
                speed:80
            },
            weight:52
        },
        {
            name:"Swampert",
            elementalTypes:[ElementType.Water,ElementType.Ground],
            baseStats:{
                hp:100,
                attack:110,
                defense:90,
                spAttack:85,
                spDefense:90,
                speed:60
            },
            weight:81.9
        },
        {
            name:"Flygon",
            elementalTypes:[ElementType.Ground,ElementType.Dragon],
            baseStats:{
               hp:80,
               attack:100,
               defense:90,
               spAttack:85,
               spDefense:90,
               speed:100
            },
            weight:82.0
        },
        {
            name:"Milotic",
            elementalTypes:[ElementType.Water],
            baseStats:{
                hp:95,
                attack:60,
                defense:79,
                spAttack:100,
                spDefense:125,
                speed:81
            },
            weight:162.0
        },
        {
            name:"Salamence",
            elementalTypes:[ElementType.Dragon,ElementType.Flying],
            baseStats:{
                hp:95,
                attack:135,
                defense:80,
                spAttack:110,
                spDefense:80,
                speed:100
            },
            weight:102.6
        },
        {
            name:"Vileplume",
            elementalTypes:[ElementType.Grass,ElementType.Poison],
            baseStats:{
                hp:75,
                attack:80,
                defense:85,
                spAttack:110,
                spDefense:90,
                speed:50
            },
            weight:18.6
        },
        {
            name:"Jolteon",
            elementalTypes:[ElementType.Electric],
            baseStats:{
                hp:65,
                attack:65,
                defense:60,
                spAttack:110,
                spDefense:95,
                speed:130
            },
            weight:24.5
        },
        {
            name:"Dragonite",
            elementalTypes:[ElementType.Dragon,ElementType.Flying],
            baseStats:{
                hp:91,
                attack:134,
                defense:95,
                spAttack:100,
                spDefense:100,
                speed:80
            },
            weight:210
        },
        {
            name:"Gyarados",
            elementalTypes:[ElementType.Water,ElementType.Flying],
            baseStats:{
                hp:95,
                attack:125,
                defense:79,
                spAttack:60,
                spDefense:100,
                speed:81
            },
            weight:235
        },
        {
            name:"Arcanine",
            elementalTypes:[ElementType.Fire],
            baseStats:{
                hp:90,
                attack:110,
                defense:80,
                spAttack:100,
                spDefense:80,
                speed:95,
            },
            weight:155
        }
    ];




    const pokemon = pokemons.find(poke => poke.name.toLowerCase() === name.toLowerCase());

    if (pokemon === undefined) {
        throw new Error(`Could not find species for ${name} in call to GetSpecies()`);
    }

    return pokemon;

}
