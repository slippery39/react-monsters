import { Actions, UseMoveAction as UseTechniqueAction } from "game/BattleActions";
import BattleBehaviour from "game/BattleBehaviour/BattleBehavior";
import { IGame } from "game/BattleGame";
import { ElementType } from "game/ElementType";
import { Status } from "game/HardStatus/HardStatus";
import { Player } from "game/Player/PlayerBuilder";
import { Pokemon, StatMultiplier } from "game/Pokemon/Pokemon";
import { Stat } from "game/Stat";
import { Technique } from "game/Techniques/Technique";
import { VolatileStatusType } from "game/VolatileStatus/VolatileStatus";
import _ from "lodash";

export abstract class HeldItem extends BattleBehaviour {
    OnRemoved(turn: IGame, pokemon: Pokemon) { //might want this for all of our battle behaviours.

    }
    name: string = ""
    description: string = ""
}

export class LeftoversHeldItem extends HeldItem {
    name: string = "Leftovers"
    description = "An item to be held by a Pokémon. The holder's HP is gradually restored during battle."
    EndOfTurn(game: IGame, pokemon: Pokemon) {
        const healing = Math.ceil(pokemon.originalStats.hp / 16);
        game.ApplyHealing(pokemon, healing);
        game.AddMessage(`${pokemon.name} has healed due to its leftovers!`);
    }

}

export class LifeOrbHeldItem extends HeldItem {
    name: string = "Life Orb";
    description = "An item to be held by a Pokémon. It boosts the power of moves, but at the cost of some HP on each hit.";
    OnAfterDamageCalculated(attackingPokemon: Pokemon, move: Technique, defendingPokemon: Pokemon, damage: number, damageInfo: any): number {
        return damage * 1.3;
    }
    OnDamageDealt(game: IGame, attackingPokemon: Pokemon, defendingPokemon: Pokemon, damageDealt: number) {
        //take recoil damage
        const recoilDamage = attackingPokemon.originalStats.hp / 10;
        game.ApplyIndirectDamage(attackingPokemon, recoilDamage);
        game.AddMessage(`${attackingPokemon.name} suffered recoil damage due to its Life Orb`);

    }
}

export class LumBerryHeldItem extends HeldItem {
    name: string = "Lum Berry";
    description = "A Berry to be consumed by Pokémon. If a Pokémon holds one, it can recover from any status condition during battle."

    Update(game: IGame, pokemon: Pokemon) {

        //check the opposing pokemon
        //unnerve ability prevents use of berries.
        const otherPokemon = game.GetOtherPokemon(pokemon);
        if (otherPokemon.ability.toLowerCase() === "unnerve"){
            return;        
        }

        let hasCured: boolean = false;

        if (pokemon.status !== Status.None) {
            pokemon.status = Status.None;
            hasCured = true;
        }
        const confusions = pokemon.volatileStatuses.filter(vStat => vStat.type === VolatileStatusType.Confusion);
        if (confusions.length > 0) {
            pokemon.volatileStatuses.forEach(vStat => {
                vStat.Remove(game, pokemon);
                hasCured = true;
            });
        }

        if (hasCured) {
            game.AddMessage(`${pokemon.name} has been cured of its status effects due to its Lum Berry!`);
            pokemon.heldItem = new NoHeldItem();
        }
    }
}

export class BlackSludge extends HeldItem {
    name: string = "Black Sludge";
    description = "A held item that gradually restores the HP of Poison-type Pokémon. It inflicts damage on all other types."

    EndOfTurn(game: IGame, pokemon: Pokemon) {

        if (pokemon.elementalTypes.includes(ElementType.Poison)) {
            const healing = Math.ceil(pokemon.originalStats.hp / 16);
            game.ApplyHealing(pokemon, healing);
            game.AddMessage(`${pokemon.name} has healed due to its black sludge!`);
        }
        else {
            const damage = Math.ceil(pokemon.originalStats.hp / 8);
            game.ApplyIndirectDamage(pokemon, damage);
            game.AddMessage(`${pokemon.name} has been damaged due to is black sludge!`);
        }
    }
}

//Forced actions should take precedent over 
export class ChoiceScarf extends HeldItem {
    name: string = "Choice Scarf";
    description = "An item to be held by a Pokémon. This scarf boosts Speed, but allows the use of only one kind of move."

    techniqueUsed: Technique | undefined = undefined;

    Update(game: IGame, pokemon: Pokemon) {
        if (pokemon.statMultipliers.find(sm => sm.tag === this.name) === undefined) {
            const statMultiplier: StatMultiplier = {
                stat: Stat.Speed,
                multiplier: 1.5,
                tag: this.name
            }
            pokemon.statMultipliers.push(statMultiplier);
        }
    }

