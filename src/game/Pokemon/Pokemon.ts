import { ElementType } from "game/ElementType";
import { Stat } from "game/Stat";
import { GetSpecies } from "./Species";
import _ from "lodash"
import { GetTech } from "game/Techniques/PremadeTechniques";
import { Technique } from "game/Techniques/Technique";
import { VolatileStatus, VolatileStatusType } from "game/VolatileStatus/VolatileStatus";
import { Status } from "game/HardStatus/HardStatus";
import GetHeldItem, { HeldItem } from "game/HeldItem/HeldItem";
import { GetNature, NatureType } from "game/Natures/Natures";
import GetPokemon, { GetRandomPokemon } from "./PremadePokemon";


export interface StatMultiplier{
    stat:Stat,
    multiplier:number,
    tag:string //a way to temporarily identify the source of the multiplier so that we can remove it if necessary.
}


export enum FieldPosition{
    InAir = 'in-air',
    GroundLevel = 'ground-level',
    BelowGround = 'below-ground'
}


export interface Pokemon {
    id: number,
    name: string,
    originalStats: Stats
    currentStats: Stats,
    techniques: Array<Technique>,
    techniqueUsedLast:String | undefined,
    status: Status,
    elementalTypes: Array<ElementType>,
    canAttackThisTurn: boolean
    statBoosts: Record<Stat, number>,
    statMultipliers: Array<StatMultiplier>
    volatileStatuses: Array<VolatileStatus>,
    heldItem: HeldItem,
    baseStats: Stats,
    ivs: Stats,
    evs: Stats,
    ability: string,
    nature: NatureType,
    weight:number,
    fieldPosition:FieldPosition
    /*
    These variables below are temporary until i can figure out a better way to encapsulate these.
    */
    toxicCount: number, //temporarily placing this and the rest turn count here until i can figure out a better way to structure this.
    restTurnCount: number,
    hasSubstitute: boolean,
    flashFireActivated: boolean,
}

export interface Stats {
    hp: number,
    attack: number,
    defense: number,
    spAttack: number,
    spDefense: number,
    speed: number
}

export interface PartialStats {
    hp?: number,
    attack?: number,
    defense?: number,
    spAttack?: number,
    spDefense?: number,
    speed?: number
}


class _PokemonBuilder {

    private pokemon: Pokemon

    constructor() {
        this.pokemon = {
            id: 1,
            name: 'Custom Pokemon',
            elementalTypes: [],
            originalStats: CreateEmptyStats(),
            currentStats: CreateEmptyStats(),
            techniqueUsedLast:undefined,
            techniques: [
            ],
            volatileStatuses: [],
            status: Status.None,
            canAttackThisTurn: true,
            statBoosts: {
                [Stat.Attack]: 0,
                [Stat.Defense]: 0,
                [Stat.SpecialAttack]: 0,
                [Stat.SpecialDefense]: 0,
                [Stat.Speed]: 0,
                [Stat.Accuracy]: 0
                
            },
            statMultipliers:[],
            baseStats: CreateEmptyStats(),
            ivs: {
                hp: 31,
                attack: 31,
                defense: 31,
                spAttack: 31,
                spDefense: 31,
                speed: 31
            },
            weight:100,
            toxicCount: 1,
            restTurnCount: 0,
            hasSubstitute: false,
            flashFireActivated: false,
            ability: "",
            nature: NatureType.Bashful, //Neutral Nature as default in case it is not specified. 
            heldItem: GetHeldItem("none"),
            evs: CreateEmptyStats(),
            fieldPosition: FieldPosition.GroundLevel
        }
    }

