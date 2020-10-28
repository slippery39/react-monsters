/*
All the different "events" that can happen as a result of a turn
*/

import {Status} from "./interfaces";

export interface BattleEvent {
    id: number,
    effects: Array<Effect>,
}
export type Effect = (SwitchOutEffect | SwitchInEffect | DamageEffect | HealEffect | FaintedPokemonEffect | UseMoveEffect | UseItemEffect | StatusChangeEffect | CannotAttackEffect | GenericMessageEffect)

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


export interface BaseEffect{
    id?:number
}

//A default effect type for easy prototyping, we can just use this one to easily display messages on the front-end, and when we are ready turn it into an actual effect.
export interface GenericMessageEffect extends BaseEffect{
    type:EffectType.GenericMessage,
    defaultMessage:string
}

export interface CannotAttackEffect extends BaseEffect{
    type:EffectType.CantAttack,
    targetPokemonId:number,
    reason:Status
}

export interface StatusChangeEffect extends BaseEffect {
    type:EffectType.StatusChange,
    targetPokemonId:number,
    attackerPokemonId?:number
    status: Status,
    defaultMessage?:string
}

export interface DamageEffect extends BaseEffect {
    type: EffectType.Damage,
    targetPokemonId: number,
    attackerPokemonId: number,
    targetFinalHealth: number,
    targetDamageTaken: number,
    didCritical: boolean,
    effectivenessAmt: number
}

export interface UseItemEffect extends BaseEffect {
    type: EffectType.UseItem,
    itemName: string,
    itemId: number,
    targetPokemonId: number
}

export interface SwitchOutEffect extends BaseEffect{
    type: EffectType.SwitchOut,
    switchOutPokemonId: number,
    switchInPokemonId: number,
}
export interface SwitchInEffect extends BaseEffect {
    type: EffectType.SwitchIn,
    switchOutPokemonId: number,
    switchInPokemonId: number,
}

export interface UseMoveEffect extends BaseEffect {
    type: EffectType.UseMove,
    userId: number,
    targetId: number,
    didMoveHit: Boolean,
    moveName: string
}
export interface HealEffect extends BaseEffect {
    type: EffectType.Heal,
    targetPokemonId: number,
    targetFinalHealth: number,
    totalHealing: number,
}

export interface FaintedPokemonEffect extends BaseEffect{
    type: EffectType.PokemonFainted,
    targetPokemonId: number,
}