import {ElementType} from './ElementType';
import {GetBaseDamage,GetTypeMod,GetDamageModifier} from './DamageFunctions';
import {  Pokemon, PokemonBuilder } from './Pokemon/Pokemon';
import { DamageType, Technique } from './Techniques/Technique';
import { Stat } from './Stat';


/*
Test these functions
function GetBaseDamage(attackingPokemon: Pokemon, defendingPokemon: Pokemon, techUsed: Technique)
function GetTypeMod(defendingPokemon:Pokemon,techUsed:Technique)
function GetDamageModifier(attackingPokemon: Pokemon, defendingPokemon: Pokemon, techUsed: Technique) 
*/

const CreateFirePokemon = function() : Pokemon{
    return PokemonBuilder()
    .UseGenericPokemon()
    .OfElementalTypes([ElementType.Fire])
    .Build();
}

const CreateWaterPokemon = function(): Pokemon{
    return PokemonBuilder()
    .UseGenericPokemon()
    .OfElementalTypes([ElementType.Water])
    .Build();
}


const createFireblast = function() : Technique{
    const fireblast:Technique = {
        id:1,
        name:'Fire blast',
        description:'A fiery blast',
        currentPP:10,
        pp:10,
        power:120,
        accuracy:100,
        damageType:DamageType.Special,
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
        accuracy:100,
        damageType:DamageType.Physical,
        elementalType:ElementType.Ground
    }
    return earthquake
}


describe('crit attacks ignore stat boost stages in base damage calculations',()=>{
    it('ignores stat boost calculations for attack / defense',()=>{
        const attackingPokemon = PokemonBuilder()
        .UseGenericPokemon()
        .OfElementalTypes([ElementType.Normal])
        .WithTechniques([
            "Earthquake"
        ])
        .Build();

        const defendingPokemon = PokemonBuilder()
        .UseGenericPokemon()
        .OfElementalTypes([ElementType.Normal])
        .WithTechniques([
            "Earthquake"
        ])
        .Build();

        //set the attack and defence accordingly

        attackingPokemon.currentStats.attack = 100;
        attackingPokemon.statBoosts[Stat.Attack] = -3;

        defendingPokemon.currentStats.defense = 100;
        defendingPokemon.statBoosts[Stat.Defense] = +3;



        //With out crit ignoring the stat boosts.
        expect(GetBaseDamage(attackingPokemon,defendingPokemon,attackingPokemon.techniques[0],false)).toBe(23);
        //With crit ignoring the stat boosts.
        expect(GetBaseDamage(attackingPokemon,defendingPokemon,attackingPokemon.techniques[0],true)).toBe(86);
    });         
});


describe(`No effectiveness attacks don't crit`,()=>{
    it('does not crit when it is 0 effectiveness',()=>{
        //export function GetDamageModifier(attackingPokemon: Pokemon, defendingPokemon: Pokemon, techUsed: Technique,options?:{autoCrit?:boolean,autoAmt?:boolean}) 

        const attackingPokemon = PokemonBuilder()
                                .UseGenericPokemon()
                                .OfElementalTypes([ElementType.Normal])
                                .Build() //overrides the species.
    
        const defendingPokemon = PokemonBuilder()
                                .UseGenericPokemon()
                                .OfElementalTypes([ElementType.Ghost])
                                .Build();

        const technique :Technique = {
            name:"Generic Technique",
            elementalType:ElementType.Fighting,
            power:100,
            accuracy:100,
            id:1,
            description:"",
            pp:10,
            currentPP:10,
            damageType:DamageType.Physical
        }

        const damageResult = GetDamageModifier(attackingPokemon,defendingPokemon,technique,{autoCrit:true});

        //crit should not be modified since it should deal no damage;
        expect(damageResult.critStrike).toBe(false);
        expect(damageResult.critAmt).toBe(1);
        


    })
})

describe('GetBaseDamage tests', ()=>{
    //what do we need to test here
    
    it('gets correct base damage',()=>{

        const attackingPokemon = CreateFirePokemon();
        const defendingPokemon = CreateWaterPokemon();
        const techUsed = createFireblast();
        const baseDamage = GetBaseDamage(attackingPokemon,defendingPokemon,techUsed,false);

        expect(baseDamage).toBe(103);
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

        it ('is not effective at all', ()=>{
            const notEffectiveAtAll = GetTypeMod([ElementType.Fire,ElementType.Flying],ElementType.Ground);
            expect(notEffectiveAtAll).toBe(0);
        });

    });

    describe('GetDamageModifier() Tests', ()=>{
        //scenarios to test
        //STAB
        //Critical
        //effectuveness?
        it ('modifies damage correctly without stab', ()=>{
            const damageModifier = GetDamageModifier(CreateFirePokemon(),CreateWaterPokemon(),createEarthquake(),{
                autoCrit:false,
                autoAmt:true
            });
            expect(damageModifier.stabBonus).toBe(1);
        });
        it('modifies damage correctly with not very effective + stab', ()=>{

            const damageModifier = GetDamageModifier(CreateFirePokemon(),CreateWaterPokemon(),createFireblast(),{
                autoCrit:false,
                autoAmt:true
            });

            expect(damageModifier.stabBonus*damageModifier.typeEffectivenessBonus).toBe(0.5*1.5);
        });

        it ('modifies damage correctly with stab and crit', ()=>{
            const damageModifier = GetDamageModifier(CreateFirePokemon(),CreateWaterPokemon(),createFireblast(),{
                autoCrit:true,
                autoAmt:true
            });
            expect(damageModifier.critAmt*damageModifier.stabBonus*damageModifier.typeEffectivenessBonus).toBe(1.5*1.5*0.5);
        });
        it('modifies damage correctly for crits', ()=>{
            const damageModifier = GetDamageModifier(CreateFirePokemon(),CreateWaterPokemon(),createEarthquake(),{
                autoCrit:true,
                autoAmt:true
            });
            expect(damageModifier.critAmt).toBe(1.5);
        });
    });

});


