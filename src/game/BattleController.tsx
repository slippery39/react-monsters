import { Status, Pokemon, Technique, ElementType, Player } from './interfaces';
import {createCharizard,createBlastoise,createVenusaur} from './premadePokemon';

export enum BattleEventType {
    UseMove = 'use-move',
    SwitchPokemon = 'switch-pokemon',
    UseItem = 'use-item',
    //non user initiated events can happen here too, (like poison damage, pokemon unable to move because of stun,confusion or frozen etc)
    PokemonFainted = 'pokemon-fainted',
    PoisonDamage = 'poison-damage',
    SwitchIn = 'switch-in',
    SwitchOut = 'switch-out'

}

export enum EffectType {
    Damage = 'damage',
    Heal = 'heal',
    Switch = 'switch',
    Poisoned = 'poisoned',
    StatusChange = 'status-change',
    SwitchIn = 'switch-in',
    SwitchOut = 'switch-out',
    None = 'none' //used in cases where nothing happaned (i.e an attack missed or something)
}

export interface Effect {
    pokemonId:number,
    targetPokemonId:number,
    type: EffectType, //should be enum?
    target: string, //should be enum?,
    targetName: string,
    targetId: number
    targetFinalHealth: number,
    targetDamageTaken:number,
    effectiveness: string,
    message: string
    status?: Status
}

export interface BattleEvent {
    type: BattleEventType,
    message: string,
    effects: Array<Effect>,
}

export interface BattleEventsLog {
    //state: string,
    events: Array<BattleEvent>
}

export interface UseMoveAction {
    playerId: number,
    pokemonId: number,
    moveId: number
    type: 'use-move-action'
}

export interface SwitchPokemonAction {
    playerId: number
    switchPokemonId: number
    type: 'switch-pokemon-action'
}

export interface UseItemAction {
    playerId: number
    itemId: number
    type: 'use-item-action'
}

export type BattleAction = UseMoveAction | SwitchPokemonAction | UseItemAction



/*
Allow input of actions,
Once both players have inputted their actions calculate the turn log (We will use the fake one for now.)
*/

//first part of damage =   ( ( (2*level) * Power * Attack / Defence)  / 50 ) + 2 ) * Modifier
//modifier = Critical * random * STAB * Type



//Calculates the base damage before any modifiers (type effectiveness, crit etc.)
export function GetBaseDamage(attackingPokemon: Pokemon, defendingPokemon: Pokemon, techUsed: Technique) {
    const level = 100; //constant for level since we aren't dealing with that stuff now.
    const Power = techUsed.power;
    const Attack = techUsed.damageType === 'physical' ? attackingPokemon.currentStats.attack : attackingPokemon.currentStats.specialAttack;
    const Defence = techUsed.damageType === 'physical' ? defendingPokemon.currentStats.defence : defendingPokemon.currentStats.specialDefence;

    //todo: this is a mess, clean this up.
    return Math.ceil(((((((2 * level) / 5) + 2) * Power * (Attack / Defence)) / 50) + 2));
}

