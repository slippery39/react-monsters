import { before, initial, shuffle } from "lodash";
import { Actions, BattleAction, CreateSwitchAction, SwitchPokemonAction, UseItemAction, UseMoveAction } from "game/BattleActions";
import BattleService from "game/BattleService";
import { GetActivePokemon, GetPercentageHealth } from "game/HelperFunctions";
import { Player } from "game/Player/PlayerBuilder";
import BattleGame from "game/BattleGame";
import { Field, OnSwitchNeededArgs } from "game/Turn";
import { Technique } from "game/Techniques/Technique";
import { Status } from "game/HardStatus/HardStatus";
import waitForSeconds from "./CoroutineTest";
import _ from "lodash";
import { Stat } from "game/Stat";




interface AI {
    ChooseAction: () => void
    ChoosePokemonToSwitchInto: (args: OnSwitchNeededArgs) => void
}

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
    moveId: number,
    moveName: string,
    points: number,
    pointCalcs: PointCalcRecord
}

class BasicAI implements AI {

    private _playerID: number;
    private _service: BattleService;

    constructor(aiPlayer: Player, service: BattleService) {
        this._playerID = aiPlayer.id;
        this._service = service;
        this._service.OnActionNeeded.on((args) => {
            if (args.playerIDsNeeded.includes(this._playerID)) {

                console.log("valid actions for ai : ", this._service.GetValidActions(this._playerID));
                this.ChooseAction();
            }
        })
        this._service.OnSwitchNeeded.on((args) => {
            this.ChoosePokemonToSwitchInto(args);

        })
    }

    private GetPlayerFromTurn(): Player {
        const player = this._service.GetCurrentTurn().GetPlayers().find(player => player.id === this._playerID);

        if (player === undefined) {
            throw new Error(`Could not find player with id ${this._playerID} in the game state to use for AI Brain`);
        }

        return player;
    }


    private AddPointCalcs(a: PointCalcInfo, b: PointCalcInfo) {
        let newPointCalcs = { ...a.pointCalcs };
        Object.values(PointCalculationTypes).forEach(pct => {
            newPointCalcs[pct] = a.pointCalcs[pct] + b.pointCalcs[pct]
        });

        return {
            moveId: a.moveId, moveName: a.moveName, points: a.points + b.points, pointCalcs: newPointCalcs
        }
    }

    private AveragePointCalcs = (totals: PointCalcInfo, iterations: number) => {

        let averageCalculation: PointCalcInfo = {
            moveId: totals.moveId,
            moveName: totals.moveName,
            points: totals.points / iterations,
            pointCalcs: totals.pointCalcs

        }
        const pointCalculationTypes: Array<PointCalculationTypes> = Object.values(PointCalculationTypes);
        pointCalculationTypes.forEach(s => {
            averageCalculation.pointCalcs[s] = totals.pointCalcs[s] / iterations;
        });
        return averageCalculation
    }

    async ChooseActionAsync() {
        await this.ChooseActionMonteCarlo();
    }


    async SimulateTurn(initialField: Field) {

        const player = initialField.players.find(player => player.id !== this._playerID);
        const otherPlayer = initialField.players.find(player => player.id !== this._playerID);

        if (otherPlayer === undefined) {
            throw new Error(`Could not find other player to simulate turn`);
        }

        const calculatedOppPoints = await this.SimulateManyTechs(otherPlayer, initialField, undefined);
        const predictedOppAction: UseMoveAction = {
            playerId: otherPlayer.id,
            pokemonId: otherPlayer.currentPokemonId,
            moveId: calculatedOppPoints[0].moveId,
            type: Actions.UseTechnique
        };

        //const calculatedPointsForUs = await this.SimulateAllActions(player, initialField, predictedOppAction);

        //const game = new BattleGame
    }

    async SimulateOneAction(player: Player, initialField: Field, oppAction?: BattleAction) {
        const simIterations = 3;
        const activePokemon = GetActivePokemon(player);
        const simGame = new BattleGame(initialField.players, false);
        simGame.gameState = initialField;
    }

