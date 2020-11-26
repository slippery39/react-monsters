import { StatusChangeEvent, BattleEventType } from "game/BattleEvents";
import GetHardStatus, { Status } from "game/HardStatus/HardStatus";
import { ApplyStatBoost, IPokemon, PokemonBuilder } from "game/Pokemon/Pokemon";
import { HealthRestoreEffect, HealthRestoreType, InflictStatusMoveEffect, InflictVolatileStatusEffect, StatBoostMoveEffect, StatusRestoreEffect, TargetType, TechniqueEffect } from "game/Techniques/Technique";
import { Turn } from "game/Turn";
import { GetVolatileStatus } from "game/VolatileStatus/VolatileStatus";



function InflictStatus(turn:Turn,pokemon:IPokemon,effect:InflictStatusMoveEffect){
        const targetPokemon = pokemon;
        //cannot apply a status to a pokemon that has one, and cannot apply a status to a fainted pokemon.
        if (targetPokemon.status !== Status.None || targetPokemon.currentStats.health === 0) {
            return;
        }

        const hardStatus = GetHardStatus(effect.status);
        if (!hardStatus.CanApply(turn, targetPokemon)) {
            return;
        }

        targetPokemon.status = effect.status;

        const statusInflictedEffect: StatusChangeEvent = {
            type: BattleEventType.StatusChange,
            status: effect.status,
            attackerPokemonId: pokemon.id,
            targetPokemonId: targetPokemon.id,
            defaultMessage: `${targetPokemon.name} ${hardStatus.inflictedMessage}`
        };
        turn.AddEvent(statusInflictedEffect);
}

function DoStatBoost(turn:Turn,pokemon:IPokemon,effect:StatBoostMoveEffect){
    const targetPokemon = pokemon;
    ApplyStatBoost(targetPokemon,effect.stat,effect.amount);

    let message = ` ${targetPokemon.name} has had its ${effect.stat} boosted!`
    if (effect.amount < 0) {
        message = ` ${targetPokemon.name} has had its ${effect.stat} decreased!`
    }
    turn.ApplyMessage(message);
}

function InflictVolatileStatus(turn:Turn,pokemon:IPokemon,effect:InflictVolatileStatusEffect){
    const targetPokemon = pokemon;
    const vStatus = GetVolatileStatus(effect.status);

    if (!vStatus.CanApply(turn, targetPokemon)) {
        return;
    }
    targetPokemon.volatileStatuses.push(vStatus);
    vStatus.OnApply(turn, targetPokemon);
    turn.ApplyMessage(vStatus.InflictedMessage(targetPokemon));
}

function ApplyHealingEffect(turn:Turn,pokemon:IPokemon,effect:HealthRestoreEffect){
    if (effect.restoreType === HealthRestoreType.Flat) {
        turn.ApplyHealing(pokemon, effect.amount);
    }
    else if (effect.restoreType === HealthRestoreType.PercentMaxHealth) {
        const amount = Math.floor(pokemon.originalStats.health / (100 / effect.amount));
        turn.ApplyHealing(pokemon, amount);
    }
}

function ApplyStatusRestoreEffect(turn:Turn,pokemon:IPokemon,effect:StatusRestoreEffect){
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



export function DoEffect(turn:Turn,pokemon:IPokemon,effect:TechniqueEffect){
    switch(effect.type){
        case 'inflict-status':{
            InflictStatus(turn,pokemon,effect);
            break;
        }
        case 'stat-boost':{
            DoStatBoost(turn,pokemon,effect);
            break;
        }
        case 'inflict-volatile-status':{
            InflictVolatileStatus(turn,pokemon,effect);
            break;
        }
        case 'health-restore':{
            ApplyHealingEffect(turn,pokemon,effect);
            break;
        }
        case 'status-restore':{
            ApplyStatusRestoreEffect(turn,pokemon,effect);
            break;
        }
        default:{
            throw new Error(`Effect type ${effect} is not defined in DoEffect()`);
        }
    }
}
