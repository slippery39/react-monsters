import { Pokemon } from "game/Pokemon/Pokemon";
import { Technique } from "game/Techniques/Technique";
import _ from "lodash";

export type DamageEffect = (EruptionDamageEffect | SeismicTossDamageEffect | NullDamageEffect);

export enum DamageEffectTypes{
    Eruption='eruption',
    SeismicToss = 'seismic-toss',
    None='null'
}


abstract class AbstractDamageEffect{
    ModifyTechnique(pokemon:Pokemon,technique:Technique){
        return technique;
    }
    ModifyDamageDealt(pokemon:Pokemon,originalDamage:number){
        return originalDamage;
    }
}

class EruptionEffect extends AbstractDamageEffect{ 
    ModifyTechnique(pokemon:Pokemon,technique:Technique){
        const newTech = _.cloneDeep(technique);        
        const newPower = technique.power * (pokemon.currentStats.hp / pokemon.originalStats.hp);
        newTech.power = newPower;
        return newTech;
    }
}

class SeismicTossEffect extends AbstractDamageEffect{
    ModifyDamageDealt(pokemon:Pokemon,originalDamage:number){
        //should be based no level
        return 100;
    }
}


export function GetDamageEffect(effectName:string){
    if (effectName === 'eruption'){
        return new EruptionEffect();
    }
    else if (effectName === 'seismic-toss'){
        return new SeismicTossEffect();
    }

    throw new Error(`Could not find damage effect for ${effectName}`)
}




interface EruptionDamageEffect{
    type:DamageEffectTypes.Eruption
}
interface SeismicTossDamageEffect{
    type:DamageEffectTypes.SeismicToss
}
interface NullDamageEffect{
    type:DamageEffectTypes.None
}