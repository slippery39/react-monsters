import { StatusChangeEvent, BattleEventType } from "game/BattleEvents";
import { ApplyEntryHazard, EntryHazardType } from "game/EntryHazards/EntryHazard";
import GetHardStatus, { Status } from "game/HardStatus/HardStatus";
import { Item } from "game/Items/Item";
import { Player } from "game/Player/PlayerBuilder";
import { ApplyStatBoost, Pokemon} from "game/Pokemon/Pokemon";
import { Stat } from "game/Stat";
import { Technique } from "game/Techniques/Technique";
import { Turn } from "game/Turn";
import { GetVolatileStatus, VolatileStatusType } from "game/VolatileStatus/VolatileStatus";
import { shuffle } from "lodash";

export enum TargetType {
    Self = 'self',
    Enemy = 'enemy'
}

export enum EffectType{
    InflictStatus = 'inflict-status',
    StatBoost = 'stat-boost',
    InflictVolatileStatus = 'inflict-volatile-status',
    HealthRestore = 'health-restore',
    StatusRestore = 'status-restore',
    Drain = 'drain',
    Aromatherapy = 'aromatherapy',
    SwitchPokemon = 'switch-pokemon',
    PlaceEntryHazard = 'place-entry-hazard',
    Whirlwind = 'whirlwind',
    ClearHazards = 'clear-hazards',
    Recoil = 'recoil'
}

export interface InflictStatusEffect {
    type: EffectType.InflictStatus,
    status: Status
    target: TargetType,
}
export interface StatBoostEffect {
    type: EffectType.StatBoost,
    stat: Stat
    target: TargetType,
    amount: number
}
export interface InflictVolatileStatusEffect {
    type: EffectType.InflictVolatileStatus,
    status: VolatileStatusType,
    target: TargetType,
}

export enum HealthRestoreType {
    Flat = 'flat',
    PercentMaxHealth = 'percent-max-health'
}

export interface HealthRestoreEffect {
    type: EffectType.HealthRestore,
    restoreType: HealthRestoreType,
    amount: number
}

export interface StatusRestoreEffect {
    type: EffectType.StatusRestore,
    forStatus: Status | 'any',
}

export interface DrainEffect {
    type: EffectType.Drain,
    amount: number
}

export interface AromatherapyEffect {
    type: EffectType.Aromatherapy
}

export interface SwitchPokemonEffect{
    type: EffectType.SwitchPokemon
}

export interface PlaceEntryHazard{
    type:EffectType.PlaceEntryHazard
    hazard:EntryHazardType
}

export interface WhirlwindEffect{
    type:EffectType.Whirlwind
}

export interface ClearHazardsEffect{
    type:EffectType.ClearHazards
}

export interface RecoilDamageEffect{
    type:EffectType.Recoil,
    recoilType:RecoilDamageType,
    amount:number
}

export enum RecoilDamageType{
    PercentDamageDealt = 'percent-damage-dealt'
}

export type BattleEffect = { target?: TargetType, chance?: number } & (InflictStatusEffect | StatBoostEffect
     | InflictVolatileStatusEffect | HealthRestoreEffect | StatusRestoreEffect | DrainEffect | 
    AromatherapyEffect | SwitchPokemonEffect | PlaceEntryHazard | WhirlwindEffect | ClearHazardsEffect | RecoilDamageEffect);




export function InflictStatus(turn: Turn, pokemon: Pokemon, status: Status, source: Pokemon) {
    const targetPokemon = pokemon;
    //cannot apply a status to a pokemon that has one, and cannot apply a status to a fainted pokemon.
    if (targetPokemon.status !== Status.None || targetPokemon.currentStats.hp === 0) {
        return;
    }

    if (targetPokemon.hasSubstitute && source !== pokemon) {
        return;
    }

    const hardStatus = GetHardStatus(status);
    if (!hardStatus.CanApply(turn, targetPokemon)) {
        return;
    }

    targetPokemon.status = status;

    const statusInflictedEffect: StatusChangeEvent = {
        type: BattleEventType.StatusChange,
        status: status,
        attackerPokemonId: pokemon.id,
        targetPokemonId: targetPokemon.id,
        defaultMessage: `${targetPokemon.name} ${hardStatus.inflictedMessage}`
    };
    turn.AddEvent(statusInflictedEffect);
}

