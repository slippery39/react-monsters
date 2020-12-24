import 'core-js'
import { PokemonBuilder } from 'game/Pokemon/Pokemon';
import { GetTech } from 'game/Techniques/PremadeTechniques';
import { Technique } from 'game/Techniques/Technique';
import { GetDamageEffect } from './DamageEffects';

describe('Eruption Tests',()=>{
    //make a pokemon,
    //call a method or something called "TechniqueModification(turn,pokemon,move)"
    //test whether the techniques power has changed.


    it('modifies power correctly',()=>{
    const pokemon = new PokemonBuilder()
    .OfSpecies("Charizard")
    .Build();

    pokemon.currentStats.hp = 150;
    pokemon.originalStats.hp = 150;


    const techinque = GetTech("eruption");
    const eruptionEffect = GetDamageEffect("eruption");
    const newTechInfo : Technique  = eruptionEffect.ModifyTechnique(pokemon,techinque);

    //100% health should be 150 power;
    expect(newTechInfo.power).toBe(150);

    //1 health should be 1 power
    pokemon.currentStats.hp = 1;
    const newTechInfo2 : Technique =  eruptionEffect.ModifyTechnique(pokemon,techinque);
    expect(newTechInfo2.power).toBe(1);

    //50% health should be 75 power

    pokemon.currentStats.hp = 75;
    const newTechInfo3 : Technique =  eruptionEffect.ModifyTechnique(pokemon,techinque);
    expect(newTechInfo3.power).toBe(75);     

    });





});