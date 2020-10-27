/*
All the different "events" that can happen as a result of a turn
*/

import {Status} from "./interfaces";

export interface BattleEvent {
    id: number,
    effects: Array<Effect>,
}
type Effect = (SwitchOutEffect | SwitchInEffect | DamageEffect | HealEffect | FaintedPokemonEffect | UseMoveEffect | UseItemEffect | StatusChangeEffect | CannotAttackEffect | GenericMessageEffect)

export enum EffectType {
    Damage = 'damage',
    Heal = 'heal',
    Switch = 'switch',
    Poisoned = 'poisoned',
    UsedTechnique = 'used-technique',
    StatusChange = 'status-change',
    PokemonFainted = 'pokemon-fainted',
    UseMove = 'use-move',
    SwitchIn = 'switch-in',
    SwitchOut = 'switch-out',
    MissedMove = 'missed-move',
    UseItem = 'use-item',
    CantAttack = `can't attack`,
    GenericMessage = 'generic-message', //if we want to display a generic message from the backend, we can use this ()
    None = 'none' //used in cases where nothing happaned (i.e an attack missed or something)
}


//A default effect type for easy prototyping, we can just use this one to easily display messages on the front-end, and when we are ready turn it into an actual effect.
export interface GenericMessageEffect{
    type:EffectType.GenericMessage,
    defaultMessage:string
}

export interface CannotAttackEffect{
    type:EffectType.CantAttack,
    targetPokemonId:number,
    reason:Status
}

export interface StatusChangeEffect {
    type:EffectType.StatusChange,
    targetPokemonId:number,
    attackerPokemonId?:number
    status: Status,
    defaultMessage?:string
}

export interface DamageEffect {
    type: EffectType.Damage,
    targetPokemonId: number,
    attackerPokemonId: number,
    targetFinalHealth: number,
    targetDamageTaken: number,
    didCritical: boolean,
    effectivenessAmt: number
}

export interface UseItemEffect {
    type: EffectType.UseItem,
    itemName: string,
    itemId: number,
    targetPokemonId: number
}

export interface SwitchOutEffect {
    type: EffectType.SwitchOut,
    switchOutPokemonId: number,
    switchInPokemonId: number,
}
export interface SwitchInEffect {
    type: EffectType.SwitchIn,
    switchOutPokemonId: number,
    switchInPokemonId: number,
}

export interface UseMoveEffect {
    type: EffectType.UseMove,
    userId: number,
    targetId: number,
    didMoveHit: Boolean,
    moveName: string
}
export interface HealEffect {
    type: EffectType.Heal,
    targetPokemonId: number,
    targetFinalHealth: number,
    totalHealing: number,
}

export interface FaintedPokemonEffect {
    type: EffectType.PokemonFainted,
    targetPokemonId: number,
}