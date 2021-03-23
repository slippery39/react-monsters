import { NatureType } from "game/Natures/Natures";
import _ from "lodash";
import { PartialStats, Pokemon, PokemonBuilder } from "./Pokemon";

interface PremadePokemon {
    species: string,
    evs: PartialStats,
    techniques: Array<string>,
    nature: NatureType,
    ability: string,
    heldItem: string
}

const premades: Array<PremadePokemon> = [

    {

        species: "Charizard",
        evs: {
            defense: 4,
            spAttack: 252,
            speed: 252
        },
        techniques: [
            "Fire Blast",
            "Air Slash",
            "Hidden Power Grass",
            "Earthquake",
        ],
        nature: NatureType.Timid,
        heldItem: "Life Orb", 
        ability: "Blaze",

    },

    {

        species: "Blastoise",
        evs: {
            hp: 252,
            defense: 252,
            spAttack: 4,
        },
        techniques: [
            "Surf",
            "Ice Beam",
            "Protect",
            "Toxic"
        ],
        nature: NatureType.Bold,
        heldItem: "Leftovers",
        ability: "Torrent"

    },

    {
        species: "Venusaur",
        evs: {
            hp: 4,
            spAttack:252,
            speed: 252
        },
        techniques: [
            "Giga Drain",
            "Sludge Bomb",
            "Synthesis",
            "Knock Off"
        ],
        heldItem: "Black Sludge",
        ability: "Overgrow",
        nature: NatureType.Timid
    },


    {

        species: "Raichu",
        evs: {
            spDefense: 4,
            spAttack: 252,
            speed: 252
        },
        techniques: [
            "Thunderbolt",
            "Hidden Power Ice",
            "Nasty Plot",
            "Focus Blast"
        ],
        nature: NatureType.Timid,
        heldItem: "Life Orb",
        ability: "Lightning Rod"

    },

    {

        species: "Alakazam",
        evs: {
            hp: 4,
            spAttack: 252,
            speed: 252
        },
        techniques: [
            "Calm Mind",
            "Psychic",
            "Focus Blast",
            "Shadow Ball"
        ],
        nature: NatureType.Timid,
        heldItem: "Life Orb",
        ability: "Magic Guard"
    },


    {

        species: "Gengar",
        evs: {
            spAttack: 252,
            spDefense: 4,
            speed: 252
        },
        techniques: [
            "Substitute",
            "Shadow Ball",
            "Sludge Wave",
            "Focus Blast"
        ],
        nature: NatureType.Timid,
        heldItem: "Life Orb",
        ability: "Levitate",
    },

    {

        species: "Meganium",
        evs: {
            hp: 252,
            defense: 4,
            spDefense: 252
        },
        techniques: [
            "Aromatherapy",
            "Synthesis",
            "Giga Drain",
            "Toxic"
        ],
        nature: NatureType.Calm,
        heldItem: "Leftovers",
        ability: "Overgrow"

    },


    {


        species: "Typhlosion",
        evs: {
            speed: 252,
            defense: 4,
            spAttack: 252
        },
        techniques: [
            "Eruption",
            "Hidden Power Grass",
            "Focus Blast",
            "Fire Blast"
        ],
        nature: NatureType.Timid,
        heldItem: "Choice Specs",
        ability: "Flash Fire"


    },

    {

        species: "Feraligatr",
        evs: {
            attack: 252,
            speed: 252,
            spDefense: 4
        },
        techniques: [
            "Dragon Dance",
            "Waterfall",
            "Crunch",
            "Ice Punch"
        ],
        nature: NatureType.Adamant,
        heldItem: "Life Orb",
        ability: "Sheer Force"

    },

    {

        species: "Ampharos",
        evs: {
            hp: 248,
            spAttack: 252,
            spDefense: 8
        },
        techniques: [
            "Heal Bell",
            "Volt Switch",
            "Hidden Power Ice",
            "Focus Blast"

        ],
        nature: NatureType.Modest,
        heldItem: "Leftovers",
        ability: "Static"

    },

    {

        species: "Skarmory",
        evs: {
            hp: 252,
            defense: 252,
            speed: 4,
        },
        techniques: [
            "Brave Bird",
            "Spikes",
            "Roost",
            "Whirlwind"
        ],
        nature: NatureType.Impish,
        heldItem: "Rocky Helmet",
        ability: "Sturdy"

    },

    {

        species: "Blissey",
        evs: {
            hp: 252,
            defense: 252,
            spDefense: 4
        },
        nature: NatureType.Calm,
        ability: "serene grace",
        heldItem: "Leftovers",
        techniques: [
            "Toxic",
            "Soft Boiled",
            "Seismic Toss",
            "Protect"
        ],
    },

    {

        species: "Sharpedo",
        ability: "Speed Boost",
        evs: {
            attack: 252,
            spDefense: 4,
            speed: 252
        },
        nature: NatureType.Adamant,
        heldItem: "Life Orb",
        techniques: [
            "Protect",
            "Waterfall",
            "Crunch",
            "Ice Beam"
        ],

    },


    {

        species: "Starmie",
        ability: "Analytic",
        evs: {
            spAttack: 252,
            speed: 252,
            spDefense: 252
        },
        nature: NatureType.Timid,
        heldItem: "Life Orb",
        techniques: [
            "Hydro Pump",
            "Thunderbolt",
            "Ice Beam",
            "Recover"
        ],
    },


    {

        species: "Dunsparce",
        ability: "Serene Grace",
        evs: {
            hp: 252,
            defense: 4,
            spDefense: 252
        },
        nature: NatureType.Careful,
        heldItem: "Leftovers",
        techniques: [
            "Glare",
            "Coil",
            "Headbutt",
            "Roost"
        ],
    },


    {

        species: "Sceptile",
        ability: "Overgrow",
        nature: NatureType.Timid,
        heldItem: "Life Orb",
        evs: {
            //EVs : 4 hp /252 SpA / 252 Speed
            hp: 4,
            spAttack: 252,
            speed: 252
        },
        techniques: [
            "Leaf Storm",
            "Focus Blast",
            "Giga Drain",
            "Hidden Power Rock"
        ],

    },

    {

        species: "Blaziken",
        ability: "Speed Boost",
        nature: NatureType.Adamant,
        heldItem: "Life Orb",
        evs: {
            //EVs : 4 hp / 252 attack / 252 speed
            hp: 4,
            attack: 252,
            speed: 252
        },
        techniques: [
            "Stone Edge",
            "Low Kick",
            "Swords Dance",
            "Flare Blitz"
        ],
    },

    {

        species: "Swampert",
        ability: "Torrent",
        nature: NatureType.Relaxed,
        techniques: [
            "Stealth Rock",
            "Scald",
            "Earthquake",
            "Toxic"
        ],
        heldItem: "Leftovers",
        evs: {
            hp: 240,
            attack: 16,
            defense: 252
        },

    },

    {

        species: "Flygon",
        ability: "Levitate",
        heldItem: "Choice Band",
        nature: NatureType.Jolly,
        techniques: [
            "Earthquake",
            "Dragon Claw",
            "Outrage",
            "U-turn"
        ],
        evs: {
            attack: 252,
            spDefense: 4,
            speed: 252
        },

    },

    {

        species: "Milotic",
        ability: "Marvel Scale",
        heldItem: "Leftovers",
        nature: NatureType.Bold,
        techniques: [
            "Scald",
            "Recover",
            "Ice Beam",
            "Haze"
        ],
        evs: {
            hp: 252,
            defense: 252,
            speed: 4
        },

    },


    {

        species: "Salamence",
        ability: "Intimidate",
        heldItem: "Lum Berry",
        nature: NatureType.Naive,
        techniques: [
            "Dragon Dance",
            "Outrage",
            "Earthquake",
            "Fire Blast"
        ],
        evs: {
            attack: 252,
            spAttack: 4,
            speed: 252
        },

    },

    {

        species: "Vileplume",
        ability: "Effect Spore",
        heldItem: "Black Sludge",
        nature: NatureType.Bold,
        techniques: [
            "Sleep Powder",
            "Giga Drain",
            "Sludge Bomb",
            "Moonlight"
        ],
        evs: {
            hp: 252,
            defense: 252,
            spDefense: 4
        },

    },

    {

        species: "Jolteon",
        ability: "Volt Absorb",
        heldItem: "Choice Specs",
        nature: NatureType.Timid,
        techniques: [
            "Thunderbolt",
            "Volt Switch",
            "Signal Beam",
            "Hidden Power Ice"
        ],
        evs: {
            defense: 4,
            spAttack: 252,
            speed: 252
        },

    },

    {

        species: "Dragonite",
        heldItem: "Lum Berry",
        nature: NatureType.Adamant,
        ability: "Multiscale",
        techniques: [
            "Dragon Dance",
            "Outrage",
            "Earthquake",
            "Extreme Speed"
        ],
        evs: {
            attack: 252,
            spDefense: 4,
            speed: 252
        },

    },
    {
        species: "Gyarados",
        heldItem: "Life Orb",
        nature: NatureType.Jolly,
        ability: "Intimidate",
        techniques: [
            "Earthquake",
            "Dragon Dance",
            "Waterfall",
            'Bounce'
        ],
        evs: {
            attack: 252,
            defense: 4,
            speed: 252
        }
    },
    {
        species: "Arcanine",
        heldItem: "Life Orb",
        ability: "Intimidate",
        nature: NatureType.Adamant,
        techniques: [
            "Flare Blitz",
            "Extreme Speed",
            "Wild Charge",
            "Close Combat"
        ],
        evs: {
           attack:252,
           defense:4,
           speed:252
        }
    },
    {
        species: "Weezing",
        heldItem: "Black Sludge",
        ability: "Levitate",
        nature: NatureType.Bold,
        techniques: [
            "Flamethrower",
            "Thunderbolt",
            "Pain Split",
            "Will-o-wisp"
        ],
        evs: {
            hp: 252,
            defense: 252,
            spDefense: 4
        }
    },
    {
        species: "Scizor",
        heldItem: "Choice Band",
        ability: "Technician",
        nature: NatureType.Adamant,
        techniques: [
            "U-turn",
            "Bullet Punch",
            "Superpower",
            "Pursuit"
        ],
        evs: {
            hp: 248,
            attack: 252,
            spDefense: 8
        }
    },
    {
        species: "Shuckle",
        heldItem: "Leftovers",
        ability: "Sturdy",
        nature: NatureType.Impish,
        techniques: [
            "Stealth Rock",
            "Toxic",
            "Sticky Web",
            "Knock Off"
        ],
        evs: {
            hp: 252,
            defense: 252,
            spDefense: 4
        }
    },
    {
        species: "Politoed",
        heldItem: "Choice Specs",
        ability: "Drizzle",
        nature: NatureType.Modest,
        techniques: [
            "Hydro Pump",
            "Ice Beam",
            "Psychic",
            "Hidden Power Grass"
        ],
        evs: {
            hp: 252,
            defense: 4,
            spAttack: 252
        }
    },
    {
        species: "Jumpluff",
        heldItem: "Flying Gem",
        ability: "Chlorophyll",
        nature: NatureType.Jolly,
        techniques: [
            "Swords Dance",
            "Acrobatics",
            "Seed Bomb",
            "Sleep Powder"
        ],
        evs: {
            attack: 252,
            spDefense: 4,
            speed: 252
        }
    },
    {
        species: "Metagross",
        heldItem: "Life Orb",
        ability: "Clear Body",
        nature: NatureType.Adamant,
        techniques: [
            "Stealth Rock",
            "Meteor Mash",
            "Zen Headbutt",
            "Earthquake"
        ],
        evs: {
            attack: 252,
            defense: 4,
            speed: 252
        }
    },
    {
        species: "Umbreon",
        heldItem: "Leftovers",
        ability: "Synchronize",
        nature: NatureType.Calm,
        techniques: [
            "Wish",
            "Foul Play",
            "Heal Bell",
            "Protect"
        ],
        evs: {
            hp: 252,
            defense: 4,
            spDefense: 252
        }
    },
    {
        species:"Zapdos",
        heldItem:"Leftovers",
        ability:"Pressure",
        nature:NatureType.Bold,
        techniques:[
            "Thunderbolt",
            "Heat Wave",
            "Hidden Power Ice",
            "Roost"
        ],
        evs:{
            hp:252,
            spAttack:68,
            speed:16,
            defense:172
        }
    },
    {
        species:"Nidoking",
        heldItem:"Life Orb",
        ability:"Sheer Force",
        nature:NatureType.Naive,
        techniques:[
            "Sludge Wave",
            "Earth Power",
            "Ice Beam",
            "Superpower"
        ],
        evs:{
            defense:4,
            spAttack:252,
            speed:252,
        }
    },
    {
        species:"Clefable",
        heldItem:"Leftovers",
        ability:"Magic Guard",
        nature:NatureType.Bold,
        techniques:[
            "Calm Mind",
            "Moonblast",
            "Thunder Wave",
            "Soft Boiled"
        ],
        evs:{
            hp:252,
            defense:252,
            spDefense:4
        }
    },
    {
        species:"Togekiss",
        heldItem:"Leftovers",
        ability:"Serene Grace",
        nature:NatureType.Timid,
        techniques:[
            "Nasty Plot",
            "Air Slash",
            "Thunder Wave",
            "Roost"
        ],
        evs:{
            hp:252,
            defense:80,
            speed:176
        }
    },
    {
        species:"Ninetales",
        heldItem:"Leftovers",
        ability:"Drought",
        nature:NatureType.Timid,
        techniques:[
            "Sunny Day",
            "Solar Beam",
            "Fire Blast",
            "Hidden Power Ice"
        ],
        evs:{
            spAttack:252,
            spDefense:4,
            speed:252
        }
    },
    {
        species:"Tyranitar",
        heldItem:"Assault Vest",
        ability:"Sand Stream",
        nature:NatureType.Careful,
        techniques:[
            "Rock Slide",
            "Crunch",
            "Pursuit",
            "Earthquake"
        ],
        evs:{
            hp:224,
            attack:32,
            speed:252
        }
    },
    {
        species:"Crobat",
        heldItem:"Black Sludge",
        ability:"Infiltrator",
        nature:NatureType.Jolly,
        techniques:[
            "Brave Bird",
            "U-turn",
            "Defog",
            "Roost"
        ],
        evs:{
            hp:248,
            defense:48,
            speed:212
        }
    }
]