    OnTechniqueUsed(game: IGame, pokemon: Pokemon, technique: Technique) {
        //save the technique used to the item slot
        //for sanity purposes the technique saved should be on the pokemon as well.
        //Check to make sure the technique actually exists on the pokemon (in case of custom moves or whatnot)

        if (technique.name.toLowerCase() === "struggle") {
            return;
        }
        if (this.techniqueUsed === undefined) {
            if (pokemon.techniques.find(tech => tech.id === technique.id || tech.name === technique.name) === undefined) {
                throw new Error(`Could not find technique for pokemon to save to choice scarf... Technique name we tried to save was ${technique.name}`)
            }
            this.techniqueUsed = technique;
        }
    }

    //CONTINUE FROM HERE... IMPLEMENTING CHOICE HELD ITEMS.
    OverrideAction(game: IGame, player: Player, pokemon: Pokemon, action: UseTechniqueAction) {
        //Change to a use technique action with 

        if (this.techniqueUsed === undefined) {
            return action;
        }

        const newAction: UseTechniqueAction = {
            playerId: player.id,
            pokemonId: pokemon.id,
            moveId: this.techniqueUsed.id,
            type: Actions.UseTechnique
        }
        return newAction;
    }

    OnSwitchedOut(game: IGame, pokemon: Pokemon) {
        //Reset the technique used for next time.
        this.techniqueUsed = undefined;
    }

    OnRemoved(turn: IGame, pokemon: Pokemon) {
        //remove our stat multiplier.
        _.remove(pokemon.statMultipliers, (sm => sm.tag === this.name));
    }

}


//Forced actions should take precedent over 
export class ChoiceBand extends HeldItem {
    name: string = "Choice Band";
    description = "An item to be held by a Pokémon. This scarf boosts attack, but allows the use of only one kind of move."

    techniqueUsed: Technique | undefined = undefined;

    Update(game: IGame, pokemon: Pokemon) {
        if (pokemon.statMultipliers.find(sm => sm.tag === this.name) === undefined) {
            const statMultiplier: StatMultiplier = {
                stat: Stat.Attack,
                multiplier: 1.5,
                tag: this.name
            }
            pokemon.statMultipliers.push(statMultiplier)
        }
    }

    OnTechniqueUsed(game: IGame, pokemon: Pokemon, technique: Technique) {
        //save the technique used to the item slot
        //for sanity purposes the technique saved should be on the pokemon as well.
        //Check to make sure the technique actually exists on the pokemon (in case of custom moves or whatnot)

        if (technique.name.toLowerCase() === "struggle") {
            return;
        }
        if (this.techniqueUsed === undefined) {
            if (pokemon.techniques.find(tech => tech.id === technique.id || tech.name === technique.name) === undefined) {
                throw new Error(`Could not find technique for pokemon to save to choice band... Technique name we tried to save was ${technique.name}`)
            }
            this.techniqueUsed = technique;
        }
    }

    //CONTINUE FROM HERE... IMPLEMENTING CHOICE HELD ITEMS.
    OverrideAction(game: IGame, player: Player, pokemon: Pokemon, action: UseTechniqueAction) {
        //Change to a use technique action with 

        if (this.techniqueUsed === undefined) {
            return action;
        }

        const newAction: UseTechniqueAction = {
            playerId: player.id,
            pokemonId: pokemon.id,
            moveId: this.techniqueUsed.id,
            type: Actions.UseTechnique
        }
        return newAction;
    }

    OnSwitchedOut(game: IGame, pokemon: Pokemon) {
        //Reset the technique used for next time.
        this.techniqueUsed = undefined;
    }

    OnRemoved(turn: IGame, pokemon: Pokemon) {
        //remove our stat multiplier.
        _.remove(pokemon.statMultipliers, (sm => sm.tag === this.name));
    }

}

export class ChoiceSpecs extends HeldItem {
    name: string = "Choice Specs";
    description = "An item to be held by a Pokémon. These curious glasses boost Sp. Atk but only allow the use of one move."

    techniqueUsed: Technique | undefined = undefined;

    Update(game: IGame, pokemon: Pokemon) {
        if (pokemon.statMultipliers.find(sm => sm.tag === this.name) === undefined) {
            const statMultiplier: StatMultiplier = {
                stat: Stat.SpecialAttack,
                multiplier: 1.5,
                tag: this.name
            }
            pokemon.statMultipliers.push(statMultiplier)
        }
    }

