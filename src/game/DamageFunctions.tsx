import { Pokemon, ElementType, Technique } from "./interfaces";

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
            return true;
        }

        const chance = 6.25
        const roll = Math.random() * 100;
        if (roll <= chance) {
            return true;
        }
        else {
            return false;
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
            return 1.0;
        }
    }
    function GetEffectiveness() {
        return GetTypeMod(defendingPokemon.elementalTypes, techUsed.elementalType)
    }


    const critStrike = GetCritical();
    const critAmt = critStrike ? 2.0 : 1.0;
    const randomAmt = GetRandomAmt();
    const effectiveness = GetEffectiveness();
    const stabBonus = GetSTAB();

    const modInfoObj = {
        critStrike: critStrike,
        critAmt:critAmt,
        stabBonus: stabBonus,
        typeEffectivenessBonus: effectiveness,
        randomDamageMod:randomAmt,
        modValue: critAmt * stabBonus * randomAmt * effectiveness
    }

    return modInfoObj;
}