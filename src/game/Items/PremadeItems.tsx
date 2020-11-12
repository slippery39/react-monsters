import { Status } from "../HardStatus/HardStatus";
import { ItemEffect } from "./Item";



interface ItemBase{
    name:string,
    description:string,
    effects:Array<ItemEffect>
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
                amount:9999
            },
            {type:'status-restore',forStatus:'any'}]
        },
        "Potion": {
            name:'Potion',
            description:'Restores 20 HP',
            effects:[{
                type:'health-restore',
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
                amount:9999
                }
            ]
        }
    }

    return items[name];
}

