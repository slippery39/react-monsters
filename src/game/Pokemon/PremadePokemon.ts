import { NatureType } from "game/Natures/Natures";
import { Pokemon, PokemonBuilder } from "./Pokemon";

const Charizard = function () {
    return PokemonBuilder()
        .OfSpecies("Charizard")
        .WithEVs({
            defense: 4,
            spAttack: 252,
            speed: 252
        })
        .WithTechniques([
            "Fire Blast",
            "Air Slash",
            "Focus Blast",
            "Earthquake"
        ])
        .WithNature(NatureType.Timid)
        .WithHeldItem("Leftovers") //.WithHeldItem("Life Orb")
        .WithAbility("Blaze")
        .Build();
}

const Blastoise = function () {
    return PokemonBuilder()
        .OfSpecies("Blastoise")
        .WithEVs({
            hp: 252,
            defense: 252,
            spAttack: 4,
        })
        .WithTechniques([
            "Surf",
            "Ice Beam",
            "Rest",
            "Toxic"
        ])
        .WithNature(NatureType.Bold)
        .WithHeldItem("Leftovers")
        .WithAbility("Torrent")
        .Build();
}

const Venusaur = function () {
    return PokemonBuilder()
        .OfSpecies("Venusaur")
        .WithEVs({
            hp: 4,
            attack: 252,
            speed: 252
        })
        .WithTechniques([
            "Swords Dance",
            "Power Whip",
            "Earthquake",
            "Sleep Powder"
        ])
        .WithHeldItem("Life Orb")
        .WithAbility("Overgrow")
        .Build();
};


const Raichu = function () {
    return PokemonBuilder()
        .OfSpecies("Raichu")
        .WithEVs({
            spDefense: 4,
            spAttack: 252,
            speed: 252
        })
        .WithTechniques([
            "Thunderbolt",
            "Surf",
            "Nasty Plot",
            "Focus Blast"
        ])
        .WithNature(NatureType.Timid)
        .WithHeldItem("Leftovers")
        .WithAbility("Lightning Rod")
        .Build();
}

const Alakazam = function () {
    return PokemonBuilder()
        .OfSpecies("Alakazam")
        .WithEVs({
            hp: 4,
            spAttack: 252,
            speed: 252
        })
        .WithTechniques([
            "Calm Mind",
            "Psychic",
            "Focus Blast",
            "Shadow Ball"
        ])
        .WithNature(NatureType.Timid)
        .WithHeldItem("Life Orb")
        .WithAbility("Magic Guard")
        .Build();
}


const Gengar = function () {
    return PokemonBuilder()
        .OfSpecies("Gengar")
        .WithEVs({
            spAttack: 252,
            spDefense: 4,
            speed: 252
        })
        .WithTechniques([
            "Substitute",
            "Shadow Ball",
            "Sludge Wave",
            "Focus Blast"
        ])
        .WithNature(NatureType.Timid)
        .WithHeldItem("Life Orb")
        .WithAbility("Levitate")
        .Build()
}

const Meganium = function () {
    return PokemonBuilder()
        .OfSpecies("Meganium")
        .WithEVs({
            hp: 252,
            defense: 4,
            spDefense: 252
        })
        .WithTechniques([
            "Aromatherapy",
            "Synthesis",
            "Giga Drain",
            "Toxic"
        ])
        .WithNature(NatureType.Calm)
        .WithHeldItem("Leftovers")
        .WithAbility("Overgrow")
        .Build();
}


const Typhlosion = function () {

    return PokemonBuilder()
        .OfSpecies("Typhlosion")
        .WithEVs({
            speed: 252,
            defense: 4,
            spAttack: 252
        })
        .WithTechniques([
            "Eruption",
            "Hidden Power (Grass)",
            "Focus Blast",
            "Fire Blast"
        ])
        .WithNature(NatureType.Timid)
        .WithHeldItem("Leftovers")
        .WithAbility("Flash Fire")
        .Build();

}

const Feraligatr = function () {
    return PokemonBuilder()
        .OfSpecies("Feraligatr")
        .WithEVs({
            attack: 252,
            speed: 252,
            spDefense: 4
        })
        .WithTechniques([
            "Dragon Dance",
            "Waterfall",
            "Crunch",
            "Ice Punch"
        ])
        .WithNature(NatureType.Jolly)
        .WithHeldItem("Life Orb")
        .WithAbility("Sheer Force")
        .Build();
}

const Ampharos = function () {
    return PokemonBuilder()
        .OfSpecies("Ampharos")
        .WithEVs({
            hp: 248,
            spAttack: 252,
            spDefense: 8
        })
        .WithTechniques([
            "Heal Bell",
            "Volt Switch",
            "Thunderbolt",
            "Focus Blast"

        ])
        .WithNature(NatureType.Calm)
        .WithHeldItem("Leftovers")
        .WithAbility("Static")
        .Build();
}

const Skarmory = function () {
    return PokemonBuilder()
        .OfSpecies("Skarmory")
        .WithEVs({
            hp: 252,
            defense: 252,
            speed: 4,
        })
        .WithTechniques([
            "Iron Head",
            "Spikes",
            "Roost",
            "Whirlwind"
        ])
        .WithNature(NatureType.Impish)
        .WithHeldItem("Leftovers")
        .WithAbility("Sturdy")
        .Build();
}

