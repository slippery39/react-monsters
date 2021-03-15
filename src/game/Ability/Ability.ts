import BattleBehaviour from "game/BattleBehaviour/BattleBehavior";
import { ApplyWeather, DoStatBoost, DoStatBoostParameters, InflictStatus, TargetType } from "game/Effects/Effects";
import { ElementType } from "game/ElementType";
import { Status } from "game/HardStatus/HardStatus";
import { GetActivePokemon, GetPercentageHealth, GetPokemonOwner } from "game/HelperFunctions";
import { Pokemon, StatMultiplier } from "game/Pokemon/Pokemon";
import { Stat } from "game/Stat";
import { DamageType, Technique } from "game/Techniques/Technique";
import { Turn } from "game/Turn";
import { RainingWeather, SunnyWeather, WeatherType } from "game/Weather/Weather";
import _, { shuffle } from "lodash";
import { stringify } from "querystring";




abstract class AbstractAbility extends BattleBehaviour {
    name: string = "";
    description: string = "";

    OnStatusChange(turn:Turn,pokemon:Pokemon,status:Status,source:Pokemon){

    }
}


class SpeedBoostAbility extends AbstractAbility {
    name = "Speed Boost"
    description = "Its Speed stat is boosted every turn."
    EndOfTurn(turn: Turn, pokemon: Pokemon) {
        if (pokemon.statBoosts[Stat.Speed] >= 6) {
            return;
        }
        DoStatBoost({
           turn:turn,
           stat:Stat.Speed,
           amount:1,
           pokemon:pokemon,
           sourcePokemon:pokemon,
           messageOverride:`${pokemon.name} speed has increased due to Speed Boost!`
        })
    }
}


class LevitateAbility extends AbstractAbility {
    name = "Levitate";
    description = "By floating in the air, the Pokémon receives full immunity to all Ground-type moves.";
    NegateDamage(turn: Turn, move: Technique, pokemon: Pokemon): boolean {
        if (move.elementalType === ElementType.Ground) {
            //no damage taken, maybe write a message
            turn.AddMessage(`It had no effect due to the pokemon's levitate!`);
            return true;
        }
        return false;
    }
}


class BlazeAbility extends AbstractAbility {
    name = "Blaze";
    description = "Powers up Fire-type moves when the Pokémon's HP is low"

    OnAfterDamageCalculated(attackingPokemon: Pokemon, move: Technique, defendingPokemon: Pokemon, damage: number, damageInfo: any, turn?: Turn) {
        if (move.elementalType === ElementType.Fire && GetPercentageHealth(attackingPokemon) <= 33) {
            return damage * 1.5;
        }
        return damage;
    }
}

class TorrentAbility extends AbstractAbility {
    name = "Torrent"
    description = "Powers up Water-type moves when the Pokémon's HP is low."
    OnAfterDamageCalculated(attackingPokemon: Pokemon, move: Technique, defendingPokemon: Pokemon, damage: number, damageInfo: any, turn?: Turn) {
        if (move.elementalType === ElementType.Water && GetPercentageHealth(attackingPokemon) <= 33) {
            return damage * 1.5;
        }
        return damage;
    }
}

class OvergrowAbility extends AbstractAbility {
    name = "Overgrow"
    description = "Powers up Grass-type moves when the Pokémon's HP is low."


    OnAfterDamageCalculated(attackingPokemon: Pokemon, move: Technique, defendingPokemon: Pokemon, damage: number, damageInfo: any, turn?: Turn) {
        if (move.elementalType === ElementType.Grass && GetPercentageHealth(attackingPokemon) <= 33) {
            return damage * 1.5;
        }
        return damage;
    }
}

class FlashFireAbility extends AbstractAbility {

    name = "Flash Fire"
    description = "Powers up the Pokémon's Fire-type moves if it's hit by one."

    NegateDamage(turn: Turn, move: Technique, pokemon: Pokemon): boolean {
        if (move.elementalType === ElementType.Fire) {
            //no damage taken, maybe write a message
            turn.AddMessage(`It had no effect due to the pokemon's flash fire ability!`);
            if (pokemon.flashFireActivated === false) {
                turn.AddMessage(`${pokemon.name}'s fire moves have been bposted due to flash fire!`);
            }
            //activate flash fire
            pokemon.flashFireActivated = true;
            return true;
        }
        return false;
    }
    OnAfterDamageCalculated(attackingPokemon: Pokemon, move: Technique, defendingPokemon: Pokemon, damage: number, damageInfo: any) {
        if (move.elementalType === ElementType.Fire && attackingPokemon.flashFireActivated) {
            return damage * 1.5;
        }
        return damage;
    }
}

