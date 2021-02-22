/*
All the different "events" that can happen as a result of a turn
*/

import { Status } from "./HardStatus/HardStatus";
import { Field } from "./Turn";

export type BattleEvent = (SwitchOutEvent | SwitchInEvent | DamageEvent | HealEvent | FaintedPokemonEvent | UseMoveEvent | UseItemEvent | StatusChangeEvent | CannotAttackEvent | GenericMessageEvent | SubstituteBrokenEvent |SubstituteCreatedEvent)

export enum BattleEventType {
    Damage = 'damage',
    Heal = 'heal',
    Switch = 'switch',
    Poisoned = 'poisoned',
    UsedTechnique = 'used-technique',
    StatusChange = 'status-change',
    PokemonFainted = 'pokemon-fainted',
    UseTechnique = 'use-move',
    SwitchIn = 'switch-in',
    SwitchOut = 'switch-out',
    MissedMove = 'missed-move',
    UseItem = 'use-item',
    CantAttack = `can't attack`,
    SubstituteBroken = "substitute-broken",
    SubstituteCreated = 'substitute-created',
    GenericMessage = 'generic-message', //if we want to display a generic message from the backend, we can use this ()
    None = 'none' //used in cases where nothing happaned (i.e an attack missed or something)
}


export interface BaseBattleEvent{
    id?:number
    resultingState?:Field
}

//A default effect type for easy prototyping, we can just use this one to easily display messages on the front-end, and when we are ready turn it into an actual effect.
export interface GenericMessageEvent extends BaseBattleEvent{
    type:BattleEventType.GenericMessage,
    defaultMessage:string
}

export interface CannotAttackEvent extends BaseBattleEvent{
    type:BattleEventType.CantAttack,
    targetPokemonId:number,
    reason:Status
}

export interface StatusChangeEvent extends BaseBattleEvent {
    type:BattleEventType.StatusChange,
    targetPokemonId:number,
    attackerPokemonId?:number
    status: Status,
    defaultMessage?:string
}

export interface DamageEvent extends BaseBattleEvent {
    type: BattleEventType.Damage,
    targetPokemonId: number,
    attackerPokemonId: number,
    targetFinalHealth: number,
    targetDamageTaken: number,
    didCritical: boolean,
    effectivenessAmt: number
}

export interface UseItemEvent extends BaseBattleEvent {
    type: BattleEventType.UseItem,
    itemName: string,
    itemId: number,
    targetPokemonId: number
}

export interface SwitchOutEvent extends BaseBattleEvent{
    type: BattleEventType.SwitchOut,
    switchOutPokemonId: number,
    switchInPokemonId: number,
}
export interface SwitchInEvent extends BaseBattleEvent {
    type: BattleEventType.SwitchIn,
    switchOutPokemonId: number,
    switchInPokemonId: number,
}

export interface UseMoveEvent extends BaseBattleEvent {
    type: BattleEventType.UseTechnique,
    userId: number,
    targetId: number,
    didTechniqueHit: Boolean,
    techniqueName: string,
}
export interface HealEvent extends BaseBattleEvent {
    type: BattleEventType.Heal,
    targetPokemonId: number,
    targetFinalHealth: number,
    totalHealing: number,
}

export interface FaintedPokemonEvent extends BaseBattleEvent{
    type: BattleEventType.PokemonFainted,
    targetPokemonId: number,
}

export interface SubstituteBrokenEvent extends BaseBattleEvent{
    type:BattleEventType.SubstituteBroken,
    targetPokemonId:number,
}
export interface SubstituteCreatedEvent extends BaseBattleEvent{
    type:BattleEventType.SubstituteCreated,
    targetPokemonId:number
}