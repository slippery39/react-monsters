export interface Stats{
    health:number,
    attack:number,
    defence: number,
    specialAttack:number,
    specialDefence:number,
    speed:number
}

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
 damageType: 'physical' | 'special',
 elementalType:ElementType,
 secondaryEffects?:Array<TechniqueEffect>,
 chance: number
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
    currentPokemonId:number,
    items: Array<Item>
    id:number
}

export enum Status{
    Poison ='poisoned',
    Paralyzed ='paralyzed',
    Sleep='sleep',
    Burned = 'burned',
    Frozen = 'frozen'
}

export interface Pokemon {
    id: number,
    name: string,
    originalStats: Stats
    currentStats: Stats,  
    techniques:Array<Technique>  ,
    status?: Status,
    elementalTypes:Array<ElementType>
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