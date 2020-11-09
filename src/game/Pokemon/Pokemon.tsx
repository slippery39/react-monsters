import { ElementType} from "game/interfaces";
import { Stat } from "game/Stat";
import { GetPokemon } from "./PremadePokemon";
import _ from "lodash"
import { GetTech } from "game/Techniques/PremadeTechniques";
import { Technique } from "game/Techniques/Technique";
import { VolatileStatus, VolatileStatusType } from "game/VolatileStatus/VolatileStatus";
import { Status } from "game/HardStatus/HardStatus";


export interface IPokemon {
    id: number,
    name: string,
    originalStats: Stats
    currentStats: Stats,  
    techniques:Array<Technique>,
    status: Status,
    elementalTypes:Array<ElementType>,
    canAttackThisTurn:boolean
    statBoosts:Record<Stat,number>,
    volatileStatuses:Array<VolatileStatus>,
    baseStats:Stats,
    ivs:Stats,
    evs:Stats
}

export interface Stats{
    health:number,
    attack:number,
    defence: number,
    specialAttack:number,
    specialDefence:number,
    speed:number
}


export class PokemonBuilder{

    private pokemon:IPokemon

    constructor(){
        this.pokemon = {
                id: 1,
                name: 'Custom Pokemon',
                elementalTypes:[],
                originalStats:CreateEmptyStats(),
                currentStats: CreateEmptyStats(),
                techniques: [
                ],
                volatileStatuses: [],
                status:Status.None,
                canAttackThisTurn:true,
                statBoosts:{
                    [Stat.Attack]:0,
                    [Stat.Defense]:0,
                    [Stat.SpecialAttack]:0,
                    [Stat.SpecialDefense]:0,
                    [Stat.Speed]:0
                },
                baseStats:CreateEmptyStats(),
                ivs:CreateEmptyStats(),
                evs:CreateEmptyStats()
        }
    }
    OfSpecies(name:string) : PokemonBuilder{        
        //todo: some warning here that this should be called first?
        const base = GetPokemon(name);
        //modify the base pokemon to change it into a regular pokemon.
        this.pokemon.name = base.name;
        this.pokemon.baseStats = {...base.baseStats};
        this.pokemon.elementalTypes = [...base.elementalTypes];
        
        
        base.techniques.forEach((techName:string)=>{
            this.pokemon.techniques.push(GetTech(techName))
        });

        return this;
    }
    WithIVs(ivAmounts:Stats):PokemonBuilder{
        this.pokemon.ivs = {...ivAmounts};
        return this;
    }
    WithEVs(evAmounts:Stats):PokemonBuilder{
        this.pokemon.evs = {...evAmounts};
        return this;
    }
    Build() : IPokemon{
        //TODO, some error checking here
        //check if it has elemental types
        //check if it has moves
        //check if it has stats
        //check if the name has been updated?
        const calculatedStats = ConvertBaseStatsToRealStats(this.pokemon);
        this.pokemon.currentStats = {...calculatedStats};
        this.pokemon.originalStats = {...calculatedStats};
        //calculate the final stats
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

export function CreateEmptyStats():Stats{
    return {
        health: 0,
        attack: 0,
        defence: 0,
        specialAttack: 0,
        specialDefence: 0,
        speed: 0
    }
}


export function ConvertBaseStatsToRealStats(pokemon:IPokemon): Stats{
    //For now we will use an ivValue and evValue of 0.
    const level = 100;
    const natureMod = 1; //assuming a neutral nature for now.

    let calculatedStats : any = CreateEmptyStats();



    const hp1 = (2*pokemon.baseStats.health + pokemon.ivs.health + ( pokemon.evs.health / 4 ) ) * level;
    const hp2 = hp1/100;
    const hp3 = hp2+level+10;

    calculatedStats['health'] = hp3;


    //calculating other stats
    const statsToCalculate = ['attack','specialAttack','speed','defence','specialDefence'];

    statsToCalculate.forEach((stat)=>{

        const ivsAsAny = pokemon.ivs as any;
        const evsAsAny = pokemon.evs as any;
        const baseStats = pokemon.baseStats as any;

        const ivValue = ivsAsAny[stat];
        const evValue = evsAsAny[stat];

        const other1 = (2*baseStats[stat]+ivValue+(evValue/4) ) * level
        const other2 = ( (other1/100) + 5 ) * natureMod
        calculatedStats[stat] = other2;
    });

    return calculatedStats as Stats;
}

export function GetPokemonBoostStage(pokemon:IPokemon,stat:Stat) : number{
    return pokemon.statBoosts[stat];
}

export function HasVolatileStatus(pokemon:IPokemon,status:VolatileStatusType): boolean{
    return pokemon.volatileStatuses.filter(el=>
        el.type === status
    ).length >0;
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

   return Math.round(statAmount * boostAmount);   
}


export function ApplyStatBoost(pokemon: IPokemon, stat:Stat,amount:number){
    pokemon.statBoosts[stat] += amount;
    //clamp it to -6 or 6
    pokemon.statBoosts[stat] = Math.min(Math.max(pokemon.statBoosts[stat], -6), 6);
}