//Gets the type effectiveness of the technique used on the defending pokemon.
export function GetTypeMod(defendingElements: Array<ElementType>, elementOfAttack: ElementType) {
    let effectivenessMap = new Map<string, number>();

    //Effectivenss Map Generated Through Excel File.
    effectivenessMap.set(ElementType.Normal + '-' + ElementType.Normal, 1); effectivenessMap.set(ElementType.Normal + '-' + ElementType.Fighting, 1); effectivenessMap.set(ElementType.Normal + '-' + ElementType.Flying, 1); effectivenessMap.set(ElementType.Normal + '-' + ElementType.Poison, 1); effectivenessMap.set(ElementType.Normal + '-' + ElementType.Ground, 1); effectivenessMap.set(ElementType.Normal + '-' + ElementType.Rock, 0.5); effectivenessMap.set(ElementType.Normal + '-' + ElementType.Bug, 1); effectivenessMap.set(ElementType.Normal + '-' + ElementType.Ghost, 0); effectivenessMap.set(ElementType.Normal + '-' + ElementType.Steel, 0.5); effectivenessMap.set(ElementType.Normal + '-' + ElementType.Fire, 1); effectivenessMap.set(ElementType.Normal + '-' + ElementType.Water, 1); effectivenessMap.set(ElementType.Normal + '-' + ElementType.Grass, 1); effectivenessMap.set(ElementType.Normal + '-' + ElementType.Electric, 1); effectivenessMap.set(ElementType.Normal + '-' + ElementType.Psychic, 1); effectivenessMap.set(ElementType.Normal + '-' + ElementType.Ice, 1); effectivenessMap.set(ElementType.Normal + '-' + ElementType.Dragon, 1); effectivenessMap.set(ElementType.Normal + '-' + ElementType.Dark, 1); effectivenessMap.set(ElementType.Normal + '-' + ElementType.Fairy, 1);
    effectivenessMap.set(ElementType.Fighting + '-' + ElementType.Normal, 2); effectivenessMap.set(ElementType.Fighting + '-' + ElementType.Fighting, 1); effectivenessMap.set(ElementType.Fighting + '-' + ElementType.Flying, 0.5); effectivenessMap.set(ElementType.Fighting + '-' + ElementType.Poison, 0.5); effectivenessMap.set(ElementType.Fighting + '-' + ElementType.Ground, 1); effectivenessMap.set(ElementType.Fighting + '-' + ElementType.Rock, 2); effectivenessMap.set(ElementType.Fighting + '-' + ElementType.Bug, 0.5); effectivenessMap.set(ElementType.Fighting + '-' + ElementType.Ghost, 0); effectivenessMap.set(ElementType.Fighting + '-' + ElementType.Steel, 2); effectivenessMap.set(ElementType.Fighting + '-' + ElementType.Fire, 1); effectivenessMap.set(ElementType.Fighting + '-' + ElementType.Water, 1); effectivenessMap.set(ElementType.Fighting + '-' + ElementType.Grass, 1); effectivenessMap.set(ElementType.Fighting + '-' + ElementType.Electric, 1); effectivenessMap.set(ElementType.Fighting + '-' + ElementType.Psychic, 0.5); effectivenessMap.set(ElementType.Fighting + '-' + ElementType.Ice, 2); effectivenessMap.set(ElementType.Fighting + '-' + ElementType.Dragon, 1); effectivenessMap.set(ElementType.Fighting + '-' + ElementType.Dark, 2); effectivenessMap.set(ElementType.Fighting + '-' + ElementType.Fairy, 0.5);
    effectivenessMap.set(ElementType.Flying + '-' + ElementType.Normal, 1); effectivenessMap.set(ElementType.Flying + '-' + ElementType.Fighting, 2); effectivenessMap.set(ElementType.Flying + '-' + ElementType.Flying, 1); effectivenessMap.set(ElementType.Flying + '-' + ElementType.Poison, 1); effectivenessMap.set(ElementType.Flying + '-' + ElementType.Ground, 1); effectivenessMap.set(ElementType.Flying + '-' + ElementType.Rock, 0.5); effectivenessMap.set(ElementType.Flying + '-' + ElementType.Bug, 2); effectivenessMap.set(ElementType.Flying + '-' + ElementType.Ghost, 1); effectivenessMap.set(ElementType.Flying + '-' + ElementType.Steel, 0.5); effectivenessMap.set(ElementType.Flying + '-' + ElementType.Fire, 1); effectivenessMap.set(ElementType.Flying + '-' + ElementType.Water, 1); effectivenessMap.set(ElementType.Flying + '-' + ElementType.Grass, 2); effectivenessMap.set(ElementType.Flying + '-' + ElementType.Electric, 0.5); effectivenessMap.set(ElementType.Flying + '-' + ElementType.Psychic, 1); effectivenessMap.set(ElementType.Flying + '-' + ElementType.Ice, 1); effectivenessMap.set(ElementType.Flying + '-' + ElementType.Dragon, 1); effectivenessMap.set(ElementType.Flying + '-' + ElementType.Dark, 1); effectivenessMap.set(ElementType.Flying + '-' + ElementType.Fairy, 1);
    effectivenessMap.set(ElementType.Poison + '-' + ElementType.Normal, 1); effectivenessMap.set(ElementType.Poison + '-' + ElementType.Fighting, 1); effectivenessMap.set(ElementType.Poison + '-' + ElementType.Flying, 1); effectivenessMap.set(ElementType.Poison + '-' + ElementType.Poison, 0.5); effectivenessMap.set(ElementType.Poison + '-' + ElementType.Ground, 0.5); effectivenessMap.set(ElementType.Poison + '-' + ElementType.Rock, 0.5); effectivenessMap.set(ElementType.Poison + '-' + ElementType.Bug, 1); effectivenessMap.set(ElementType.Poison + '-' + ElementType.Ghost, 0.5); effectivenessMap.set(ElementType.Poison + '-' + ElementType.Steel, 0); effectivenessMap.set(ElementType.Poison + '-' + ElementType.Fire, 1); effectivenessMap.set(ElementType.Poison + '-' + ElementType.Water, 1); effectivenessMap.set(ElementType.Poison + '-' + ElementType.Grass, 2); effectivenessMap.set(ElementType.Poison + '-' + ElementType.Electric, 1); effectivenessMap.set(ElementType.Poison + '-' + ElementType.Psychic, 1); effectivenessMap.set(ElementType.Poison + '-' + ElementType.Ice, 1); effectivenessMap.set(ElementType.Poison + '-' + ElementType.Dragon, 1); effectivenessMap.set(ElementType.Poison + '-' + ElementType.Dark, 1); effectivenessMap.set(ElementType.Poison + '-' + ElementType.Fairy, 2);
    effectivenessMap.set(ElementType.Ground + '-' + ElementType.Normal, 1); effectivenessMap.set(ElementType.Ground + '-' + ElementType.Fighting, 1); effectivenessMap.set(ElementType.Ground + '-' + ElementType.Flying, 0); effectivenessMap.set(ElementType.Ground + '-' + ElementType.Poison, 2); effectivenessMap.set(ElementType.Ground + '-' + ElementType.Ground, 1); effectivenessMap.set(ElementType.Ground + '-' + ElementType.Rock, 2); effectivenessMap.set(ElementType.Ground + '-' + ElementType.Bug, 0.5); effectivenessMap.set(ElementType.Ground + '-' + ElementType.Ghost, 1); effectivenessMap.set(ElementType.Ground + '-' + ElementType.Steel, 2); effectivenessMap.set(ElementType.Ground + '-' + ElementType.Fire, 2); effectivenessMap.set(ElementType.Ground + '-' + ElementType.Water, 1); effectivenessMap.set(ElementType.Ground + '-' + ElementType.Grass, 0.5); effectivenessMap.set(ElementType.Ground + '-' + ElementType.Electric, 2); effectivenessMap.set(ElementType.Ground + '-' + ElementType.Psychic, 1); effectivenessMap.set(ElementType.Ground + '-' + ElementType.Ice, 1); effectivenessMap.set(ElementType.Ground + '-' + ElementType.Dragon, 1); effectivenessMap.set(ElementType.Ground + '-' + ElementType.Dark, 1); effectivenessMap.set(ElementType.Ground + '-' + ElementType.Fairy, 1);
    effectivenessMap.set(ElementType.Rock + '-' + ElementType.Normal, 1); effectivenessMap.set(ElementType.Rock + '-' + ElementType.Fighting, 0.5); effectivenessMap.set(ElementType.Rock + '-' + ElementType.Flying, 2); effectivenessMap.set(ElementType.Rock + '-' + ElementType.Poison, 1); effectivenessMap.set(ElementType.Rock + '-' + ElementType.Ground, 0.5); effectivenessMap.set(ElementType.Rock + '-' + ElementType.Rock, 1); effectivenessMap.set(ElementType.Rock + '-' + ElementType.Bug, 2); effectivenessMap.set(ElementType.Rock + '-' + ElementType.Ghost, 1); effectivenessMap.set(ElementType.Rock + '-' + ElementType.Steel, 0.5); effectivenessMap.set(ElementType.Rock + '-' + ElementType.Fire, 2); effectivenessMap.set(ElementType.Rock + '-' + ElementType.Water, 1); effectivenessMap.set(ElementType.Rock + '-' + ElementType.Grass, 1); effectivenessMap.set(ElementType.Rock + '-' + ElementType.Electric, 1); effectivenessMap.set(ElementType.Rock + '-' + ElementType.Psychic, 1); effectivenessMap.set(ElementType.Rock + '-' + ElementType.Ice, 2); effectivenessMap.set(ElementType.Rock + '-' + ElementType.Dragon, 1); effectivenessMap.set(ElementType.Rock + '-' + ElementType.Dark, 1); effectivenessMap.set(ElementType.Rock + '-' + ElementType.Fairy, 1);
    effectivenessMap.set(ElementType.Bug + '-' + ElementType.Normal, 1); effectivenessMap.set(ElementType.Bug + '-' + ElementType.Fighting, 0.5); effectivenessMap.set(ElementType.Bug + '-' + ElementType.Flying, 0.5); effectivenessMap.set(ElementType.Bug + '-' + ElementType.Poison, 0.5); effectivenessMap.set(ElementType.Bug + '-' + ElementType.Ground, 1); effectivenessMap.set(ElementType.Bug + '-' + ElementType.Rock, 1); effectivenessMap.set(ElementType.Bug + '-' + ElementType.Bug, 1); effectivenessMap.set(ElementType.Bug + '-' + ElementType.Ghost, 0.5); effectivenessMap.set(ElementType.Bug + '-' + ElementType.Steel, 0.5); effectivenessMap.set(ElementType.Bug + '-' + ElementType.Fire, 0.5); effectivenessMap.set(ElementType.Bug + '-' + ElementType.Water, 1); effectivenessMap.set(ElementType.Bug + '-' + ElementType.Grass, 2); effectivenessMap.set(ElementType.Bug + '-' + ElementType.Electric, 1); effectivenessMap.set(ElementType.Bug + '-' + ElementType.Psychic, 2); effectivenessMap.set(ElementType.Bug + '-' + ElementType.Ice, 1); effectivenessMap.set(ElementType.Bug + '-' + ElementType.Dragon, 1); effectivenessMap.set(ElementType.Bug + '-' + ElementType.Dark, 2); effectivenessMap.set(ElementType.Bug + '-' + ElementType.Fairy, 0.5);
    effectivenessMap.set(ElementType.Ghost + '-' + ElementType.Normal, 0); effectivenessMap.set(ElementType.Ghost + '-' + ElementType.Fighting, 1); effectivenessMap.set(ElementType.Ghost + '-' + ElementType.Flying, 1); effectivenessMap.set(ElementType.Ghost + '-' + ElementType.Poison, 1); effectivenessMap.set(ElementType.Ghost + '-' + ElementType.Ground, 1); effectivenessMap.set(ElementType.Ghost + '-' + ElementType.Rock, 1); effectivenessMap.set(ElementType.Ghost + '-' + ElementType.Bug, 1); effectivenessMap.set(ElementType.Ghost + '-' + ElementType.Ghost, 2); effectivenessMap.set(ElementType.Ghost + '-' + ElementType.Steel, 1); effectivenessMap.set(ElementType.Ghost + '-' + ElementType.Fire, 1); effectivenessMap.set(ElementType.Ghost + '-' + ElementType.Water, 1); effectivenessMap.set(ElementType.Ghost + '-' + ElementType.Grass, 1); effectivenessMap.set(ElementType.Ghost + '-' + ElementType.Electric, 1); effectivenessMap.set(ElementType.Ghost + '-' + ElementType.Psychic, 2); effectivenessMap.set(ElementType.Ghost + '-' + ElementType.Ice, 1); effectivenessMap.set(ElementType.Ghost + '-' + ElementType.Dragon, 1); effectivenessMap.set(ElementType.Ghost + '-' + ElementType.Dark, 0.5); effectivenessMap.set(ElementType.Ghost + '-' + ElementType.Fairy, 1);
    effectivenessMap.set(ElementType.Steel + '-' + ElementType.Normal, 1); effectivenessMap.set(ElementType.Steel + '-' + ElementType.Fighting, 1); effectivenessMap.set(ElementType.Steel + '-' + ElementType.Flying, 1); effectivenessMap.set(ElementType.Steel + '-' + ElementType.Poison, 1); effectivenessMap.set(ElementType.Steel + '-' + ElementType.Ground, 1); effectivenessMap.set(ElementType.Steel + '-' + ElementType.Rock, 2); effectivenessMap.set(ElementType.Steel + '-' + ElementType.Bug, 1); effectivenessMap.set(ElementType.Steel + '-' + ElementType.Ghost, 1); effectivenessMap.set(ElementType.Steel + '-' + ElementType.Steel, 0.5); effectivenessMap.set(ElementType.Steel + '-' + ElementType.Fire, 0.5); effectivenessMap.set(ElementType.Steel + '-' + ElementType.Water, 0.5); effectivenessMap.set(ElementType.Steel + '-' + ElementType.Grass, 1); effectivenessMap.set(ElementType.Steel + '-' + ElementType.Electric, 0.5); effectivenessMap.set(ElementType.Steel + '-' + ElementType.Psychic, 1); effectivenessMap.set(ElementType.Steel + '-' + ElementType.Ice, 2); effectivenessMap.set(ElementType.Steel + '-' + ElementType.Dragon, 1); effectivenessMap.set(ElementType.Steel + '-' + ElementType.Dark, 1); effectivenessMap.set(ElementType.Steel + '-' + ElementType.Fairy, 2);
    effectivenessMap.set(ElementType.Fire + '-' + ElementType.Normal, 1); effectivenessMap.set(ElementType.Fire + '-' + ElementType.Fighting, 1); effectivenessMap.set(ElementType.Fire + '-' + ElementType.Flying, 1); effectivenessMap.set(ElementType.Fire + '-' + ElementType.Poison, 1); effectivenessMap.set(ElementType.Fire + '-' + ElementType.Ground, 1); effectivenessMap.set(ElementType.Fire + '-' + ElementType.Rock, 0.5); effectivenessMap.set(ElementType.Fire + '-' + ElementType.Bug, 2); effectivenessMap.set(ElementType.Fire + '-' + ElementType.Ghost, 1); effectivenessMap.set(ElementType.Fire + '-' + ElementType.Steel, 2); effectivenessMap.set(ElementType.Fire + '-' + ElementType.Fire, 0.5); effectivenessMap.set(ElementType.Fire + '-' + ElementType.Water, 0.5); effectivenessMap.set(ElementType.Fire + '-' + ElementType.Grass, 2); effectivenessMap.set(ElementType.Fire + '-' + ElementType.Electric, 1); effectivenessMap.set(ElementType.Fire + '-' + ElementType.Psychic, 1); effectivenessMap.set(ElementType.Fire + '-' + ElementType.Ice, 2); effectivenessMap.set(ElementType.Fire + '-' + ElementType.Dragon, 0.5); effectivenessMap.set(ElementType.Fire + '-' + ElementType.Dark, 1); effectivenessMap.set(ElementType.Fire + '-' + ElementType.Fairy, 1);
    effectivenessMap.set(ElementType.Water + '-' + ElementType.Normal, 1); effectivenessMap.set(ElementType.Water + '-' + ElementType.Fighting, 1); effectivenessMap.set(ElementType.Water + '-' + ElementType.Flying, 1); effectivenessMap.set(ElementType.Water + '-' + ElementType.Poison, 1); effectivenessMap.set(ElementType.Water + '-' + ElementType.Ground, 2); effectivenessMap.set(ElementType.Water + '-' + ElementType.Rock, 2); effectivenessMap.set(ElementType.Water + '-' + ElementType.Bug, 1); effectivenessMap.set(ElementType.Water + '-' + ElementType.Ghost, 1); effectivenessMap.set(ElementType.Water + '-' + ElementType.Steel, 1); effectivenessMap.set(ElementType.Water + '-' + ElementType.Fire, 2); effectivenessMap.set(ElementType.Water + '-' + ElementType.Water, 0.5); effectivenessMap.set(ElementType.Water + '-' + ElementType.Grass, 0.5); effectivenessMap.set(ElementType.Water + '-' + ElementType.Electric, 1); effectivenessMap.set(ElementType.Water + '-' + ElementType.Psychic, 1); effectivenessMap.set(ElementType.Water + '-' + ElementType.Ice, 1); effectivenessMap.set(ElementType.Water + '-' + ElementType.Dragon, 0.5); effectivenessMap.set(ElementType.Water + '-' + ElementType.Dark, 1); effectivenessMap.set(ElementType.Water + '-' + ElementType.Fairy, 1);
    effectivenessMap.set(ElementType.Grass + '-' + ElementType.Normal, 1); effectivenessMap.set(ElementType.Grass + '-' + ElementType.Fighting, 1); effectivenessMap.set(ElementType.Grass + '-' + ElementType.Flying, 0.5); effectivenessMap.set(ElementType.Grass + '-' + ElementType.Poison, 0.5); effectivenessMap.set(ElementType.Grass + '-' + ElementType.Ground, 2); effectivenessMap.set(ElementType.Grass + '-' + ElementType.Rock, 2); effectivenessMap.set(ElementType.Grass + '-' + ElementType.Bug, 0.5); effectivenessMap.set(ElementType.Grass + '-' + ElementType.Ghost, 1); effectivenessMap.set(ElementType.Grass + '-' + ElementType.Steel, 0.5); effectivenessMap.set(ElementType.Grass + '-' + ElementType.Fire, 0.5); effectivenessMap.set(ElementType.Grass + '-' + ElementType.Water, 2); effectivenessMap.set(ElementType.Grass + '-' + ElementType.Grass, 0.5); effectivenessMap.set(ElementType.Grass + '-' + ElementType.Electric, 1); effectivenessMap.set(ElementType.Grass + '-' + ElementType.Psychic, 1); effectivenessMap.set(ElementType.Grass + '-' + ElementType.Ice, 1); effectivenessMap.set(ElementType.Grass + '-' + ElementType.Dragon, 0.5); effectivenessMap.set(ElementType.Grass + '-' + ElementType.Dark, 1); effectivenessMap.set(ElementType.Grass + '-' + ElementType.Fairy, 1);
    effectivenessMap.set(ElementType.Electric + '-' + ElementType.Normal, 1); effectivenessMap.set(ElementType.Electric + '-' + ElementType.Fighting, 1); effectivenessMap.set(ElementType.Electric + '-' + ElementType.Flying, 2); effectivenessMap.set(ElementType.Electric + '-' + ElementType.Poison, 1); effectivenessMap.set(ElementType.Electric + '-' + ElementType.Ground, 0); effectivenessMap.set(ElementType.Electric + '-' + ElementType.Rock, 1); effectivenessMap.set(ElementType.Electric + '-' + ElementType.Bug, 1); effectivenessMap.set(ElementType.Electric + '-' + ElementType.Ghost, 1); effectivenessMap.set(ElementType.Electric + '-' + ElementType.Steel, 1); effectivenessMap.set(ElementType.Electric + '-' + ElementType.Fire, 1); effectivenessMap.set(ElementType.Electric + '-' + ElementType.Water, 2); effectivenessMap.set(ElementType.Electric + '-' + ElementType.Grass, 0.5); effectivenessMap.set(ElementType.Electric + '-' + ElementType.Electric, 0.5); effectivenessMap.set(ElementType.Electric + '-' + ElementType.Psychic, 1); effectivenessMap.set(ElementType.Electric + '-' + ElementType.Ice, 1); effectivenessMap.set(ElementType.Electric + '-' + ElementType.Dragon, 0.5); effectivenessMap.set(ElementType.Electric + '-' + ElementType.Dark, 1); effectivenessMap.set(ElementType.Electric + '-' + ElementType.Fairy, 1);
    effectivenessMap.set(ElementType.Psychic + '-' + ElementType.Normal, 1); effectivenessMap.set(ElementType.Psychic + '-' + ElementType.Fighting, 2); effectivenessMap.set(ElementType.Psychic + '-' + ElementType.Flying, 1); effectivenessMap.set(ElementType.Psychic + '-' + ElementType.Poison, 2); effectivenessMap.set(ElementType.Psychic + '-' + ElementType.Ground, 1); effectivenessMap.set(ElementType.Psychic + '-' + ElementType.Rock, 1); effectivenessMap.set(ElementType.Psychic + '-' + ElementType.Bug, 1); effectivenessMap.set(ElementType.Psychic + '-' + ElementType.Ghost, 1); effectivenessMap.set(ElementType.Psychic + '-' + ElementType.Steel, 0.5); effectivenessMap.set(ElementType.Psychic + '-' + ElementType.Fire, 1); effectivenessMap.set(ElementType.Psychic + '-' + ElementType.Water, 1); effectivenessMap.set(ElementType.Psychic + '-' + ElementType.Grass, 1); effectivenessMap.set(ElementType.Psychic + '-' + ElementType.Electric, 1); effectivenessMap.set(ElementType.Psychic + '-' + ElementType.Psychic, 0.5); effectivenessMap.set(ElementType.Psychic + '-' + ElementType.Ice, 1); effectivenessMap.set(ElementType.Psychic + '-' + ElementType.Dragon, 1); effectivenessMap.set(ElementType.Psychic + '-' + ElementType.Dark, 0); effectivenessMap.set(ElementType.Psychic + '-' + ElementType.Fairy, 1);
    effectivenessMap.set(ElementType.Ice + '-' + ElementType.Normal, 1); effectivenessMap.set(ElementType.Ice + '-' + ElementType.Fighting, 1); effectivenessMap.set(ElementType.Ice + '-' + ElementType.Flying, 2); effectivenessMap.set(ElementType.Ice + '-' + ElementType.Poison, 1); effectivenessMap.set(ElementType.Ice + '-' + ElementType.Ground, 2); effectivenessMap.set(ElementType.Ice + '-' + ElementType.Rock, 1); effectivenessMap.set(ElementType.Ice + '-' + ElementType.Bug, 1); effectivenessMap.set(ElementType.Ice + '-' + ElementType.Ghost, 1); effectivenessMap.set(ElementType.Ice + '-' + ElementType.Steel, 0.5); effectivenessMap.set(ElementType.Ice + '-' + ElementType.Fire, 0.5); effectivenessMap.set(ElementType.Ice + '-' + ElementType.Water, 0.5); effectivenessMap.set(ElementType.Ice + '-' + ElementType.Grass, 2); effectivenessMap.set(ElementType.Ice + '-' + ElementType.Electric, 1); effectivenessMap.set(ElementType.Ice + '-' + ElementType.Psychic, 1); effectivenessMap.set(ElementType.Ice + '-' + ElementType.Ice, 0.5); effectivenessMap.set(ElementType.Ice + '-' + ElementType.Dragon, 2); effectivenessMap.set(ElementType.Ice + '-' + ElementType.Dark, 1); effectivenessMap.set(ElementType.Ice + '-' + ElementType.Fairy, 1);
    effectivenessMap.set(ElementType.Dragon + '-' + ElementType.Normal, 1); effectivenessMap.set(ElementType.Dragon + '-' + ElementType.Fighting, 1); effectivenessMap.set(ElementType.Dragon + '-' + ElementType.Flying, 1); effectivenessMap.set(ElementType.Dragon + '-' + ElementType.Poison, 1); effectivenessMap.set(ElementType.Dragon + '-' + ElementType.Ground, 1); effectivenessMap.set(ElementType.Dragon + '-' + ElementType.Rock, 1); effectivenessMap.set(ElementType.Dragon + '-' + ElementType.Bug, 1); effectivenessMap.set(ElementType.Dragon + '-' + ElementType.Ghost, 1); effectivenessMap.set(ElementType.Dragon + '-' + ElementType.Steel, 0.5); effectivenessMap.set(ElementType.Dragon + '-' + ElementType.Fire, 1); effectivenessMap.set(ElementType.Dragon + '-' + ElementType.Water, 1); effectivenessMap.set(ElementType.Dragon + '-' + ElementType.Grass, 1); effectivenessMap.set(ElementType.Dragon + '-' + ElementType.Electric, 1); effectivenessMap.set(ElementType.Dragon + '-' + ElementType.Psychic, 1); effectivenessMap.set(ElementType.Dragon + '-' + ElementType.Ice, 1); effectivenessMap.set(ElementType.Dragon + '-' + ElementType.Dragon, 2); effectivenessMap.set(ElementType.Dragon + '-' + ElementType.Dark, 1); effectivenessMap.set(ElementType.Dragon + '-' + ElementType.Fairy, 0);
    effectivenessMap.set(ElementType.Dark + '-' + ElementType.Normal, 1); effectivenessMap.set(ElementType.Dark + '-' + ElementType.Fighting, 0.5); effectivenessMap.set(ElementType.Dark + '-' + ElementType.Flying, 1); effectivenessMap.set(ElementType.Dark + '-' + ElementType.Poison, 1); effectivenessMap.set(ElementType.Dark + '-' + ElementType.Ground, 1); effectivenessMap.set(ElementType.Dark + '-' + ElementType.Rock, 1); effectivenessMap.set(ElementType.Dark + '-' + ElementType.Bug, 1); effectivenessMap.set(ElementType.Dark + '-' + ElementType.Ghost, 2); effectivenessMap.set(ElementType.Dark + '-' + ElementType.Steel, 1); effectivenessMap.set(ElementType.Dark + '-' + ElementType.Fire, 1); effectivenessMap.set(ElementType.Dark + '-' + ElementType.Water, 1); effectivenessMap.set(ElementType.Dark + '-' + ElementType.Grass, 1); effectivenessMap.set(ElementType.Dark + '-' + ElementType.Electric, 1); effectivenessMap.set(ElementType.Dark + '-' + ElementType.Psychic, 2); effectivenessMap.set(ElementType.Dark + '-' + ElementType.Ice, 1); effectivenessMap.set(ElementType.Dark + '-' + ElementType.Dragon, 1); effectivenessMap.set(ElementType.Dark + '-' + ElementType.Dark, 0.5); effectivenessMap.set(ElementType.Dark + '-' + ElementType.Fairy, 0.5);
    effectivenessMap.set(ElementType.Fairy + '-' + ElementType.Normal, 1); effectivenessMap.set(ElementType.Fairy + '-' + ElementType.Fighting, 2); effectivenessMap.set(ElementType.Fairy + '-' + ElementType.Flying, 1); effectivenessMap.set(ElementType.Fairy + '-' + ElementType.Poison, 0.5); effectivenessMap.set(ElementType.Fairy + '-' + ElementType.Ground, 1); effectivenessMap.set(ElementType.Fairy + '-' + ElementType.Rock, 1); effectivenessMap.set(ElementType.Fairy + '-' + ElementType.Bug, 1); effectivenessMap.set(ElementType.Fairy + '-' + ElementType.Ghost, 1); effectivenessMap.set(ElementType.Fairy + '-' + ElementType.Steel, 0.5); effectivenessMap.set(ElementType.Fairy + '-' + ElementType.Fire, 0.5); effectivenessMap.set(ElementType.Fairy + '-' + ElementType.Water, 1); effectivenessMap.set(ElementType.Fairy + '-' + ElementType.Grass, 1); effectivenessMap.set(ElementType.Fairy + '-' + ElementType.Electric, 1); effectivenessMap.set(ElementType.Fairy + '-' + ElementType.Psychic, 1); effectivenessMap.set(ElementType.Fairy + '-' + ElementType.Ice, 1); effectivenessMap.set(ElementType.Fairy + '-' + ElementType.Dragon, 2); effectivenessMap.set(ElementType.Fairy + '-' + ElementType.Dark, 2); effectivenessMap.set(ElementType.Fairy + '-' + ElementType.Fairy, 1);

    //The default value is to satisfy typescript, but we should never get it.
    let effectiveness: number = effectivenessMap.get(elementOfAttack + "-" + defendingElements[0]) || 1
    //The default value is to satisfy typescript, but we should never get it.
    if (defendingElements.length > 1) {
        effectiveness *= effectivenessMap.get(elementOfAttack + "-" + defendingElements[1]) || 1
    }

    return effectiveness;
}


