import { IPokemon } from "game/Pokemon/Pokemon";
import { Technique } from "game/Techniques/Technique";
import _ from "lodash";

export type DamageEffect = (EruptionDamageEffect | NullDamageEffect);

export enum DamageEffectTypes{
    Eruption='eruption',
    None='null'
}


abstract class AbstractDamageEffect{
    ModifyTechnique(pokemon:IPokemon,technique:Technique){
        return technique;
    }
}

class EruptionEffect extends AbstractDamageEffect{ 
    ModifyTechnique(pokemon:IPokemon,technique:Technique){
        const newTech = _.cloneDeep(technique);        
        const newPower = technique.power * (pokemon.currentStats.hp / pokemon.originalStats.hp);
        newTech.power = newPower;
        return newTech;
    }
}


export function GetDamageEffect(effectName:string){
    if (effectName === 'eruption'){
        return new EruptionEffect();
    }

    throw new Error(`Could not find damage effect for ${effectName}`)
}




interface EruptionDamageEffect{
    type:DamageEffectTypes.Eruption
}
interface NullDamageEffect{
    type:DamageEffectTypes.None
}