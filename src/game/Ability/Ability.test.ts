import 'core-js'
import { Player, PlayerBuilder } from 'game/Player/PlayerBuilder';
import { PokemonBuilder } from 'game/Pokemon/Pokemon';
import { GetTech } from 'game/Techniques/PremadeTechniques';
import { CreateMockTurn } from 'game/Testing/TestingFunctions';
import { Turn } from 'game/Turn';
import GetAbility from './Ability';



describe('Levitate Ability Tests',()=>{

    it('does not get hit by ground moves',()=>{
        const pokemon = new PokemonBuilder()
        .OfSpecies("gengar")
        .WithAbility("levitate")
        .Build();

        const turn = CreateMockTurn();

        const pokemon2 = new PokemonBuilder().
        OfSpecies("Charizard")
        .WithBaseStats({ health: 200, attack: 1, specialAttack: 1, defence: 1, specialDefence: 1, speed: 1 })
        .Build();

        const earthquake = GetTech("earthquake");
        const gengarHealth = pokemon.currentStats.health;
        turn.UseTechniqueForTesting(pokemon2,pokemon,earthquake);
        expect(pokemon.currentStats.health).toBe(gengarHealth);
    });

});


describe('Blaze Ability - (Damage Modifying Ability) Modifies Correctly',()=>{

    /*
        Create a Pokemon with the blaze ability.
    */

    it('correctly does not apply damage modifier for pokemon at >33% health', ()=>{
    const pokemon = new PokemonBuilder()
        .OfSpecies("charizard")
        .WithAbility("blaze")
        .Build();

    
    //get the ability
    const blazeAbility = GetAbility(pokemon.ability);

    pokemon.originalStats.health = 100;
    pokemon.currentStats.health = 34;

    const damage = blazeAbility.OnAfterDamageCalculated(pokemon,GetTech("Fire Blast"),pokemon,100,{});

    //damage should still be 100

    expect (damage).toBe(100);

    });
    

    it ('correctly applies damage modifier for pokemon at <=33% health',()=>{
        const pokemon = new PokemonBuilder()
        .OfSpecies("charizard")
        .WithAbility("blaze")
        .Build();

    
    //get the ability
    const blazeAbility = GetAbility(pokemon.ability);

    pokemon.originalStats.health = 100;
    pokemon.currentStats.health = 33;

    const damage = blazeAbility.OnAfterDamageCalculated(pokemon,GetTech("Fire Blast"),pokemon,100,{});

    //damage should now be 150;

    expect (damage).toBe(150);
    });

    it('correctly does not apply damage modifier at <=33% health when using a non fire move',()=>{
        const pokemon = new PokemonBuilder()
        .OfSpecies("charizard")
        .WithAbility("blaze")
        .Build();

    
    //get the ability
    const blazeAbility = GetAbility(pokemon.ability);

    pokemon.originalStats.health = 100;
    pokemon.currentStats.health = 33;

    const damage = blazeAbility.OnAfterDamageCalculated(pokemon,GetTech("Earthquake"),pokemon,100,{});

    //damage should still be 100

    expect (damage).toBe(100);
    });

    



});


