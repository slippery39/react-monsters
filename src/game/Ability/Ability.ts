import BattleBehaviour from "game/BattleBehaviour/BattleBehavior";
import { ElementType } from "game/ElementType";
import { GetPercentageHealth} from "game/HelperFunctions";
import { IPokemon } from "game/Pokemon/Pokemon";
import { Technique } from "game/Techniques/Technique";


abstract class AbstractAbility extends BattleBehaviour{ 
    OnAfterDamageCalculated(attackingPokemon:IPokemon,move:Technique,defendingPokemon:IPokemon,damage:number,damageInfo:any){
        //default is to just return the same damage that gets put in.
        return damage;
    }
}


class BlazeAbility extends AbstractAbility{
    OnAfterDamageCalculated(attackingPokemon:IPokemon,move:Technique,defendingPokemon:IPokemon,damage:number,damageInfo:any){
        if (move.elementalType === ElementType.Fire && GetPercentageHealth(attackingPokemon)<=33){
            return damage*1.5;
        }
        return damage;
    }
}

class TorrentAbility extends AbstractAbility{
    OnAfterDamageCalculated(attackingPokemon:IPokemon,move:Technique,defendingPokemon:IPokemon,damage:number,damageInfo:any){
        if (move.elementalType === ElementType.Water && GetPercentageHealth(attackingPokemon)<=33){
            return damage*1.5;
        }
        return damage;
    }
}

class OverGrowthAbility extends AbstractAbility{
    OnAfterDamageCalculated(attackingPokemon:IPokemon,move:Technique,defendingPokemon:IPokemon,damage:number,damageInfo:any){
        if (move.elementalType === ElementType.Grass && GetPercentageHealth(attackingPokemon)<=33){
            return damage*1.5;
        }
        return damage;
    }
}

class NoAbility extends AbstractAbility{

}

function GetAbility(name:String){
    name = name.toLowerCase();

    switch(name){
        case 'blaze':{
            return new BlazeAbility();
        }
        case 'torrent':{
            return new TorrentAbility();
        }
        case 'overgrowth':{
            return new OverGrowthAbility();
        }
        default:{
            return new NoAbility();
        }
    }
}

export default GetAbility
