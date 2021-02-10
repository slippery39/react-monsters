import { Turn } from './Turn';
import { Player, PlayerBuilder } from './Player/PlayerBuilder';
import 'core-js'
import { PokemonBuilder } from './Pokemon/Pokemon';
import { GetTech } from './Techniques/PremadeTechniques';



describe('Roost heals the proper pokemon', () => {


    const player1: Player = new PlayerBuilder(1)
    .WithPokemon("blastoise")
    .WithPokemon("venusaur")
    .Build();

    const player2: Player = new PlayerBuilder(2)
    .WithPokemon("blastoise")
    .WithPokemon("venusaur")
    .Build();


    const initialState = {
        players:[player1,player2]
    }

    const turn = new Turn (1,initialState);

    const pokemon = 
        PokemonBuilder()
        .OfSpecies("Charizard")
        .WithBaseStats({ hp: 200, attack: 1, spAttack: 1, defense: 1, spDefense: 1, speed: 1 })
        .WithTechniques(["roost", "fire blast"])
        .Build();
    pokemon.currentStats.hp = 100;
    const technique = GetTech("roost");

    const pokemon2 = 
    PokemonBuilder()
    .OfSpecies("Charizard")
    .WithBaseStats({ hp: 200, attack: 1, spAttack: 1, defense: 1, spDefense: 1, speed: 1 })
    .WithTechniques(["roost", "fire blast"])
    .Build();

    turn.UseTechnique(pokemon,pokemon2,technique);
    expect(pokemon.currentStats.hp).toBeGreaterThan(100);
   
});





