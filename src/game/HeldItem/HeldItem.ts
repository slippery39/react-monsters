import BattleBehaviour from "game/BattleBehaviour/BattleBehavior";
import { IPokemon } from "game/Pokemon/Pokemon";
import { Technique } from "game/Techniques/Technique";
import { Turn } from "game/Turn";

export abstract class HeldItem extends BattleBehaviour{
    
}

export class LeftoversHeldItem extends HeldItem{

    EndOfTurn(turn: Turn, pokemon:IPokemon){
        const healing = Math.ceil(pokemon.originalStats.health / 16);
        turn.ApplyHealing(pokemon,healing);
        turn.ApplyMessage(`${pokemon.name} has healed due to its leftovers!`);
    }
    
}

export class LifeOrbHeldItem extends HeldItem{
    OnAfterDamageCalculated(attackingPokemon:IPokemon,move:Technique,defendingPokemon:IPokemon,damage:number,damageInfo:any):number{
        return damage*1.3;
    }
    OnDamageDealt(turn:Turn,attackingPokemon:IPokemon,defendingPokemon:IPokemon,damageDealt:number){
        //take recoil damage
        const recoilDamage = attackingPokemon.originalStats.health/10;
        turn.ApplyIndirectDamage(attackingPokemon,recoilDamage);
        turn.ApplyMessage(`${attackingPokemon.name} suffered recoil damage due to its Life Orb`);
        
    }
}


//Empty held item.
export class NoHeldItem extends HeldItem{

}

function GetHeldItem(name:string):HeldItem{

    switch(name.toLowerCase()){
        case "leftovers":{
            return new LeftoversHeldItem();
        }
        case "life orb":{
            return new LifeOrbHeldItem();
        }
        case "none":{
            return new NoHeldItem();
        }
        default:{
            throw new Error(`Could not find held item for ${name} in GetHeldItem`);
        }
    }
}


export default GetHeldItem;