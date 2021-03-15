import { DamageModifierInfo } from "game/DamageFunctions";
import { EffectType, HealthRestoreEffect } from "game/Effects/Effects";
import { ElementType } from "game/ElementType";
import { Pokemon } from "game/Pokemon/Pokemon";
import { Technique } from "game/Techniques/Technique";
import { Turn } from "game/Turn";
import _ from "lodash";



export enum WeatherType{
    Rain='Rain',
    Sunny='Sunny',
    None = 'None'
}

export abstract class Weather {
    name:WeatherType = WeatherType.None;
    duration: number = 5;
    currentTurn: number = 0;

    OnApply(turn:Turn){
    }

    ModifyTechnique(pokemon:Pokemon,tech:Technique){
        return tech;
    }
    OnAfterDamageCalculated(pokemon: Pokemon, tech: Technique, defendingPokemon: Pokemon, damage: number, damageModifier: DamageModifierInfo, turn: Turn){
        return damage;
    }
    EndOfTurn(turn:Turn){
        
    }
}


export class SunnyWeather extends Weather{
    name:WeatherType = WeatherType.Sunny

    OnApply(turn:Turn){
        turn.AddMessage("The sunlight turned harsh!");
    }

    ModifyTechnique(pokemon:Pokemon,tech:Technique){
        if (["moonlight","synthesis","morning sun"].includes(tech.name.toLowerCase())){

            const newTech = _.cloneDeep(tech);
            if (!newTech.effects) {
                throw new Error(`Expected effect healing effect for move ${tech.name} but could not find one`);
            }
            const healingEffect = newTech.effects.find(eff => eff.type === EffectType.HealthRestore);
            if (healingEffect === undefined) {
                throw new Error(`Expected healing effect for move ${tech.name} but could not find one`);
            }   
            (healingEffect as HealthRestoreEffect).amount = 66;
             return newTech;
        }
        if (["thunder", "hurricane"].includes(tech.name.toLowerCase())) {
            const newTech = _.cloneDeep(tech);
            newTech.accuracy = 50; //hack to make the move bypass the accuracy check. think about having a flag to do so anyways.
            return newTech;
        }
        if (["solar beam"].includes(tech.name.toLowerCase())){
            console.log("we are finding solar beam here!");
            //Solar beam becomes a non charging move.
            const newTech = _.cloneDeep(tech);
            newTech.twoTurnMove = false;
            newTech.firstTurnStatus = undefined;
            console.log(newTech);
            return newTech;
        }
        return tech;
    }

    OnAfterDamageCalculated(pokemon: Pokemon, tech: Technique, defendingPokemon: Pokemon, damage: number, damageModifier: DamageModifierInfo, turn: Turn) {
        if (tech.elementalType === ElementType.Fire) {
            return damage * 1.5;
        }
        if (tech.elementalType === ElementType.Water) {
            return damage * 0.5;
        }
        return damage;
    }

    EndOfTurn(turn: Turn) {
        this.currentTurn++;
        if (this.currentTurn >=this.duration){
            turn.AddMessage("The harsh sunlight faded.")
            turn.field.weather = undefined //stops the weather.          
        }  
      }
}


export class RainingWeather extends Weather {
    name:WeatherType = WeatherType.Rain;
    //Moves Thunder and Hurricane should always hit.

    OnApply(turn:Turn){
        turn.AddMessage("It started to rain!");
    }

    ModifyTechnique(pokemon: Pokemon, tech: Technique) {
        // Moonlight, Synthesis and Morning sun 

        if (["moonlight", "synthesis", "morning sun"].includes(tech.name.toLowerCase())) {

            const newTech = _.cloneDeep(tech);
            if (!newTech.effects) {
                throw new Error(`Expected effect healing effect for move ${tech.name} but could not find one`);
            }
            const healingEffect = newTech.effects.find(eff => eff.type === EffectType.HealthRestore);
            if (healingEffect === undefined) {
                throw new Error(`Expected healing effect for move ${tech.name} but could not find one`);
            }

            //change to 25 percent;
            //for some reason we need to cast this.. but i thought we wouldn't need to
            (healingEffect as HealthRestoreEffect).amount = 25;

            return newTech;
        }
        if (["thunder", "hurricane"].includes(tech.name.toLowerCase())) {
            const newTech = _.cloneDeep(tech);
            newTech.accuracy = 9999999; //hack to make the move bypass the accuracy check. think about having a flag to do so anyways.
            return newTech;
        }

        return tech;
    }

    OnAfterDamageCalculated(pokemon: Pokemon, tech: Technique, defendingPokemon: Pokemon, damage: number, damageModifier: DamageModifierInfo, turn: Turn) {

        if (tech.elementalType === ElementType.Water) {
            return damage * 1.5;
        }
        if (tech.elementalType === ElementType.Fire) {
            return damage * 0.5;
        }
        return damage;
    }
    EndOfTurn(turn: Turn) {
        this.currentTurn++;
        if (this.currentTurn >=this.duration){
            turn.AddMessage("The rain stopped.")
            turn.field.weather = undefined //stops the weather.          
        }  
      }
}