function DoStatBoost(turn: Turn, pokemon: Pokemon, stat: Stat, amount: number) {
    const targetPokemon = pokemon;
    ApplyStatBoost(targetPokemon, stat, amount);

    let statString = "";

    switch (stat) {
        case Stat.Attack: {
            statString = "attack";
            break;
        }
        case Stat.Defense: {
            statString = "defence";
            break;
        }
        case Stat.SpecialAttack: {
            statString = "special attack";
            break;
        }
        case Stat.SpecialDefense: {
            statString = "special defense";
            break;
        }
        case Stat.Speed: {
            statString = "speed";
            break;
        }
        case Stat.Accuracy:{
            statString = "accuracy"
            break;
        }
        default:{
            throw new Error(`Could not find string to use for stat : ${stat} in call to DoStatBoost()`)
        }
    }

    let message = ` ${targetPokemon.name} has had its ${statString} boosted!`
    if (amount < 0) {
        message = ` ${targetPokemon.name} has had its ${statString} decreased!`
    }
    turn.AddMessage(message);
}

export function InflictVolatileStatus(turn: Turn, pokemon: Pokemon, status: VolatileStatusType, source: Pokemon) {
    const targetPokemon = pokemon;
    const vStatus = GetVolatileStatus(status);


    if (pokemon.hasSubstitute && pokemon !== source) {
        return;
    }

    if (!vStatus.CanApply(turn, targetPokemon)) {
        return;
    }
    targetPokemon.volatileStatuses.push(vStatus);
    vStatus.OnApply(turn, targetPokemon);
    turn.AddMessage(vStatus.InflictedMessage(targetPokemon));
}

function ApplyHealingEffect(turn: Turn, pokemon: Pokemon, effect: HealthRestoreEffect) {
    if (effect.restoreType === HealthRestoreType.Flat) {
        turn.ApplyHealing(pokemon, effect.amount);
    }
    else if (effect.restoreType === HealthRestoreType.PercentMaxHealth) {
        const amount = Math.floor(pokemon.originalStats.hp / (100 / effect.amount));
        turn.ApplyHealing(pokemon, amount);
    }
}

function ApplyStatusRestoreEffect(turn: Turn, pokemon: Pokemon, effect: StatusRestoreEffect) {
    if (effect.forStatus === 'any' && pokemon.status !== Status.None) {
        let statusRestoreEffect: StatusChangeEvent = {
            type: BattleEventType.StatusChange,
            status: Status.None,
            targetPokemonId: pokemon.id,
            defaultMessage: `${pokemon.name} ` + GetHardStatus(pokemon.status).curedString
        }
        turn.AddEvent(statusRestoreEffect);
        pokemon.status = Status.None;
    }
    else if (effect.forStatus === pokemon.status) {
        let statusRestoreEffect: StatusChangeEvent = {
            type: BattleEventType.StatusChange,
            status: Status.None,
            targetPokemonId: pokemon.id,
            defaultMessage: `${pokemon.name} ` + GetHardStatus(pokemon.status).curedString
        }
        turn.AddEvent(statusRestoreEffect);
        pokemon.status = Status.None;
    }
}

function DrainEffect(turn: Turn, pokemonToHeal: Pokemon, effect: DrainEffect, damage: number) {
    const drainAmount = damage * (effect.amount * 0.01);
    turn.ApplyHealing(pokemonToHeal, drainAmount);
    turn.AddMessage(`${pokemonToHeal.name} drained some energy.`)
}

function ApplyAromatherapyEffect(turn: Turn, sourcePokemon: Pokemon) {
    /*
    Heals all pokemon in the user pokemons party.
    */

    const pokemonOwner = turn.GetPlayers().find(player => player.pokemon.find(poke => poke.id === sourcePokemon.id));
    if (pokemonOwner === undefined) {
        throw new Error(`Could not find pokemon owner for pokemon : ${sourcePokemon.id}`);
    }

    pokemonOwner.pokemon.forEach(pokemon => {
        //how to cure a status?
        if (pokemon.status !== Status.None) {
            let statusRestoreEffect: StatusChangeEvent = {
                type: BattleEventType.StatusChange,
                status: Status.None,
                targetPokemonId: pokemon.id,
                defaultMessage: `${pokemon.name} ` + GetHardStatus(pokemon.status).curedString
            }
            turn.AddEvent(statusRestoreEffect);
            pokemon.status = Status.None;
        }

    });
}

function SwitchPokemonEffect(turn:Turn,sourcePokemon:Pokemon){
    turn.PromptForSwitch(sourcePokemon);
}

function PlaceEntryHazardEffect(turn:Turn,type:EntryHazardType,player:Player){
    console.warn("Entry Hazard has been placed");
    ApplyEntryHazard(turn,player,type);    
}

