import { GetActivePokemon, HasElementType } from "game/HelperFunctions";
import { ElementType } from "game/ElementType";
import { HasVolatileStatus, Pokemon } from "game/Pokemon/Pokemon";
import { Turn } from "game/Turn";
import _, { shuffle } from "lodash";
import BattleBehaviour from "game/BattleBehaviour/BattleBehavior";
import { BattleEventType } from "game/BattleEvents";
import { DamageType, Technique } from "game/Techniques/Technique";
import { InflictVolatileStatus, TargetType } from "game/Effects/Effects";
import { Player } from "game/Player/PlayerBuilder";
import { GetTech } from "game/Techniques/PremadeTechniques";
import { Actions, ForcedTechniqueAction, UseMoveAction } from "game/BattleActions";


export enum VolatileStatusType {
    Confusion = 'confusion',
    AquaRing = 'aqua-ring',
    LeechSeed = 'leech-seed',
    Flinch = 'flinch',
    Roosted = 'roosted',
    Substitute = 'substitute',
    Protection = 'protection',
    Outraged = "outraged",
    Bouncing = "bouncing",
    Encored = "encored",    
}


export abstract class VolatileStatus extends BattleBehaviour {
    abstract type: VolatileStatusType
 

    abstract InflictedMessage(pokemon: Pokemon): string

    OnApply(turn: Turn, pokemon: Pokemon) {

    }
    CanApply(turn: Turn, pokemon: Pokemon) {
        return !HasVolatileStatus(pokemon, this.type)
    }
    Remove(turn: Turn, pokemon: Pokemon) {
        _.remove(pokemon.volatileStatuses, (vStat) =>
            vStat.type === this.type
        );
        this.OnRemoved(turn, pokemon);
    }
    OnRemoved(turn: Turn, pokemon: Pokemon) {

    }
}

export class SubstituteVolatileStatus extends VolatileStatus {
    type = VolatileStatusType.Substitute
 

    public substituteHealth: number = 999;

    Damage(turn: Turn, pokemon: Pokemon, amount: number) {
        this.substituteHealth -= amount;
        if (this.substituteHealth <= 0) {
            this.Remove(turn, pokemon);
        }
    }
    InflictedMessage(pokemon: Pokemon) {
        return `${pokemon.name} has created a substitute`
    }

    HealthForSubstitute(pokemon: Pokemon) {
        return Math.ceil(pokemon.originalStats.hp / 4);
    }

    CanApply(turn: Turn, pokemon: Pokemon) {
        const canApply = super.CanApply(turn, pokemon) && (pokemon.currentStats.hp > this.HealthForSubstitute(pokemon));

        //Not ideal here, but works for now. 
        if (!canApply) {
            turn.AddMessage('But it failed!');
        }
        return canApply;
    }

    OnRemoved(turn: Turn, pokemon: Pokemon) {
        pokemon.hasSubstitute = false;
        turn.AddEvent({
            type: BattleEventType.SubstituteBroken,
            targetPokemonId: pokemon.id
        });
        turn.AddEvent({
            type: BattleEventType.GenericMessage,
            defaultMessage: `${pokemon.name}'s substitute has broken!`
        })
    }

    OnApply(turn: Turn, pokemon: Pokemon) {
        /*
            Create a substitute that has 1/4 the pokemon's health
            //all damage should go to the substiute until it breaks.
        */

        this.substituteHealth = this.HealthForSubstitute(pokemon);
        pokemon.currentStats.hp -= this.HealthForSubstitute(pokemon);
        pokemon.hasSubstitute = true;

        //temporary, to show the damage animtion in the ui.
        turn.AddEvent({
            type: BattleEventType.Damage,
            targetPokemonId: pokemon.id,
            attackerPokemonId: pokemon.id,
            targetDamageTaken: this.HealthForSubstitute(pokemon),
            didCritical: false,
            targetFinalHealth: pokemon.currentStats.hp,
            effectivenessAmt: 1
        })
        turn.AddEvent({
            type: BattleEventType.SubstituteCreated,
            targetPokemonId: pokemon.id
        });

    }
}

