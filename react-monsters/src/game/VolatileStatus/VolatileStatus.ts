import { GetActivePokemon, HasElementType } from "game/HelperFunctions";
import { ElementType } from "game/ElementType";
import { FieldPosition, HasVolatileStatus, Pokemon } from "game/Pokemon/Pokemon";
import _, { shuffle } from "lodash";
import BattleBehaviour from "game/BattleBehaviour/BattleBehavior";
import { BattleEventType } from "game/BattleEvents";
import { DamageType, Technique } from "game/Techniques/Technique";
import { InflictVolatileStatus, TargetType } from "game/Effects/Effects";
import { Player } from "game/Player/PlayerBuilder";
import { GetTech } from "game/Techniques/PremadeTechniques";
import { Actions, BattleAction, ForcedTechniqueAction, UseMoveAction } from "game/BattleActions";
import { IGame } from "game/BattleGame";


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
    ChargingSolarBeam = 'charging-solar-beam',
    Taunted = "taunted"
}


export abstract class VolatileStatus extends BattleBehaviour {
    abstract type: VolatileStatusType


    abstract InflictedMessage(pokemon: Pokemon): string

    OnApply(game: IGame, pokemon: Pokemon) {

    }
    CanApply(game: IGame, pokemon: Pokemon) {
        return pokemon.currentStats.hp>0 && !HasVolatileStatus(pokemon, this.type) 
    }
    Remove(game: IGame, pokemon: Pokemon) {
        _.remove(pokemon.volatileStatuses, (vStat) =>
            vStat.type === this.type
        );
        this.OnRemoved(game, pokemon);
    }
    OnRemoved(game: IGame, pokemon: Pokemon) {

    }
}

export class SubstituteVolatileStatus extends VolatileStatus {
    type = VolatileStatusType.Substitute


    public substituteHealth: number = 999;

    Damage(game: IGame, pokemon: Pokemon, amount: number) {
        this.substituteHealth -= amount;
        if (this.substituteHealth <= 0) {
            this.Remove(game, pokemon);
        }
    }
    InflictedMessage(pokemon: Pokemon) {
        return `${pokemon.name} has created a substitute`
    }

    HealthForSubstitute(pokemon: Pokemon) {
        return Math.ceil(pokemon.originalStats.hp / 4);
    }

    CanApply(game: IGame, pokemon: Pokemon) {
        const canApply = super.CanApply(game, pokemon) && (pokemon.currentStats.hp > this.HealthForSubstitute(pokemon));

        //Not ideal here, but works for now. 
        if (!canApply) {
            game.AddMessage('But it failed!');
        }
        return canApply;
    }

    OnRemoved(game: IGame, pokemon: Pokemon) {
        pokemon.hasSubstitute = false;
        game.AddEvent({
            type: BattleEventType.SubstituteBroken,
            targetPokemonId: pokemon.id
        });
        game.AddEvent({
            type: BattleEventType.GenericMessage,
            defaultMessage: `${pokemon.name}'s substitute has broken!`
        })
    }

