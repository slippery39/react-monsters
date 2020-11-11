import { IPokemon, PokemonBuilder } from "./Pokemon";


const Charizard = function () {
    const builder = new PokemonBuilder();
    return builder
        .OfSpecies("Charizard")
        .WithEVs({
            health: 0,
            attack: 0,
            defence: 4,
            specialDefence: 0,
            specialAttack: 252,
            speed: 252
        })
        .WithIVs({
            health: 31,
            attack: 31,
            defence: 31,
            specialDefence: 31,
            specialAttack: 31,
            speed: 31
        })
        .WithTechniques([
            "Fire Blast",
            "Air Slash",
            "Focus Blast",
            "Roost"
        ])
        .Build();
}

const Blastoise = function(){
    const builder = new PokemonBuilder();
    return  builder
        .OfSpecies("Blastoise")
        .WithEVs({
            health: 252,
            attack: 0,
            defence: 252,
            specialDefence: 0,
            specialAttack: 4,
            speed: 0
        })
        .WithIVs({
            health: 31,
            attack: 31,
            defence: 31,
            specialDefence: 31,
            specialAttack: 31,
            speed: 31
        })
        .WithTechniques([
            "Surf",
            "Ice Beam",
            "Rest",
            "Toxic"
        ])
        .Build();
}

const Venusaur = function(){
    const builder = new PokemonBuilder();
    return builder
        .OfSpecies("Venusaur")
        .WithEVs({
            health: 4,
            attack: 252,
            defence: 0,
            specialDefence: 0,
            specialAttack:0,
            speed: 252
        })
        .WithIVs({
            health: 31,
            attack: 31,
            defence: 31,
            specialDefence: 31,
            specialAttack: 31,
            speed: 31
        })
        .WithTechniques([
            "Swords Dance",
            "Power Whip",
            "Earthquake",
            "Sleep Powder"
        ])
        .Build();
};


const GetPokemon = function(name:string):IPokemon{

    var pokemons : Array<IPokemon> = [
        Charizard(),
        Blastoise(),
        Venusaur()        
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