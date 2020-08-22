import React from 'react';
import { Pokemon,Stats, ElementType,Technique } from './interfaces';
import {GetBaseDamage,GetTypeMod,GetDamageModifier} from './DamageFunctions';

/*
Test these functions
function GetBaseDamage(attackingPokemon: Pokemon, defendingPokemon: Pokemon, techUsed: Technique)
function GetTypeMod(defendingPokemon:Pokemon,techUsed:Technique)
function GetDamageModifier(attackingPokemon: Pokemon, defendingPokemon: Pokemon, techUsed: Technique) 
*/

const createCharizard = function() : Pokemon{
    const charizardStats : Stats = {
        health:360,
        attack:293,
        defence:280,
        specialAttack:348,
        specialDefence:295,
        speed:328
    }
    const charizard : Pokemon  = {
        id:1,
        name:'Charizard',
        currentStats:{...charizardStats},
        originalStats:{...charizardStats},
        techniques:[

        ],
        elementalTypes:[ElementType.Fire,ElementType.Flying]
    }

    return charizard;
}

const createBlastoise = function(): Pokemon{
    const blastoiseStats = {
        health:362,
        attack:291,
        defence:328,
        specialAttack:295,
        specialDefence:339,
        speed:78
    }
    const blastoise : Pokemon  = {
        id:1,
        name:'Blastoise',
        currentStats:{...blastoiseStats},
        originalStats:{...blastoiseStats},
        techniques:[

        ],
        elementalTypes:[ElementType.Water]
    }
    return blastoise;
}

const createFireblast = function() : Technique{
    const fireblast:Technique = {
        id:1,
        name:'Fire blast',
        description:'A fiery blast',
        currentPP:10,
        pp:10,
        power:120,
        chance:100,
        damageType:'special',
        elementalType:ElementType.Fire
    }

    return fireblast;
}

const createEarthquake = function(): Technique{
    const earthquake:Technique = {
        id:1,
        name:'',
        description:'An earthy quake',
        currentPP:10,
        pp:10,
        power:120,
        chance:100,
        damageType:'physical',
        elementalType:ElementType.Ground
    }
    return earthquake
}


describe('GetBaseDamage tests', ()=>{
    //what do we need to test here

    const blastoiseStats = {
        health:362,
        attack:291,
        defence:328,
        specialAttack:295,
        specialDefence:339,
        speed:78
    }

    it('gets correct base damage',()=>{

        const attackingPokemon = createCharizard();
        const defendingPokemon = createBlastoise();
        const techUsed = createFireblast();
        //42 * [power]* [attack/defence]
        //a = 42 * 120 * 348/339 (1.026548672566372)
        //5,173.805309734515
        //b = (a/50) + 2
        //base damage should be 105.4761061946903
        //we should always round up?
        //should be 106
        const baseDamage = GetBaseDamage(attackingPokemon,defendingPokemon,techUsed);
        expect(baseDamage).toBe(106);
    });

    describe('GetTypeMod() tests', ()=>{

        //GetTypeMod(defendingElements:Array<ElementType>,elementOfAttack:ElementType);

        it('is super duper effective', ()=>{
            const superDuperEffective = GetTypeMod([ElementType.Grass,ElementType.Bug],ElementType.Fire);
            expect(superDuperEffective).toBe(4.0);
        });

        it('is super effective', ()=>{
            const superEffective = GetTypeMod([ElementType.Water],ElementType.Electric);
            expect(superEffective).toBe(2.0);
        });

        it('is normal effectiveness',()=>{
            const normalEffective = GetTypeMod([ElementType.Normal],ElementType.Normal);
            expect(normalEffective).toBe(1.0);
        });

        it ('is it not effective',()=>{
            const notEffective = GetTypeMod([ElementType.Ground],ElementType.Rock);
            expect(notEffective).toBe(0.5);
        });

        it('is really not effective',()=>{
            const reallyNotEffective = GetTypeMod([ElementType.Fire,ElementType.Rock],ElementType.Fire);
            expect(reallyNotEffective).toBe(0.25);
        });

    });

    describe('GetDamageModifier() Tests', ()=>{
        //scenarios to test
        //STAB
        //Critical
        //effectuveness?
        it ('modifies damage correctly without stab', ()=>{
            const damageModifier = GetDamageModifier(createCharizard(),createBlastoise(),createEarthquake(),{
                autoCrit:false,
                autoAmt:true
            });
            expect(damageModifier.stabBonus).toBe(1);
        });
        it('modifies damage correctly with not very effective + stab', ()=>{

            const damageModifier = GetDamageModifier(createCharizard(),createBlastoise(),createFireblast(),{
                autoCrit:false,
                autoAmt:true
            });

            expect(damageModifier.stabBonus*damageModifier.typeEffectivenessBonus).toBe(0.5*1.25);
        });

        it ('modifies damage correctly with stab and crit', ()=>{
            const damageModifier = GetDamageModifier(createCharizard(),createBlastoise(),createFireblast(),{
                autoCrit:true,
                autoAmt:true
            });
            expect(damageModifier.critAmt*damageModifier.stabBonus*damageModifier.typeEffectivenessBonus).toBe(2*1.25*0.5);
        });
        it('modifies damage correctly for crits', ()=>{
            const damageModifier = GetDamageModifier(createCharizard(),createBlastoise(),createEarthquake(),{
                autoCrit:true,
                autoAmt:true
            });
            expect(damageModifier.critAmt).toBe(2);
        });
    });

});


