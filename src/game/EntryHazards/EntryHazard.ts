import { Player } from "game/Player/PlayerBuilder";
import { IPokemon } from "game/Pokemon/Pokemon";
import { Turn } from "game/Turn";


export enum EntryHazardType{
    Spikes = 'spikes'
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
        default:{
            throw new Error (`Entry hazard cannot be applyed : ${type}`)
        }
    }
}

export abstract class EntryHazard{

    type:string = "";
    player?:Player = undefined;

    constructor(player:Player){

    }

    CanApply(turn:Turn,player:Player){
        return true;
    }
    OnApplied(turn:Turn,player:Player){

    }
    OnApplyFail(turn:Turn,player:Player){

    }
    OnPokemonEntry(turn:Turn,pokemon:IPokemon){

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
    OnPokemonEntry(turn:Turn,pokemon:IPokemon){   
        
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


