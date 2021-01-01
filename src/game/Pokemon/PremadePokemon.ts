import { IPokemon, PokemonBuilder } from "./Pokemon";


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
        .WithAbility("Overgrowth")
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
        .WithHeldItem("Leftovers")
        .WithAbility("Overgrowth")
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
    .WithHeldItem("Leftovers")
    .WithTechniques([
        "Thunder Wave",
        "Soft Boiled",
        "Seismic Toss",
        "Stealth Rock"
    ])
    .Build()
}



const GetPokemon = function (name: string): IPokemon {

    var pokemons: Array<IPokemon> = [
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
        Blissey()
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