export class RoostedVolatileStatus extends VolatileStatus {
    type = VolatileStatusType.Roosted
   

    private originalTypes: Array<ElementType> = [];

    InflictedMessage(pokemon: Pokemon) {
        return `${pokemon.name} has roosted!`
    }

    OnApply(turn: Turn, pokemon: Pokemon) {

        this.originalTypes = [...pokemon.elementalTypes];
        //remove the flying element of the pokemon
        _.remove(pokemon.elementalTypes, (elType) => {
            return elType === ElementType.Flying
        });
    }

    OnRemoved(turn: Turn, pokemon: Pokemon) {
        pokemon.elementalTypes = this.originalTypes;
    }

    EndOfTurn(turn: Turn, pokemon: Pokemon) {
        this.Remove(turn, pokemon);
    }

}

export class ProtectionVolatileStatus extends VolatileStatus {

    type = VolatileStatusType.Protection;
    private chanceToApply: number = 100;
    private flagForRemoval: boolean = false;
   

    InflictedMessage(pokemon: Pokemon) {
        return `${pokemon.name} is protecting itself`;
    }

    OnTechniqueUsed(turn: Turn, pokemon: Pokemon, move: Technique) {
        if (move.name.toLowerCase() === "protect") {
            const isProtected = turn.Roll(this.chanceToApply);
            if (!isProtected) {
                this.flagForRemoval = true;
                turn.AddMessage(`But it failed`);
            }
            else {
                turn.AddMessage(this.InflictedMessage(pokemon));
            }
        }
        else {
            this.flagForRemoval = true;
        }
    }
    //defending against a technique.
    NegateTechnique(turn: Turn, attackingPokemon: Pokemon, defendingPokemon: Pokemon, move: Technique) {

        if (this.flagForRemoval) {
            return false;
        }
        const isDamagingMove = move.damageType === DamageType.Physical || move.damageType === DamageType.Special;
        const isStatusMoveThatEffectsOpponent = move.damageType === DamageType.Status && move.effects?.find(eff => eff.target === undefined || eff.target === TargetType.Enemy) !== undefined;

        if (isDamagingMove || isStatusMoveThatEffectsOpponent) {
            turn.AddMessage(`${defendingPokemon.name} protected itself!`);
            this.chanceToApply /= 2;
        }
        return true;
    }
    EndOfTurn(turn: Turn, pokemon: Pokemon) {

        if (this.flagForRemoval) {
            this.Remove(turn, pokemon);
        }
    }
}

export class AquaRingVolatileStatus extends VolatileStatus {
    type: VolatileStatusType = VolatileStatusType.AquaRing;
   

    InflictedMessage(pokemon: Pokemon): string {
        return `${pokemon.name} has surrounded itself in a veil of water!`
    }
    EndOfTurn(turn: Turn, pokemon: Pokemon) {
        //heal 1/16 of hp
        turn.ApplyHealing(pokemon, pokemon.originalStats.hp / 16);
        turn.AddMessage(`${pokemon.name} restored a little health due to aqua veil!`);
    }
}


export class FlinchVolatileStatus extends VolatileStatus {
    type: VolatileStatusType = VolatileStatusType.Flinch
   

    InflictedMessage(pokemon: Pokemon): string {
        //hack here. we may need an "on apply" method
        return ``;
    }

    //Not sure if we should apply here or we should apply on attack.
    OnApply(turn: Turn, pokemon: Pokemon) {
    }

    BeforeAttack(turn: Turn, pokemon: Pokemon) {
        pokemon.canAttackThisTurn = false;
        turn.AddMessage(`${pokemon.name} has flinched`);
    }

    EndOfTurn(turn: Turn, pokemon: Pokemon) {
        _.remove(pokemon.volatileStatuses, (vStat) =>
            vStat.type === this.type
        );
    }
}

export class LeechSeedVolatileStatus extends VolatileStatus {
    type: VolatileStatusType = VolatileStatusType.LeechSeed;
   

