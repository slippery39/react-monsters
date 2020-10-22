
export type ItemEffect = (HealthRestoreItemEffect)


interface ItemEffectBase{
    type:string
}

interface HealthRestoreItemEffect extends ItemEffectBase{
    type:'health-restore'
    amount:number
}

interface ItemBase{
    name:string,
    description:string,
    effects:Array<ItemEffect>
}

interface PremadeItems {
    [key:string] : ItemBase
}

export function GetItem(name:string){
    
    const items : PremadeItems = {
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

/*
export function createItem(name:string,id:number,quantity:number):Item{    
    let itemBase = items[name];
    let newItem : Item = {...itemBase,...{"id":id,"quantity":quantity}}
    return newItem;
}

const items : PremadeItems = {
    "Potion": {
        name:'Potion',
        description:'Restores 20 HP'
    },
    "Super Potion":{
        name:'Super Potion',
        description:'Restores 60 HP'
    },
    "Hyper Potion":{
        name:'Hyper Potion',
        description:'Restores 120 HP'
    },
    "Max Potion":{
        name:"Max Potion",
        description:'Fully restores HP'
    }
}

export default items;
*/