class SheerForceAbility extends AbstractAbility {

    name = "Sheer Force";
    description = "Removes additional effects to increase the power of moves when attacking."

    ModifyTechnique(pokemon: Pokemon, technique: Technique) {

        if (!technique.effects || technique.damageType === DamageType.Status) {
            return technique;
        }
        const hasEFfect = technique.effects.filter(eff => eff.target && eff.target === TargetType.Enemy);
        if (!hasEFfect) {
            return technique;
        }
        const newTechnique = _.cloneDeep(technique);
        //from bulbapedia
        //Sheer Force raises the base power of all damaging moves that have any additional effects by 30%, but their additional effects are ignored.
        newTechnique.power = newTechnique.power * 1.3;
        newTechnique.effects = []; //all effects are gone muaahahaha       

        return newTechnique;
    }
}

class StaticAbility extends AbstractAbility {
    name = "Static"
    description = "The Pokémon is charged with static electricity, so contact with it may cause paralysis."

    OnDamageTakenFromTechnique(turn: Turn, attackingPokemon: Pokemon, defendingPokemon: Pokemon, move: Technique, damage: number) {
        if (move.makesContact) {
            const shouldParalyze = turn.Roll(30);
            if (shouldParalyze) {
                InflictStatus(turn, attackingPokemon, Status.Paralyzed, defendingPokemon)
            }
        }
    }
}

class SturdyAbility extends AbstractAbility {

    name = "Sturdy"
    description = "It cannot be knocked out with one hit."

    ModifyDamageTaken(turn: Turn, attackingPokemon: Pokemon, defendingPokemon: Pokemon, move: Technique, originalDamage: number) {
        let modifiedDamage = originalDamage;
        if (defendingPokemon.currentStats.hp === defendingPokemon.originalStats.hp && originalDamage >= defendingPokemon.currentStats.hp) {
            modifiedDamage = defendingPokemon.originalStats.hp - 1;
        }
        return modifiedDamage;
    }
    //Little hacky but will work for now.
    OnDamageTakenFromTechnique(turn: Turn, attackingPokemon: Pokemon, defendingPokemon: Pokemon, move: Technique, damage: number) {
        if (defendingPokemon.currentStats.hp === 1 && damage === defendingPokemon.originalStats.hp - 1) {
            turn.AddMessage(`${defendingPokemon.name} has survived due to its Sturdy ability!`);
        }
    }
}


class AnalyticAbility extends AbstractAbility {

    name = "Analytic"
    description = "Boosts move power when the Pokémon moves last."

    OnAfterDamageCalculated(attackingPokemon: Pokemon, move: Technique, defendingPokemon: Pokemon, damage: number, damageInfo: any, turn: Turn) {
        const attackingOwner = GetPokemonOwner(turn.GetPlayers(), attackingPokemon);

        if (turn.GetMoveOrder()[1].playerId === attackingOwner.id) {
            return damage * 1.3;
        }
        return damage;
    }
}

class SereneGraceAbility extends AbstractAbility {

    name = "Serene Grace"
    description = "Boosts the likelihood of added effects appearing."

    ModifyTechnique(pokemon: Pokemon, technique: Technique) {
        let newTechnique = _.cloneDeep(technique);

        //Should have no effect for status type moves.
        if (!newTechnique.effects || newTechnique.damageType === DamageType.Status) {
            return newTechnique;
        }

        newTechnique.effects?.forEach(effect => {
            if (!effect.chance) {
                effect.chance = 100;
            }
            effect.chance *= 2;
        });
        return newTechnique;
    }
}

class MarvelScaleAbility extends AbstractAbility {
    name = "Marvel Scale"
    description = "The Pokémon's marvelous scales boost the Defense stat if it has a status condition."

    //we will need to modify the damage taken somehow?
    //May need to call 

    //This gets recalculated on every "step"
    Update(turn: Turn, pokemon: Pokemon) {
        const multiplierTag = "MarvelScale";

        if (pokemon.status !== Status.None) {
            if (pokemon.statMultipliers.find(multi => multi.tag === multiplierTag) === undefined) {
                const multiplier: StatMultiplier = {
                    stat: Stat.Defense,
                    multiplier: 1.5,
                    tag: "MarvelScale"
                }

                pokemon.statMultipliers.push(multiplier);
            }
        }
        else {
            _.remove(pokemon.statMultipliers, function (mod) {
                return mod.tag === "MarvelScale"
            })
        }
    }
}

