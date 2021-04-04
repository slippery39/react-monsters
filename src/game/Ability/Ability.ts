import { BattleAction } from "game/BattleActions";
import BattleBehaviour from "game/BattleBehaviour/BattleBehavior";
import { IGame } from "game/BattleGame";
import { ApplyWeather, DoStatBoost, DoStatBoostParameters, InflictStatus, TargetType } from "game/Effects/Effects";
import { ElementType } from "game/ElementType";
import { Status } from "game/HardStatus/HardStatus";
import { GetActivePokemon, GetPercentageHealth, GetPokemonOwner } from "game/HelperFunctions";
import { Player } from "game/Player/PlayerBuilder";
import { Pokemon, StatMultiplier } from "game/Pokemon/Pokemon";
import { Stat } from "game/Stat";
import { DamageType, Technique } from "game/Techniques/Technique";
import { RainingWeather, SandstormWeather, SunnyWeather, WeatherType } from "game/Weather/Weather";
import _, { shuffle } from "lodash";





abstract class AbstractAbility extends BattleBehaviour {
    name: string = "";
    description: string = "";

    OnStatusChange(game: IGame, pokemon: Pokemon, status: Status, source: Pokemon) {

    }
}


class SpeedBoostAbility extends AbstractAbility {
    name = "Speed Boost"
    description = "Its Speed stat is boosted every turn."
    EndOfTurn(game: IGame, pokemon: Pokemon) {
        if (pokemon.statBoosts[Stat.Speed] >= 6) {
            return;
        }
        DoStatBoost({
            game: game,
            stat: Stat.Speed,
            amount: 1,
            pokemon: pokemon,
            sourcePokemon: pokemon,
            messageOverride: `${pokemon.name} speed has increased due to Speed Boost!`
        })
    }
}


class LevitateAbility extends AbstractAbility {
    name = "Levitate";
    description = "By floating in the air, the Pokémon receives full immunity to all Ground-type moves.";
    NegateDamage(game: IGame, move: Technique, pokemon: Pokemon): boolean {
        if (move.elementalType === ElementType.Ground) {
            //no damage taken, maybe write a message
            game.AddMessage(`It had no effect due to the pokemon's levitate!`);
            return true;
        }
        return false;
    }
}


class BlazeAbility extends AbstractAbility {
    name = "Blaze";
    description = "Powers up Fire-type moves when the Pokémon's HP is low"

    OnAfterDamageCalculated(attackingPokemon: Pokemon, move: Technique, defendingPokemon: Pokemon, damage: number, damageInfo: any, game?: IGame) {
        if (move.elementalType === ElementType.Fire && GetPercentageHealth(attackingPokemon) <= 33) {
            return damage * 1.5;
        }
        return damage;
    }
}

class TorrentAbility extends AbstractAbility {
    name = "Torrent"
    description = "Powers up Water-type moves when the Pokémon's HP is low."
    OnAfterDamageCalculated(attackingPokemon: Pokemon, move: Technique, defendingPokemon: Pokemon, damage: number, damageInfo: any, game?: IGame) {
        if (move.elementalType === ElementType.Water && GetPercentageHealth(attackingPokemon) <= 33) {
            return damage * 1.5;
        }
        return damage;
    }
}

class OvergrowAbility extends AbstractAbility {
    name = "Overgrow"
    description = "Powers up Grass-type moves when the Pokémon's HP is low."


    OnAfterDamageCalculated(attackingPokemon: Pokemon, move: Technique, defendingPokemon: Pokemon, damage: number, damageInfo: any, game?: IGame) {
        if (move.elementalType === ElementType.Grass && GetPercentageHealth(attackingPokemon) <= 33) {
            return damage * 1.5;
        }
        return damage;
    }
}

class FlashFireAbility extends AbstractAbility {

    name = "Flash Fire"
    description = "Powers up the Pokémon's Fire-type moves if it's hit by one."

