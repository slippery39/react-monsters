import { IGame } from "game/BattleGame";
import { GetTypeMod } from "game/DamageFunctions";
import { DoStatBoost } from "game/Effects/Effects";
import { ElementType } from "game/ElementType";
import { GetActivePokemon } from "game/HelperFunctions";
import { Player } from "game/Player/PlayerBuilder";
import { Pokemon } from "game/Pokemon/Pokemon";
import { Stat } from "game/Stat";

export enum EntryHazardType {
    Spikes = 'spikes',
    StealthRock = 'stealth-rock',
    StickyWeb = 'sticky-web'
}


export function ApplyEntryHazard(game: IGame, player: Player, type: EntryHazardType) {


    const getEntryHazard = function(type:EntryHazardType,player:Player){
        return game.field.entryHazards.find(hazard=>hazard.type === type && hazard.player!.id === player.id)
    }

    switch (type) {
        case EntryHazardType.Spikes: {
            let spikes = getEntryHazard(EntryHazardType.Spikes,player);
            if (spikes === undefined) {
                spikes = new Spikes(player);
                game.field.entryHazards.push(spikes);
                spikes.OnApplied(game, player);
            }
            else {
                if (spikes.CanApply(game, player)) {
                    spikes.OnApplied(game, player);
                }
                else {
                    spikes.OnApplyFail(game, player);
                }
            }
            //look if the turn already has an entry hazard of this type stored.
            //if so get it and try to apply it.
            //if not, create a new one and apply it.
            break;
        }
        case EntryHazardType.StealthRock: {
            let stealthRock = getEntryHazard(EntryHazardType.StealthRock,player);
            if (stealthRock === undefined) {
                stealthRock = new StealthRock(player);
                game.field.entryHazards.push(stealthRock);
                stealthRock.OnApplied(game, player);
            }
            else {
                stealthRock.OnApplyFail(game, player);
            }
            break;

        }
        case EntryHazardType.StickyWeb:{
            let stickyWeb = getEntryHazard(EntryHazardType.StickyWeb,player);
            if (stickyWeb === undefined){
                stickyWeb = new StickyWeb(player);
                game.field.entryHazards.push(stickyWeb);
                stickyWeb.OnApplied(game,player);
            }
            else{
                stickyWeb.OnApplyFail(game,player);
            }
            break;
        }
        default: {
            throw new Error(`Entry hazard cannot be applied : ${type}`)
        }
    }
}

export abstract class EntryHazard {

    type: string = "";
    player?: Player = undefined;
    stage:number = 0;

    constructor(player: Player) {
        this.player = player;
    }

    CanApply(game: IGame, player: Player) {
        return true;
    }
    OnApplied(game: IGame, player: Player) {

    }
    OnApplyFail(game: IGame, player: Player) {

    }
    OnPokemonEntry(game: IGame, pokemon: Pokemon) {

    }
}

export class Spikes extends EntryHazard {
    stage: number = 0;
    type: EntryHazardType = EntryHazardType.Spikes;
    player: Player;

    constructor(player: Player) {
        super(player);
        this.player = player;
    }

    CanApply(game: IGame, player: Player) {
        return this.stage < 3;
    }

    OnApplied(game: IGame, player: Player) {
        this.stage = Math.min(this.stage+1,3);
    }
    OnApplyFail(game: IGame, player: Player) {
        game.AddMessage("But it failed!");
    }
    OnPokemonEntry(game: IGame, pokemon: Pokemon) {

        if (game.GetPokemonOwner(pokemon).id !== this.player.id) {
            return;
        }

        let damage = 0;
        if (this.stage === 1) {
            damage = pokemon.originalStats.hp * 0.125;
        }
        else if (this.stage === 2) {
            damage = pokemon.originalStats.hp * 0.1667;
        }
        else if (this.stage >= 3) {
            damage = pokemon.originalStats.hp * 0.25;
        }
        game.ApplyIndirectDamage(pokemon, damage,`${pokemon.name} was hurt by spikes`);        
    }
}


export class StickyWeb extends EntryHazard {
    type: EntryHazardType = EntryHazardType.StickyWeb
    player: Player;
    private sourcePokemon:Pokemon; //hack here because we need a source pokemon to do the stat boost.... really strongly consider having a source system implemented.

    constructor(player: Player) {
        super(player);
        this.player = player;
        this.sourcePokemon = GetActivePokemon(player);
    }
    
    OnApplied(game: IGame, player: Player) {
        game.AddMessage(`A sticky web was placed below ${player.name}'s team.`);
    }
    OnApplyFail(game: IGame, player: Player) {
        game.AddMessage("But it failed!");
    }
    OnPokemonEntry(game: IGame, pokemon: Pokemon) {
        if (game.GetPokemonOwner(pokemon).id !== this.player.id) {
            return;
        }
        if (pokemon.ability.toLowerCase() === "levitate" || pokemon.elementalTypes.includes(ElementType.Flying)){
            return;
        }
        
        DoStatBoost({
            game:game,
            pokemon:pokemon,
            stat:Stat.Speed,
            amount:-1,
            sourcePokemon:this.sourcePokemon,
            messageOverride:`The sticky web lowered ${pokemon.name}'s speed!`
        })
    }
}



export class StealthRock extends EntryHazard {
    type: EntryHazardType = EntryHazardType.StealthRock
    player: Player;

    constructor(player: Player) {
        super(player);
        this.player = player;
    }
    
    OnApplied(game: IGame, player: Player) {
        game.AddMessage(`Pointed stones float in the air around ${player.name}'s team.`);
    }
    OnApplyFail(game: IGame, player: Player) {
        game.AddMessage("But it failed!");
    }
    OnPokemonEntry(game: IGame, pokemon: Pokemon) {

        if (game.GetPokemonOwner(pokemon).id !== this.player.id) {
            return;
        }

        const effectiveness = GetTypeMod(pokemon.elementalTypes, ElementType.Rock);

        let damageMod = 0;
        if (effectiveness >= 4) {
            damageMod = 50;
        }
        else if (effectiveness >= 2) {
            damageMod = 25;
        }
        else if (effectiveness >= 1) {
            damageMod = 12.5;
        }
        else if (effectiveness >= 0.5) {
            damageMod = 6.25;
        }
        else if (effectiveness >= 0.25) {
            damageMod = 3.125;
        }

        if (damageMod > 0) {
            const damage = pokemon.originalStats.hp * (damageMod/100);
            game.ApplyIndirectDamage(pokemon, damage,`${pokemon.name} was hurt by stealth rock.`);
        }
    }
}


