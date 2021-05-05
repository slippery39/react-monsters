import 'core-js'
import BattleGame from 'game/BattleGame';
import { PlayerBuilder } from 'game/Player/PlayerBuilder';
import { PokemonBuilder } from 'game/Pokemon/Pokemon';
import { GetTech } from 'game/Techniques/PremadeTechniques';
import { Technique } from 'game/Techniques/Technique';
import { GetDamageEffect } from './DamageEffects';



describe('Low Kick Tests', ()=>{


    const weightRanges = [
        {lower:0.1,upper:9.9,power:20},
        {lower:10.0,upper:24.9,power:40},
        {lower:25.0,upper:49.9,power:60},
        {lower:50.0,upper:99.9,power:80},
        {lower:100,upper:199.9,power:100},
        {lower:200.0,upper:99999,power:120}        
    ]

    
    weightRanges.forEach((val,index)=>{
        it(`gets the right power for weight ${val.lower} amd ${val.upper}`,()=>{
            const lowKickEffect = GetDamageEffect('low-kick');

            const techUser = PokemonBuilder().UseGenericPokemon().Build();
            const defendingPokemon = PokemonBuilder().UseGenericPokemon().Build();

            const lowKick = GetTech("Low Kick");

              //needed for our damage effects now sadly.
        const game = new BattleGame([new PlayerBuilder().WithPokemon("Charizard").Build(),new PlayerBuilder().WithPokemon("Blastoise").Build()],true);

            //lower test
            defendingPokemon.weight = val.lower;
            const lowRangePower = lowKickEffect.ModifyTechnique(techUser,lowKick,defendingPokemon,game).power;
            expect(lowRangePower).toBe(val.power);

            //upper test
            defendingPokemon.weight = val.upper;
            const highRangePower = lowKickEffect.ModifyTechnique(techUser,lowKick,defendingPokemon,game).power;
            expect(highRangePower).toBe(val.power);

        });
    });
});

describe('Eruption Tests',()=>{
    //make a pokemon,
    //call a method or something called "TechniqueModification(turn,pokemon,move)"
    //test whether the techniques power has changed.


    it('modifies power correctly',()=>{
    const pokemon = PokemonBuilder()
    .OfSpecies("Charizard")
    .Build();

    pokemon.currentStats.hp = 150;
    pokemon.originalStats.hp = 150;


    const techinque = GetTech("eruption");
    const eruptionEffect = GetDamageEffect("eruption");

                    //needed for our damage effects now sadly.
                    const game = new BattleGame([new PlayerBuilder().WithPokemon("Charizard").Build(),new PlayerBuilder().WithPokemon("Blastoise").Build()],true);


    const newTechInfo : Technique  = eruptionEffect.ModifyTechnique(pokemon,techinque,pokemon,game);

    //100% health should be 150 power;
    expect(newTechInfo.power).toBe(150);

    //1 health should be 1 power
    pokemon.currentStats.hp = 1;
    const newTechInfo2 : Technique =  eruptionEffect.ModifyTechnique(pokemon,techinque,pokemon,game);
    expect(newTechInfo2.power).toBe(1);

    //50% health should be 75 power

    pokemon.currentStats.hp = 75;
    const newTechInfo3 : Technique =  eruptionEffect.ModifyTechnique(pokemon,techinque,pokemon,game);
    expect(newTechInfo3.power).toBe(75);     

    });





});