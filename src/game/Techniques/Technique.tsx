import { BaseTechnique } from "./PremadeTechniques";



export enum DamageType{
    Physical = 'physical',
    Special = 'special',
    Status = 'status'
}

export interface Technique extends BaseTechnique{
 id:number,
 currentPP:number,
 accuracy:number
}