    InflictedMessage(pokemon: Pokemon): string {
        return `${pokemon.name} has been seeded!`;
    }

    CanApply(turn: Turn, pokemon: Pokemon) {
        return super.CanApply(turn, pokemon) && !HasElementType(pokemon, ElementType.Grass);
    }

    EndOfTurn(turn: Turn, pokemon: Pokemon) {
        const leechSeedDamage = pokemon.originalStats.hp / 16;
        //deal the leech seed damage to the pokemon
        //heal the opponent pokemon
        const opponentPlayer = turn.GetPlayers().find(player => player.currentPokemonId !== pokemon.id);
        if (opponentPlayer === undefined) {
            throw new Error('Could not find player for leech seed end of turn');
        }

        const opponentPokemon = GetActivePokemon(opponentPlayer);
        turn.ApplyIndirectDamage(pokemon, leechSeedDamage);
        turn.ApplyHealing(opponentPokemon, leechSeedDamage);
        turn.AddMessage(`${pokemon.name} had its health drained a little due to leech seed!`);
    }
}


export class ConfusionVolatileStatus extends VolatileStatus {
    type: VolatileStatusType = VolatileStatusType.Confusion;
   

    private unconfuseChance: number = 25;
    private damageSelfChance: number = 50

    BeforeAttack(turn: Turn, pokemon: Pokemon) {

        if (pokemon.canAttackThisTurn === false) {
            return;
        }

        if (turn.Roll(this.unconfuseChance)) {
            //the attacking pokemon is no longer confused
            _.remove(pokemon.volatileStatuses, (vstatus) => vstatus.type === 'confusion');
            turn.AddMessage(`${pokemon.name} has snapped out of its confusion!`);
        }
        else {
            turn.AddMessage(`${pokemon.name} is confused!`);
            if (turn.Roll(this.damageSelfChance)) {
                turn.AddMessage(`${pokemon.name} has hurt itself in its confusion`);
                turn.ApplyIndirectDamage(pokemon, 40);
                //pokemon skips the turn as well
                pokemon.canAttackThisTurn = false;
            }
        }
    }

    InflictedMessage(pokemon: Pokemon): string {
        return `${pokemon.name} is now confused!`
    }
}


export class OutragedVolatileStatus extends VolatileStatus {
    type = VolatileStatusType.Outraged;
    amountOfTurns: number = 3;
    currentTurn: number = 1;


    InflictedMessage(pokemon: Pokemon): string {
        return "";
    }

    OnApply(turn: Turn, pokemon: Pokemon) {
        this.amountOfTurns = shuffle([2, 3])[0];
        console.warn(`amount of turns is ${this.amountOfTurns}`);
    }

    ForceAction(turn: Turn, player: Player, pokemon: Pokemon) {
        //force an overwrite of whatever action might be in there.
        const outrageTechnique = GetTech("outrage");

        const forcedTechnique: ForcedTechniqueAction = {
            playerId: player.id,
            pokemonId: pokemon.id,
            technique: outrageTechnique,
            type: Actions.ForcedTechnique
        }
        turn.SetInitialPlayerAction(forcedTechnique);
    }

    BeforeAttack(turn: Turn, pokemon: Pokemon) {
        if (pokemon.canAttackThisTurn === false) {
            this.Remove(turn, pokemon);
            return;
        }
        turn.AddMessage(`${pokemon.name} is outraged!`);
        this.currentTurn++
    }

    OnTechniqueMissed(turn: Turn, pokemon: Pokemon) {
        this.Remove(turn, pokemon);
    }

    EndOfTurn(turn: Turn, pokemon: Pokemon) {
        if (this.currentTurn >= this.amountOfTurns) {
            this.Remove(turn, pokemon);
            turn.AddMessage(`${pokemon.name} is no longer outraged.`);
            InflictVolatileStatus(turn, pokemon, VolatileStatusType.Confusion, pokemon);
        }
        //Remove Outraged Status if Attack missed for whatever reason.
    }
}

export class BouncingVolatileStatus extends VolatileStatus {
    flaggedForRemoval:boolean = false;
    type = VolatileStatusType.Bouncing;
    name="Bouncing"