function WhirlwindEffect(turn:Turn,player:Player){
    //Choose a random pokemon other than the current one
    //Switch that pokemon in
    console.warn("Whirlwind Effect");
    const otherValidPokemon = player.pokemon.filter(poke=>poke.currentStats.hp>0 && poke.id!== player.currentPokemonId);
    if (otherValidPokemon.length <1){
        turn.AddMessage("But it failed!");
        return;
    }    
    const randomPokemon = shuffle(otherValidPokemon)[0];
    turn.SwitchPokemon(player,randomPokemon);   
}


function ClearHazards(turn:Turn,player:Player){
    const hasHazards = (turn.currentGameState.entryHazards!.filter(hazard=>{
        return hazard.player===player;
    }).length > 0)
    if (hasHazards){
        turn.AddMessage(`All hazards on ${player.name}'s side have been removed!`);
    }
    turn.currentGameState.entryHazards = turn.currentGameState.entryHazards?.filter(hazard=>{
        return hazard.player!==player;
    });
}

function RecoilEffect(turn:Turn,pokemon:Pokemon,recoilDamage:number){
    turn.ApplyIndirectDamage(pokemon,recoilDamage);
    turn.AddMessage(`${pokemon.name} has damaged itself due to recoil`);
}

interface EffectSource {
    sourcePokemon?: Pokemon,
    sourceTechnique?: Technique,
    sourceDamage?: number,
    sourceItem?: Item
}


//need someting more abstract for the source, but for now just having the pokemon will do.
export function DoEffect(turn: Turn, pokemon: Pokemon, effect: BattleEffect, source: EffectSource) {


    //TODO: We need a sourceInfo object,
    //This object could contain many different source info things.
    //like the pokemon, the technique, the hazard the item etc.
    switch (effect.type) {
        case EffectType.InflictStatus: {
            if (source.sourcePokemon === undefined) {
                throw new Error("Need a source pokemon to DoEffect - inflict-status");
            }
            InflictStatus(turn, pokemon, effect.status, source.sourcePokemon);
            break;
        }
        case EffectType.StatBoost: {
            DoStatBoost(turn, pokemon, effect.stat, effect.amount);
            break;
        }
        case EffectType.InflictVolatileStatus: {
            if (source.sourcePokemon === undefined) {
                throw new Error("Need a source pokemon to DoEffect - inflict-volatile-status");
            }
            InflictVolatileStatus(turn, pokemon, effect.status, source.sourcePokemon);
            break;
        }
        case EffectType.HealthRestore: {
            ApplyHealingEffect(turn, pokemon, effect);
            break;
        }
        case EffectType.StatusRestore: {
            ApplyStatusRestoreEffect(turn, pokemon, effect);
            break;
        }
        case EffectType.Drain: {
            if (source.sourceDamage === undefined) {
                throw new Error("Need a source damage to DoEffect - drain");
            }
            DrainEffect(turn, pokemon, effect, source.sourceDamage);
            break;
        }
        case EffectType.Aromatherapy:{
            if (source.sourcePokemon === undefined){
                throw new Error("Need a source pokemon to DoEffect - aromatherapy");
            }
            ApplyAromatherapyEffect(turn,source.sourcePokemon);
            break;
        }
        case EffectType.SwitchPokemon:{
            if (source.sourcePokemon === undefined){
                throw new Error("Need a source pokemon to DoEffect - aromatherapy");
            }
            SwitchPokemonEffect(turn,source.sourcePokemon);
            break;
        }
        case EffectType.PlaceEntryHazard:{
            if (effect.hazard === undefined){
                throw new Error('No hazard define for DoEffect - place entry hazard');
            }
            PlaceEntryHazardEffect(turn,effect.hazard,turn.GetPokemonOwner(pokemon));
            break;
        }
        case EffectType.Whirlwind:{
            WhirlwindEffect(turn,turn.GetPokemonOwner(pokemon));
            break;
        }
        case EffectType.ClearHazards:{

            if (source.sourcePokemon === undefined){
                throw new Error(`No source pokemon defined for DoEFfect - PlaceEntryHazard`);
            }
            ClearHazards(turn,turn.GetPokemonOwner(source.sourcePokemon))
            break;
        }
        case EffectType.Recoil:{
            if (source.sourceDamage==undefined){
                throw new Error("Need a source damage to induce a recoil effect");
            }
            if (source.sourcePokemon === undefined){
                throw new Error(`Need a source pokemon for a recoil effect`);
            }

            if (effect.recoilType === RecoilDamageType.PercentDamageDealt){
                RecoilEffect(turn,source.sourcePokemon,source.sourceDamage*(effect.amount/100))
            }
            break;
        }
        default: {
            throw new Error(`Effect type ${effect['type']} is not defined in DoEffect()`);
        }
    }
}
