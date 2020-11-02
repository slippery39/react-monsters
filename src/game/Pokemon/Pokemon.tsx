import { ElementType, Status, Technique } from "game/interfaces";
import { Stat } from "game/Stat";
import { GetPokemon } from "./PremadePokemon";
import _ from "lodash"


export interface IPokemon {
    id: number,
    name: string,
    originalStats: Stats
    currentStats: Stats,  
    techniques:Array<Technique>  ,
    status?: Status,
    elementalTypes:Array<ElementType>,
    canAttackThisTurn?:boolean
    statBoosts?:Record<Stat,number>
}

export interface Stats{
    health:number,
    attack:number,
    defence: number,
    specialAttack:number,
    specialDefence:number,
    speed:number
}

/*
export class Pokemon implements IPokemon{
 
    id=-1;
    name="[POKEMON]"
    originalStats

    constructor(){
        
    }
}
*/


export class PokemonBuilder{

    private pokemon:IPokemon

    constructor(){
        this.pokemon = {
                id: 1,
                name: 'unknown',
                elementalTypes:[ElementType.Fire,ElementType.Flying],
                originalStats: {
                    health: 0,
                    attack: 0,
                    defence: 0,
                    specialAttack: 0,
                    specialDefence: 0,
                    speed: 0
                },
                currentStats: {
                    health: 0,
                    attack: 0,
                    defence: 0,
                    specialAttack: 0,
                    specialDefence: 0,
                    speed: 0
                },
                techniques: [
                ],
                statBoosts:{
                    [Stat.Attack]:0,
                    [Stat.Defense]:0,
                    [Stat.SpecialAttack]:0,
                    [Stat.SpecialDefense]:0,
                    [Stat.Speed]:0
                }
        }
    }
    OfSpecies(name:string) : PokemonBuilder{
        //todo: some warning here that this should be called first?
        this.pokemon = {...this.pokemon,...GetPokemon(name)};
        return this;
    }
    Build() : IPokemon{
        return _.cloneDeep(this.pokemon);
    }
}


export function GetStat(pokemon:IPokemon,stat:Stat) : number{
    switch (stat){
        case Stat.Attack:{
            return pokemon.currentStats.attack
        }
        case Stat.Defense:{
            return pokemon.currentStats.defence
        }
        case Stat.SpecialAttack:{
            return pokemon.currentStats.specialAttack
        }
        case Stat.SpecialDefense:{
            return pokemon.currentStats.specialDefence
        }
        case Stat.Speed:{
            return pokemon.currentStats.speed
        }
    }
}
export function GetPokemonBoostStage(pokemon:IPokemon,stat:Stat) : number{

    if (pokemon.statBoosts!==undefined){
        return pokemon.statBoosts[stat];
    }
    else{
        return 0;
    }
}

export function CalculateStatWithBoost(pokemon:IPokemon,stat:Stat){
    /*
    Logic for stat boost goes in here
    */
   const statAmount = GetStat(pokemon,stat);
   const boostStage = GetPokemonBoostStage(pokemon,stat);
   /*
    Get the boost amount
   */

   //these are the wrong amounts, look these up again.
   var boostAmounts = [3/3,4/3,5/3,6/3,7/3,8/3,9/3];

   var boostAmount = (boostAmounts[(Math.abs(boostStage))]);
   if (boostStage <0){
       boostAmount = 1/boostAmount;
   }

   console.log(boostAmount);
   return Math.round(statAmount * boostAmount);   
}