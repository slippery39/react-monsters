
import { Actions, BattleAction, SwitchPokemonAction } from "game/BattleActions";
import BattleGame, { Field, TurnState } from "game/BattleGame";
import { Status } from "game/HardStatus/HardStatus";
import { CloneField, GetActivePokemon } from "game/HelperFunctions";
import { Player } from "game/Player/PlayerBuilder";
import { Pokemon } from "game/Pokemon/Pokemon";
import { Stat } from "game/Stat";
import { DamageType } from "game/Techniques/Technique";
import { VolatileStatusType } from "game/VolatileStatus/VolatileStatus";
import  { shuffle } from "lodash";
import waitForSeconds from "./CoroutineTest";



enum PointCalculationTypes {
    WonGame = "won-game",
    EnemyPokemonFainted = "enemy-pokemon-fainted",
    AllyPokemonFainted = 'ally-pokemon-fainted',
    EnemyTeamDeltaHealth = "enemy-team-delta-health",
    AllyTeamDeltaHealth = "ally-team-delta-health",
    AllyPokemonDeltaHealth = "ally-pokemon-delta-health",
    EnemyPokemonDeltaHealth = "enemy-pokemon-delta-health",
    AllyPokemonInflictedStatus = "ally-pokemon-has-status",
    EnemyPokemonHasStatus = "enemy-pokemon-has-status",
    EnemyPlayerEntryHazards = "enemy-entry-hazards",
    AllyStatBoost = "ally-stat-boost",
    EnemyStatBoost = "enemy-stat-boost",
    LostGame = "lost-game",
    EnemyTaunted = 'enemy-taunted'
}

type PointCalcRecord = Record<PointCalculationTypes, number>;

interface PointCalcInfo {
    action: BattleAction,
    action2?: BattleAction,
    points: number,
    pointCalcs: PointCalcRecord,
    depth?: number
}

class MiniMax {


    async GetBestPokemonSwitch(simmedPlayer: Player, originalGame: BattleGame) {
        const miniMax = new MiniMax();
        const validSwitchActions = originalGame.GetValidActions(simmedPlayer).filter(vAct => vAct.type === 'switch-pokemon-action');
        const results: Array<PointCalcInfo> = [];
        for (let key in validSwitchActions) {
            const clonedGame = originalGame.Clone();
            const action = validSwitchActions[key];
            const player = clonedGame.GetPlayers().find(p => p.id === simmedPlayer.id)!;

            if (clonedGame.GetCurrentState() === TurnState.WaitingForInitialActions) {
                clonedGame.SetInitialPlayerAction(action as SwitchPokemonAction);
            }
            else if (clonedGame.GetCurrentState() === TurnState.WaitingForSwitchActions) {
                clonedGame.SetSwitchPromptAction(action as SwitchPokemonAction);
            }
            const afterSwitchField = clonedGame.field;
            const result = await miniMax.SimulateAllActions(player, afterSwitchField, true, undefined);
            result[0].action = action;
            results.push(result[0]);
        }
        
        return results.length < 2 ? results : results.sort((a, b) => b.points - a.points);
    }

