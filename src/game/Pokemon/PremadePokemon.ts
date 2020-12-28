import { IPokemon, PokemonBuilder } from "./Pokemon";


const Charizard = function () {
    const builder = new PokemonBuilder();
    return builder
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
            "Substitute"
        ])
        .WithHeldItem("Life Orb")
        .Build();
}

const Blastoise = function(){
    const builder = new PokemonBuilder();
    return  builder
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
        .Build();
}

const Venusaur = function(){
    const builder = new PokemonBuilder();
    return builder
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
        .Build();
};


const Raichu = function(){
    const builder = new PokemonBuilder();
    return builder
    .OfSpecies("Raichu")
    .WithEVs({
        spDefense: 4,
        spAttack:252,
        speed: 252
    })
    .WithTechniques([
        "Thunderbolt",
        "Surf",
        "Nasty Plot",
        "Focus Blast"
    ])
    .WithHeldItem("Leftovers")
    .Build();
}

const Alakazam = function(){
    const builder = new PokemonBuilder();
    return builder
    .OfSpecies("Alakazam")
    .WithEVs({
        hp: 4,
        spAttack:252,
        speed: 252
    })
    .WithTechniques([
        "Calm Mind",
        "Psychic",
        "Focus Blast",
        "Shadow Ball"
    ])
    .WithHeldItem("Life Orb")
    .Build();
}


const Gengar = function(){
    const builder = new PokemonBuilder();
    return builder
    .OfSpecies("Gengar")
    .WithEVs({
        spAttack:252,
        spDefense:4,
        speed:252
    })
    .WithTechniques([
        "Substitute",
        "Shadow Ball",
        "Sludge Wave",
        "Focus Blast"
    ])
    .WithHeldItem("Life Orb")
    .Build()
}

const Meganium = function(){
    const builder = new PokemonBuilder();
    return builder
    .OfSpecies("Meganium")
    .WithEVs({
        hp:252,
        defense:4,
        spDefense:252
    })
    .WithTechniques([
        "Aromatherapy",
        "Synthesis",
        "Giga Drain",
        "Toxic"
    ])
    .WithHeldItem("Leftovers")
    .Build();
}


const Typhlosion = function(){
    
    const builder = new PokemonBuilder();
    return builder
    .OfSpecies("Typhlosion")
    .WithEVs({
        speed:252,
        defense:4,
        spAttack:252
    })
    .WithTechniques([
        "Eruption",
        "Hidden Power (Grass)",
        "Focus Blast",
        "Fire Blast"
    ])
    .WithHeldItem("Leftovers")
    .Build();
    
}

const Feraligatr = function(){
    const builder = new PokemonBuilder();
    return builder
    .OfSpecies("Feraligatr")
    .WithEVs({
        attack:252,
        speed:252,
        spDefense:4
    })
    .WithTechniques([
        "Dragon Dance",
        "Waterfall",
        "Crunch",
        "Ice Punch"
    ])
    .WithHeldItem("Life Orb")
    .Build();
}

const Ampharos = function(){
    const builder = new PokemonBuilder();
    return builder.OfSpecies("Ampharos")
    .WithEVs({
        hp:248,
        spAttack:252,
        spDefense:8
    })
    .WithTechniques([
        "Heal Bell",
        "Volt Switch",
        "Thunderbolt",
        "Focus Blast"

    ])
    .WithHeldItem("Leftovers")
    .Build();
}



const GetPokemon = function(name:string):IPokemon{

    var pokemons : Array<IPokemon> = [
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
    ]


    const returnPokemon = pokemons.find(poke=>{
        return poke.name.toLowerCase() === name.toLowerCase()
    })

    if (returnPokemon === undefined){
        throw new Error(`Could not find pokemon with name ${name} in the list of premade pokemon`);
    }
    
    return returnPokemon;

}

export default GetPokemon;