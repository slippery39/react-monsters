export interface Stats{
    health:number,
    attack:number,
    defence: number,
    specialAttack:number,
    specialDefence:number,
    speed:number
}
export interface Technique{
 id:number,
 name:string,
 description:string,
 pp:number,
 currentPP:number 
}
export interface Item {
    id: number,
    name: string,
    description: string
    quantity: number
}

export interface Player {
    name: string,
    pokemon: Array<Pokemon>,
    items: Array<Item>
}
export enum Status{
    Poison ='poison',
    Paralyze ='paralyze',
    Sleep='sleep',
    Burned = 'burned',
    Frozen = 'frozen'
}

export interface Pokemon {
    id: number,
    name: string,
    originalStats: Stats
    currentStats: Stats,  
    techniques:Array<Technique>  
    status?: Status 
}