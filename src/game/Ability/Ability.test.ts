import 'core-js'
import { EffectType, TargetType } from 'game/Effects/Effects';
import { ElementType } from 'game/ElementType';
import { PokemonBuilder } from 'game/Pokemon/Pokemon';
import { Stat } from 'game/Stat';
import { GetTech } from 'game/Techniques/PremadeTechniques';
import { DamageType, Technique } from 'game/Techniques/Technique';
import { CreateMockTurn } from 'game/Testing/TestingFunctions';
import { VolatileStatusType } from 'game/VolatileStatus/VolatileStatus';
import { isExportDeclaration } from 'typescript';
import GetAbility from './Ability';

describe('Serene Grace Ability Tests',()=>{
    it('it properly doubles effect chances of damaging moves',()=>{

        const testTechnique:Technique = {
            id:1,
            currentPP:15,
            pp:15,
            accuracy:100,
            name:"TestTech",
            power:100,
            description:"",
            damageType:DamageType.Physical,
            elementalType:ElementType.Normal,
            effects:[
                {
                    type:EffectType.StatBoost,
                    chance:30,
                    stat:Stat.Attack,
                    target:TargetType.Self,
                    amount:1
                },
                {
                    type:EffectType.InflictVolatileStatus,
                    chance:50,
                    status:VolatileStatusType.Confusion,
                    target:TargetType.Enemy
                }
            ]
        }

        const sereneGraceAbility = GetAbility("Serene Grace");

        const testPokemon = PokemonBuilder().UseGenericPokemon().OfElementalTypes([ElementType.Normal]).Build();

        const modifiedTech = sereneGraceAbility.ModifyTechnique(testPokemon,testTechnique);

        expect(modifiedTech.effects![0].chance).toBe(60);
        expect(modifiedTech.effects![1].chance).toBe(100);
    


    });
});

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

    const damage = blazeAbility.OnAfterDamageCalculated(pokemon,GetTech("Fire Blast"),pokemon,100,{},CreateMockTurn());

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

    const damage = blazeAbility.OnAfterDamageCalculated(pokemon,GetTech("Fire Blast"),pokemon,100,{},CreateMockTurn());

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

    const damage = blazeAbility.OnAfterDamageCalculated(pokemon,GetTech("Earthquake"),pokemon,100,{},CreateMockTurn());

    //damage should still be 100

    expect (damage).toBe(100);
    });

    



});


