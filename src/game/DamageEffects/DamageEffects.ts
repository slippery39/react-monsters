import { GetPokemonOwner } from "game/HelperFunctions";
import { Pokemon } from "game/Pokemon/Pokemon";
import { Technique } from "game/Techniques/Technique";
import { Turn } from "game/Turn";
import _ from "lodash";

export type DamageEffect = (EruptionDamageEffect | SeismicTossDamageEffect | LowKickDamageEffect | PursuitDamageEffect | NullDamageEffect);

export enum DamageEffectTypes{
    Eruption='eruption',
    SeismicToss = 'seismic-toss',
    LowKick = 'low-kick',
    Pursuit="pursuit",
    None='null'
}


abstract class AbstractDamageEffect{
    ModifyTechnique(pokemon:Pokemon,technique:Technique,opponentPokemon:Pokemon,turn?:Turn){
        return technique;
    }
    ModifyDamageDealt(pokemon:Pokemon,originalDamage:number){
        return originalDamage;
    }
}

class EruptionEffect extends AbstractDamageEffect{ 
    ModifyTechnique(pokemon:Pokemon,technique:Technique,opponentPokemon:Pokemon){
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

class LowKickEffect extends AbstractDamageEffect{
    ModifyTechnique(pokemon:Pokemon,technique:Technique,opponentPokemon:Pokemon){
       
        const ranges = [
          {lower:0,upper:9.9,power:20},
          {lower:10,upper:24.9,power:40},
          {lower:25,upper:49.9,power:60},
          {lower:50,upper:99.9,power:80},
          {lower:100.0,upper:199.9,power:100},
          {lower:200,upper:999999999,power:120}
        ]

        const weightRange = ranges.find(range=>{
            return range.lower<=opponentPokemon.weight && range.upper>=opponentPokemon.weight;
        })

        if (weightRange === undefined){
            throw new Error(`Could not find power for low kick move for pokemon ${opponentPokemon.name}. Their weight was ${opponentPokemon.weight}`)
        }

        let newTech = {...technique}
        newTech.power = weightRange.power;
       
        return newTech
    }
}

class PursuitEffect extends AbstractDamageEffect{
    ModifyTechnique(pokemon:Pokemon,technique:Technique,opponentPokemon:Pokemon,turn:Turn){
        const moveOrder = turn.GetMoveOrder(); //get the opponents action.

        const otherAction = moveOrder.find(move=>move.playerId!==GetPokemonOwner(turn.GetPlayers(),pokemon).id)
        if (otherAction === undefined){
            throw new Error(`Could not find action from other player for pursuit effect`);
        }

        if (otherAction.type === 'switch-pokemon-action'){
            let newTech = {...technique};
            newTech.power*=2;

            turn.AddMessage(`${pokemon.name} has caught ${opponentPokemon.name} switching out with pursuit!`)
            return newTech;
        }

        return technique;
        //if the opponents action is a switch pokemon action, then double this moves power.
    }
}


export function GetDamageEffect(effectName:string){
    if (effectName === 'eruption'){
        return new EruptionEffect();
    }
    else if (effectName === 'seismic-toss'){
        return new SeismicTossEffect();
    }
    else if (effectName === 'low-kick'){
        return new LowKickEffect();
    }
    else if (effectName === "pursuit"){
        return new PursuitEffect();
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
interface LowKickDamageEffect{
    type:DamageEffectTypes.LowKick
}
interface PursuitDamageEffect{
    type:DamageEffectTypes.Pursuit
}