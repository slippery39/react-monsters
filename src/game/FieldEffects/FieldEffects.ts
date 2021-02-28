import BattleBehaviour from "game/BattleBehaviour/BattleBehavior";
import { GetActivePokemon } from "game/HelperFunctions";
import { Player } from "game/Player/PlayerBuilder";
import { Pokemon } from "game/Pokemon/Pokemon";
import { Turn } from "game/Turn";
import _ from "lodash";


export enum FieldEffectType{
    None = "none",
    Wish = "wish"
}

export abstract class FieldEffect extends BattleBehaviour{
    name:FieldEffectType = FieldEffectType.None
    playerId:number = -1;
    OnCreated(turn:Turn,player:Player){

    }
}

export class WishFieldEffect extends FieldEffect{
    name:FieldEffectType = FieldEffectType.Wish
    playerId:number = -1; //need this...
    count:number =1;
    healingAmount:number = 1;

    OnCreated(turn:Turn,player:Player){
        this.playerId = player.id;
        const pokemon = GetActivePokemon(player);
        this.healingAmount = pokemon.originalStats.hp /2;
        turn.AddMessage(`${GetActivePokemon(player).name} made a wish!`)
    }


    EndOfTurn(turn: Turn, pokemon: Pokemon){
        if (this.count<2){
            this.count++;
        }
        else{
            turn.ApplyHealing(pokemon,this.healingAmount);
            turn.AddMessage(`${pokemon.name}'s wish came true!`);
            _.remove(turn.field.fieldEffects!,(fe=>fe===this));
        }
    }
}