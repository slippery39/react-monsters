import { Status } from "game/HardStatus/HardStatus";
import { ElementType } from "game/ElementType";
import { Stat } from "game/Stat";
import { VolatileStatusType } from "game/VolatileStatus/VolatileStatus";


export enum DamageType{
    Physical = 'physical',
    Special = 'special',
    Status = 'status'
}

export enum TargetType{
    Self = 'self',
    Enemy = 'enemy'
}

export interface Technique{
 id:number,
 name:string,
 description:string,
 pp:number,
 currentPP:number,
 power:number,
 damageType: DamageType,
 elementalType:ElementType,
 effects?:Array<TechniqueEffect>
 chance: number
}

interface InflictStatusMoveEffect{
    type:'inflict-status',
    status:Status
    target:TargetType,
    chance:number
}
interface StatBoostMoveEffect{
    type:'stat-boost',
    stat:Stat
    target:TargetType,
    amount:number
    chance:number 
}
interface InflictVolatileStatusEffect{
    type:'inflict-volatile-status',
    status:VolatileStatusType,
    target:TargetType,
    chance:number
}

export enum HealthRestoreType{
    Flat='flat',
    PercentMaxHealth='percent-max-health'
}

interface HealthRestoreEffect{
    type:'health-restore',
    restoreType:HealthRestoreType
    amount:number
    chance:number
}

interface StatusRestoreEffect{
    type:'status-restore',
    forStatus:Status | 'any',
    target:TargetType,
    chance:number
}



export type TechniqueEffect = (InflictStatusMoveEffect | StatBoostMoveEffect | InflictVolatileStatusEffect | HealthRestoreEffect | StatusRestoreEffect);