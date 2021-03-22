import GetAbility from "game/Ability/Ability";
import { StatusChangeEvent, BattleEventType } from "game/BattleEvents";
import { ApplyEntryHazard, EntryHazardType } from "game/EntryHazards/EntryHazard";
import { FieldEffectType, WishFieldEffect } from "game/FieldEffects/FieldEffects";
import GetHardStatus, { Status } from "game/HardStatus/HardStatus";
import { NoHeldItem } from "game/HeldItem/HeldItem";
import { GetActivePokemon, ResetStatBoosts } from "game/HelperFunctions";
import { Item } from "game/Items/Item";
import { Player } from "game/Player/PlayerBuilder";
import { ApplyStatBoost, Pokemon } from "game/Pokemon/Pokemon";
import { Stat } from "game/Stat";
import { Technique } from "game/Techniques/Technique";
import { NewGameInterface } from "game/Turn";
import { GetVolatileStatus, VolatileStatusType } from "game/VolatileStatus/VolatileStatus";
import { RainingWeather, SunnyWeather, Weather, WeatherType } from "game/Weather/Weather";
import { shuffle } from "lodash";

export enum TargetType {
    Self = 'self',
    Enemy = 'enemy'
}

export enum EffectType {
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
    Recoil = 'recoil',
    RemoveStatBoosts = 'remove-stat-boosts',
    PainSplit = 'pain-split',
    RemoveHeldItem = 'remove-held-item',
    CreateFieldEffect = 'create-field-effect',
    StruggleRecoilDamage = 'struggle-damage',
    ApplyWeather = 'apply-weather'
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

export interface SwitchPokemonEffect {
    type: EffectType.SwitchPokemon
}

export interface PlaceEntryHazard {
    type: EffectType.PlaceEntryHazard
    hazard: EntryHazardType
}

export interface WhirlwindEffect {
    type: EffectType.Whirlwind
}

export interface ClearHazardsEffect {
    type: EffectType.ClearHazards
}

export interface RecoilDamageEffect {
    type: EffectType.Recoil,
    recoilType: RecoilDamageType,
    amount: number
}

export interface StruggleRecoilEffect {
    type: EffectType.StruggleRecoilDamage
}


export enum RecoilDamageType {
    PercentDamageDealt = 'percent-damage-dealt',
    PercentMaxHealth = "percent-max-health"
}

export interface RemoveStatBoostEffect {
    type: EffectType.RemoveStatBoosts
}

export interface PainSplitEffect {
    type: EffectType.PainSplit
}

export interface RemoveHeldItemEffect {
    type: EffectType.RemoveHeldItem
}

export interface CreateFieldEffect {
    type: EffectType.CreateFieldEffect
    effectType: FieldEffectType
}

export interface ApplyWeatherEffect {
    type: EffectType.ApplyWeather,
    weather: WeatherType
}



export type BattleEffect = { target?: TargetType, chance?: number } & (InflictStatusEffect | StatBoostEffect
    | InflictVolatileStatusEffect | HealthRestoreEffect | StatusRestoreEffect | DrainEffect |
    AromatherapyEffect | SwitchPokemonEffect | PlaceEntryHazard | WhirlwindEffect | ClearHazardsEffect | RecoilDamageEffect | RemoveStatBoostEffect
    | PainSplitEffect | RemoveHeldItemEffect | CreateFieldEffect | StruggleRecoilEffect | ApplyWeatherEffect);




export function InflictStatus(game: NewGameInterface, pokemon: Pokemon, status: Status, source: Pokemon) {
    const targetPokemon = pokemon;
    //cannot apply a status to a pokemon that has one, and cannot apply a status to a fainted pokemon.
    if (targetPokemon.status !== Status.None || targetPokemon.currentStats.hp === 0) {
        return;
    }

    if (targetPokemon.hasSubstitute && source !== pokemon) {
        return;
    }

    const hardStatus = GetHardStatus(status);
    if (!hardStatus.CanApply(game, targetPokemon)) {
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
    game.AddEvent(statusInflictedEffect);

    //TODO: OnStatusChange could be a BattleBehavior
    GetAbility(targetPokemon.ability).OnStatusChange(game, pokemon, status, source);
}


export interface DoStatBoostParameters {
    game: NewGameInterface,
    pokemon: Pokemon,
    stat: Stat,
    amount: number,
    sourcePokemon: Pokemon,
    messageOverride?: string
}

export function DoStatBoost(params: DoStatBoostParameters) {

    const turn = params.game;
    const pokemon = params.pokemon;
    let amount = params.amount;
    const sourcePokemon = params.sourcePokemon;
    const stat = params.stat;
    const messageOverride = params.messageOverride;

    const targetPokemon = pokemon;
    amount = GetAbility(pokemon.ability).ModifyStatBoostAmount(turn, pokemon, amount, sourcePokemon);
    if (amount === 0) {
        return;
    }

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
        case Stat.Accuracy: {
            statString = "accuracy"
            break;
        }
        default: {
            throw new Error(`Could not find string to use for stat : ${stat} in call to DoStatBoost()`)
        }
    }

    let message = messageOverride;
    if (message === undefined) {
        message = ` ${targetPokemon.name} has had its ${statString} boosted!`
        if (amount < 0) {
            message = ` ${targetPokemon.name} has had its ${statString} decreased!`
        }
    }

    turn.AddMessage(message);
}

export function InflictVolatileStatus(turn: NewGameInterface, pokemon: Pokemon, status: VolatileStatusType, source: Pokemon) {
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

function ApplyHealingEffect(turn: NewGameInterface, pokemon: Pokemon, effect: HealthRestoreEffect) {
    if (effect.restoreType === HealthRestoreType.Flat) {
        turn.ApplyHealing(pokemon, effect.amount);
    }
    else if (effect.restoreType === HealthRestoreType.PercentMaxHealth) {
        const amount = Math.floor(pokemon.originalStats.hp / (100 / effect.amount));
        turn.ApplyHealing(pokemon, amount);
    }
}

function ApplyStatusRestoreEffect(turn: NewGameInterface, pokemon: Pokemon, effect: StatusRestoreEffect) {
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

function DrainEffect(turn: NewGameInterface, pokemonToHeal: Pokemon, effect: DrainEffect, damage: number) {
    const drainAmount = damage * (effect.amount * 0.01);
    turn.ApplyHealing(pokemonToHeal, drainAmount);
    turn.AddMessage(`${pokemonToHeal.name} drained some energy.`)
}

function ApplyAromatherapyEffect(turn: NewGameInterface, sourcePokemon: Pokemon) {
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

function SwitchPokemonEffect(turn: NewGameInterface, sourcePokemon: Pokemon) {
    //check to see if there is valid pokemon to switch into
    if (turn.GetValidSwitchIns(turn.GetPokemonOwner(sourcePokemon)).length === 0) {
        return;
    }
    turn.PromptForSwitch(sourcePokemon);
}

function PlaceEntryHazardEffect(turn: NewGameInterface, type: EntryHazardType, player: Player) {
    ApplyEntryHazard(turn, player, type);
}

function WhirlwindEffect(turn: NewGameInterface, player: Player) {
    //Choose a random pokemon other than the current one
    //Switch that pokemon in
    const otherValidPokemon = player.pokemon.filter(poke => poke.currentStats.hp > 0 && poke.id !== player.currentPokemonId);
    if (otherValidPokemon.length < 1) {
        turn.AddMessage("But it failed!");
        return;
    }
    const randomPokemon = shuffle(otherValidPokemon)[0];
    turn.SwitchPokemon(player, randomPokemon);
}


function ClearHazards(turn: NewGameInterface, player: Player) {
    const hasHazards = (turn.field.entryHazards!.filter(hazard => {
        return hazard.player === player;
    }).length > 0)
    if (hasHazards) {
        turn.AddMessage(`All hazards on ${player.name}'s side have been removed!`);
    }
    turn.field.entryHazards = turn.field.entryHazards?.filter(hazard => {
        return hazard.player !== player;
    });
}

function RecoilEffect(turn: NewGameInterface, pokemon: Pokemon, recoilDamage: number) {
    turn.ApplyIndirectDamage(pokemon, recoilDamage);
    turn.AddMessage(`${pokemon.name} has damaged itself due to recoil`);
}

function RemoveStatBoosts(turn: NewGameInterface) {
    const player1 = turn.GetPlayers()[0];
    const player2 = turn.GetPlayers()[1];

    const activePokemon1 = GetActivePokemon(player1);
    const activePokemon2 = GetActivePokemon(player2);

    ResetStatBoosts(activePokemon1);
    ResetStatBoosts(activePokemon2);

    turn.AddMessage(`All stat boosts have been reset!`);

}

function PainSplitEffect(turn: NewGameInterface, attackingPokemon: Pokemon, defendingPokemon: Pokemon) {

    /*Pain Split adds the current HP of the user and target Pokémon. It then divides this value by two and increases or decreases the HP of each Pokémon to become equal to the result (limited by each Pokémon's maximum HP).*/

    //todo: handle substitute fail clause
    const totalHealth = attackingPokemon.currentStats.hp + defendingPokemon.currentStats.hp;
    const healthToSet = Math.ceil(totalHealth / 2);
    /*
    const pokemon1HPBefore = attackingPokemon.currentStats.hp;
    const pokemon2HPBefore = defendingPokemon.currentStats.hp;
    */

    attackingPokemon.currentStats.hp = Math.min(healthToSet, attackingPokemon.originalStats.hp);
    defendingPokemon.currentStats.hp = Math.min(healthToSet, defendingPokemon.originalStats.hp);

    //todo: add in animation triggers for the direct hp loss / gain.

    //check to see if it either healed or damaged the pokemon?
    turn.AddMessage(`The battlers shared their pain!`);

}

function RemoveHeldItemEffect(turn: NewGameInterface, pokemon: Pokemon) {
    if (pokemon.heldItem.name !== "") {
        turn.AddMessage(`${pokemon.name} dropped it's ${pokemon.heldItem.name}`);
        //removing the held item here not sure if we should have this for everything.
        pokemon.heldItem.OnRemoved(turn, pokemon);
        pokemon.heldItem = new NoHeldItem();
    }
}

export function ApplyWeather(turn: NewGameInterface, weather: Weather) {
    turn.field.weather = weather;
    weather.OnApply(turn);
}

export function ApplyCreateFieldEffect(turn: NewGameInterface, pokenon: Pokemon, fieldEffectType: FieldEffectType) {
    const pokemonOwner = turn.GetPokemonOwner(pokenon);

    if (fieldEffectType === FieldEffectType.Wish) {
        const wishEffect = new WishFieldEffect();
        wishEffect.playerId = pokemonOwner.id;
        wishEffect.OnCreated(turn, pokemonOwner);
        turn.field.fieldEffects!.push(wishEffect);

    }
}

export function StruggleRecoilEffect(turn: NewGameInterface, pokemon: Pokemon) {
    const damage = pokemon.originalStats.hp / 4;
    turn.ApplyStruggleDamage(pokemon, damage);
    turn.AddMessage(`${pokemon.name} hurt itself from struggling!`);

}




export interface EffectSource {
    sourcePokemon?: Pokemon,
    sourceTechnique?: Technique,
    sourceDamage?: number,
    sourceItem?: Item
}


//need someting more abstract for the source, but for now just having the pokemon will do.
export function DoEffect(turn: NewGameInterface, pokemon: Pokemon, effect: BattleEffect, source: EffectSource) {


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
            if (source.sourcePokemon === undefined) {
                throw new Error(`Need a source pokemon to DoEffect - effect.sourcePokemon`);
            }
            const params: DoStatBoostParameters = {
                game: turn,
                pokemon: pokemon,
                stat: effect.stat,
                amount: effect.amount,
                sourcePokemon: source.sourcePokemon
            }
            DoStatBoost(params);
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
        case EffectType.Aromatherapy: {
            if (source.sourcePokemon === undefined) {
                throw new Error("Need a source pokemon to DoEffect - aromatherapy");
            }
            ApplyAromatherapyEffect(turn, source.sourcePokemon);
            break;
        }
        case EffectType.SwitchPokemon: {
            if (source.sourcePokemon === undefined) {
                throw new Error("Need a source pokemon to DoEffect - aromatherapy");
            }
            SwitchPokemonEffect(turn, source.sourcePokemon);
            break;
        }
        case EffectType.PlaceEntryHazard: {
            if (effect.hazard === undefined) {
                throw new Error('No hazard define for DoEffect - place entry hazard');
            }
            PlaceEntryHazardEffect(turn, effect.hazard, turn.GetPokemonOwner(pokemon));
            break;
        }
        case EffectType.Whirlwind: {
            WhirlwindEffect(turn, turn.GetPokemonOwner(pokemon));
            break;
        }
        case EffectType.ClearHazards: {

            if (source.sourcePokemon === undefined) {
                throw new Error(`No source pokemon defined for DoEFfect - PlaceEntryHazard`);
            }
            ClearHazards(turn, turn.GetPokemonOwner(source.sourcePokemon))
            break;
        }
        case EffectType.Recoil: {
            if (source.sourceDamage === undefined) {
                throw new Error("Need a source damage to induce a recoil effect");
            }
            if (source.sourcePokemon === undefined) {
                throw new Error(`Need a source pokemon for a recoil effect`);
            }

            if (effect.recoilType === RecoilDamageType.PercentDamageDealt) {
                RecoilEffect(turn, source.sourcePokemon, source.sourceDamage * (effect.amount / 100))
            }
            else if (effect.recoilType === RecoilDamageType.PercentMaxHealth) {
                RecoilEffect(turn, source.sourcePokemon, source.sourcePokemon.originalStats.hp * (effect.amount / 100))
            }
            break;
        }
        case EffectType.RemoveStatBoosts: {
            RemoveStatBoosts(turn);
            break;
        }
        case EffectType.PainSplit: {
            if (source.sourcePokemon === undefined) {
                throw new Error(`Could not find source pokemon for Pain Split effect`);
            }
            PainSplitEffect(turn, source.sourcePokemon, pokemon);
            break;
        }
        case EffectType.RemoveHeldItem: {
            RemoveHeldItemEffect(turn, pokemon);
            break;
        }
        case EffectType.CreateFieldEffect: {
            ApplyCreateFieldEffect(turn, pokemon, effect.effectType)
            break;
        }
        case EffectType.StruggleRecoilDamage: {
            if (source.sourcePokemon === undefined) {
                throw new Error(`Could not find source for struggle recoil damage`);
            }
            StruggleRecoilEffect(turn, source.sourcePokemon);
            break;
        }
        case EffectType.ApplyWeather: {
            if (effect.weather === WeatherType.Rain) {
                ApplyWeather(turn, new RainingWeather())
            }
            else if (effect.weather === WeatherType.Sunny) {
                ApplyWeather(turn, new SunnyWeather())
            }
            else {
                throw new Error(`Could not find weather to apply`);
            }
            break;
        }
        default: {
            throw new Error(`Effect type ${effect['type']} is not defined in DoEffect()`);
        }
    }
}
