import { IPokemon } from "./Pokemon/Pokemon";
import { ItemEffect } from "./PremadeItems";

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