    //Mainly will be used for testing.
    UseGenericPokemon(): _PokemonBuilder {

        this.pokemon.name = "Generic-Pokemon"
        this.pokemon.baseStats = {
            hp: 100,
            attack: 100,
            spAttack: 100,
            defense: 100,
            spDefense: 100,
            speed: 100
        }
        this.pokemon.elementalTypes = [];
        return this;
    }
    GetPremadePokemon(name:string): _PokemonBuilder{
        this.pokemon = GetPokemon(name);
        return this;
    }
    GetRandomPremade(): _PokemonBuilder{
        this.pokemon = GetRandomPokemon();
        return this;
    }
    OfSpecies(name: string): _PokemonBuilder {
        //todo: some warning here that this should be called first?
        const base = GetSpecies(name);
        //modify the base pokemon to change it into a regular pokemon.
        this.pokemon.name = base.name;
        this.pokemon.baseStats = { ...base.baseStats };
        this.pokemon.elementalTypes = [...base.elementalTypes];
        this.pokemon.weight = base.weight
        //this.pokemon.ability = base.ability;   
        return this;
    }
    WithIVs(ivAmounts: Stats): _PokemonBuilder {
        this.pokemon.ivs = { ...ivAmounts };
        return this;
    }
    WithEVs(evAmounts: PartialStats): _PokemonBuilder {
        this.pokemon.evs = { ...CreateEmptyStats(), ...evAmounts };
        return this;
    }
    WithTechniques(techNames: Array<string>): _PokemonBuilder {
        this.pokemon.techniques = [];
        techNames.forEach((techName: string) => {
            this.pokemon.techniques.push(GetTech(techName))
        });
        return this;
    }
    WithAbility(abilityName: string): _PokemonBuilder {
        this.pokemon.ability = abilityName;
        return this;
    }
    WithHeldItem(heldItemName: string): _PokemonBuilder {
        this.pokemon.heldItem = GetHeldItem(heldItemName);
        return this;
    }
    WithNature(nature:NatureType):_PokemonBuilder{
        this.pokemon.nature = nature;
        return this;
    }
    WithBaseStats(baseStats: Stats): _PokemonBuilder {
        this.pokemon.baseStats = baseStats;
        return this;
    }
    OfElementalTypes(elements: Array<ElementType>): _PokemonBuilder {
        this.pokemon.elementalTypes = [...elements];
        return this;
    }
    Build(): Pokemon {
        //TODO, some error checking here
        //check if it has elemental types
        //check if it has moves
        //check if it has stats
        //check if the name has been updated?
        const calculatedStats = ConvertBaseStatsToRealStats(this.pokemon);
        this.pokemon.currentStats = { ...calculatedStats };
        this.pokemon.originalStats = { ...calculatedStats };
        //calculate the final stats
        return _.cloneDeep(this.pokemon);
    }
}

export function PokemonBuilder() {
    return new _PokemonBuilder();
}


export function GetStat(pokemon: Pokemon, stat: Stat): number {
    switch (stat) {
        case Stat.Attack: {
            return pokemon.currentStats.attack
        }
        case Stat.Defense: {
            return pokemon.currentStats.defense
        }
        case Stat.SpecialAttack: {
            return pokemon.currentStats.spAttack
        }
        case Stat.SpecialDefense: {
            return pokemon.currentStats.spDefense
        }
        case Stat.Speed: {
            return pokemon.currentStats.speed
        }
        case Stat.Accuracy:{
            return 100
        }
    }
}

export function CreateEmptyStats(): Stats {
    return {
        hp: 0,
        attack: 0,
        defense: 0,
        spAttack: 0,
        spDefense: 0,
        speed: 0
    }
}



//FOUND THE PROBLEM!
export function ConvertBaseStatsToRealStats(pokemon: Pokemon): Stats {
    //For now we will use an ivValue and evValue of 0.
    const level = 100;
    const natureMod = 1; //assuming a neutral nature for now.

    let calculatedStats: Stats = CreateEmptyStats();

    let baseStats = { ...pokemon.baseStats };

    

    const hp1 = (2 * baseStats.hp + pokemon.ivs.hp + (pokemon.evs.hp / 4)) * level;
    const hp2 = hp1 / 100;
    const hp3 = hp2 + level + 10;

    calculatedStats.hp = hp3;

    function CalculateStat(iv: number, ev: number, base: number): number {
        const calc1 = (2 * base + iv + (ev / 4)) * level
        const calc2 = ((calc1 / 100) + 5) * natureMod
        return calc2;
    }

    calculatedStats.attack = CalculateStat(pokemon.ivs.attack, pokemon.evs.attack, baseStats.attack);
    calculatedStats.spAttack = CalculateStat(pokemon.ivs.spAttack, pokemon.evs.spAttack, baseStats.spAttack);
    calculatedStats.speed = CalculateStat(pokemon.ivs.speed, pokemon.evs.speed, baseStats.speed);
    calculatedStats.defense = CalculateStat(pokemon.ivs.defense, pokemon.evs.defense, baseStats.defense);
    calculatedStats.spDefense = CalculateStat(pokemon.ivs.spDefense, pokemon.evs.spDefense, baseStats.spDefense);

    return calculatedStats;
}

