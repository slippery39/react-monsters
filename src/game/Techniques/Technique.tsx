import { BattleEffect } from "game/Effects/Effects";
import { ElementType } from "game/ElementType";



export enum DamageType{
    Physical = 'physical',
    Special = 'special',
    Status = 'status'
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
 effects?:Array<BattleEffect>
 chance: number
}
