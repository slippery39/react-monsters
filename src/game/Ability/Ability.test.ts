import 'core-js'
import { PokemonBuilder } from 'game/Pokemon/Pokemon';
import { GetTech } from 'game/Techniques/PremadeTechniques';
import { CreateMockTurn } from 'game/Testing/TestingFunctions';
import GetAbility from './Ability';



describe('Levitate Ability Tests',()=>{

    it('does not get hit by ground moves',()=>{
        const pokemon = PokemonBuilder()
        .OfSpecies("gengar")
        .WithAbility("levitate")
        .Build();

        const turn = CreateMockTurn();

        const pokemon2 = PokemonBuilder().
        OfSpecies("Charizard")
        .WithBaseStats({ hp: 200, attack: 1, spAttack: 1, defense: 1, spDefense: 1, speed: 1 })
        .Build();

        const earthquake = GetTech("earthquake");
        const gengarHealth = pokemon.currentStats.hp;
        turn.UseTechnique(pokemon2,pokemon,earthquake);
        expect(pokemon.currentStats.hp).toBe(gengarHealth);
    });

});


describe('Blaze Ability - (Damage Modifying Ability) Modifies Correctly',()=>{

    /*
        Create a Pokemon with the blaze ability.
    */

    it('correctly does not apply damage modifier for pokemon at >33% health', ()=>{
    const pokemon = PokemonBuilder()
        .OfSpecies("charizard")
        .WithAbility("blaze")
        .Build();

    
    //get the ability
    const blazeAbility = GetAbility(pokemon.ability);

    pokemon.originalStats.hp = 100;
    pokemon.currentStats.hp = 34;

    const damage = blazeAbility.OnAfterDamageCalculated(pokemon,GetTech("Fire Blast"),pokemon,100,{},undefined);

    //damage should still be 100

    expect (damage).toBe(100);

    });
    

    it ('correctly applies damage modifier for pokemon at <=33% health',()=>{
        const pokemon = PokemonBuilder()
        .OfSpecies("charizard")
        .WithAbility("blaze")
        .Build();

    
    //get the ability
    const blazeAbility = GetAbility(pokemon.ability);

    pokemon.originalStats.hp = 100;
    pokemon.currentStats.hp = 33;

    const damage = blazeAbility.OnAfterDamageCalculated(pokemon,GetTech("Fire Blast"),pokemon,100,{},undefined);

    //damage should now be 150;

    expect (damage).toBe(150);
    });

    it('correctly does not apply damage modifier at <=33% health when using a non fire move',()=>{
        const pokemon = PokemonBuilder()
        .OfSpecies("charizard")
        .WithAbility("blaze")
        .Build();

    
    //get the ability
    const blazeAbility = GetAbility(pokemon.ability);

    pokemon.originalStats.hp = 100;
    pokemon.currentStats.hp = 33;

    const damage = blazeAbility.OnAfterDamageCalculated(pokemon,GetTech("Earthquake"),pokemon,100,{});

    //damage should still be 100

    expect (damage).toBe(100);
    });

    



});