export function GetAllPokemonInfo(){
   return premades;
}

function BuildPokemonFromPremadeInfo(pokemonInfo:PremadePokemon){
    return PokemonBuilder()
    .OfSpecies(pokemonInfo.species)
    .WithTechniques(pokemonInfo.techniques)
    .WithNature(pokemonInfo.nature)
    .WithEVs(pokemonInfo.evs)
    .WithAbility(pokemonInfo.ability)
    .WithHeldItem(pokemonInfo.heldItem)
    .Build();
}

export function GetRandomPokemon(): Pokemon {
    const pokemonInfo = _.shuffle(_.cloneDeep(premades))[0];
    return BuildPokemonFromPremadeInfo(pokemonInfo);
}

export function GetMultipleRandomPokemon(amount: number): Array<Pokemon> {

    let premadesCopy = _.shuffle(_.cloneDeep(premades));


    return premadesCopy.slice(0, amount).map(pokemonInfo => {
        return BuildPokemonFromPremadeInfo(pokemonInfo);
    })
}

const GetPokemon = function (name: string): Pokemon {

    const pokemonInfo = premades.find(poke => poke.species.toLowerCase() === name.toLowerCase());

    if (pokemonInfo === undefined) {
        throw new Error(`Could not find pokemon with name ${name} in the list of premade pokemon`);
    }

   return BuildPokemonFromPremadeInfo(pokemonInfo);

}

export default GetPokemon;