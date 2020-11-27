import { BattleEffect, HealthRestoreType } from "game/Effects/Effects";
import { Status } from "../HardStatus/HardStatus";


interface ItemBase{
    name:string,
    description:string,
    effects:Array<BattleEffect>
}

interface PremadeItems {
    [key:string] : ItemBase
}

export function GetItem(name:string): ItemBase{
    
    const items : PremadeItems = {


        "Antidote":{
            name:"Antidote",
            description:'Cures poison',
            effects:[{
                type:'status-restore',
                forStatus:Status.Poison,
            },
        {
         type:'status-restore',
         forStatus:Status.ToxicPoison   
        }]
        },
        "Full Restore":{
            name:"Full Restore",
            description:'Heals to full health and cures any status',
            effects:[{
                type:'health-restore',
                restoreType:HealthRestoreType.PercentMaxHealth,
                amount:100
            },
            {type:'status-restore',forStatus:'any'}]
        },
        "Potion": {
            name:'Potion',
            description:'Restores 20 HP',
            effects:[{
                type:'health-restore',
                restoreType:HealthRestoreType.Flat,
                amount:20
                }
            ]
        },
        "Super Potion":{
            name:'Super Potion',
            description:'Restores 60 HP',
            effects:[
                {
                type:'health-restore',
                restoreType:HealthRestoreType.Flat,
                amount:60
                }
            ]
        },
        "Hyper Potion":{
            name:'Hyper Potion',
            description:'Restores 120 HP',
            effects:[
                {
                type:'health-restore',
                restoreType:HealthRestoreType.Flat,
                amount:120
                }
            ]
        },
        "Max Potion":{
            name:"Max Potion",
            description:'Fully restores HP',
            effects:[
                {
                type:'health-restore',
                restoreType:HealthRestoreType.PercentMaxHealth,
                amount:100
                }
            ]
        }
    }

    return items[name];
}

