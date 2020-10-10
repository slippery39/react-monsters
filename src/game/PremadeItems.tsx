import {Item} from "./interfaces";

interface ItemBase{
    name:string,
    description:string
}

interface PremadeItems {
    [key:string] : ItemBase
}

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