    OnApply(game: IGame, pokemon: Pokemon) {
        /*
            Create a substitute that has 1/4 the pokemon's health
            //all damage should go to the substiute until it breaks.
        */

        this.substituteHealth = this.HealthForSubstitute(pokemon);
        pokemon.currentStats.hp -= this.HealthForSubstitute(pokemon);
        pokemon.hasSubstitute = true;

        //temporary, to show the damage animtion in the ui.
        game.AddEvent({
            type: BattleEventType.Damage,
            targetPokemonId: pokemon.id,
            attackerPokemonId: pokemon.id,
            targetDamageTaken: this.HealthForSubstitute(pokemon),
            didCritical: false,
            targetFinalHealth: pokemon.currentStats.hp,
            effectivenessAmt: 1
        })
        game.AddEvent({
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

    OnApply(game: IGame, pokemon: Pokemon) {
        this.originalTypes = [...pokemon.elementalTypes];
        //remove the flying element of the pokemon
        _.remove(pokemon.elementalTypes, (elType) => {
            return elType === ElementType.Flying
        });
    }

    EndOfTurn(game: IGame, pokemon: Pokemon) {
        pokemon.elementalTypes = this.originalTypes;
        this.Remove(game, pokemon);
    }
}

export class ProtectionVolatileStatus extends VolatileStatus {

    type = VolatileStatusType.Protection;
    private chanceToApply: number = 100;
    private isProtected: boolean = true;


    InflictedMessage(pokemon: Pokemon) {
        //this is firing every single time.
        return `${pokemon.name} is protecting itself`;
    }

    OnApply() {
        this.isProtected = true;
    }



    OnTechniqueUsed(game: IGame, pokemon: Pokemon, move: Technique) {
        if (move.name.toLowerCase() === "protect") {
            const isProtected = game.Roll(this.chanceToApply);
            if (!isProtected) {
                game.AddMessage(`But it failed`);
                this.isProtected = false;
            }
            else {
                game.AddMessage(this.InflictedMessage(pokemon));
                this.isProtected = true;
            }
        }
        else {
            this.isProtected = false;
        }
    }
    //defending against a technique.
    NegateTechnique(game: IGame, attackingPokemon: Pokemon, defendingPokemon: Pokemon, move: Technique) {

        if (!this.isProtected) {
            return false;
        }
        this.chanceToApply /= 2; //new: going to always lower the chance now to prevent protect spamming against
        const isDamagingMove = move.damageType === DamageType.Physical || move.damageType === DamageType.Special;
        const isStatusMoveThatEffectsOpponent = move.damageType === DamageType.Status && move.effects?.find(eff => eff.target === undefined || eff.target === TargetType.Enemy) !== undefined;

        if (isDamagingMove || isStatusMoveThatEffectsOpponent) {
            game.AddMessage(`${defendingPokemon.name} protected itself!`);
            return true;
        }
        return false;
    }

    EndOfTurn(game: IGame, pokemon: Pokemon) {
        if (!this.isProtected) {
            _.remove(pokemon.volatileStatuses, (vStat => vStat.type === this.type))
        }
        else {
            this.isProtected = false;
        }
    }
}

export class AquaRingVolatileStatus extends VolatileStatus {
    type: VolatileStatusType = VolatileStatusType.AquaRing;


    InflictedMessage(pokemon: Pokemon): string {
        return `${pokemon.name} has surrounded itself in a veil of water!`
    }
    EndOfTurn(game: IGame, pokemon: Pokemon) {
        //heal 1/16 of hp
        game.ApplyHealing(pokemon, pokemon.originalStats.hp / 16);
        game.AddMessage(`${pokemon.name} restored a little health due to aqua veil!`);
    }
}


export class FlinchVolatileStatus extends VolatileStatus {
    type: VolatileStatusType = VolatileStatusType.Flinch


    InflictedMessage(pokemon: Pokemon): string {
        //hack here. we may need an "on apply" method
        return ``;
    }

    //Not sure if we should apply here or we should apply on attack.
    OnApply(game: IGame, pokemon: Pokemon) {
    }

    BeforeAttack(game: IGame, pokemon: Pokemon) {
        pokemon.canAttackThisTurn = false;
        game.AddMessage(`${pokemon.name} has flinched`);
    }

    EndOfTurn(game: IGame, pokemon: Pokemon) {
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

    CanApply(game: IGame, pokemon: Pokemon) {
        return super.CanApply(game, pokemon) && !HasElementType(pokemon, ElementType.Grass);
    }

    EndOfTurn(game: IGame, pokemon: Pokemon) {
        const leechSeedDamage = pokemon.originalStats.hp / 16;
        //deal the leech seed damage to the pokemon
        //heal the opponent pokemon
        const opponentPlayer = game.GetPlayers().find(player => player.currentPokemonId !== pokemon.id);
        if (opponentPlayer === undefined) {
            throw new Error('Could not find player for leech seed end of turn');
        }

        const opponentPokemon = GetActivePokemon(opponentPlayer);
        game.ApplyIndirectDamage(pokemon, leechSeedDamage);
        game.ApplyHealing(opponentPokemon, leechSeedDamage);
        game.AddMessage(`${pokemon.name} had its health drained a little due to leech seed!`);
    }
}


export class ConfusionVolatileStatus extends VolatileStatus {
    type: VolatileStatusType = VolatileStatusType.Confusion;


    private unconfuseChance: number = 25;
    private damageSelfChance: number = 50

    BeforeAttack(game: IGame, pokemon: Pokemon) {

        if (pokemon.canAttackThisTurn === false) {
            return;
        }

        if (game.Roll(this.unconfuseChance)) {
            //the attacking pokemon is no longer confused
            _.remove(pokemon.volatileStatuses, (vstatus) => vstatus.type === 'confusion');
            game.AddMessage(`${pokemon.name} has snapped out of its confusion!`);
        }
        else {
            game.AddMessage(`${pokemon.name} is confused!`);
            if (game.Roll(this.damageSelfChance)) {
                game.AddMessage(`${pokemon.name} has hurt itself in its confusion`);
                game.ApplyIndirectDamage(pokemon, 40);
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

    OnApply(game: IGame, pokemon: Pokemon) {
        this.amountOfTurns = shuffle([2, 3])[0];
    }

    ForceAction(game: IGame, player: Player, pokemon: Pokemon) {
        //force an overwrite of whatever action might be in there.
        const outrageTechnique = GetTech("outrage");

        const forcedTechnique: ForcedTechniqueAction = {
            playerId: player.id,
            pokemonId: pokemon.id,
            technique: outrageTechnique,
            type: Actions.ForcedTechnique
        }
        game.SetInitialPlayerAction(forcedTechnique);
    }

    BeforeAttack(game: IGame, pokemon: Pokemon) {
        if (pokemon.canAttackThisTurn === false) {
            this.Remove(game, pokemon);
            return;
        }
        game.AddMessage(`${pokemon.name} is outraged!`);
        this.currentTurn++
    }

    OnTechniqueMissed(game: IGame, pokemon: Pokemon) {
        this.Remove(game, pokemon);
    }

    EndOfTurn(game: IGame, pokemon: Pokemon) {
        if (this.currentTurn >= this.amountOfTurns) {
            this.Remove(game, pokemon);
            game.AddMessage(`${pokemon.name} is no longer outraged.`);
            InflictVolatileStatus(game, pokemon, VolatileStatusType.Confusion, pokemon);
        }
        //Remove Outraged Status if Attack missed for whatever reason.
    }
}

export class BouncingVolatileStatus extends VolatileStatus {
    flaggedForRemoval: boolean = false;
    type = VolatileStatusType.Bouncing;
    name = "Bouncing"

    InflictedMessage(pokemon: Pokemon) {
        return `${pokemon.name} bounced high up in the air`;
    }


    OnApply(game: IGame, pokemon: Pokemon) {
        pokemon.fieldPosition = FieldPosition.InAir;
    }

    OnTechniqueUsed(game: IGame, pokemon: Pokemon, move: Technique) {
        pokemon.fieldPosition = FieldPosition.GroundLevel;
        game.AddMessage("");
    }

    ForceAction(game: IGame, player: Player, pokemon: Pokemon) {
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
        game.SetInitialPlayerAction(forcedTechnique);
    }


    AfterActionStep(game: IGame, pokemon: Pokemon) {
        //this is triggering even when its not the pokemon's action.

        if (this.flaggedForRemoval === false) {
            this.flaggedForRemoval = true;
        }
        else {
            this.Remove(game, pokemon);
        }
    }

    //This status prevents it from getting hit by any move except for 
    NegateTechnique(game: IGame, attackingPokemon: Pokemon, defendingPokemon: Pokemon, move: Technique) {
        const isDamagingMove = move.damageType === DamageType.Physical || move.damageType === DamageType.Special;
        const isStatusMoveThatEffectsOpponent = move.damageType === DamageType.Status && move.effects?.find(eff => eff.target === undefined || eff.target === TargetType.Enemy) !== undefined;

        if (isDamagingMove || isStatusMoveThatEffectsOpponent) {
            game.AddMessage(`it had no effect because ${defendingPokemon.name} is in the air!`);
            return true;
        }

        return false;
    }
}

export class EncoredVolatileStatus extends VolatileStatus {
    type = VolatileStatusType.Encored
    numTurns: number = 3;
    currentTurnNum: number = 1;



    InflictedMessage(pokemon: Pokemon) {
        return `${pokemon.name} got an encore!`
    }

    CanApply(game: IGame, pokemon: Pokemon) {
        return super.CanApply(game, pokemon) && pokemon.techniqueUsedLast !== undefined && pokemon.techniques.find(t => t.name === pokemon.techniqueUsedLast) !== undefined;
    }

    OverrideAction(game: IGame, player: Player, pokemon: Pokemon, action: UseMoveAction): UseMoveAction {
        //Overrides an action, i.e. for Choice items
        const encoreTechniqueName = pokemon.techniques.find(t => t.name === pokemon.techniqueUsedLast);

        if (encoreTechniqueName === undefined) {
            return action;
            //throw new Error(`Could not find technique to encore`);
        }

        const newAction = { ...action };
        newAction.moveId = encoreTechniqueName.id;
        this.currentTurnNum++;

        return newAction;
    }

    EndOfTurn(game: IGame, pokemon: Pokemon) {
        if (this.currentTurnNum > this.numTurns) {
            game.AddMessage(`${pokemon.name}'s encore has ended!`);
            game.AddMessage("");
            this.Remove(game, pokemon);

        }
        //Remove Outraged Status if Attack missed for whatever reason.
    }
}

export class ChargingSolarBeamVolatileStatus extends VolatileStatus {
    flaggedForRemoval: boolean = false;
    type = VolatileStatusType.ChargingSolarBeam;
    name = "Charging-Solar-Beam"

    InflictedMessage(pokemon: Pokemon) {
        return `${pokemon.name} is gathering sunlight`;
    }

    ForceAction(game: IGame, player: Player, pokemon: Pokemon) {
        let solarBeamTechnique = GetTech("solar beam");
        //remove the 2 turn move part so that it doesn't inflict the "charging solar beam" status again
        solarBeamTechnique.firstTurnStatus = undefined;
        solarBeamTechnique.twoTurnMove = false;

        const forcedTechnique: ForcedTechniqueAction = {
            playerId: player.id,
            pokemonId: pokemon.id,
            technique: solarBeamTechnique,
            type: Actions.ForcedTechnique
        }
        game.SetInitialPlayerAction(forcedTechnique);
    }


    AfterActionStep(game: IGame, pokemon: Pokemon) {
        //this is triggering even when its not the pokemon's action.

        if (this.flaggedForRemoval === false) {
            this.flaggedForRemoval = true;
        }
        else {
            this.Remove(game, pokemon);
        }
    }

}

export class TauntedVolatileStatus extends VolatileStatus{

    type=VolatileStatusType.Taunted
    turnsLeft:number = 0;

    InflictedMessage(pokemon:Pokemon){
        return `${pokemon.name} is being taunted!`;
    }

    OnApply(game: IGame, pokemon: Pokemon) {
        this.turnsLeft = 4;
    }


    NegateOwnTechnique(game: IGame, attackingPokemon: Pokemon, defendingPokemon: Pokemon, technique: Technique){
        if (technique.damageType === DamageType.Status){
            game.AddMessage(`${attackingPokemon.name} is taunted and cannot use its technique!`);
            return true;
        }
        return false;
    }

    ModifyValidActions(game:IGame,player:Player,validActions:BattleAction[]):BattleAction[]{        
        let newValidActions = [];
       newValidActions =  validActions.filter(p=>{
        //Should only apply to moves, maybe we should have a ModifyValidTechniques and ModifyValidSwitchActions functions?
             if (p.type === Actions.SwitchPokemon || p.type === Actions.ForcedTechnique || p.type === Actions.UseItem){
                 return true;
             }
             const activePokemon = GetActivePokemon(player);
             const validTechniqueIds = activePokemon.techniques.filter(t=>t.damageType!==DamageType.Status).map(t=>t.id);             
             return validTechniqueIds.includes(p.moveId);     
        });
        return newValidActions;
    }
    EndOfTurn(game: IGame, pokemon: Pokemon) {
        this.turnsLeft--;
        if (this.turnsLeft<=0){
            game.AddMessage(`${pokemon.name} is not being taunted anymore!`);
            game.AddMessage("");
            this.Remove(game, pokemon);
        }
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
        case VolatileStatusType.Encored: {
            return new EncoredVolatileStatus();
        }
        case VolatileStatusType.ChargingSolarBeam: {
            return new ChargingSolarBeamVolatileStatus();
        }
        case VolatileStatusType.Taunted:{
            return new TauntedVolatileStatus();
        }
        default: {
            throw new Error(`${type} has not been implemented in GetVolatileStatus`);
        }
    }
}