//TODO: test this
export function GetDamageModifier(attackingPokemon: Pokemon, defendingPokemon: Pokemon, techUsed: Technique,options?:{autoCrit?:boolean,autoAmt?:boolean}) {

    function lerp(v0: number, v1: number, t: number) {
        return (1 - t) * v0 + t * v1;
    }

    function GetCritical() {

        //this option is to be able to test crits without randomness
        if (options?.autoCrit){
            return 2;
        }

        const chance = 6.25
        const roll = Math.random() * 100;
        if (roll <= chance) {
            return 2;
        }
        else {
            return 1;
        }
    }
    function GetRandomAmt() {

        //this option is to be able to test this amount modifier without randomness
        if (options?.autoAmt){
            return 1;
        }

        const perc = Math.random() * 1;
        //needs to be a random value between 0.85 and 1.00
        return lerp(0.85, 1.00, perc);
    }
    function GetSTAB() {
        if (attackingPokemon.elementalTypes.filter(e => {
            return e === techUsed.elementalType
        }).length > 0) {
            return 1.25
        }
        else {
            return 1;
        }
    }
    function GetEffectiveness() {
        return GetTypeMod(defendingPokemon.elementalTypes, techUsed.elementalType)
    }


    return GetCritical() * GetRandomAmt() * GetSTAB() * GetEffectiveness();
}

