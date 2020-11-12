import { Status } from "game/HardStatus/HardStatus";

export interface BaseItem{
    name:string,
    description:string,
    quantity:number
    effects:Array<ItemEffect>
}

//Represents an item that is connected with game logic.
export interface Item extends BaseItem {
    id: number,
}

export type ItemEffect = (HealthRestoreItemEffect | StatusRestoreEffect)


interface ItemEffectBase{
    type:string
}

interface HealthRestoreItemEffect extends ItemEffectBase{
    type:'health-restore'
    amount:number
}

interface StatusRestoreEffect extends ItemEffectBase{
    type:'status-restore',
    forStatus:Status | "any"
}