class IntimidateAbility extends AbstractAbility {
    name = "Intimidate"
    description = "The Pokémon intimidates opposing Pokémon upon entering battle, lowering their Attack stat."

    OnPokemonEntry(turn: Turn, pokemon: Pokemon,) {
        //find out what the other pokemon is
        //this should only effect the current pokemon
        const trainer = GetPokemonOwner(turn.GetPlayers(), pokemon);
        const otherTrainer = turn.GetPlayers().find(player => player.id !== trainer.id);

        if (otherTrainer === undefined) {
            throw new Error(`Could not find nother trainer in intimidate ability OnPokemonEntry`)
        }

        const otherTrainersPokemon = GetActivePokemon(otherTrainer);

        const params :DoStatBoostParameters = {
            turn:turn,
            pokemon:otherTrainersPokemon,
            stat:Stat.Attack,
            amount:-1,
            sourcePokemon:pokemon,
            messageOverride: `${pokemon.name}'s Intimidate cuts ${otherTrainersPokemon.name}'s attack!`         
        }
        DoStatBoost(params);
      }


}


class MagicGuardAbility extends AbstractAbility{
    name="Magic Guard"
    description="The Pokémon only takes damage from attacks."

    ModifyIndirectDamage(turn:Turn,pokemon:Pokemon,damage:number){
        return 0;
    }
}

class EffectSporeAbility extends AbstractAbility {
    name = "Effect Spore"
    description = "Contact with the Pokémon may inflict poison, sleep, or paralysis on its attacker."

    OnDamageTakenFromTechnique(turn: Turn, attackingPokemon: Pokemon, defendingPokemon: Pokemon, move: Technique, damage: number) {
        if (move.makesContact) {
            const shouldInflictStatus = turn.Roll(30);
            if (shouldInflictStatus) {
                const statusToInflict = shuffle([Status.Poison,Status.Sleep,Status.Paralyzed])[0];    
                turn.AddMessage(`${defendingPokemon.name} has released spores from contact!`);               
                InflictStatus(turn,attackingPokemon,statusToInflict,defendingPokemon);                           
            }
        }
    }
}

class VoltAbsorbAbility extends AbstractAbility{
    name="Volt Absorb"
    description="Restores HP if hit by an Electric-type move, instead of taking damage."

    NegateDamage(turn: Turn, move: Technique, pokemon: Pokemon): boolean {
        if (move.elementalType === ElementType.Electric) {
            //no damage taken, maybe write a message
            turn.AddMessage(`It had no effect due to the pokemon's Volt Absorb Ability!`);
            turn.AddMessage(`${pokemon.name} regained a bit of health due to Volt Absorb!`);
            return true;
        }
        return false;
    }
}

class MultiscaleAbility extends AbstractAbility{
    name="Multiscale"
    description='Reduces the amount of damage the Pokémon takes when its HP is full.'

    ModifyDamageTaken(turn: Turn, attackingPokemon: Pokemon, defendingPokemon: Pokemon, move: Technique, originalDamage: number) {
        if (defendingPokemon.currentStats.hp === defendingPokemon.originalStats.hp){
            return originalDamage/2;
        }
        else{
            return originalDamage;
        }
    }
}

class TechnicianAbility extends AbstractAbility{
    name="Technician";
    description="Powers up the Pokémon's weaker moves.";

    ModifyTechnique(pokemon: Pokemon, technique:Technique){
        if (technique.power<=60){
            let newTech = {...technique}
            newTech.power = newTech.power*1.5;
            return newTech;
        }
        return technique;
    }
}

class DrizzleAbility extends AbstractAbility{
    name="Drizzle"
    description="The Pokémon makes it rain when it enters a battle."

    OnPokemonEntry(turn: Turn, pokemon: Pokemon) {
        //find out what the other pokemon is
        //this should only effect the current pokemon
        const rainWeather = new RainingWeather();
        rainWeather.duration = 5;
        ApplyWeather(turn,rainWeather);
    }
}

class DroughtAbility extends AbstractAbility{
    name="Drought"
    description="Turns the sunlight harsh when the Pokémon enters a battle."

    OnPokemonEntry(turn: Turn, pokemon: Pokemon) {
        //find out what the other pokemon is
        //this should only effect the current pokemon
        const sunWeather = new SunnyWeather();
        sunWeather.duration = 5;
        ApplyWeather(turn,sunWeather);
    }
}

class ChlorophyllAbility extends AbstractAbility{
    name="Chlorophyll"
    description = "Boosts the Pokémon's Speed stat in sunshine"