class BattleController {
    //need to store the state here somehow.
    actions: Array<BattleAction> = [];
    players: Array<Player> = []
    turnLog: Array<BattleEvent> = [];

    constructor(players:Array<Player>){
        this.players = players;
    }

    GetTurnLog() : Array<BattleEvent>{
        return this.turnLog;
    }

    SetPlayerAction(action: BattleAction) {
        //check the id, 
        //update the actions object
        //if both actions have been submitted then start calculating the turn.
        /*
        if (!this.actions.filter(act => {
            return act.playerId === action.playerId
        })) 
        */{
            this.actions.push(action);
        }
        /*
        else {
            console.error(`cannot add action, action already made by player ${action.playerId}`)
        }*/

        //maybe some error checking to make sure that the actions is always 2.

        if (this.actions.length === 2) {
            this.CalculateTurn();
        }
    }

    GetActionPriority(action: BattleAction) {

        //priorities are defined from -5 to +7  https://bulbapedia.bulbagarden.net/wiki/Priority
        let priority: number = 0;
        switch (action.type) {
            case 'use-move-action': {
                priority = 0;
                break;
            }
            case 'use-item-action': {
                priority = 6;
                break;
            }
            case 'switch-pokemon-action': {
                priority = 7;
                break;
            }
        }
        return priority;
    }
    GetSpeedPriority() {
        return this.actions.map(act => {
            const player = this.players.find(p => p.id === act.playerId);
            if (player === undefined) {
                console.error(`cannot find player with id ${act.playerId}`)
                return {
                    action: act,
                    speed: 0
                }
            }
            const activePokemon = player.pokemon.find(p => p.id === player.currentPokemonId);

            if (activePokemon === undefined) {
                console.log(`cannot find pokemon with id ${player.currentPokemonId}`)
                return {
                    action: act,
                    speed: 0
                }
            }
            return {
                action: act,
                speed: activePokemon.currentStats.speed
            }
        }).sort((a, b) => a.speed - b.speed);
    }

