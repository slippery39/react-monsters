import { StatusChangeEvent, BattleEventType } from "game/BattleEvents";
import GetHardStatus, { HardStatus, Status } from "game/HardStatus/HardStatus";
import { ApplyStatBoost, IPokemon, PokemonBuilder } from "game/Pokemon/Pokemon";
import { Stat } from "game/Stat";
import { Turn } from "game/Turn";
import { GetVolatileStatus, VolatileStatusType } from "game/VolatileStatus/VolatileStatus";

export enum TargetType{
    Self = 'self',
    Enemy = 'enemy'
}

export interface InflictStatusEffect{
    type:'inflict-status',
    status:Status
    target:TargetType,
    chance:number
}
export interface StatBoostEffect{
    type:'stat-boost',
    stat:Stat
    target:TargetType,
    amount:number
    chance:number 
}
export interface InflictVolatileStatusEffect{
    type:'inflict-volatile-status',
    status:VolatileStatusType,
    target:TargetType,
    chance:number
}

export enum HealthRestoreType{
    Flat='flat',
    PercentMaxHealth='percent-max-health'
}

export interface HealthRestoreEffect{
    type:'health-restore',
    restoreType:HealthRestoreType,
    amount:number
}

export interface StatusRestoreEffect{
    type:'status-restore',
    forStatus:Status | 'any',
}



export type BattleEffect = {target?:TargetType,chance?:number} & (InflictStatusEffect | StatBoostEffect | InflictVolatileStatusEffect | HealthRestoreEffect | StatusRestoreEffect);




export function InflictStatus(turn:Turn,pokemon:IPokemon,status:Status,source:IPokemon){
        const targetPokemon = pokemon;
        //cannot apply a status to a pokemon that has one, and cannot apply a status to a fainted pokemon.
        if (targetPokemon.status !== Status.None || targetPokemon.currentStats.health === 0) {
            return;
        }

        if (targetPokemon.hasSubstitute && source!==pokemon){
            return;
        }

        const hardStatus = GetHardStatus(status);
        if (!hardStatus.CanApply(turn, targetPokemon)) {
            return;
        }

        targetPokemon.status = status;

        const statusInflictedEffect: StatusChangeEvent = {
            type: BattleEventType.StatusChange,
            status: status,
            attackerPokemonId: pokemon.id,
            targetPokemonId: targetPokemon.id,
            defaultMessage: `${targetPokemon.name} ${hardStatus.inflictedMessage}`
        };
        turn.AddEvent(statusInflictedEffect);
}

function DoStatBoost(turn:Turn,pokemon:IPokemon,stat:Stat,amount:number){
    const targetPokemon = pokemon;
    ApplyStatBoost(targetPokemon,stat,amount);

    let statString = "";

    switch(stat){
        case Stat.Attack:{
            statString = "attack";
            break;
        }
        case Stat.Defense:{
            statString = "defence";
            break;
        }
        case Stat.SpecialAttack:{
            statString = "special attack";
            break;
        }
        case Stat.SpecialDefense:{
            statString = "special defense";
            break;
        }
        case Stat.Speed:{
            statString = "speed";
            break;
        }        
    }

    let message = ` ${targetPokemon.name} has had its ${statString} boosted!`
    if (amount < 0) {
        message = ` ${targetPokemon.name} has had its ${statString} decreased!`
    }
    turn.ApplyMessage(message);
}

export function InflictVolatileStatus(turn:Turn,pokemon:IPokemon,status:VolatileStatusType,source:IPokemon){
    const targetPokemon = pokemon;
    const vStatus = GetVolatileStatus(status);


    if (pokemon.hasSubstitute && pokemon!=source){
        return;
    }

    if (!vStatus.CanApply(turn, targetPokemon)) {
        return;
    }
    targetPokemon.volatileStatuses.push(vStatus);
    vStatus.OnApply(turn, targetPokemon);
    turn.ApplyMessage(vStatus.InflictedMessage(targetPokemon));
}

function ApplyHealingEffect(turn:Turn,pokemon:IPokemon,effect:HealthRestoreEffect){
    if (effect.restoreType === HealthRestoreType.Flat) {
        turn.ApplyHealing(pokemon, effect.amount);
    }
    else if (effect.restoreType === HealthRestoreType.PercentMaxHealth) {
        const amount = Math.floor(pokemon.originalStats.health / (100 / effect.amount));
        turn.ApplyHealing(pokemon, amount);
    }
}

function ApplyStatusRestoreEffect(turn:Turn,pokemon:IPokemon,effect:StatusRestoreEffect){
    if (effect.forStatus === 'any' && pokemon.status !== Status.None) {
        let statusRestoreEffect: StatusChangeEvent = {
            type: BattleEventType.StatusChange,
            status: Status.None,
            targetPokemonId: pokemon.id,
            defaultMessage: `${pokemon.name} ` + GetHardStatus(pokemon.status).curedString
        }
        turn.AddEvent(statusRestoreEffect);
        pokemon.status = Status.None;
    }
    else if (effect.forStatus === pokemon.status) {
        let statusRestoreEffect: StatusChangeEvent = {
            type: BattleEventType.StatusChange,
            status: Status.None,
            targetPokemonId: pokemon.id,
            defaultMessage: `${pokemon.name} ` + GetHardStatus(pokemon.status).curedString
        }
        turn.AddEvent(statusRestoreEffect);
        pokemon.status = Status.None;
    }
}


//need someting more abstract for the source, but for now just having the pokemon will do.
export function DoEffect(turn:Turn,pokemon:IPokemon,effect:BattleEffect,source:IPokemon){
    switch(effect.type){
        case 'inflict-status':{
            InflictStatus(turn,pokemon,effect.status,source);
            break;
        }
        case 'stat-boost':{
            DoStatBoost(turn,pokemon,effect.stat,effect.amount);
            break;
        }
        case 'inflict-volatile-status':{
            InflictVolatileStatus(turn,pokemon,effect.status,source);
            break;
        }
        case 'health-restore':{
            ApplyHealingEffect(turn,pokemon,effect);
            break;
        }
        case 'status-restore':{
            ApplyStatusRestoreEffect(turn,pokemon,effect);
            break;
        }
        default:{
            throw new Error(`Effect type ${effect} is not defined in DoEffect()`);
        }
    }
}