    async RunSimulation(simmedPlayer: Player, field: Field) {
        await waitForSeconds(0);
        const player = field.players.find(player => player.id === simmedPlayer.id);
        const otherPlayer = field.players.find(player => player.id !== simmedPlayer.id);

        if (player === undefined) {
            throw new Error(`Could not find player for simulation`);
        }

        if (otherPlayer === undefined) {
            throw new Error(`Could not find other player to simulate turn`);
        }
        const calculatedOppPoints = await this.SimulateAllActions(otherPlayer, field, true, undefined);
        const predictedOppAction = calculatedOppPoints[0].action;
        return await this.SimulateAllActions(player, field, false, predictedOppAction);
    }
    async SimulateAllActions(simmedPlayer: Player, beforeField: Field, techsOnly: Boolean, oppAction?: BattleAction) {
        beforeField = CloneField(beforeField)
        const originalGame = new BattleGame(beforeField.players, false);
        originalGame.field = beforeField;
        const validTechActions = originalGame.GetValidActions(simmedPlayer).filter(vAct => vAct.type === Actions.UseTechnique || vAct.type === Actions.ForcedTechnique);
  

        let calculatedPoints = [];
        for (let key in validTechActions) {
            const action = validTechActions[key];
            //If necessary we can change simulate 1 action to have multiple iterations;
            waitForSeconds(0);
            let total = await this.Simulate1Action(simmedPlayer, action, beforeField, oppAction);
            calculatedPoints.push(total);
        }


        calculatedPoints = shuffle(calculatedPoints).sort((a, b) => b.points - a.points);

        //We need to specify tech's only or we will run into an infinite loop with the switching logic.
        if (techsOnly) {
  
            return calculatedPoints;
        }

        const beforePoints = this.EvaluateField(simmedPlayer, beforeField);
        //No good moves lets look for a good switch
        //put a bit of a threshold, pokemon should be switching in for large advantages, not necessarily for small ones
        if (beforePoints.points > calculatedPoints[0].points + 50) {
            const switchPoints = await this.GetBestPokemonSwitch(simmedPlayer,originalGame);
              if (switchPoints.length>0 && switchPoints[0].points > calculatedPoints[0].points+50) {
                return switchPoints;
            }
        }
  

            return calculatedPoints;
        
    }

    private async Simulate1Action(simmedPlayer: Player, simmedAction: BattleAction, beforeField: Field, oppAction?: BattleAction) {

        const testGame = new BattleGame(beforeField.players, false);
        testGame.field = CloneField(beforeField);
        testGame.Initialize();


        if (simmedAction.type === 'switch-pokemon-action') {
            const bestSwitch = await this.GetBestPokemonSwitch(simmedPlayer, testGame);
            return bestSwitch[0];
        }


        testGame.SetInitialPlayerAction(simmedAction);

        //find a random move for this playr
        const opponentPlayer = beforeField.players.find(p => p.id !== simmedPlayer.id);
        if (opponentPlayer === undefined) {
            throw new Error(`Could not find opponent player for simulation`);
        }

        const getOpponentAction = function (opponentPlayer: Player) {
            let otherAction: BattleAction;
            if (oppAction === undefined) {
                const otherPlayerActivePokemon = GetActivePokemon(opponentPlayer);
                const randomMove = shuffle(otherPlayerActivePokemon.techniques)[0];

                otherAction = {
                    playerId: opponentPlayer.id,
                    pokemonId: opponentPlayer.currentPokemonId,
                    moveId: randomMove.id,
                    type: Actions.UseTechnique
                };
            }
            else {
                otherAction = oppAction;
            }
            return otherAction;
        }

        const opponentAction = getOpponentAction(opponentPlayer);
        testGame.SetInitialPlayerAction(opponentAction);
        let pointCalcInfo;
        pointCalcInfo = this.EvaluateField(simmedPlayer, testGame.field);

        const finalInfo: PointCalcInfo = {
            action: simmedAction,
            pointCalcs: pointCalcInfo.pointCalcs,
            points: pointCalcInfo.points,
        }


        return finalInfo;
    }