    InflictedMessage(pokemon: Pokemon) {
        return `${pokemon.name} bounced high up in the air`;
    }

    ForceAction(turn: Turn, player: Player, pokemon: Pokemon) {
        let bounceTechnique = GetTech("bounce");
        //remove the 2 turn move part so that it doesn't inflict the "bounce" status again.
        bounceTechnique.firstTurnStatus = undefined;
        bounceTechnique.twoTurnMove = false;

        const forcedTechnique: ForcedTechniqueAction = {
            playerId: player.id,
            pokemonId: pokemon.id,
            technique: bounceTechnique,
            type: Actions.ForcedTechnique
        }
        turn.SetInitialPlayerAction(forcedTechnique);     
    }


    AfterActionStep(turn:Turn,pokemon:Pokemon){
        if (this.flaggedForRemoval === false){
            this.flaggedForRemoval = true;
        }
        else{
            this.Remove(turn,pokemon);
        }
    }

    //This status prevents it from getting hit by any move except for 
    NegateTechnique(turn: Turn, attackingPokemon: Pokemon, defendingPokemon: Pokemon, move: Technique) {
        const isDamagingMove = move.damageType === DamageType.Physical || move.damageType === DamageType.Special;
        const isStatusMoveThatEffectsOpponent = move.damageType === DamageType.Status && move.effects?.find(eff => eff.target === undefined || eff.target === TargetType.Enemy) !== undefined;

        if (isDamagingMove || isStatusMoveThatEffectsOpponent) {
            turn.AddMessage(`it had no effect because ${defendingPokemon.name} is in the air!`);
            return true;
        }

        return false;
    }
}

export class EncoredVolatileStatus extends VolatileStatus{
    type = VolatileStatusType.Encored
    numTurns:number = 3;
    currentTurnNum:number = 1;



    InflictedMessage(pokemon:Pokemon){
        return `${pokemon.name} got an encore!`
    }

    OverrideAction(turn:Turn,player:Player,pokemon:Pokemon,action:UseMoveAction):UseMoveAction{
         //Overrides an action, i.e. for Choice items
         const encoreTechniqueName = pokemon.techniques.find(t=>t.name === pokemon.techniqueUsedLast);      

         if (encoreTechniqueName === undefined){
             throw new Error(`Could not find technique to encore`);
         }

         const newAction = {...action};
         newAction.moveId = encoreTechniqueName.id;
         this.currentTurnNum++;

        return newAction;
    }

    EndOfTurn(turn: Turn, pokemon: Pokemon) {
        if (this.currentTurnNum > this.numTurns) {
            turn.AddMessage(`${pokemon.name}'s encore has ended!`);
            turn.AddMessage("");
            this.Remove(turn, pokemon);
            
        }
        //Remove Outraged Status if Attack missed for whatever reason.
    }
}


export function GetVolatileStatus(type: VolatileStatusType): VolatileStatus {
    switch (type) {
        case VolatileStatusType.Confusion: {
            return new ConfusionVolatileStatus();
        }
        case VolatileStatusType.AquaRing: {
            return new AquaRingVolatileStatus();
        }
        case VolatileStatusType.LeechSeed: {
            return new LeechSeedVolatileStatus();
        }
        case VolatileStatusType.Flinch: {
            return new FlinchVolatileStatus();
        }
        case VolatileStatusType.Roosted: {
            return new RoostedVolatileStatus();
        }
        case VolatileStatusType.Substitute: {
            return new SubstituteVolatileStatus();
        }
        case VolatileStatusType.Protection: {
            return new ProtectionVolatileStatus();
        }
        case VolatileStatusType.Outraged: {
            return new OutragedVolatileStatus();
        }
        case VolatileStatusType.Bouncing: {
            return new BouncingVolatileStatus();
        }
        case VolatileStatusType.Encored:{
            return new EncoredVolatileStatus();
        }
        default: {
            throw new Error(`${type} has not been implemented in GetVolatileStatus`);
        }
    }
}


