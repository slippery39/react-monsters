import 'core-js'
import { ApplyStatBoost, CalculateStatWithBoost, PokemonBuilder } from './Pokemon';
import { Stat } from 'game/Stat';


describe('Stats are correctly calculated from Base Stats',()=>{

    /*
    TODO: Figure out stat calculations from some website online

    http://www.psypokes.com/dex/stats.php
    */

    it('calculates real stats from base stats correctly with no ivs or evs',()=>{
        const pokemon = PokemonBuilder()
        .OfSpecies("charizard")
        .WithIVs({
            hp:0,
            attack:0,
            defense:0,
            spAttack:0,
            spDefense:0,
            speed:0
        })
        .WithEVs({
            hp:0,
            attack:0,
            defense:0,
            spAttack:0,
            spDefense:0,
            speed:0
        })
        .Build();

        expect(pokemon.currentStats.hp).toBe(266);
        expect(pokemon.currentStats.attack).toBe(173);
        expect(pokemon.currentStats.defense).toBe(161);
        expect(pokemon.currentStats.spAttack).toBe(223);
        expect(pokemon.currentStats.spDefense).toBe(175);
        expect(pokemon.currentStats.speed).toBe(205);
    });

    //todo: calculate real stats from base stats correctly with ivs and evs


});


describe('Stat boosts are correctly implemented', () => {
 
   it ('calculates stat correctly with no boost', ()=>{     
     //boost amuont shuld be 0 by default
     const pokemon = PokemonBuilder().OfSpecies("charizard").Build();
     pokemon.currentStats.attack = 100;
     const attackAmount1 = CalculateStatWithBoost(pokemon,Stat.Attack);
     expect(attackAmount1).toBe(100);
   });

   it ('calculates stat correctly with boost of 1', ()=>{
        const pokemon = PokemonBuilder().OfSpecies("charizard").Build();
        pokemon.currentStats.attack = 100;
         pokemon.statBoosts![Stat.Attack] = 1;
         const attackAmount1 = CalculateStatWithBoost(pokemon,Stat.Attack);
         expect(attackAmount1).toBe(133);
   });

   it ('calculates stat correctly with boost of 6', ()=>{
    const pokemon = PokemonBuilder().OfSpecies("charizard").Build();
    pokemon.currentStats.attack = 100;
    pokemon.statBoosts![Stat.Attack] = 6;
    const attackAmount1 = CalculateStatWithBoost(pokemon,Stat.Attack);
    expect(attackAmount1).toBe(300);
});

it ('calculates stat correctly with boost of -1', ()=>{
    const pokemon = PokemonBuilder().OfSpecies("charizard").Build();
    pokemon.currentStats.attack = 100;
    pokemon.statBoosts![Stat.Attack] = -1;
    const attackAmount1 = CalculateStatWithBoost(pokemon,Stat.Attack);
    expect(attackAmount1).toBe(75);
});

it ('calculates stat correctly with boost of -6', ()=>{
    const pokemon = PokemonBuilder().OfSpecies("charizard").Build();
    pokemon.currentStats.attack = 100;
    pokemon.statBoosts![Stat.Attack] = -6;
    const attackAmount1 = CalculateStatWithBoost(pokemon,Stat.Attack);
    expect(attackAmount1).toBe(33);
});


it('applies multiple stat boosts correctly', ()=>{

    const pokemon = PokemonBuilder().OfSpecies("charizard").Build();
    ApplyStatBoost(pokemon,Stat.Attack,2);
    
    expect(pokemon.statBoosts[Stat.Attack]).toBe(2);

    ApplyStatBoost(pokemon,Stat.Attack,2);
    expect(pokemon.statBoosts[Stat.Attack]).toBe(4);

    ApplyStatBoost(pokemon,Stat.Attack,2);
    expect(pokemon.statBoosts[Stat.Attack]).toBe(6);

    //should be clamped here.
    ApplyStatBoost(pokemon,Stat.Attack,2);
    expect(pokemon.statBoosts[Stat.Attack]).toBe(6);

});
    



});


