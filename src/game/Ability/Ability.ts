import BattleBehaviour from "game/BattleBehaviour/BattleBehavior";
import { InflictStatus, TargetType } from "game/Effects/Effects";
import { ElementType } from "game/ElementType";
import { Status } from "game/HardStatus/HardStatus";
import { GetPercentageHealth, GetPokemonOwner} from "game/HelperFunctions";
import { ApplyStatBoost, Pokemon } from "game/Pokemon/Pokemon";
import { Stat } from "game/Stat";
import { DamageType, Technique } from "game/Techniques/Technique";
import { Turn } from "game/Turn";
import _ from "lodash";



abstract class AbstractAbility extends BattleBehaviour{ 
    name:string = "";
    description:string = "";
}


class SpeedBoostAbility extends AbstractAbility{
    name ="Speed Boost"
    description = "Its Speed stat is boosted every turn."
    EndOfTurn(turn:Turn,pokemon:Pokemon){
        if (pokemon.statBoosts[Stat.Speed] >=6){
            return;
        }
        ApplyStatBoost(pokemon,Stat.Speed,1);
        turn.AddMessage(`${pokemon.name} speed has increased due to Speed Boost!`);

    }
}


class LevitateAbility extends AbstractAbility{
    name="Levitate";
    description = "By floating in the air, the Pokémon receives full immunity to all Ground-type moves.";
    NegateDamage(turn:Turn,move:Technique,pokemon:Pokemon):boolean{
        if (move.elementalType === ElementType.Ground){
            //no damage taken, maybe write a message
            turn.AddMessage(`It had no effect due to the pokemon's levitate!`);
            return true;
        }
        return false;
    }
}


class BlazeAbility extends AbstractAbility{
    name="Blaze";
    description = "Powers up Fire-type moves when the Pokémon's HP is low"

    OnAfterDamageCalculated(attackingPokemon:Pokemon,move:Technique,defendingPokemon:Pokemon,damage:number,damageInfo:any,turn?:Turn){
        if (move.elementalType === ElementType.Fire && GetPercentageHealth(attackingPokemon)<=33){
            return damage*1.5;
        }
        return damage;
    }
}

class TorrentAbility extends AbstractAbility{
    name="Torrent"
    description = "Powers up Water-type moves when the Pokémon's HP is low."
    OnAfterDamageCalculated(attackingPokemon:Pokemon,move:Technique,defendingPokemon:Pokemon,damage:number,damageInfo:any,turn?:Turn){
        if (move.elementalType === ElementType.Water && GetPercentageHealth(attackingPokemon)<=33){
            return damage*1.5;
        }
        return damage;
    }
}

class OvergrowAbility extends AbstractAbility{
    name = "Overgrow"
    description = "Powers up Grass-type moves when the Pokémon's HP is low."   


    OnAfterDamageCalculated(attackingPokemon:Pokemon,move:Technique,defendingPokemon:Pokemon,damage:number,damageInfo:any,turn?:Turn){
        if (move.elementalType === ElementType.Grass && GetPercentageHealth(attackingPokemon)<=33){
            return damage*1.5;
        }
        return damage;
    }
}

class FlashFireAbility extends AbstractAbility{

    name = "Flash Fire"
    description = "Powers up the Pokémon's Fire-type moves if it's hit by one."    

    NegateDamage(turn:Turn,move:Technique,pokemon:Pokemon):boolean{
        if (move.elementalType === ElementType.Fire){
            //no damage taken, maybe write a message
                turn.AddMessage(`It had no effect due to the pokemon's flash fire ability!`);
            if (pokemon.flashFireActivated === false){
                turn.AddMessage(`${pokemon.name}'s fire moves have been bposted due to flash fire!`);
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

    name = "Sheer Force";
    description = "Removes additional effects to increase the power of moves when attacking."

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
    name = "Static"
    description = "The Pokémon is charged with static electricity, so contact with it may cause paralysis."

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

    name = "Sturdy"
    description = "It cannot be knocked out with one hit."

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
            turn.AddMessage(`${defendingPokemon.name} has survived due to its Sturdy ability!`);
        }
    }
}


class AnalyticAbility extends AbstractAbility{

    name = "Analytic"
    description = "Boosts move power when the Pokémon moves last."

    OnAfterDamageCalculated(attackingPokemon:Pokemon,move:Technique,defendingPokemon:Pokemon,damage:number,damageInfo:any,turn:Turn){
        const attackingOwner = GetPokemonOwner(turn.GetPlayers(),attackingPokemon);

        if (turn.GetMoveOrder()[1].playerId === attackingOwner.id ){
            console.warn('analytic ability triggering');
            return damage*1.3;
        }
        return damage;
    }
}

class SereneGraceAbility extends AbstractAbility{

    name = "Serene Grace"
    description = "Boosts the likelihood of added effects appearing."

    ModifyTechnique(pokemon:Pokemon,technique:Technique){   
        let newTechnique = _.cloneDeep(technique);

        //Should have no effect for status type moves.
        if (!newTechnique.effects || newTechnique.damageType === DamageType.Status){
              return newTechnique;
        }

        newTechnique.effects?.forEach(effect=>{
            if (!effect.chance){
                effect.chance = 100;
            }            
            effect.chance*=2;
        });
        return newTechnique;
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
        case 'overgrow':{
            return new OvergrowAbility();
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
        case 'analytic':{
            return new AnalyticAbility();
        }
        case 'serene grace':{
            return new SereneGraceAbility();
        }
        default:{
            console.warn(`Warning: Could not find passive ability for ability name : { ${name} } - using no ability instead`);
            return new NoAbility();
        }
    }
}

export default GetAbility