const Blissey = function(){
    return PokemonBuilder()
    .OfSpecies("Blissey")
    .WithEVs({
        hp:252,
        defense:252,
        spDefense:4
    })
    .WithNature(NatureType.Calm)
    .WithHeldItem("Leftovers")
    .WithTechniques([
        "Toxic",
        "Soft Boiled",
        "Seismic Toss",
        "Protect"
    ])
    .Build()
}

const Sharpedo = function(){
    return PokemonBuilder()
    .OfSpecies("Sharpedo")
    .WithAbility("Speed Boost")
    .WithEVs({
        attack:252,
        spDefense:4,
        speed:252    
    })
    .WithNature(NatureType.Adamant)
    .WithHeldItem("Life Orb")
    .WithTechniques([
        "Protect",
        "Waterfall",
        "Crunch",
        "Earthquake"
    ])
    .Build();
}


const Starmie = function(){
    return PokemonBuilder()
    .OfSpecies("Starmie")
    .WithAbility("Analytic")
    .WithEVs({
        spAttack:252,
        speed:252,
        spDefense:252
    })
    .WithNature(NatureType.Timid)
    .WithHeldItem("Life Orb")
    .WithTechniques([
        "Hydro Pump",
        "Thunderbolt",
        "Ice Beam",
        "Rapid Spin"
    ])
    .Build()
}


const Dunsparce = function(){
    return PokemonBuilder()
    .OfSpecies("Dunsparce")
    .WithAbility("Serene Grace")
    .WithEVs({
        hp:252,
        defense:4,
        spDefense:252
    })
    .WithNature(NatureType.Careful)
    .WithHeldItem("Leftovers")
    .WithTechniques([
        "Glare",
        "Coil",
        "Headbutt",
        "Roost"
    ])
    .Build()
}


const Sceptile = function(){
    return PokemonBuilder()
    .OfSpecies("Sceptile")
    .WithAbility("Overgrow")
    .WithNature(NatureType.Timid)
    .WithHeldItem("Life Orb")
    .WithEVs({
        //EVs : 4 hp /252 SpA / 252 Speed
        hp:4,
        spAttack:252,
        speed:252
    })
    .WithTechniques([
        "Substitute",
        "Giga Drain",
        "Focus Blast",
        "Hidden Power Rock"
    ])
    .Build();
}

const Blaziken = function(){
    return PokemonBuilder()
    .OfSpecies("Blaziken")
    .WithAbility("Speed Boost")
    .WithNature(NatureType.Jolly)
    .WithHeldItem("Leftovers")
    .WithEVs({
        //EVs : 4 hp / 252 attack / 252 speed
        hp:4,
        attack:252,
        speed:252
    })
    .WithTechniques([
        "Swords Dance",
        "Low Kick",
        "Protect",
        "Flare Blitz"
    ])
    .Build()
}

const Swampert = function(){
    return PokemonBuilder()
    .OfSpecies("Swampert")
    .WithAbility("Torrent")
    .WithNature(NatureType.Relaxed)
    .WithTechniques([
        "Stealth Rock",
        "Scald",
        "Earthquake",
        "Toxic"
    ])
    .WithHeldItem("Leftovers")
    .WithEVs({
        hp:240,
        attack:16,
        defense:252
    })
    .Build();
}

const Flygon = function(){
    return PokemonBuilder()
    .OfSpecies("Flygon")
    .WithAbility("Levitate")
    .WithHeldItem("Life Orb")
    .WithNature(NatureType.Jolly)
    .WithTechniques([
        "Earthquake",
        "Dragon Claw",
        "Roost",
        "Fire Punch"
    ])
    .WithEVs({
        attack:252,
        spDefense:4,
        speed:252
    })
    .Build();
}

const Milotic = function(){
    return PokemonBuilder()
    .OfSpecies("Milotic")
    .WithAbility("Marvel Scale")
    .WithHeldItem("Leftovers")
    .WithNature(NatureType.Bold)
    .WithTechniques([
        "Scald",
        //"Recover",
        "Ice Beam",
        //"Haze"
    ])
    .WithEVs({
        hp:248,
        defense:252,
        speed:8
    })
    .Build();
}





const GetPokemon = function (name: string): Pokemon {

    var pokemons: Array<Pokemon> = [
        Charizard(),
        Blastoise(),
        Venusaur(),
        Raichu(),
        Alakazam(),
        Gengar(),
        Meganium(),
        Typhlosion(),
        Feraligatr(),
        Ampharos(),
        Skarmory(),
        Blissey(),
        Sharpedo(),
        Starmie(),
        Dunsparce(),
        Sceptile(),
        Blaziken(),
        Swampert(),
        Flygon(),
        Milotic(),
    ]


    const returnPokemon = pokemons.find(poke => {
        return poke.name.toLowerCase() === name.toLowerCase()
    })

    if (returnPokemon === undefined) {
        throw new Error(`Could not find pokemon with name ${name} in the list of premade pokemon`);
    }

    return returnPokemon;

}

export default GetPokemon;