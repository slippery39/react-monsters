import 'core-js'
import { CalculateStatWithBoost, PokemonBuilder } from './Pokemon';
import { Stat } from 'game/Stat';


describe('Stat boosts are correctly implemented', () => {
 
   it ('calculates stat correctly with no boost', ()=>{     
     //boost amuont shuld be 0 by default
     const pokemon = new PokemonBuilder().OfSpecies("charizard").Build();
     pokemon.currentStats.attack = 100;
     const attackAmount1 = CalculateStatWithBoost(pokemon,Stat.Attack);
     expect(attackAmount1).toBe(100);
   });

   it ('calculates stat correctly with boost of 1', ()=>{
        const pokemon = new PokemonBuilder().OfSpecies("charizard").Build();
        pokemon.currentStats.attack = 100;
         pokemon.statBoosts![Stat.Attack] = 1;
         const attackAmount1 = CalculateStatWithBoost(pokemon,Stat.Attack);
         expect(attackAmount1).toBe(133);
   });

   it ('calculates stat correctly with boost of 6', ()=>{
    const pokemon = new PokemonBuilder().OfSpecies("charizard").Build();
    pokemon.currentStats.attack = 100;
    pokemon.statBoosts![Stat.Attack] = 6;
    const attackAmount1 = CalculateStatWithBoost(pokemon,Stat.Attack);
    expect(attackAmount1).toBe(300);
});

it ('calculates stat correctly with boost of -1', ()=>{
    const pokemon = new PokemonBuilder().OfSpecies("charizard").Build();
    pokemon.currentStats.attack = 100;
    pokemon.statBoosts![Stat.Attack] = -1;
    const attackAmount1 = CalculateStatWithBoost(pokemon,Stat.Attack);
    expect(attackAmount1).toBe(75);
});

it ('calculates stat correctly with boost of -6', ()=>{
    const pokemon = new PokemonBuilder().OfSpecies("charizard").Build();
    pokemon.currentStats.attack = 100;
    pokemon.statBoosts![Stat.Attack] = -6;
    const attackAmount1 = CalculateStatWithBoost(pokemon,Stat.Attack);
    expect(attackAmount1).toBe(33);
});

    



});