    CalculatePoints(simmedPlayer:Player,beforeField:Field,testGame:BattleGame){        
        const afterField = testGame.GetCurrentTurn().field;
        const opponentPlayer = beforeField.players.find(p=>p.id!==simmedPlayer.id);

        if (opponentPlayer === undefined){
            throw new Error(`could not find opponent player`);
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


        const simmedPlayerAfter = afterField.players.find(p => p.id === simmedPlayer.id)!;
        const simmedOpponentAfter = afterField.players.find(p => p.id !== simmedPlayer.id)!;
        const gameState = testGame.GetCurrentTurn().currentState;

 

        const initializePointCalcRecord = function () {
            const keys = Object.values(PointCalculationTypes);
            const genericObject: any = {};

            keys.forEach(key => {
                genericObject[key] = 0;
            })

            return genericObject as PointCalcRecord;
        }

        const initializePointValues = function (){
            const keys = Object.values(PointCalculationTypes);
            const genericObject: any = {};

            keys.forEach(key => {
                genericObject[key] = 0;
            })

            return genericObject as Record<PointCalculationTypes,number>
        }

        const pointValues  = initializePointValues();
        pointValues[PointCalculationTypes.WonGame] = 99999;
        pointValues[PointCalculationTypes.EnemyPokemonFainted] = 1000;
        pointValues[PointCalculationTypes.AllyPokemonFainted] =-1000;
        pointValues[PointCalculationTypes.EnemyTeamDeltaHealth] = 600; //* the difference
        pointValues[PointCalculationTypes.AllyTeamDeltaHealth] = -600; //* the difference
        pointValues[PointCalculationTypes.AllyPokemonInflictedStatus] = -60;
        pointValues[PointCalculationTypes.EnemyPokemonHasStatus] = 60;
        pointValues[PointCalculationTypes.AllyStatBoost] = 60;
        pointValues[PointCalculationTypes.EnemyPlayerEntryHazards] = 12; 

    


        const pointCalcs: PointCalcRecord = initializePointCalcRecord();

        if (gameState.winningPlayerId === simmedPlayer.id) {
            pointCalcs[PointCalculationTypes.WonGame] += 99999;
        }
        //Enemy pokemon fainting.
        if (GetAmountOfFaintedPokemon(simmedOpponentAfter) > GetAmountOfFaintedPokemon(opponentPlayer)) {
              pointCalcs[PointCalculationTypes.EnemyPokemonFainted] += pointValues[PointCalculationTypes.EnemyPokemonFainted];
        }

        //Our own pokemon fainting
        if (GetAmountOfFaintedPokemon(simmedPlayerAfter) > GetAmountOfFaintedPokemon(simmedPlayer)) {
            pointCalcs[PointCalculationTypes.AllyPokemonFainted] = pointValues[PointCalculationTypes.AllyPokemonFainted]
        }
        //Needs to be opposite.
        const opphealthDiff = CalculateTeamHealthPercentage(opponentPlayer) - CalculateTeamHealthPercentage(simmedOpponentAfter);
        pointCalcs[PointCalculationTypes.EnemyTeamDeltaHealth] += pointValues[PointCalculationTypes.EnemyTeamDeltaHealth] * opphealthDiff

        const myHealthDiff = CalculateTeamHealthPercentage(simmedPlayer) - CalculateTeamHealthPercentage(simmedPlayerAfter);
        pointCalcs[PointCalculationTypes.AllyPokemonDeltaHealth] += pointValues[PointCalculationTypes.AllyPokemonDeltaHealth] * myHealthDiff;

        //We had a status inflicted onto us.
        if (GetActivePokemon(simmedPlayer).status === Status.None &&
            [Status.Burned, Status.ToxicPoison, Status.Resting, Status.Frozen, Status.Paralyzed, Status.Poison].includes(GetActivePokemon(simmedPlayerAfter).status)) {
              pointCalcs[PointCalculationTypes.AllyPokemonInflictedStatus] += pointValues[PointCalculationTypes.AllyPokemonInflictedStatus];
        }

        //Enemy had a status inflicted onto them
        if (GetActivePokemon(opponentPlayer).status === Status.None &&
            [Status.Burned, Status.ToxicPoison, Status.Resting, Status.Frozen, Status.Paralyzed, Status.Poison].includes(GetActivePokemon(simmedOpponentAfter).status)) {
            pointCalcs[PointCalculationTypes.EnemyPokemonHasStatus] += pointValues[PointCalculationTypes.EnemyPokemonHasStatus];
        }

        //We got a stat boost while still having more than 70% health
        if ((GetActivePokemon(simmedPlayerAfter).currentStats.hp / GetActivePokemon(simmedPlayerAfter).originalStats.hp) * 100 >= 70
            && GetStatBoostsAmount(simmedPlayerAfter) > GetStatBoostsAmount(simmedPlayer)) {
              pointCalcs[PointCalculationTypes.AllyStatBoost] += pointValues[PointCalculationTypes.AllyStatBoost];
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


        if (getAmountOfEntryHazards(simmedOpponentAfter, afterField) > getAmountOfEntryHazards(opponentPlayer, beforeField)) {
            pointCalcs[PointCalculationTypes.EnemyPlayerEntryHazards] += pointValues[PointCalculationTypes.EnemyPlayerEntryHazards] * GetAmountOfAlivePokemon(opponentPlayer);
        }

        if (gameState.winningPlayerId === opponentPlayer.id) {
            pointCalcs[PointCalculationTypes.LostGame] += pointValues[PointCalculationTypes.LostGame];
        }

        let totalPoints = 0;
        for (let key in pointCalcs){
            totalPoints += pointCalcs[key as PointCalculationTypes];
        }

        return {
            points:totalPoints,
            pointCalcs:pointCalcs
        }
    }




    async ChooseActionMonteCarlo() {

        const beforeField = this._service.GetField();
        const beforeAIPlayer = beforeField.players.find(player => player.id === this._playerID)!;
        const beforeOtherPlayer = beforeField.players.find(player => player.id !== this._playerID)!;


        const activePokemon = this.GetPlayerFromTurn().pokemon.find(p => p.id === this.GetPlayerFromTurn().currentPokemonId);

        if (activePokemon === undefined) {
            throw new Error(`Could not find active pokemon for AI`);
        }

        const calculatedOppPoints = await this.SimulateManyTechs(beforeOtherPlayer, beforeField, undefined);
        const predictedOppAction: UseMoveAction = {
            playerId: beforeOtherPlayer.id,
            pokemonId: beforeOtherPlayer.currentPokemonId,
            moveId: calculatedOppPoints[0].moveId,
            type: Actions.UseTechnique
        };
        const calculatedPointsForUs = await this.SimulateManyTechs(beforeAIPlayer, beforeField, predictedOppAction);
        const currentPokemon = GetActivePokemon(beforeAIPlayer);

        let techniqueName = currentPokemon.techniques.find(t => t.id === calculatedPointsForUs[0].moveId)?.name
        if (!techniqueName) {
            //console.error(`technique not found for ${beforeAIPlayer.name}, looking for technique id ${e[0].moveId}`,e,currentPokemon);
        }
        const chosenAction: UseMoveAction = {
            type: Actions.UseTechnique,
            playerId: this.GetPlayerFromTurn().id,
            pokemonId: this.GetPlayerFromTurn().currentPokemonId,
            pokemonName: currentPokemon.name,
            moveName: techniqueName ? techniqueName : "move not found...",
            moveId: calculatedPointsForUs[0].moveId
        }

        this._service.SetPlayerAction(chosenAction);

    }

    private async SimulateManyTechs(simmedPlayer: Player, beforeField: Field, oppAction?: BattleAction) {
        const simIterations = 3;
        const activePokemon = GetActivePokemon(simmedPlayer);

        beforeField = _.cloneDeep(beforeField);


        let calculatedPoints = await Promise.all(activePokemon.techniques.map(async tech => {
            const arr = [];
            for (var i = 1; i < simIterations; i++) {
                arr.push(i);
            }
            let totals;
            await Promise.all(
                arr.map(
                    async () => {
                        await waitForSeconds(0.01);
                        return this.Simulate1Tech(simmedPlayer, tech, beforeField, oppAction)
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


    /* TODO - We should do a 2 turn simulation if neither the current pokemon or the enemy pokemon fainted, or else 2 turn moves like Bounce / Wish / whatever will not be scored appropriately*/
    private Simulate1Tech(simmedPlayer: Player, techToSim: Technique, beforeField: Field, oppAction?: BattleAction) {

        const testGame = new BattleGame(beforeField.players, false);
        testGame.gameState = beforeField;
        testGame.Initialize();


        const currentPokemon = GetActivePokemon(simmedPlayer);
        //Setting Action for Simmed Player
        const action: UseMoveAction = {
            playerId: simmedPlayer.id,
            pokemonName: currentPokemon.name,
            pokemonId: simmedPlayer.currentPokemonId,
            moveId: techToSim.id,
            moveName: techToSim.name,
            type: Actions.UseTechnique
        };
        testGame.GetCurrentTurn().SetInitialPlayerAction(action);


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

        const pointCalcInfo = this.CalculatePoints(simmedPlayer,beforeField,testGame);

        const finalInfo :PointCalcInfo = {
           moveId:techToSim.id,
           moveName:techToSim.name,
           pointCalcs:pointCalcInfo.pointCalcs,
           points:pointCalcInfo.points
       }

       return finalInfo;
    }


    ChooseAction() {
        //NEW AI if current pokemon has 40% health use a potion
        const AIpokemon = GetActivePokemon(this.GetPlayerFromTurn());


        if (GetPercentageHealth(AIpokemon) <= 40 && this.GetPlayerFromTurn().items.length > 0) {
            /*
                use a potion on their pokemon instead of attacking
            */
            const itemToUse = shuffle(this.GetPlayerFromTurn().items)[0].id;

            const action: UseItemAction = {
                type: 'use-item-action',
                playerId: this.GetPlayerFromTurn().id,
                itemId: itemToUse
            }

            this._service.SetInitialAction(action);

        }
        else {
            this.ChooseActionAsync();
        }
    }

    GetOtherPlayer(players: Array<Player>) {
        const otherPlayer = players.find(p => p.id !== this._playerID);
        if (otherPlayer === undefined) {
            throw new Error(`Could not find other player`);
        }
        return otherPlayer;
    }

    private SwitchRandomPokemon(validPokemon: Array<number>) {
        if (validPokemon.length === 0) {
            throw new Error(`ERROR could not get valid pokemon to switch into for AI`);
        }

        const pokemonChosen = shuffle(validPokemon)[0]
        const switchPokemonAction: SwitchPokemonAction = {
            playerId: this.GetPlayerFromTurn().id,
            type: 'switch-pokemon-action',
            switchPokemonId: pokemonChosen
        }
        this._service.SetSwitchFaintedPokemonAction(switchPokemonAction, false);
    }

    private async SwitchPokemonSmart(validPokemon: Array<number>) {
        let maxPoints = -999999999;
        let bestPokemon = undefined;
        for (var key in validPokemon) {
            const pokeId = validPokemon[key];
            const clonedTurn = this._service.GetCurrentTurn().Clone();
            const player = clonedTurn.GetPlayers().find(p => p.id === this._playerID)!;
            clonedTurn.SetSwitchPromptAction(CreateSwitchAction(player, pokeId));
            const afterSwitchField = clonedTurn.field;
            const result = await this.SimulateManyTechs(player, afterSwitchField, undefined);
            console.log("result for smart switch", pokeId, result)
            if (result[0].points > maxPoints) {
                maxPoints = result[0].points;
                bestPokemon = pokeId;
            }
        }

        if (bestPokemon === undefined) {
            throw new Error(`Could not find best pokemon to switch into... choosing at random instead`);
        }
        //we found the best pokemon lets switch into it!
        const pokemonSwitchActionSelected = CreateSwitchAction(this.GetPlayerFromTurn(), bestPokemon);
        this._service.SetSwitchFaintedPokemonAction(pokemonSwitchActionSelected, false);
    }


    async ChoosePokemonToSwitchInto(args: OnSwitchNeededArgs) {
        //Allowing the AI player to switch his fainted pokemon to something else.

        const AIShouldSwitch = args.playerIDsNeeded.includes(this._playerID);
        if (AIShouldSwitch) {

            //TODO - If both players switch, pick randomly.
            const validPokemon = this._service.GetValidPokemonToSwitchInto(this.GetPlayerFromTurn().id);

            //in the case where both players are switching at the same time then we should just pick randomly, also no need to use smart switch if we only have 1 pokemon left.
            if (args.playerIDsNeeded.length > 1 || validPokemon.length === 1) {
                console.log("choosing the random switch path");
                this.SwitchRandomPokemon(validPokemon);
                return;
            }
            else {
                console.log("choosing the smart switch path");
                await this.SwitchPokemonSmart(validPokemon);
            }
        }
        else {

        }
    }

}

export default BasicAI