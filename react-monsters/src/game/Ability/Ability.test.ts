import 'core-js'
import { EffectType, TargetType } from 'game/Effects/Effects';
import { ElementType } from 'game/ElementType';
import { PokemonBuilder } from 'game/Pokemon/Pokemon';
import { Stat } from 'game/Stat';
import { DamageType, TechniqueBuilder } from 'game/Techniques/Technique';
import { VolatileStatusType } from 'game/VolatileStatus/VolatileStatus';
import GetAbility from './Ability';

describe('Serene Grace Ability Tests', () => {
    it('it properly doubles effect chances of damaging moves', () => {


        const testTechnique = TechniqueBuilder()
            .OfDamageType(DamageType.Physical)
            .WithEffects([
                {
                    type: EffectType.StatBoost,
                    chance: 30,
                    stat: Stat.Attack,
                    target: TargetType.Self,
                    amount: 1
                },
                {
                    type: EffectType.InflictVolatileStatus,
                    chance: 50,
                    status: VolatileStatusType.Confusion,
                    target: TargetType.Enemy
                }
            ])
            .Build();

        const sereneGraceAbility = GetAbility("Serene Grace");
        const testPokemon = PokemonBuilder().UseGenericPokemon().OfElementalTypes([ElementType.Normal]).Build();
        const modifiedTech = sereneGraceAbility.ModifyTechnique(testPokemon, testTechnique);

        expect(modifiedTech.effects![0].chance).toBe(60);
        expect(modifiedTech.effects![1].chance).toBe(100);
    });
});



