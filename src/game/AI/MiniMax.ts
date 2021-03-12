import { UseMoveAction, Actions, BattleAction } from "game/BattleActions";
import BattleGame from "game/BattleGame";
import { Status } from "game/HardStatus/HardStatus";
import { GetActivePokemon } from "game/HelperFunctions";
import { Player } from "game/Player/PlayerBuilder";
import { Stat } from "game/Stat";
import { Technique } from "game/Techniques/Technique";
import { Field } from "game/Turn";
import _, { shuffle } from "lodash";
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
    LostGame = "lost-game"
}

type PointCalcRecord = Record<PointCalculationTypes, number>;

interface PointCalcInfo {
    action:BattleAction,
    points: number,
    pointCalcs: PointCalcRecord
}


//What would be a node ->
/*

I want to implement a tree for this so

class MinMaxNode{
    id:number,
    turnId: number //the id of the turn that this choice is occuring on (starting from 1 every time though)
    field:Field,
    parentNode:MinMaxNode,
    childrenNode:Array<MinMaxNode>
    nodeType : 'initial-action' | 'switch-pokemon-action'
    action: BattleAction
    score: PointCalc    
}



-A field with an initial action and any additional switch pokemon actions after that.
-Each switch pokemon action 

-They should all be treated as the same, perhaps we will just store the action type in the node.

 (IA)
  |
  V
(IA2) || (SP1) || (SP2) || (SP3) || (SP4)
           |
           V
        (IA3)
*/

class MiniMax {
    

    //Iterations is the number of iterations we will run per "node"
    //depth is how many turns deep we want to go.
    //To start lets get it working with 1 turn deep.
    async RunSimulation(simmedPlayer:Player,field:Field,iterations:number,depth:number){
        const player = field.players.find(player => player.id === simmedPlayer.id);
        const otherPlayer = field.players.find(player => player.id !== simmedPlayer.id);

        if (player === undefined){
            throw new Error(`Could not find player for simulation`);
        }

        if (otherPlayer === undefined) {
            throw new Error(`Could not find other player to simulate turn`);
        }
        const calculatedOppPoints = await this.SimulateAllActions(otherPlayer, field, undefined);
        const predictedOppAction = calculatedOppPoints[0].action;
       return await this.SimulateAllActions(player,field,predictedOppAction);
    }
    async SimulateAllActions(simmedPlayer: Player, beforeField: Field, oppAction?: BattleAction) {
        const simIterations = 3;

        beforeField = _.cloneDeep(beforeField);

        /*
        Make an initial game,
        Get all of the legal actions;
        */

        const originalGame = new BattleGame(beforeField.players,false);
        originalGame.gameState = beforeField;

        const validActions = originalGame.GetValidActions(simmedPlayer);

        //TODO - this should change to all actions instead.
        let calculatedPoints = await Promise.all(validActions.map(async tech => {
            const arr = [];
            for (var i = 0; i < simIterations; i++) {
                arr.push(i);
            }
            let totals;
            await Promise.all(
                arr.map(
                    async () => {
                        await waitForSeconds(0.01);
                        return this.Simulate1Action(simmedPlayer, tech, beforeField, oppAction)
                    }
                )).then((result) => {
                    totals = result.reduce(this.AddPointCalcs)
                })
            if (totals === undefined) {
                throw new Error(`totals was undefined in ai!`);
            }

            return this.AveragePointCalcs(totals, simIterations);
        }));

        calculatedPoints = calculatedPoints.sort((a, b) => b.points - a.points);
        return calculatedPoints;
    }

    private Simulate1Action(simmedPlayer: Player, simmedAction:BattleAction, beforeField: Field, oppAction?: BattleAction) {
        const testGame = new BattleGame(beforeField.players, false);
        testGame.gameState = beforeField;
        testGame.Initialize();
        testGame.GetCurrentTurn().SetInitialPlayerAction(simmedAction);

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
        testGame.GetCurrentTurn().SetInitialPlayerAction(opponentAction);
        const pointCalcInfo = this.EvaluateField(simmedPlayer,testGame.GetCurrentTurn().field);

        //terminate if - we have reached our maximum depth,both players are going to switch pokemon,or the game has ended.

        const finalInfo :PointCalcInfo = {
           action:simmedAction,
           pointCalcs:pointCalcInfo.pointCalcs,
           points:pointCalcInfo.points
       }

       return finalInfo;
    }




