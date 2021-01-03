import { GetTypeMod } from "game/DamageFunctions";
import { ElementType } from "game/ElementType";
import { Player } from "game/Player/PlayerBuilder";
import { Pokemon } from "game/Pokemon/Pokemon";
import { Turn } from "game/Turn";



export enum EntryHazardType{
    Spikes = 'spikes',
    StealthRock = 'stealth-rock'
}


export function ApplyEntryHazard(turn:Turn,player:Player,type:EntryHazardType){
    switch(type){
        case EntryHazardType.Spikes:{
        
            let spikes = turn.GetEntryHazards().find(hazard=>hazard.type === EntryHazardType.Spikes && hazard.player!.id === player.id);
            if (spikes === undefined){
                spikes = new Spikes(player);
                turn.GetEntryHazards().push(spikes);    
                spikes.OnApplied(turn,player);        
            }
            else{
                if (spikes.CanApply(turn,player)){
                    spikes.OnApplied(turn,player);
                }
                else{
                    spikes.OnApplyFail(turn,player);
                }
            }
            //look if the turn already has an entry hazard of this type stored.
            //if so get it and try to apply it.
            //if not, create a new one and apply it.
            break;
        }
        case EntryHazardType.StealthRock:{
            let stealthRock = turn.GetEntryHazards().find(hazard=>hazard.type === EntryHazardType.StealthRock && hazard.player!.id === player.id)
            if (stealthRock === undefined){
                stealthRock = new StealthRock(player);
                turn.GetEntryHazards().push(stealthRock);
                stealthRock?.OnApplied(turn,player);
            }
            else{
                stealthRock.OnApplyFail(turn,player);
            }
            break;

        }
        default:{
            throw new Error (`Entry hazard cannot be applied : ${type}`)
        }
    }
}

export abstract class EntryHazard{

    type:string = "";
    player?:Player = undefined;

    constructor(player:Player){
        this.player = player;
    }

    CanApply(turn:Turn,player:Player){
        return true;
    }
    OnApplied(turn:Turn,player:Player){

    }
    OnApplyFail(turn:Turn,player:Player){

    }
    OnPokemonEntry(turn:Turn,pokemon:Pokemon){

    }
}

export class Spikes extends EntryHazard{
    stage:number = 0;
    type:EntryHazardType = EntryHazardType.Spikes;
    player:Player;

    constructor(player:Player){
        super(player);
        this.player = player;
    }

    CanApply(turn:Turn,player:Player){
        return this.stage<3;
    }
    
    OnApplied(turn:Turn,player:Player){
         this.stage++;
    }
    OnApplyFail(turn:Turn,player:Player){
        turn.ApplyMessage("But it failed!");
    }
    OnPokemonEntry(turn:Turn,pokemon:Pokemon){   
        
        if (turn.GetPokemonOwner(pokemon).id !== this.player.id){
            return;
        }

        let damage = 0;
       if (this.stage === 1){
           damage = pokemon.originalStats.hp *0.125;
       }
       else if (this.stage === 2){
           damage = pokemon.originalStats.hp *0.1667;
       }
       else if (this.stage === 3){
        damage = pokemon.originalStats.hp *0.25;
       }
       turn.ApplyIndirectDamage(pokemon,damage);
       turn.ApplyMessage(`${pokemon.name} was hurt by spikes`);
    }
}

export class StealthRock extends EntryHazard{
    type:EntryHazardType = EntryHazardType.StealthRock
    OnApplied(turn:Turn,player:Player){
        turn.ApplyMessage(`Pointed stones float in the air around ${player.name}'s team.`);
    }
    OnApplyFail(turn:Turn,player:Player){
        turn.ApplyMessage("But it failed!");
    }
    OnPokemonEntry(turn:Turn,pokemon:Pokemon){
        const effectiveness = GetTypeMod(pokemon.elementalTypes,ElementType.Rock);

        let damageMod = 0;
        if (effectiveness >= 4){
            damageMod = 50;
        }
        else if (effectiveness>=2){
            damageMod = 25;
        }
        else if (effectiveness >=1){
            damageMod = 12.5;
        }
        else if (effectiveness >=0.5){
            damageMod = 6.25;
        }
        else if (effectiveness >=0.25){
            damageMod = 3.125;
        }

        if (damageMod > 0){
            const damage = pokemon.originalStats.hp / damageMod;
            turn.ApplyIndirectDamage(pokemon,damage);
            turn.ApplyMessage(`${pokemon.name} was hurt by stealth rock.`);
        }
    }
}


