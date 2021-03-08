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
            "Focus Blast",
            "Earthquake",
        ],
        nature: NatureType.Timid,
        heldItem: "Leftovers", //heldItem:"Life Orb"
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
            "Rest",
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
            attack: 252,
            speed: 252
        },
        techniques: [
            "Swords Dance",
            "Power Whip",
            "Earthquake",
            "Sleep Powder"
        ],
        heldItem: "Life Orb",
        ability: "Overgrow",
        nature: NatureType.Calm //TODO - update this.
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
            "Surf",
            "Nasty Plot",
            "Focus Blast"
        ],
        nature: NatureType.Timid,
        heldItem: "Leftovers",
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
        heldItem: "Leftovers",
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
        nature: NatureType.Jolly,
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
            "Thunderbolt",
            "Focus Blast"

        ],
        nature: NatureType.Calm,
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
            "Iron Head",
            "Spikes",
            "Roost",
            "Whirlwind"
        ],
        nature: NatureType.Impish,
        heldItem: "Leftovers",
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
            "Earthquake"
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
            "Rapid Spin"
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
            "Substitute",
            "Giga Drain",
            "Focus Blast",
            "Hidden Power Rock"
        ],

    },

    {

        species: "Blaziken",
        ability: "Speed Boost",
        nature: NatureType.Jolly,
        heldItem: "Leftovers",
        evs: {
            //EVs : 4 hp / 252 attack / 252 speed
            hp: 4,
            attack: 252,
            speed: 252
        },
        techniques: [
            "Swords Dance",
            "Low Kick",
            "Protect",
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
        heldItem: "Life Orb",
        nature: NatureType.Jolly,
        techniques: [
            "Earthquake",
            "Dragon Claw",
            "Roost",
            "Fire Punch"
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
            hp: 248,
            defense: 252,
            speed: 8
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
            "Aromatherapy",
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
        heldItem: "Life Orb",
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
        heldItem: "Leftovers",
        nature: NatureType.Adamant,
        ability: "Multiscale",
        techniques: [
            "Dragon Dance",
            "Outrage",
            "Fire Punch",
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
        heldItem: "Leftovers",
        nature: NatureType.Jolly,
        ability: "Intimidate",
        techniques: [
            "Substitute",
            "Dragon Dance",
            "Waterfall",
            'Bounce'
        ],
        evs: {
            hp: 88,
            attack: 248,
            defense: 4,
            speed: 168
        }
    },
    {
        species: "Arcanine",
        heldItem: "Life Orb",
        ability: "flash fire",
        nature: NatureType.Adamant,
        techniques: [
            "Flare Blitz",
            "Extreme Speed",
            "Wild Charge",
            "Close Combat"
        ],
        evs: {
            hp: 72,
            attack: 252,
            spDefense: 8,
            speed: 176
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
            "Encore",
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
        heldItem: "Leftovers",
        ability: "Clear Body",
        nature: NatureType.Adamant,
        techniques: [
            "Stealth Rock",
            "Meteor Mash",
            "Pursuit",
            "Earthquake"
        ],
        evs: {
            hp: 252,
            attack: 96,
            spDefense: 160
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
        heldItem:"Life Orb",
        ability:"Pressure",
        nature:NatureType.Timid,
        techniques:[
            "Thunderbolt",
            "Heat Wave",
            "Hidden Power Grass",
            "Roost"
        ],
        evs:{
            hp:4,
            spAttack:252,
            speed:252
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