    //Returns our interpretation of what we think a winning an losing game state is.
    EvaluateField(player: Player, field: Field) {

        const simmedPlayer = field.players.find(p=>p.id === player.id);
        const opponentPlayer = field.players.find(p => p.id !== player.id);

        if (opponentPlayer === undefined || simmedPlayer === undefined)  {
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

        const pointValues = initializePointValues();
        pointValues[PointCalculationTypes.WonGame] = 99999;
        pointValues[PointCalculationTypes.LostGame] = -99999;
        pointValues[PointCalculationTypes.EnemyPokemonFainted] = 100;
        pointValues[PointCalculationTypes.AllyPokemonFainted] = -100;
        pointValues[PointCalculationTypes.EnemyTeamDeltaHealth] = -510; //* the difference
        pointValues[PointCalculationTypes.AllyTeamDeltaHealth] = 500; //* the difference
        pointValues[PointCalculationTypes.AllyPokemonInflictedStatus] = -60;
        pointValues[PointCalculationTypes.EnemyPokemonHasStatus] = 60;
        pointValues[PointCalculationTypes.AllyStatBoost] = 60;
        pointValues[PointCalculationTypes.EnemyPlayerEntryHazards] = 12;




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
        if ([Status.Burned, Status.ToxicPoison, Status.Resting, Status.Frozen, Status.Paralyzed, Status.Poison].includes(GetActivePokemon(simmedPlayer).status)) {
            pointCalcs[PointCalculationTypes.AllyPokemonInflictedStatus] = pointValues[PointCalculationTypes.AllyPokemonInflictedStatus];
        }

        //Enemy had a status inflicted onto them
        if ([Status.Burned, Status.ToxicPoison, Status.Resting, Status.Frozen, Status.Paralyzed, Status.Poison].includes(GetActivePokemon(opponentPlayer).status)) {
            pointCalcs[PointCalculationTypes.EnemyPokemonHasStatus] = pointValues[PointCalculationTypes.EnemyPokemonHasStatus];
        }

        //We got a stat boost while still having more than 70% health
        if ((GetActivePokemon(simmedPlayer).currentStats.hp / GetActivePokemon(simmedPlayer).originalStats.hp) * 100 >= 70){
            pointCalcs[PointCalculationTypes.AllyStatBoost] = pointValues[PointCalculationTypes.AllyStatBoost] * GetStatBoostsAmount(simmedPlayer);
        }

        //TODO, speed stat boost should only care if they are faster than the opponent.

        const getAmountOfEntryHazards = (player: Player, field: Field) => {
            if (!field.entryHazards) {
                return 0;
            }
            const amountOfHazards = field.entryHazards?.filter(haz => haz.player?.id === player.id).length;
            const hazardStages = field.entryHazards?.filter(haz => haz.player?.id === player.id && haz.stage > 0).map(haz => haz.stage - 1).reduce((a, b) => a + b, 0)
            return amountOfHazards + hazardStages;
        }

        const GetAmountOfAlivePokemon = (player: Player) => {
            return player.pokemon.filter(poke => poke.currentStats.hp > 0).length;
        }
        pointCalcs[PointCalculationTypes.EnemyPlayerEntryHazards] = pointValues[PointCalculationTypes.EnemyPlayerEntryHazards] * getAmountOfEntryHazards(opponentPlayer,field) * GetAmountOfAlivePokemon(opponentPlayer);

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
            action:a.action, points: a.points + b.points, pointCalcs: newPointCalcs
        }
    }

    private AveragePointCalcs = (totals: PointCalcInfo, iterations: number) => {

        let averageCalculation: PointCalcInfo = {
            action:totals.action,
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
