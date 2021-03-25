import { IGame } from "game/BattleGame";
import { DamageModifierInfo } from "game/DamageFunctions";
import { EffectType, HealthRestoreEffect } from "game/Effects/Effects";
import { ElementType } from "game/ElementType";
import { GetActivePokemon } from "game/HelperFunctions";
import { Pokemon, StatMultiplier } from "game/Pokemon/Pokemon";
import { Stat } from "game/Stat";
import { Technique } from "game/Techniques/Technique";
import _ from "lodash";



export enum WeatherType {
    Rain = 'Rain',
    Sunny = 'Sunny',
    Sandstorm = 'Sandstorm',
    None = 'None'
}

export abstract class Weather {
    name: WeatherType = WeatherType.None;
    duration: number = 5;
    currentTurn: number = 0;

    OnApply(game: IGame) {
    }

    ModifyTechnique(pokemon: Pokemon, tech: Technique) {
        return tech;
    }
    OnAfterDamageCalculated(pokemon: Pokemon, tech: Technique, defendingPokemon: Pokemon, damage: number, damageModifier: DamageModifierInfo, game: IGame) {
        return damage;
    }
    EndOfTurn(game: IGame) {

    }
}

export class SandstormWeather extends Weather {
    name: WeatherType = WeatherType.Sandstorm

    OnApply(game: IGame) {
        game.AddMessage("A sandstorm kicked up!");
    }

    ModifyTechnique(pokemon: Pokemon, tech: Technique) {
        if (["moonlight", "synthesis", "morning sun"].includes(tech.name.toLowerCase())) {

            const newTech = _.cloneDeep(tech);
            if (!newTech.effects) {
                throw new Error(`Expected effect healing effect for move ${tech.name} but could not find one`);
            }
            const healingEffect = newTech.effects.find(eff => eff.type === EffectType.HealthRestore);
            if (healingEffect === undefined) {
                throw new Error(`Expected healing effect for move ${tech.name} but could not find one`);
            }
            (healingEffect as HealthRestoreEffect).amount = 25;
            return newTech;
        }
        if (["solar beam"].includes(tech.name.toLowerCase())) {
            const newTech = _.cloneDeep(tech);
            newTech.power = 60;
            return newTech;
        }
        return tech;
    }
    OnAfterDamageCalculated(pokemon: Pokemon, tech: Technique, defendingPokemon: Pokemon, damage: number, damageModifier: DamageModifierInfo, game: IGame) {
        if (tech.elementalType === ElementType.Fire) {
            return damage * 1.5;
        }
        if (tech.elementalType === ElementType.Water) {
            return damage * 0.5;
        }
        return damage;
    }

    EndOfTurn(game: IGame) {
        this.currentTurn++;
        if (this.currentTurn >= this.duration) {
            game.AddMessage("The sandstorm subsided.");
            const allPokemon = game.GetPlayers().map(play => play.pokemon).flat();
            allPokemon.forEach(pokemon => {
                _.remove(pokemon.statMultipliers, function (mod) {
                    return mod.tag === "sandstorm"
                })
            });
            game.field.weather = undefined //stops the weather.          
        }
        else {
            //deal 1/16 max health damage to each active pokemon that is not ground steel or rock
            const activePokemons = game.GetPlayers().map(player => GetActivePokemon(player));
            activePokemons.forEach(poke => {
                const shouldDamage = poke.elementalTypes.filter(el => [ElementType.Rock, ElementType.Steel, ElementType.Ground].includes(el)).length === 0
                if (shouldDamage) {
                    game.ApplyIndirectDamage(poke, poke.originalStats.hp / 16);
                    game.AddMessage(`${poke.name} was buffeted by the sandstorm!`);
                }
            });

        }
    }

    Update(game: IGame) {
        const allPokemon = game.GetPlayers().map(play => play.pokemon).flat();
        allPokemon.forEach(pokemon => {
            if (pokemon.statMultipliers.find(multi => multi.tag === "sandstorm") === undefined) {
                const multiplier: StatMultiplier = {
                    stat: Stat.SpecialDefense,
                    multiplier: 1.5,
                    tag: "sandstorm"
                }
                pokemon.statMultipliers.push(multiplier);
            }
        });

    }
}



export class SunnyWeather extends Weather {
    name: WeatherType = WeatherType.Sunny

    OnApply(game: IGame) {
        game.AddMessage("The sunlight turned harsh!");
    }

    ModifyTechnique(pokemon: Pokemon, tech: Technique) {
        if (["moonlight", "synthesis", "morning sun"].includes(tech.name.toLowerCase())) {

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
        if (["solar beam"].includes(tech.name.toLowerCase())) {
            //Solar beam becomes a non charging move.
            const newTech = _.cloneDeep(tech);
            newTech.twoTurnMove = false;
            newTech.firstTurnStatus = undefined;
            return newTech;
        }
        return tech;
    }

    OnAfterDamageCalculated(pokemon: Pokemon, tech: Technique, defendingPokemon: Pokemon, damage: number, damageModifier: DamageModifierInfo, game: IGame) {
        if (tech.elementalType === ElementType.Fire) {
            return damage * 1.5;
        }
        if (tech.elementalType === ElementType.Water) {
            return damage * 0.5;
        }
        return damage;
    }

    EndOfTurn(game: IGame) {
        this.currentTurn++;
        if (this.currentTurn >= this.duration) {
            game.AddMessage("The harsh sunlight faded.")
            game.field.weather = undefined //stops the weather.          
        }
    }
}


export class RainingWeather extends Weather {
    name: WeatherType = WeatherType.Rain;
    //Moves Thunder and Hurricane should always hit.

    OnApply(game: IGame) {
        game.AddMessage("It started to rain!");
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

    OnAfterDamageCalculated(pokemon: Pokemon, tech: Technique, defendingPokemon: Pokemon, damage: number, damageModifier: DamageModifierInfo, game: IGame) {

        if (tech.elementalType === ElementType.Water) {
            return damage * 1.5;
        }
        if (tech.elementalType === ElementType.Fire) {
            return damage * 0.5;
        }
        return damage;
    }
    EndOfTurn(game: IGame) {
        this.currentTurn++;
        if (this.currentTurn >= this.duration) {
            game.AddMessage("The rain stopped.")
            game.field.weather = undefined //stops the weather.          
        }
    }
}