    GetMoveOrder() {
        const actionPriorities = this.actions.map(act => {
            return {
                playerId: act.playerId,
                priority: this.GetActionPriority(act),
                action: act
            }
        }).sort((a, b) => a.priority - b.priority);

        let actionOrder: Array<BattleAction> = [];

        //2 cases here, the priority is equal, or the priorities are different
        if (actionPriorities[0].priority === actionPriorities[1].priority) {
            //search for the active player's pokemons speed.
            actionOrder = this.GetSpeedPriority().map(priority => priority.action);
        }
        else {
            //they should be sorted already.
            actionOrder = actionPriorities.map(priority => priority.action);
        }
        return actionOrder;
    }

    CalculateTurn() {
        /*
        const turnLog = {
            turnId:1,
            events:[
                {}//use move etc.
            ]
        }
        */
        const actionOrder = this.GetMoveOrder();
        //lets run the moves.
        //this.StartTurn();
        this.DoAction(actionOrder[0]);
        //this.CheckStateBasedEffects();
        this.DoAction(actionOrder[1]);
        //this.CheckStateBasedEffects();
        //this.EndTurn():

        //check state-based effects here (i.e pokemon dying etc)
    }

    SwitchPokemon(playerId: number, pokemonInId: number) {

        //not yet implemented, just for practice.
        const player = this.players.find(p => p.id === playerId);
        const pokemon = player?.pokemon.find(p => p.id === pokemonInId);


        if (player === undefined || pokemon === undefined) {
            console.error('error in switching pokemon');
            //should never get to this point?
            return;
        }
        const pokemonOutId = player.currentPokemonId;
        player.currentPokemonId = pokemon.id;

        /*
        this.turnLog.push({
                        playerId: playerId,
            pokemonInId: pokemonInId,
            pokemonOutId: pokemonOutId
        });
        */
    }
    UseItem(playerId: number, itemId: number) {
        //not implemented yet;
    }

