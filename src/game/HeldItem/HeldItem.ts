import BattleBehaviour from "game/BattleBehaviour/BattleBehavior";
import { Pokemon } from "game/Pokemon/Pokemon";
import { Technique } from "game/Techniques/Technique";
import { Turn } from "game/Turn";

export abstract class HeldItem extends BattleBehaviour{
    name:string =""
    description:string = ""
}

export class LeftoversHeldItem extends HeldItem{
    name:string = "Leftovers"
    description = "An item to be held by a Pokémon. The holder's HP is gradually restored during battle."
    EndOfTurn(turn: Turn, pokemon:Pokemon){
        const healing = Math.ceil(pokemon.originalStats.hp / 16);
        turn.ApplyHealing(pokemon,healing);
        turn.AddMessage(`${pokemon.name} has healed due to its leftovers!`);
    }
    
}

export class LifeOrbHeldItem extends HeldItem{
    name:string = "Life Orb";
    description = "An item to be held by a Pokémon. It boosts the power of moves, but at the cost of some HP on each hit.";
    OnAfterDamageCalculated(attackingPokemon:Pokemon,move:Technique,defendingPokemon:Pokemon,damage:number,damageInfo:any):number{
        return damage*1.3;
    }
    OnDamageDealt(turn:Turn,attackingPokemon:Pokemon,defendingPokemon:Pokemon,damageDealt:number){
        //take recoil damage
        const recoilDamage = attackingPokemon.originalStats.hp/10;
        turn.ApplyIndirectDamage(attackingPokemon,recoilDamage);
        turn.AddMessage(`${attackingPokemon.name} suffered recoil damage due to its Life Orb`);
        
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