    OnTechniqueUsed(game: IGame, pokemon: Pokemon, technique: Technique) {
        //save the technique used to the item slot
        //for sanity purposes the technique saved should be on the pokemon as well.
        //Check to make sure the technique actually exists on the pokemon (in case of custom moves or whatnot)

        if (technique.name.toLowerCase() === "struggle") {
            return;
        }

        if (this.techniqueUsed === undefined) {
            if (pokemon.techniques.find(tech => tech.id === technique.id || tech.name === technique.name) === undefined) {
                throw new Error(`Could not find technique for pokemon to save to choice band... Technique name we tried to save was ${technique.name}`)
            }
            this.techniqueUsed = technique;
        }
    }

    //CONTINUE FROM HERE... IMPLEMENTING CHOICE HELD ITEMS.
    OverrideAction(game: IGame, player: Player, pokemon: Pokemon, action: UseTechniqueAction) {
        //Change to a use technique action with 

        if (this.techniqueUsed === undefined) {
            return action;
        }

        const newAction: UseTechniqueAction = {
            playerId: player.id,
            pokemonId: pokemon.id,
            moveId: this.techniqueUsed.id,
            type: Actions.UseTechnique
        }
        return newAction;
    }

    OnSwitchedOut(game: IGame, pokemon: Pokemon) {
        //Reset the technique used for next time.
        this.techniqueUsed = undefined;
    }

    OnRemoved(game: IGame, pokemon: Pokemon) {
        //remove our stat multiplier.
        _.remove(pokemon.statMultipliers, (sm => sm.tag === this.name));
    }
}

export class FlyingGem extends HeldItem {
    name: string = "Flying Gem"
    description: string = "A gem with an essence of air. When held, it strengthens the power of a Flying-type move only once."

    ModifyTechnique(pokemon: Pokemon, technique: Technique) {
        if (technique.elementalType === ElementType.Flying) {
            const newTechnique = { ...technique };
            newTechnique.power *= 1.5;
            //drop the held item
            //remove the held item.
            pokemon.heldItem = new NoHeldItem();
            return newTechnique;
        }
        return technique;
    }
}

export class RockyHelmet extends HeldItem {
    name: string = "Rocky Helmet"
    description: string = "If the holder of this item takes damage, the attacker will also be damaged upon contact."


    OnDamageTakenFromTechnique(game: IGame, attackingPokemon: Pokemon, defendingPokemon: Pokemon, move: Technique, damage: number) {
        if (move.makesContact) {
            game.ApplyIndirectDamage(attackingPokemon, attackingPokemon.originalStats.hp / 6);
            game.AddMessage(`${attackingPokemon.name} took damage due to ${defendingPokemon.name}'s rocky helmet!`);
        }
    }
}


//NOTE: For now we will just not put this on any pokemon with status moves, since our pokemon are all preset, it shouldn't be an issue.
export class AssaultVest extends HeldItem {
    name: string = "Assault Vest"
    description: string = "An item to be held by a Pokémon. This offensive vest raises Sp. Def but prevents the use of status moves."


    Update(game: IGame, pokemon: Pokemon) {
        if (pokemon.statMultipliers.find(sm => sm.tag === this.name) === undefined) {
            const statMultiplier: StatMultiplier = {
                stat: Stat.SpecialDefense,
                multiplier: 1.5,
                tag: this.name
            }
            pokemon.statMultipliers.push(statMultiplier)
        }
    }

    OnRemoved(game: IGame, pokemon: Pokemon) {
        //remove our stat multiplier.
        _.remove(pokemon.statMultipliers, (sm => sm.tag === this.name));
    }


}


//Empty held item.
export class NoHeldItem extends HeldItem {

}

function GetHeldItem(name: string): HeldItem {

    switch (name.toLowerCase()) {
        case "leftovers": {
            return new LeftoversHeldItem();
        }
        case "life orb": {
            return new LifeOrbHeldItem();
        }
        case "lum berry": {
            return new LumBerryHeldItem();
        }
        case "black sludge": {
            return new BlackSludge();
        }
        case "choice band": {
            return new ChoiceBand();
        }
        case "choice specs": {
            return new ChoiceSpecs();
        }
        case "flying gem": {
            return new FlyingGem();
        }
        case "rocky helmet": {
            return new RockyHelmet();
        }
        case "assault vest": {
            return new AssaultVest();
        }
        case "choice scarf":{
            return new ChoiceScarf();
        }
        case "none": {
            return new NoHeldItem();
        }


        default: {
            throw new Error(`Could not find held item for ${name} in GetHeldItem`);
        }
    }
}


export default GetHeldItem;