    UseTechnique(playerId: number, pokemonId: number, techniqueId: number) {

        const player = this.players.find(p => p.id === playerId);
        const pokemon = player?.pokemon.find(p => p.id === pokemonId);
        const move = pokemon?.techniques.find(t => t.id === techniqueId);

        //This should work as long as it stays 1v1
        const defendingPlayer = this.players.find(p => p !== player);
        const defendingPokemon = defendingPlayer?.pokemon.find(p => p.id === defendingPlayer.currentPokemonId);


        if (player === undefined || pokemon === undefined || move === undefined || defendingPlayer === undefined || defendingPokemon === undefined) {
            console.error('error in using technique');
            //should never get to this point?
            return;
        }


        //only programming damaging moves for now

        const baseDamage = GetBaseDamage(pokemon, defendingPokemon, move);
        const damageModifier = GetDamageModifier(pokemon, defendingPokemon, move);

        const totalDamage = Math.ceil(baseDamage * damageModifier);

        //apply the damage
        defendingPokemon.currentStats.health -= totalDamage;

        //what do we need in the turn log?
        /*
                type: BattleEventType.UseMove,
                message: 'Charizard used fireblast!',
                effects: [{
                    type: EffectType.Damage,
                    target: 'enemy',
                    targetName: 'Blastoise',
                    targetId: 4,
                    targetFinalHealth: 100,
                    effectiveness: 'super',
                    message: 'it was super effective!'
                }],
            },*/

        //we need to figure out if it was super effective ornot
        //need to move the super effectiveness calculation function out and call it here to find out? or have the damage calculator return
        //all the variables used in an object?
        let effectiveLabel = GetEffectivenessMessage(defendingPokemon, move);

        const log: BattleEvent = 
            {
                type: BattleEventType.UseMove,
                message: `${pokemon.name} used ${move.name}`,
                effects: [{
                    type:EffectType.Damage,
                    //maybe we don't need these anymore
                    target:'opponent',
                    targetName:'opponent',
                    targetId:defendingPokemon.id,
                    pokemonId: pokemon.id,
                    targetPokemonId: defendingPokemon.id,
                    targetFinalHealth: defendingPokemon.currentStats.health,
                    targetDamageTaken: totalDamage,
                    effectiveness: GetTypeMod(defendingPokemon.elementalTypes, move.elementalType).toString(),
                    message: effectiveLabel
                }]
            }

            this.turnLog.push(log);
        }
      
    
    

