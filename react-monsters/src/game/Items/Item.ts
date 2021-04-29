import { BattleEffect } from "game/Effects/Effects";

export interface BaseItem{
    name:string,
    description:string,
    quantity:number
    effects:Array<BattleEffect>
}

//Represents an item that is connected with game logic.
export interface Item extends BaseItem {
    id: number,
}