    Update(turn:Turn, pokemon: Pokemon){
        if (!turn.field.weather){
            return;
        }
        //TODO: at the time we made this ability, sunlight was not implemented yet.... double check and remove this comment once we implement sunlight.
        if (turn.field.weather.name === WeatherType.Sunny){
            pokemon.statMultipliers.push({
                stat:Stat.Speed,
                multiplier:2,
                tag:this.name
            })
        }
        else{
            _.remove(pokemon.statMultipliers,(sm=>sm.tag===this.name));
        }
    }
}

class ClearBodyAbility extends AbstractAbility{
    name="Clear Body"
    description = "Prevents other Pokémon from lowering its stats."

    ModifyStatBoostAmount(turn: Turn, pokemon: Pokemon, amount: number, sourcePokemon: Pokemon){
        if (sourcePokemon.id!==pokemon.id){
            if (amount <= -1){
                turn.AddMessage(`${pokemon.name}'s clear body prevents negative stat boosts!`)
                return 0; //cannot have negative stat boosts done 
            }
        }
        return amount;
    }
}

class SynchronizeAbility extends AbstractAbility{
    name="Synchronize"
    description = "The attacker will receive the same status condition if it inflicts a burn, poison, or paralysis to the Pokémon."

    OnStatusChange(turn: Turn, pokemon: Pokemon, status: Status, source: Pokemon){
        if (source.id !== pokemon.id && [Status.Burned,Status.Paralyzed,Status.Poison,Status.ToxicPoison].includes(status)){
            if (source.status === Status.None){
                source.status = status;
                turn.AddMessage(`${pokemon.name} copied its status onto its foe due to the Synchronize ability!`);
            }
        }
    }
}

class LightningRodAbility extends AbstractAbility{
        name = "Lightning Rod"
        description = "The Pokémon draws in all Electric-type moves. Instead of being hit by Electric-type moves, it boosts its Sp. Atk."
    
        NegateDamage(turn: Turn, move: Technique, pokemon: Pokemon): boolean {
            if (move.elementalType === ElementType.Electric) {
                //no damage taken, maybe write a message
                turn.AddMessage(`${pokemon.name}'s lightning rod absorbed the electric move!`);
                DoStatBoost({
                   turn:turn,
                   pokemon:pokemon,
                   stat:Stat.SpecialAttack,
                   amount:1,
                   sourcePokemon:pokemon,
                })
                
                return true;
            }
            return false;
        }  
}

class PressureAbility extends AbstractAbility{
    name = "Pressure"
    description = "The Pokémon raises the foe's PP usage."

    OnOppTechniqueUsed(turn: Turn, pokemon: Pokemon, tech: Technique){
        tech.currentPP=1; //additional 
    }
}

class NoAbility extends AbstractAbility {

}

function GetAbility(name: String) {
    name = name.toLowerCase();

    switch (name) {
        case 'blaze': {
            return new BlazeAbility();
        }
        case 'torrent': {
            return new TorrentAbility();
        }
        case 'overgrow': {
            return new OvergrowAbility();
        }
        case 'levitate': {
            return new LevitateAbility();
        }
        case 'flash fire': {
            return new FlashFireAbility();
        }
        case 'sheer force': {
            return new SheerForceAbility();
        }
        case 'static': {
            return new StaticAbility();
        }
        case 'sturdy': {
            return new SturdyAbility();
        }
        case 'speed boost': {
            return new SpeedBoostAbility();
        }
        case 'analytic': {
            return new AnalyticAbility();
        }
        case 'serene grace': {
            return new SereneGraceAbility();
        }
        case 'marvel scale': {
            return new MarvelScaleAbility();
        }
        case 'intimidate': {
            return new IntimidateAbility();
        }
        case 'magic guard':{
            return new MagicGuardAbility();
        }
        case 'effect spore':{
            return new EffectSporeAbility();
        }
        case 'volt absorb':{
            return new VoltAbsorbAbility();
        }
        case 'multiscale':{
            return new MultiscaleAbility();
        }
        case 'technician':{
            return new TechnicianAbility();
        }
        case 'drizzle':{
            return new DrizzleAbility();
        }
        case 'chlorophyll':{
            return new ChlorophyllAbility();
        }
        case 'clear body':{
            return new ClearBodyAbility();
        }
        case 'synchronize':{
            return new SynchronizeAbility();
        }
        case 'lightning rod':{
            return new LightningRodAbility();
        }
        case 'pressure':{
            return new PressureAbility();
        }
        case 'drought':{
            return new DroughtAbility();
        }
        default: {
            console.warn(`Warning: Could not find passive ability for ability name : { ${name} } - using no ability instead`);
            return new NoAbility();
        }
    }
}

export default GetAbility