    DoAction(action: BattleAction) {
        switch (action.type) {
            case 'switch-pokemon-action': {
                break;
                //this.SwitchPokemon(action.playerId,action.switchPokemonId);
            }
            case 'use-item-action': {
                break;
                //this.UseItem(action.playerId,action.itemId);
            }
            case 'use-move-action': {
                this.UseTechnique(action.playerId,action.pokemonId,action.moveId);
                break;                
            }
        }
    }
    CheckDeaths() {
        //check if any pokemon have died.

    }

};

function GetEffectivenessMessage(defendingPokemon: Pokemon, move: Technique) {
    const effectiveness = GetTypeMod(defendingPokemon.elementalTypes, move.elementalType);

    let effectiveLabel = '';
    switch (effectiveness) {
        case 0.25: {
            effectiveLabel = "It wasn't very effective";
            break;
        }
        case 0.5: {
            effectiveLabel = "It wasn't very effective";
            break;
        }
        case 1.0: {
            effectiveLabel = "Normal Effectiveness";
            break;
        }
        case 2.0: {
            effectiveLabel = "It was super effective";
            break;
        }
        case 4.0: {
            effectiveLabel = "It was super effective";
            break;
        }
        default: {
            break;
        }

    }
    return effectiveLabel;
}

export function getTurnLog(): BattleEventsLog {

    //TODO: Mock this turn log, by auto applying actions
    //lets say Charizard uses fireblast and Blastoise uses HydroPump or something.


    //mock players for now.
    const player1 : Player = {
        id:1,
        name: 'Shayne',
        pokemon:[
            createCharizard(1),
            createVenusaur(2),
            createBlastoise(3)
        ],
        currentPokemonId:1,
        items:[]
    }
    
    const player2 : Player = {
        id:2,
        name:'Bob',
        pokemon:[
            createBlastoise(4),
            createVenusaur(5),
            createCharizard(6)
        ],
        currentPokemonId:4,
        items:[]
    }

    const battle = new BattleController([player1,player2]);

    const moveId1 = player1.pokemon.find(p=>p.id === player1.currentPokemonId)?.techniques[0].id || -1;
    const player1Action: UseMoveAction = {
        type:'use-move-action',
        playerId:player1.id,
        pokemonId:player1.currentPokemonId,
        moveId:moveId1
    }

    const moveId2 = player2.pokemon.find(p=>p.id === player2.currentPokemonId)?.techniques[0].id || -1;
    const player2Action: UseMoveAction = {
        type:'use-move-action',
        playerId:player2.id,
        pokemonId:player2.currentPokemonId,
        moveId:moveId2
    }

    battle.SetPlayerAction(player1Action);
    battle.SetPlayerAction(player2Action);

    const returnLog = {
        events:battle.GetTurnLog()
    }

    console.log(returnLog);
    return returnLog;

    const battleState: BattleEventsLog = {
        events: [
            /*
            {
                type: BattleEventType.UseMove,
                message: 'Charizard used fireblast!',
                effects: [{
                    type: EffectType.Damage,
                    target: 'enemy',
                    targetName: 'Blastoise',
                    targetId: 4,
                    targetFinalHealth: 100,
                    effectiveness: 'super',
                    message: 'it was super effective!'
                }],
            },
            {
                type: BattleEventType.UseMove,
                message: 'Blastoise used Hydropump!',
                effects: [{
                    type: EffectType.Damage,
                    target: 'enemy',
                    targetName: 'charizard',
                    targetId: 1,
                    targetFinalHealth: 50,
                    effectiveness: 'super',
                    message: 'It was super effective!'
                }],
            },
            {
                type: BattleEventType.UseItem,
                message: 'You used a potion on charizard!', //if a message is blank, then it should skip the message?,
                effects: [{
                    type: EffectType.Heal,
                    target: 'enemy',
                    targetName: 'charizard',
                    targetId: 1,
                    targetFinalHealth: 300,
                    effectiveness: 'none',
                    message: 'Charizard healed a little!'
                }],
            },
            {
                type: BattleEventType.UseMove,
                message: 'Charizard used Poison Blast!',
                effects: [{
                    type: EffectType.Damage,
                    target: 'enemy',
                    targetName: 'Blastoise',
                    targetId: 4,
                    targetFinalHealth: 20,
                    effectiveness: 'Not very effective',
                    message: 'It was not very effective!'
                },
                {
                    type: EffectType.Poisoned,
                    target: 'enemy',
                    targetName: 'Blastoise',
                    targetId: 4,
                    targetFinalHealth: 99999,
                    effectiveness: 'none',
                    message: 'Blastoise was poisoned!'
                }
                ],
            },
            {
                type: BattleEventType.PoisonDamage,
                message: '',
                effects: [{
                    type: EffectType.Damage,
                    target: 'enemy',
                    targetName: 'Blastoise',
                    targetFinalHealth: 10,
                    targetId: 4,
                    effectiveness: 'none',
                    message: 'Blastoise was hurt due to poison!'
                }]
            },
            */
           /*
            {
                type: BattleEventType.SwitchOut,
                message: 'Enough Charizard, Come back!',
                effects: [{
                    type: EffectType.SwitchOut,
                    targetName: 'Charizard',
                    target: 'ally',
                    targetId: 1,
                    targetFinalHealth: 9999,
                    effectiveness: 'none',
                    message: ''
                }]
            },
            {
                type: BattleEventType.SwitchIn,
                message: 'Go Venusaur!',
                effects: [
                    {
                        type: EffectType.SwitchIn,
                        targetName: 'Venusaur',
                        target: 'ally',
                        targetId: 2,
                        targetFinalHealth: 9999,
                        effectiveness: 'none',
                        message: ''
                    }
                ]
            }
            */

        ]
    }
    return battleState;
}