    //Returns our interpretation of what we think a winning an losing game state is.
    EvaluateField(player: Player, field: Field) {

        const simmedPlayer = field.players.find(p => p.id === player.id);
        const opponentPlayer = field.players.find(p => p.id !== player.id);

        if (opponentPlayer === undefined || simmedPlayer === undefined) {
            throw new Error(`Could not find opponent player`);
        }

        function GetAmountOfFaintedPokemon(player: Player) {
            return player.pokemon.filter(poke => poke.currentStats.hp <= 0).length;
        }

        function CalculateTeamHealthPercentage(player: Player) {
            const totalHP = player.pokemon.map(poke => poke.originalStats.hp).reduce((a, b) => a + b);
            const currentHP = player.pokemon.map(poke => poke.currentStats.hp).reduce((a, b) => a + b);
            return currentHP / totalHP;
        }

        function GetStatBoostsAmount(player: Player) {
            const statBoostsAmount = player.pokemon.map(p => p.statBoosts.attack + p.statBoosts.defense + p.statBoosts[Stat.SpecialAttack] + p.statBoosts[Stat.SpecialDefense] + p.statBoosts.speed).reduce((a, b) => a + b);
            return statBoostsAmount;
        }

        const hasWonGame = GetAmountOfFaintedPokemon(opponentPlayer) === opponentPlayer?.pokemon.length;
        const hasLostGame = GetAmountOfFaintedPokemon(simmedPlayer) === simmedPlayer.pokemon.length;


        const initializePointCalcRecord = function () {
            const keys = Object.values(PointCalculationTypes);
            const genericObject: any = {};

            keys.forEach(key => {
                genericObject[key] = 0;
            })

            return genericObject as PointCalcRecord;
        }

        const initializePointValues = function () {
            const keys = Object.values(PointCalculationTypes);
            const genericObject: any = {};

            keys.forEach(key => {
                genericObject[key] = 0;
            })

            return genericObject as Record<PointCalculationTypes, number>
        }

        //The point values here may not matchup between ally and enemy ie the fainting and damage. The reason being is that the AI currently plays too defensively 
        //if it does not have a good move to make, which usually ends up in it just losing slower rather than trying to go for a lucky win. Trying the staggering point values
        //to make the AI's more aggresive
        const pointValues = initializePointValues();
        pointValues[PointCalculationTypes.WonGame] = 99999;
        pointValues[PointCalculationTypes.LostGame] = -99999;
        pointValues[PointCalculationTypes.EnemyPokemonFainted] = 150;
        pointValues[PointCalculationTypes.AllyPokemonFainted] = -100;
        //putting different point values for enemy and ally to try to see if the AI makes more aggresive plays, rather than playing too defensively if they are behind.
        pointValues[PointCalculationTypes.EnemyTeamDeltaHealth] = -550; //* the difference
        pointValues[PointCalculationTypes.AllyTeamDeltaHealth] = 450; //* the difference
        pointValues[PointCalculationTypes.AllyPokemonInflictedStatus] = -120;
        pointValues[PointCalculationTypes.EnemyPokemonHasStatus] = 120;
        pointValues[PointCalculationTypes.AllyStatBoost] = 75;
        pointValues[PointCalculationTypes.EnemyPlayerEntryHazards] = 16;
        

        //edge case things here
        pointValues[PointCalculationTypes.EnemyStatBoost] = -75;
        //pointValues[PointCalculationTypes.TauntedStatus] = 30 //30 times the amount of status moves that a player has

        pointValues[PointCalculationTypes.EnemyTaunted] = 20;



        const ourPokemon = GetActivePokemon(simmedPlayer);
        const opponentPokemon = GetActivePokemon(opponentPlayer);
       


        const pointCalcs: PointCalcRecord = initializePointCalcRecord();

        if (hasWonGame) {
            pointCalcs[PointCalculationTypes.WonGame] += 99999;
        }

        pointCalcs[PointCalculationTypes.EnemyPokemonFainted] = pointValues[PointCalculationTypes.EnemyPokemonFainted] * GetAmountOfFaintedPokemon(opponentPlayer);

        pointCalcs[PointCalculationTypes.AllyPokemonFainted] = pointValues[PointCalculationTypes.AllyPokemonFainted] * GetAmountOfFaintedPokemon(simmedPlayer);

        //Needs to be opposite.
        const opphealthDiff = CalculateTeamHealthPercentage(opponentPlayer);
        pointCalcs[PointCalculationTypes.EnemyTeamDeltaHealth] = pointValues[PointCalculationTypes.EnemyTeamDeltaHealth] * opphealthDiff

        const myHealthDiff = CalculateTeamHealthPercentage(simmedPlayer);
        pointCalcs[PointCalculationTypes.AllyTeamDeltaHealth] = pointValues[PointCalculationTypes.AllyTeamDeltaHealth] * myHealthDiff;


        //We had a status inflicted onto us.
        if (ourPokemon.ability.toLowerCase()!=="magic guard" && [Status.Burned, Status.ToxicPoison,Status.Poison].includes(ourPokemon.status)){
            pointCalcs[PointCalculationTypes.AllyPokemonInflictedStatus] = pointValues[PointCalculationTypes.AllyPokemonInflictedStatus];
        }
        if ([Status.Resting, Status.Frozen, Status.Paralyzed].includes(ourPokemon.status)) {
            pointCalcs[PointCalculationTypes.AllyPokemonInflictedStatus] = pointValues[PointCalculationTypes.AllyPokemonInflictedStatus];
        }

        if (opponentPokemon.ability.toLowerCase()!=="magic guard" && [Status.Burned, Status.ToxicPoison,Status.Poison].includes(opponentPokemon.status)){
            pointCalcs[PointCalculationTypes.EnemyPokemonHasStatus] = pointValues[PointCalculationTypes.EnemyPokemonHasStatus];
        }
        //Enemy had a status inflicted onto them
        if ([Status.Resting, Status.Frozen, Status.Paralyzed].includes(opponentPokemon.status)) {
            pointCalcs[PointCalculationTypes.EnemyPokemonHasStatus] = pointValues[PointCalculationTypes.EnemyPokemonHasStatus];
        }
        //TODO ; edge case for magic guard pokemon


        const GetHealthRatio = function (pokemon: Pokemon) {
            return (pokemon.currentStats.hp / pokemon.originalStats.hp);
        }
        pointCalcs[PointCalculationTypes.AllyStatBoost] = pointValues[PointCalculationTypes.AllyStatBoost] * GetStatBoostsAmount(simmedPlayer) * GetHealthRatio(ourPokemon);
        pointCalcs[PointCalculationTypes.EnemyStatBoost] = pointValues[PointCalculationTypes.EnemyStatBoost] * GetStatBoostsAmount(opponentPlayer) * GetHealthRatio(opponentPokemon);

        //taunted
        if (opponentPokemon.volatileStatuses.filter(vstat=>vstat.type===VolatileStatusType.Taunted)){
            pointCalcs[PointCalculationTypes.EnemyTaunted]= pointValues[PointCalculationTypes.EnemyTaunted] * opponentPokemon.techniques.filter(t=>t.damageType === DamageType.Status).length
        }

        //TODO, speed stat boost should only care if they are faster than the opponent.

        const getAmountOfEntryHazards = (player: Player, field: Field) => {
            if (!field.entryHazards) {
                return 0;
            }
            const amountOfHazards = field.entryHazards.filter(haz => haz.player?.id === player.id).length;
            const hazardStages = field.entryHazards.filter(haz => haz.player?.id === player.id && haz.stage > 0).map(haz => haz.stage - 1).reduce((a, b) => a + b, 0)
            return amountOfHazards + hazardStages;
        }

        const GetAmountOfAlivePokemon = (player: Player) => {
            return player.pokemon.filter(poke => poke.currentStats.hp > 0).length;
        }
        pointCalcs[PointCalculationTypes.EnemyPlayerEntryHazards] = pointValues[PointCalculationTypes.EnemyPlayerEntryHazards] * getAmountOfEntryHazards(opponentPlayer, field) * (GetAmountOfAlivePokemon(opponentPlayer)-1);


        if (hasLostGame) {
            pointCalcs[PointCalculationTypes.LostGame] = pointValues[PointCalculationTypes.LostGame];
        }

        let totalPoints = 0;
        for (let key in pointCalcs) {
            totalPoints += pointCalcs[key as PointCalculationTypes];
        }

        return {
            points: totalPoints,
            pointCalcs: pointCalcs
        }
    }

    //Some Calculation Functions

    private AddPointCalcs(a: PointCalcInfo, b: PointCalcInfo) {
        let newPointCalcs = { ...a.pointCalcs };
        Object.values(PointCalculationTypes).forEach(pct => {
            newPointCalcs[pct] = a.pointCalcs[pct] + b.pointCalcs[pct]
        });

        return {
            action: a.action, points: a.points + b.points, pointCalcs: newPointCalcs
        }
    }

    private AveragePointCalcs = (totals: PointCalcInfo, iterations: number) => {

        let averageCalculation: PointCalcInfo = {
            action: totals.action,
            points: totals.points / iterations,
            pointCalcs: totals.pointCalcs

        }
        const pointCalculationTypes: Array<PointCalculationTypes> = Object.values(PointCalculationTypes);
        pointCalculationTypes.forEach(s => {
            averageCalculation.pointCalcs[s] = totals.pointCalcs[s] / iterations;
        });
        return averageCalculation
    }


}

export default MiniMax;
