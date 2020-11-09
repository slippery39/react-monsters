import { Status } from "game/HardStatus/HardStatus";
import { ElementType } from "game/interfaces";
import { Stat } from "game/Stat";
import { VolatileStatusType } from "game/VolatileStatus/VolatileStatus";


//etc.
export enum TechniqueEffectType{
    Poison='poison',
    Burn='burn',
    SkipTurn='skip-turn'
}
export interface TechniqueEffect{
    effectType:TechniqueEffectType,
    chance:number
}

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
 effects?:Array<MoveEffect>
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


type MoveEffect = (InflictStatusMoveEffect | StatBoostMoveEffect | InflictVolatileStatusEffect);