export function ApplyNatureStatChanges(baseStats: Stats, nature: NatureType): Stats {

    let newStats : Stats = { ...baseStats };
    const natureInfo = GetNature(nature);

    //If the increase and decrease stats are the same then it is a neutral nature where there should be no stat changes.
    //Just to make sure nothing actually gets changed due to a decimal or rounding error, we will just exit instead.
    if (natureInfo.increase === natureInfo.decrease) {
        return newStats;
    }

    const increaseMultiplier = 1.1;
    const decreaseMultiplier = 0.9;

    //Increases
    if (natureInfo.increase === Stat.Attack) {
        newStats.attack *= increaseMultiplier;
    }
    else if (natureInfo.increase === Stat.Defense) {
        newStats.defense *= increaseMultiplier;
    }
    else if (natureInfo.increase === Stat.SpecialAttack) {
        newStats.spAttack *= increaseMultiplier;
    }
    else if (natureInfo.increase === Stat.SpecialDefense) {
        newStats.spDefense *= increaseMultiplier;
    }
    else if (natureInfo.increase === Stat.Speed) {
        newStats.speed *= increaseMultiplier;

    }

    //Decreases
    if (natureInfo.decrease === Stat.Attack) {
        newStats.attack *= decreaseMultiplier;
    }
    else if (natureInfo.decrease === Stat.Defense) {
        newStats.defense *= decreaseMultiplier;
    }
    else if (natureInfo.decrease === Stat.SpecialAttack) {
        newStats.spAttack *= decreaseMultiplier;
    }
    else if (natureInfo.decrease === Stat.SpecialDefense) {
        newStats.spDefense *= decreaseMultiplier;
    }
    else if (natureInfo.decrease === Stat.Speed) {
        newStats.speed *= decreaseMultiplier;
    }

    //Round all the stats
    newStats.attack = Math.round(newStats.attack);
    newStats.defense = Math.round(newStats.defense);
    newStats.hp = Math.round(newStats.hp);
    newStats.spAttack = Math.round(newStats.spAttack);
    newStats.spDefense = Math.round(newStats.spDefense);
    newStats.speed = Math.round(newStats.speed);

    return newStats;
}

export function GetPokemonBoostStage(pokemon: Pokemon, stat: Stat): number {
    return pokemon.statBoosts[stat];
}

export function HasVolatileStatus(pokemon: Pokemon, status: VolatileStatusType): boolean {
    return pokemon.volatileStatuses.filter(el =>
        el.type === status
    ).length > 0;
}

export function CalculateStatWithBoost(pokemon: Pokemon, stat: Stat) {
    /*
    Logic for stat boost goes in here
    */
    const statAmount = GetStat(pokemon, stat);
    const boostStage = GetPokemonBoostStage(pokemon, stat);
    /*
     Get the boost amount
    */
    //these are the wrong amounts, look these up again.
    var boostAmounts = [3 / 3, 4 / 3, 5 / 3, 6 / 3, 7 / 3, 8 / 3, 9 / 3];
    var boostAmount = (boostAmounts[(Math.abs(boostStage))]);

    if (boostStage < 0) {
        boostAmount = 1 / boostAmount;
    }

     //apply multipliers as well
    const multiplierAmount = pokemon.statMultipliers.filter((el)=>el.stat===stat).map( (el)=>el.multiplier).reduce((prev,curr)=>prev*curr,1);
    var  calculatedStat = statAmount * multiplierAmount;
   


    return Math.round(calculatedStat * boostAmount);
}




export function ApplyStatBoost(pokemon: Pokemon, stat: Stat, amount: number) {
    pokemon.statBoosts[stat] += amount;
    //clamp it to -6 or 6
    pokemon.statBoosts[stat] = Math.min(Math.max(pokemon.statBoosts[stat], -6), 6);
}