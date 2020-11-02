import { IPokemon } from "./Pokemon/Pokemon";
import { ItemEffect } from "./PremadeItems";



//etc.
export enum TechniqueEffectType{
    Poison='poison',
    Burn='burn',
    SkipTurn='skip-turn'
}
export interface TechniqueEffect{
    effectType:TechniqueEffectType,
    chance:number
}


export interface Technique{
 id:number,
 name:string,
 description:string,
 pp:number,
 currentPP:number,
 power:number,
 damageType: 'physical' | 'special' | 'status',
 elementalType:ElementType,
 effects?:Array<MoveEffect>
 chance: number
}



interface InflictStatusMoveEffect{
    type:'inflict-status',
    status:Status
    target:'ally' | 'enemy'
    chance:number
}

type MoveEffect = (InflictStatusMoveEffect);


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

export interface Player {
    name: string,
    pokemon: Array<IPokemon>,
    currentPokemonId:number,
    items: Array<Item>
    id:number
}

export enum Status{
    Poison ='poisoned',
    Paralyzed ='paralyzed',
    Sleep='sleep',
    Burned = 'burned',
    Frozen = 'frozen',
    None = 'none'
}


export enum ElementType{
    Normal = 'NORMAL',
    Fighting = 'FIGHTING',
    Flying = 'FLYING',
    Poison = 'POISON',
    Ground = 'GROUND',
    Rock ='ROCK',
    Bug ='BUG',
    Ghost ='GHOST',
    Steel ='STEEL',
    Fire ='FIRE',
    Water ='WATER',
    Grass = 'GRASS',
    Electric ='ELECTRIC',
    Psychic ='PSYCHIC',
    Ice ='ICE',
    Dragon = 'DRAGON',
    Dark ='DARK',
    Fairy ='FAIRY'
}