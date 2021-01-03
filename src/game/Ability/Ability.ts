import PokemonImage from "components/PokemonImage/PokemonImage";
import BattleBehaviour from "game/BattleBehaviour/BattleBehavior";
import { InflictStatus, TargetType } from "game/Effects/Effects";
import { ElementType } from "game/ElementType";
import { Status } from "game/HardStatus/HardStatus";
import { GetPercentageHealth} from "game/HelperFunctions";
import { ApplyStatBoost, Pokemon } from "game/Pokemon/Pokemon";
import { Stat } from "game/Stat";
import { Technique } from "game/Techniques/Technique";
import { Turn } from "game/Turn";
import _ from "lodash";



abstract class AbstractAbility extends BattleBehaviour{ 
    OnAfterDamageCalculated(attackingPokemon:Pokemon,move:Technique,defendingPokemon:Pokemon,damage:number,damageInfo:any){
        //default is to just return the same damage that gets put in.
        return damage;
    }
    NegateDamage(turn:Turn,move:Technique,pokemon:Pokemon):boolean{
        return false; //by default no abilities should negate damage unless we say so.
    }
    ModifyDamageTaken(turn:Turn,attackingPokemon:Pokemon,defendingPokemon:Pokemon,move:Technique,originalDamage:number){
        return originalDamage;
    }
}


class SpeedBoostAbility extends AbstractAbility{
    EndOfTurn(turn:Turn,pokemon:Pokemon){
        if (pokemon.statBoosts[Stat.Speed] >=6){
            return;
        }
        ApplyStatBoost(pokemon,Stat.Speed,1);
        turn.ApplyMessage(`${pokemon.name} speed has increased due to Speed Boost!`);

    }
}


class LevitateAbility extends AbstractAbility{
    NegateDamage(turn:Turn,move:Technique,pokemon:Pokemon):boolean{
        if (move.elementalType === ElementType.Ground){
            //no damage taken, maybe write a message
            turn.ApplyMessage(`It had no effect due to the pokemon's levitate!`);
            return true;
        }
        return false;
    }
}


class BlazeAbility extends AbstractAbility{
    OnAfterDamageCalculated(attackingPokemon:Pokemon,move:Technique,defendingPokemon:Pokemon,damage:number,damageInfo:any){
        if (move.elementalType === ElementType.Fire && GetPercentageHealth(attackingPokemon)<=33){
            return damage*1.5;
        }
        return damage;
    }
}

class TorrentAbility extends AbstractAbility{
    OnAfterDamageCalculated(attackingPokemon:Pokemon,move:Technique,defendingPokemon:Pokemon,damage:number,damageInfo:any){
        if (move.elementalType === ElementType.Water && GetPercentageHealth(attackingPokemon)<=33){
            return damage*1.5;
        }
        return damage;
    }
}

class OverGrowthAbility extends AbstractAbility{
    OnAfterDamageCalculated(attackingPokemon:Pokemon,move:Technique,defendingPokemon:Pokemon,damage:number,damageInfo:any){
        if (move.elementalType === ElementType.Grass && GetPercentageHealth(attackingPokemon)<=33){
            return damage*1.5;
        }
        return damage;
    }
}

class FlashFireAbility extends AbstractAbility{
    NegateDamage(turn:Turn,move:Technique,pokemon:Pokemon):boolean{
        if (move.elementalType === ElementType.Fire){
            //no damage taken, maybe write a message
                turn.ApplyMessage(`It had no effect due to the pokemon's flash fire ability!`);
            if (pokemon.flashFireActivated === false){
                turn.ApplyMessage(`${pokemon.name}'s fire moves have been bposted due to flash fire!`);
            }
            //activate flash fire
            pokemon.flashFireActivated = true;
            return true;
        }
        return false;
    }
    OnAfterDamageCalculated(attackingPokemon:Pokemon,move:Technique,defendingPokemon:Pokemon,damage:number,damageInfo:any){
        if (move.elementalType === ElementType.Fire && attackingPokemon.flashFireActivated){
            return damage*1.5;
        }
        return damage;
    }
}

class SheerForceAbility extends AbstractAbility{
    ModifyTechnique(pokemon:Pokemon,technique:Technique){        

        if (!technique.effects){
            return technique;
        }
        const hasEFfect = technique.effects.filter(eff=>eff.target && eff.target === TargetType.Enemy);
        if (!hasEFfect){
            return technique;
        }
        const newTechnique = _.cloneDeep(technique);
        //from bulbapedia
        //Sheer Force raises the base power of all damaging moves that have any additional effects by 30%, but their additional effects are ignored.
        newTechnique.power = newTechnique.power *1.3;
        newTechnique.effects = []; //all effects are gone muaahahaha       

        return newTechnique;
    }
}

class StaticAbility extends AbstractAbility{
    OnDamageTakenFromTechnique(turn:Turn,attackingPokemon:Pokemon,defendingPokemon:Pokemon,move:Technique,damage:number){
        console.warn('on damage taken from technique is firing');
        console.warn(move);
        if (move.makesContact){
            const shouldParalyze = turn.Roll(30);
            if (shouldParalyze){
                InflictStatus(turn,attackingPokemon,Status.Paralyzed,defendingPokemon) 
            }
        }
    }
}

class SturdyAbility extends AbstractAbility{
    ModifyDamageTaken(turn:Turn,attackingPokemon:Pokemon,defendingPokemon:Pokemon,move:Technique,originalDamage:number){
        let modifiedDamage = originalDamage;
        if (defendingPokemon.currentStats.hp === defendingPokemon.originalStats.hp && originalDamage>=defendingPokemon.currentStats.hp){
            modifiedDamage = defendingPokemon.originalStats.hp -1;
        }
        return modifiedDamage;
    }
    //Little hacky but will work for now.
    OnDamageTakenFromTechnique(turn:Turn,attackingPokemon:Pokemon,defendingPokemon:Pokemon,move:Technique,damage:number){
          if (defendingPokemon.currentStats.hp === 1 && damage === defendingPokemon.originalStats.hp -1){
            turn.ApplyMessage(`${defendingPokemon.name} has survived due to its Sturdy ability!`);
        }
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
        case 'levitate':{
            return new LevitateAbility();
        }
        case 'flash fire':{
            return new FlashFireAbility();
        }
        case 'sheer force':{
            return new SheerForceAbility();
        }
        case 'static':{
            return new StaticAbility();
        }
        case 'sturdy':{
            return new SturdyAbility();
        }
        case 'speed boost':{
            return new SpeedBoostAbility();
        }
        default:{
            console.warn(`Warning: Could not find passive ability for ability name : { ${name} } - using no ability instead`);
            return new NoAbility();
        }
    }
}

export default GetAbility
