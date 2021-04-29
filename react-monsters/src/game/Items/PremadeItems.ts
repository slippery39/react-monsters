import { BattleEffect, EffectType, HealthRestoreType } from "game/Effects/Effects";
import { Status } from "../HardStatus/HardStatus";


interface ItemBase{
    name:string,
    description:string,
    effects:Array<BattleEffect>
}


export function GetItem(name:string): ItemBase{
    
    const items : Array<ItemBase>= [
        {
            name:"Antidote",
            description:'Cures poison',
            effects:[{
                type:EffectType.StatusRestore,
                forStatus:Status.Poison,
            },
        {
         type:EffectType.StatusRestore,
         forStatus:Status.ToxicPoison   
        }]
        },
        {
            name:"Full Restore",
            description:'Heals to full health and cures any status',
            effects:[{
                type:EffectType.HealthRestore,
                restoreType:HealthRestoreType.PercentMaxHealth,
                amount:100
            },
            {type:EffectType.StatusRestore,forStatus:'any'}]
        },
        {
            name:'Potion',
            description:'Restores 20 HP',
            effects:[{
                type:EffectType.HealthRestore,
                restoreType:HealthRestoreType.Flat,
                amount:20
                }
            ]
        },
        {
            name:'Super Potion',
            description:'Restores 60 HP',
            effects:[
                {
                type:EffectType.HealthRestore,
                restoreType:HealthRestoreType.Flat,
                amount:60
                }
            ]
        },
        {
            name:'Hyper Potion',
            description:'Restores 120 HP',
            effects:[
                {
                type:EffectType.HealthRestore,
                restoreType:HealthRestoreType.Flat,
                amount:120
                }
            ]
        },
        {
            name:"Max Potion",
            description:'Fully restores HP',
            effects:[
                {
                type:EffectType.HealthRestore,
                restoreType:HealthRestoreType.PercentMaxHealth,
                amount:100
                }
            ]
        }
    ]

    const item = items.find(i=>{
        return i.name.toLowerCase().trim() === name.toLowerCase().trim();
    })

    if (item === undefined){
        throw new Error (`Could not locate premade item with name ${name}`);
    }

    return item;
}