    NegateDamage(game: IGame, move: Technique, pokemon: Pokemon): boolean {
        if (move.elementalType === ElementType.Fire) {
            //no damage taken, maybe write a message
            game.AddMessage(`It had no effect due to the pokemon's flash fire ability!`);
            if (pokemon.flashFireActivated === false) {
                game.AddMessage(`${pokemon.name}'s fire moves have been bposted due to flash fire!`);
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

    OnDamageTakenFromTechnique(game: IGame, attackingPokemon: Pokemon, defendingPokemon: Pokemon, move: Technique, damage: number) {
        if (move.makesContact) {
            const shouldParalyze = game.Roll(30);
            if (shouldParalyze) {
                InflictStatus(game, attackingPokemon, Status.Paralyzed, defendingPokemon)
            }
        }
    }
}

class SturdyAbility extends AbstractAbility {

    name = "Sturdy"
    description = "It cannot be knocked out with one hit."

    ModifyDamageTaken(turn: IGame, attackingPokemon: Pokemon, defendingPokemon: Pokemon, move: Technique, originalDamage: number) {
        let modifiedDamage = originalDamage;
        if (defendingPokemon.currentStats.hp === defendingPokemon.originalStats.hp && originalDamage >= defendingPokemon.currentStats.hp) {
            modifiedDamage = defendingPokemon.originalStats.hp - 1;
        }
        return modifiedDamage;
    }
    //Little hacky but will work for now.
    OnDamageTakenFromTechnique(turn: IGame, attackingPokemon: Pokemon, defendingPokemon: Pokemon, move: Technique, damage: number) {
        if (defendingPokemon.currentStats.hp === 1 && damage === defendingPokemon.originalStats.hp - 1) {
            turn.AddMessage(`${defendingPokemon.name} has survived due to its Sturdy ability!`);
        }
    }
}


class AnalyticAbility extends AbstractAbility {

    name = "Analytic"
    description = "Boosts move power when the Pokémon moves last."

    OnAfterDamageCalculated(attackingPokemon: Pokemon, move: Technique, defendingPokemon: Pokemon, damage: number, damageInfo: any, turn: IGame) {
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

        /*
        if (technique.name.toLowerCase() === 'headbutt'){
        console.log("original technique",technique);
        
        }
        */

        //Should have no effect for status type moves.
        if (!newTechnique.effects || newTechnique.damageType === DamageType.Status) {
            return newTechnique;
        }

        newTechnique.effects?.forEach(effect => {
            if (!effect.chance) {
                effect.chance = 100;
            }
            effect.chance = effect.chance * 2;
        });
        /*
        if (technique.name.toLowerCase() === 'headbutt'){
            console.log("Technique has been modified",newTechnique);
        }
        */
        return newTechnique;
    }
}

class MarvelScaleAbility extends AbstractAbility {
    name = "Marvel Scale"
    description = "The Pokémon's marvelous scales boost the Defense stat if it has a status condition."

    //we will need to modify the damage taken somehow?
    //May need to call 

    //This gets recalculated on every "step"
    Update(game: IGame, pokemon: Pokemon) {
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

    OnPokemonEntry(game: IGame, pokemon: Pokemon,) {
        //find out what the other pokemon is
        //this should only effect the current pokemon
        const trainer = GetPokemonOwner(game.GetPlayers(), pokemon);
        const otherTrainer = game.GetPlayers().find(player => player.id !== trainer.id);

        if (otherTrainer === undefined) {
            throw new Error(`Could not find nother trainer in intimidate ability OnPokemonEntry`)
        }

        const otherTrainersPokemon = GetActivePokemon(otherTrainer);

        const params: DoStatBoostParameters = {
            game: game,
            pokemon: otherTrainersPokemon,
            stat: Stat.Attack,
            amount: -1,
            sourcePokemon: pokemon,
            messageOverride: `${pokemon.name}'s Intimidate cuts ${otherTrainersPokemon.name}'s attack!`
        }
        DoStatBoost(params);
    }


}


class MagicGuardAbility extends AbstractAbility {
    name = "Magic Guard"
    description = "The Pokémon only takes damage from attacks."

    ModifyIndirectDamage(turn: IGame, pokemon: Pokemon, damage: number) {
        return 0;
    }
}

class EffectSporeAbility extends AbstractAbility {
    name = "Effect Spore"
    description = "Contact with the Pokémon may inflict poison, sleep, or paralysis on its attacker."

    OnDamageTakenFromTechnique(game: IGame, attackingPokemon: Pokemon, defendingPokemon: Pokemon, move: Technique, damage: number) {
        if (move.makesContact) {
            const shouldInflictStatus = game.Roll(30);
            if (shouldInflictStatus) {
                const statusToInflict = shuffle([Status.Poison, Status.Sleep, Status.Paralyzed])[0];
                game.AddMessage(`${defendingPokemon.name} has released spores from contact!`);
                InflictStatus(game, attackingPokemon, statusToInflict, defendingPokemon);
            }
        }
    }
}

class VoltAbsorbAbility extends AbstractAbility {
    name = "Volt Absorb"
    description = "Restores HP if hit by an Electric-type move, instead of taking damage."

    NegateDamage(game: IGame, move: Technique, pokemon: Pokemon): boolean {
        if (move.elementalType === ElementType.Electric) {
            //no damage taken, maybe write a message
            game.AddMessage(`It had no effect due to the pokemon's Volt Absorb Ability!`);
            game.AddMessage(`${pokemon.name} regained a bit of health due to Volt Absorb!`);
            return true;
        }
        return false;
    }
}

class MultiscaleAbility extends AbstractAbility {
    name = "Multiscale"
    description = 'Reduces the amount of damage the Pokémon takes when its HP is full.'

    ModifyDamageTaken(game: IGame, attackingPokemon: Pokemon, defendingPokemon: Pokemon, move: Technique, originalDamage: number) {
        if (defendingPokemon.currentStats.hp === defendingPokemon.originalStats.hp) {
            return originalDamage / 2;
        }
        else {
            return originalDamage;
        }
    }
}

class TechnicianAbility extends AbstractAbility {
    name = "Technician";
    description = "Powers up the Pokémon's weaker moves.";

    ModifyTechnique(pokemon: Pokemon, technique: Technique) {
        if (technique.power <= 60) {
            let newTech = { ...technique }
            newTech.power = newTech.power * 1.5;
            return newTech;
        }
        return technique;
    }
}

class DrizzleAbility extends AbstractAbility {
    name = "Drizzle"
    description = "The Pokémon makes it rain when it enters a battle."

    OnPokemonEntry(game: IGame, pokemon: Pokemon) {
        //find out what the other pokemon is
        //this should only effect the current pokemon
        const rainWeather = new RainingWeather();
        rainWeather.duration = 5;
        ApplyWeather(game, rainWeather);
    }
}

class DroughtAbility extends AbstractAbility {
    name = "Drought"
    description = "Turns the sunlight harsh when the Pokémon enters a battle."

    OnPokemonEntry(game: IGame, pokemon: Pokemon) {
        //find out what the other pokemon is
        //this should only effect the current pokemon
        const sunWeather = new SunnyWeather();
        sunWeather.duration = 5;
        ApplyWeather(game, sunWeather);
    }
}

class ChlorophyllAbility extends AbstractAbility {
    name = "Chlorophyll"
    description = "Boosts the Pokémon's Speed stat in sunshine"

    Update(game: IGame, pokemon: Pokemon) {
        if (!game.field.weather) {
            return;
        }
        //TODO: at the time we made this ability, sunlight was not implemented yet.... double check and remove this comment once we implement sunlight.
        if (game.field.weather.name === WeatherType.Sunny) {
            pokemon.statMultipliers.push({
                stat: Stat.Speed,
                multiplier: 2,
                tag: this.name
            })
        }
        else {
            _.remove(pokemon.statMultipliers, (sm => sm.tag === this.name));
        }
    }
}

class ClearBodyAbility extends AbstractAbility {
    name = "Clear Body"
    description = "Prevents other Pokémon from lowering its stats."

    ModifyStatBoostAmount(game: IGame, pokemon: Pokemon, amount: number, sourcePokemon: Pokemon) {
        if (sourcePokemon.id !== pokemon.id) {
            if (amount <= -1) {
                game.AddMessage(`${pokemon.name}'s clear body prevents negative stat boosts!`)
                return 0; //cannot have negative stat boosts done 
            }
        }
        return amount;
    }
}

class SynchronizeAbility extends AbstractAbility {
    name = "Synchronize"
    description = "The attacker will receive the same status condition if it inflicts a burn, poison, or paralysis to the Pokémon."

    OnStatusChange(game: IGame, pokemon: Pokemon, status: Status, source: Pokemon) {
        if (source.id !== pokemon.id && [Status.Burned, Status.Paralyzed, Status.Poison, Status.ToxicPoison].includes(status)) {
            if (source.status === Status.None) {
                source.status = status;
                game.AddMessage(`${pokemon.name} copied its status onto its foe due to the Synchronize ability!`);
            }
        }
    }
}

class LightningRodAbility extends AbstractAbility {
    name = "Lightning Rod"
    description = "The Pokémon draws in all Electric-type moves. Instead of being hit by Electric-type moves, it boosts its Sp. Atk."

    NegateDamage(game: IGame, move: Technique, pokemon: Pokemon): boolean {
        if (move.elementalType === ElementType.Electric) {
            //no damage taken, maybe write a message
            game.AddMessage(`${pokemon.name}'s lightning rod absorbed the electric move!`);
            DoStatBoost({
                game: game,
                pokemon: pokemon,
                stat: Stat.SpecialAttack,
                amount: 1,
                sourcePokemon: pokemon,
            })

            return true;
        }
        return false;
    }
}

class PressureAbility extends AbstractAbility {
    name = "Pressure"
    description = "The Pokémon raises the foe's PP usage."

    OnOppTechniqueUsed(turn: IGame, pokemon: Pokemon, tech: Technique) {
        tech.currentPP -= 1;
    }
}



class SandStreamAbility extends AbstractAbility {
    name = "Sand Stream"
    description = "The Pokémon summons a sandstorm when it enters a battle."

    OnPokemonEntry(game: IGame, pokemon: Pokemon) {
        //find out what the other pokemon is
        //this should only effect the current pokemon
        const sandWeather = new SandstormWeather();
        sandWeather.duration = 5;
        ApplyWeather(game, sandWeather);
    }
}


//Note we have hard coded the work around for substitute inside the Game class itself... 
class InfiltratorAbility extends AbstractAbility {
    name = "Infiltrator";
    description = "Passes through the opposing Pokémon’s barrier, substitute, and the like and strikes."
}

class ThickFatAbility extends AbstractAbility {
    name = "Thick Fat";
    description = "The Pokémon is protected by a layer of thick fat, which halves the damage taken from Fire- and Ice-type moves.";

    ModifyDamageTaken(game: IGame, attackingPokemon: Pokemon, defendingPokemon: Pokemon, technique: Technique, damage: number) {
        if ([ElementType.Fire, ElementType.Ice].includes(technique.elementalType)) {
            return damage / 2;
        }
        return damage;
    }
}

class RoughSkinAbility extends AbstractAbility {
    name = "Rough Skin";
    description = "This Pokémon inflicts damage with its rough skin to the attacker on contact.";

    OnDamageTakenFromTechnique(game: IGame, attackingPokemon: Pokemon, defendingPokemon: Pokemon, move: Technique, damage: number) {
        if (move.makesContact) {
            game.ApplyIndirectDamage(attackingPokemon, defendingPokemon.originalStats.hp / 6, `${defendingPokemon.name} took damage due to ${attackingPokemon.name}'s rough skin!`);
        }
    }
}


//The unnerve ability is applied to the "Lum Berry" held item right now.. since we won't have many actual berries implemented.
class UnnerveAbility extends AbstractAbility {
    name = "Unnerve";
    description = "Unnerves opposing Pokémon and makes them unable to eat Berries.";
}

class JustifiedAbility extends AbstractAbility {
    name = "Justified";
    description = "Being hit by a Dark-type move boosts the Attack stat of the Pokémon, for justice.";

    OnDamageTakenFromTechnique(game: IGame, attackingPokemon: Pokemon, defendingPokemon: Pokemon, tech: Technique, damage: number) {
        if (tech.elementalType === ElementType.Dark) {

            const statBoostParams: DoStatBoostParameters = {
                game: game,
                pokemon: defendingPokemon,
                amount: 1,
                stat: Stat.Attack,
                sourcePokemon: attackingPokemon
            }
            DoStatBoost(statBoostParams);
        }
    }
}

class ArenaTrapAbility extends AbstractAbility {
    name = "Arena Trap";
    description = "Prevents opposing Pokémon from fleeing.";

    ModifyOpponentValidActions(game: IGame, player: Player, currentValidActions: BattleAction[]) {

        if (GetActivePokemon(player).currentStats.hp <= 0) {
            return currentValidActions; //opponent should still be able to switch out pokemon with 0 health.
        }

        if (GetActivePokemon(player).elementalTypes.includes(ElementType.Flying)) {
            return currentValidActions;
        }
        //edge case for levitate
        if (GetActivePokemon(player).ability.toLowerCase() === "levitate") {
            return currentValidActions
        }
        //remove all switch pokemon actions away.

        const newActions = currentValidActions.filter(act => act.type !== 'switch-pokemon-action');
        return newActions;

    }
}

class WaterAbsorbAbility extends AbstractAbility {
    name = "Water Absorb";
    description = "Restores HP if hit by a Water-type move instead of taking damage."

    NegateDamage(game: IGame, move: Technique, pokemon: Pokemon): boolean {
        if (move.elementalType === ElementType.Water) {
            //no damage taken, maybe write a message
            game.ApplyHealing(pokemon,pokemon.originalStats.hp/4);
            game.AddMessage(`${pokemon.name} absorbed the water attack!`);
            return true;
        }
        return false;
    }    
}

class NoGuardAbility extends AbstractAbility{
    name="No Guard";
    description = "The Pokémon employs no-guard tactics to ensure incoming and outgoing attacks always land.";

    ModifyTechnique(pokemon: Pokemon, technique: Technique) {

        const newTech = _.cloneDeep(technique);
        newTech.accuracy = 99999;
        return newTech;
    }
    ModifyOpponentTechnique(pokemon:Pokemon,technique:Technique){
        const newTech = _.cloneDeep(technique);
        newTech.accuracy = 99999;
        return newTech;
    }
}

class DrySkinAbility extends AbstractAbility{
    name="Dry Skin";
    description="Restores HP in rain or when hit by Water-type moves. Reduces HP in harsh sunlight, and increases the damage received from Fire-type moves.";


    NegateDamage(game: IGame, move: Technique, pokemon: Pokemon): boolean {
        if (move.elementalType === ElementType.Water){
            game.ApplyHealing(pokemon,pokemon.originalStats.hp/4);
            game.AddMessage(`${pokemon.name}'s dry skin absorbed the water attack!`);
            return true;
        }
        return false;
    }

    ModifyDamageTaken(game: IGame, attackingPokemon: Pokemon, defendingPokemon: Pokemon, move: Technique, originalDamage: number) {
        let modifiedDamage = originalDamage;
        if (move.elementalType === ElementType.Fire){
            return modifiedDamage*1.25;
        }
        return modifiedDamage;
    }
    
    EndOfTurn(game: IGame, pokemon: Pokemon){
        if (game.field.weather?.name === WeatherType.Rain){
            game.ApplyHealing(pokemon,pokemon.originalStats.hp/8);
            game.AddMessage(`${pokemon.name} healed from the rain due to its dry skin!`);
        }
        else if (game.field.weather?.name === WeatherType.Sunny){
            game.ApplyIndirectDamage(pokemon,pokemon.originalStats.hp/8);
            game.AddMessage(`${pokemon.name} took damage from the sunlight due to its dry skin!`);
        }        
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
        case 'magic guard': {
            return new MagicGuardAbility();
        }
        case 'effect spore': {
            return new EffectSporeAbility();
        }
        case 'volt absorb': {
            return new VoltAbsorbAbility();
        }
        case 'multiscale': {
            return new MultiscaleAbility();
        }
        case 'technician': {
            return new TechnicianAbility();
        }
        case 'drizzle': {
            return new DrizzleAbility();
        }
        case 'chlorophyll': {
            return new ChlorophyllAbility();
        }
        case 'clear body': {
            return new ClearBodyAbility();
        }
        case 'synchronize': {
            return new SynchronizeAbility();
        }
        case 'lightning rod': {
            return new LightningRodAbility();
        }
        case 'pressure': {
            return new PressureAbility();
        }
        case 'drought': {
            return new DroughtAbility();
        }
        case 'sand stream': {
            return new SandStreamAbility();
        }
        case 'infiltrator': {
            return new InfiltratorAbility();
        }
        case 'thick fat': {
            return new ThickFatAbility();
        }
        case 'rough skin': {
            return new RoughSkinAbility();
        }
        case 'unnerve': {
            return new UnnerveAbility();
        }
        case 'justified': {
            return new JustifiedAbility();
        }
        case 'arena trap': {
            return new ArenaTrapAbility();
        }
        case 'water absorb':{
            return new WaterAbsorbAbility();
        }
        case 'no guard':{
            return new NoGuardAbility();
        }
        case 'dry skin':{
            return new DrySkinAbility();
        }
        default: {
            console.warn(`Warning: Could not find passive ability for ability name : { ${name} } - using no ability instead`);
            return new NoAbility();
        }
    }
}

export default GetAbility
