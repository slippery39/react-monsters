import { before, shuffle } from "lodash";
import { Actions, BattleAction, SwitchPokemonAction, UseItemAction, UseMoveAction } from "game/BattleActions";
import BattleService from "game/BattleService";
import { GetActivePokemon, GetPercentageHealth } from "game/HelperFunctions";
import { Player, PlayerBuilder } from "game/Player/PlayerBuilder";
import BattleGame from "game/BattleGame";
import { Field } from "game/Turn";
import { Technique } from "game/Techniques/Technique";
import { Status } from "game/HardStatus/HardStatus";
import waitForSeconds from "./CoroutineTest";
import _ from "lodash";



interface AI {
    ChooseAction: () => void
    ChoosePokemonToSwitchInto: () => void
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

        this._service.OnNewTurn.on(() => {
            //setTimeout(() => {
            
            //Do we need to select an action here?
            this.ChooseAction()
            //}, 300);

        })
        this._service.OnSwitchNeeded.on(() => {
            this.ChoosePokemonToSwitchInto();
        })
    }

    private GetPlayerFromTurn(): Player {
        const player = this._service.GetCurrentTurn().GetPlayers().find(player => player.id === this._playerID);

        if (player === undefined) {
            throw new Error(`Could not find player with id ${this._playerID} in the game state to use for AI Brain`);
        }

        return player;
    }


    async ChooseActionAsync() {
        this.ChooseActionMonteCarlo();
    }


    async ChooseActionMonteCarlo() {
        //console.log("Beginning to choose action for player " + this._playerID);
        //console.warn("turn id at start:" + this._service.GetCurrentTurn().id)
        //console.warn(`CHOOSING MONTE CARLO ACTION FOR PLAYER ${this.GetPlayerFromTurn().name}`)
        /*
            The process, we will go over all valid game actions
                Valid Game Actions (Should be 9 total in a normal game state if we aren't counting items)
                    Tech1,Tech2,Tech3,Tech4,Switch1,Switch2,Switch3,Switch4,Switch5
                For each valid game action, we will run a simulation of the turn N times (10,100,1000?)
                At the end of the turn calculation we will score the result based off of these factors
                    Player has won game : X Points (should be very high 999999)
                    Enemy Pokemon Fainted : X Points
                    Enemy Pokemon Damaged : X Points
                    Enemy Pokemon Hard Status Inflicted : X Points
                    Ally Hazard Placed if not existing : X Points
                    Ally Pokemon gained Stat Boost : X Points
                    Ally Pokemon healed : X Points
                    Ally Pokemon removed status : X Points
                    Ally Pokemon Damaged : -X Points
                    Ally Pokemon Fainted : -X Points
                    Player has lost game : -X Points (should be very low -999999)
                We will average the score out based off of how many interations and then pick that action.                
        */

        /*
            Steps for Implementing
            1. Implement MonteCarlo for Techniques only and assuming a random technique used by the opponent.
                Why? This should at least have the AI picking super effective moves or what not
            2.: TBD

        */

        const beforeField = this._service.GetField();
        const beforeAIPlayer = beforeField.players.find(player => player.id === this._playerID)!;
        const beforeOtherPlayer = beforeField.players.find(player => player.id !== this._playerID)!;


        const activePokemon = this.GetPlayerFromTurn().pokemon.find(p => p.id === this.GetPlayerFromTurn().currentPokemonId);



        if (activePokemon === undefined) {
            throw new Error(`Could not find active pokemon for AI`);
        }


        //FIGURE OUT MOST LIKELY MOVE FOR OPPONENT.
        //console.error("-----");
       //console.log(this._service.GetCurrentTurn().id,this._playerID);
        //console.log("first many techs started....",beforeField);
        //console.warn("turn id right before predicint opp move", this._service.GetCurrentTurn().id)
        const calculatedOppPoints= await this.SimulateManyTechs(beforeOtherPlayer,beforeField,undefined);
        const predictedOppAction: UseMoveAction = {
            playerId: beforeOtherPlayer.id,
            pokemonId: beforeOtherPlayer.currentPokemonId,
            moveId: calculatedOppPoints[0].moveId,
            type: Actions.UseTechnique
        };
        //console.log("second many techs started",beforeField,this._playerID);
        //console.warn("turn id right before simming result" + this._service.GetCurrentTurn().id)
        const e = await this.SimulateManyTechs(beforeAIPlayer, beforeField, predictedOppAction);
        //console.warn("recieved sim result for ai" +this._playerID,e);
        //console.warn("turn id after simming result" + this._service.GetCurrentTurn().id)
        const currentPokemon = GetActivePokemon(beforeAIPlayer);



        //WE NEED TO FIX THIS FIRST... ONCE WE FIX THIS WE WILL SEE IF THERE THE OTHER PROBLEM STILL EXISTS.
        if (this.GetPlayerFromTurn().currentPokemonId !== beforeAIPlayer.currentPokemonId){
            /*


            const activePokemon = GetActivePokemon(this.GetPlayerFromTurn());
            const activePokemon2 = GetActivePokemon(beforeAIPlayer);
            //console.error("we need to choose another action :(",this._service.GetCurrentTurn().field,activePokemon,activePokemon2);

            setTimeout(()=>{
            this.ChooseActionMonteCarlo(); 
            },20);//hack, lets try aagin.
            return;


           */
        }
        let techniqueName = currentPokemon.techniques.find(t=>t.id === e[0].moveId)?.name
        if (!techniqueName){
            //console.error(`technique not found for ${beforeAIPlayer.name}, looking for technique id ${e[0].moveId}`,e,currentPokemon);
        }
        const chosenAction: UseMoveAction = {
            type: Actions.UseTechnique,
            playerId: this.GetPlayerFromTurn().id,
            pokemonId: this.GetPlayerFromTurn().currentPokemonId,
            pokemonName:currentPokemon.name,
            moveName:techniqueName ? techniqueName : "move not found...",
            moveId: e[0].moveId
        }
        //console.error("about to set action into the service",_.cloneDeep(chosenAction));
  
        this._service.SetPlayerAction(chosenAction);

    }

    private async SimulateManyTechs(simmedPlayer: Player, beforeField: Field, oppAction?: BattleAction) {
        const simIterations = 2;
        const activePokemon = GetActivePokemon(simmedPlayer);

        beforeField = _.cloneDeep(beforeField);

        const addPointCalcs = (a: PointCalcInfo, b: PointCalcInfo) => {
            let newPointCalcs = { ...a.pointCalcs };
            Object.values(PointCalculationTypes).forEach(pct => {
                newPointCalcs[pct] = a.pointCalcs[pct] + b.pointCalcs[pct]
            });

            return {
                moveId: a.moveId, moveName: a.moveName, points: a.points + b.points, pointCalcs: newPointCalcs
            }
        }

        const averagePointCalcs = (totals: PointCalcInfo, iterations: number) => {

            let averageCalculation: PointCalcInfo = {
                moveId: totals.moveId,
                moveName: totals.moveName,
                points: totals.points / iterations,
                pointCalcs: totals.pointCalcs

            }
            const pointCalculationTypes: Array<PointCalculationTypes> = Object.values(PointCalculationTypes);
            pointCalculationTypes.forEach(s => {
                averageCalculation.pointCalcs[s] = totals.pointCalcs[s] / simIterations;
            });
            return averageCalculation
        }


        let calculatedPoints = await Promise.all(activePokemon.techniques.map(async tech => {
            const arr = [];
            for (var i = 1; i < simIterations; i++) {
                arr.push(i);
            }

            //console.log("calculating points...",activePokemon,tech);
            let totals;
            await Promise.all(
                arr.map(
                    async () => {
                        await waitForSeconds(0.05);
                         return await this.Simulate1Tech(simmedPlayer, tech, beforeField, oppAction)
                    }
                )).then((result) => {
                    totals = result.reduce(addPointCalcs)
                })
                /*
                .catch((result) => {
                    throw new Error(`Error in calculation ${result}`);
                });*/

            if (totals === undefined) {
                throw new Error(`totals was undefined in ai!`);
            }

            return averagePointCalcs(totals, simIterations);


        }));

        calculatedPoints = calculatedPoints.sort((a, b) => b.points - a.points);

        //await waitForSeconds(0.01);
        //console.log(`calculated points for ${simmedPlayer.name} have returned!`,calculatedPoints);
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
            pokemonName:currentPokemon.name,
            pokemonId: simmedPlayer.currentPokemonId,
            moveId: techToSim.id,
            moveName:techToSim.name,
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


        function GetAmountOfFaintedPokemon(player: Player) {
            return player.pokemon.filter(poke => poke.currentStats.hp <= 0).length;
        }

        function CalculateTeamHealthPercentage(player: Player) {
            const totalHP = player.pokemon.map(poke => poke.originalStats.hp).reduce((a, b) => a + b);
            const currentHP = player.pokemon.map(poke => poke.currentStats.hp).reduce((a, b) => a + b);
            return currentHP / totalHP;
        }

        function GetStatBoostsAmount(player: Player) {
            const statBoostsAmount = player.pokemon.map(p => p.statBoosts.attack + p.statBoosts.defense + p.statBoosts["special-attack"] + p.statBoosts["special-defense"] + p.statBoosts.speed).reduce((a, b) => a + b);
            return statBoostsAmount;
        }

        const newField = testGame.GetCurrentTurn().field;
        const simmedPlayerAfter = newField.players.find(p => p.id === simmedPlayer.id)!;
        const simmedOpponentAfter = newField.players.find(p => p.id !== simmedPlayer.id)!;
        const gameState = testGame.GetCurrentTurn().currentState;

        let points = 0;

        const initializePointCalcRecord = function () {
            const keys = Object.values(PointCalculationTypes);
            const genericObject: any = {};

            keys.forEach(key => {
                genericObject[key] = 0;
            })

            return genericObject as PointCalcRecord;
        }

        const pointCalcs: PointCalcRecord = initializePointCalcRecord();

        if (gameState.winningPlayerId === simmedPlayer.id) {
            points += 99999;
            pointCalcs[PointCalculationTypes.WonGame] += 99999;
        }
        //Enemy pokemon fainting.
        if (GetAmountOfFaintedPokemon(simmedOpponentAfter) > GetAmountOfFaintedPokemon(opponentPlayer)) {
            points += 1000;
            pointCalcs[PointCalculationTypes.EnemyPokemonFainted] += 1000;
        }

        //Our own pokemon fainting
        if (GetAmountOfFaintedPokemon(simmedPlayerAfter) > GetAmountOfFaintedPokemon(simmedPlayer)) {
            points -= 1000;
            pointCalcs[PointCalculationTypes.AllyPokemonFainted] = 1000;
        }
        //Needs to be opposite.
        const opphealthDiff = CalculateTeamHealthPercentage(opponentPlayer) - CalculateTeamHealthPercentage(simmedOpponentAfter);
        points += opphealthDiff * 600;
        pointCalcs[PointCalculationTypes.EnemyTeamDeltaHealth] += opphealthDiff * 600;

        const myHealthDiff = CalculateTeamHealthPercentage(simmedPlayer) - CalculateTeamHealthPercentage(simmedPlayerAfter);
        points -= myHealthDiff * 600;
        pointCalcs[PointCalculationTypes.AllyPokemonDeltaHealth] -= myHealthDiff * 600;


        //We had a status inflicted onto us.
        if (GetActivePokemon(simmedPlayer).status === Status.None &&
            [Status.Burned, Status.ToxicPoison, Status.Resting, Status.Frozen, Status.Paralyzed, Status.Poison].includes(GetActivePokemon(simmedPlayerAfter).status)) {
            points -= 50;
            pointCalcs[PointCalculationTypes.AllyPokemonInflictedStatus] -= 50;
        }

        //Enemy had a status inflicted onto them
        if (GetActivePokemon(opponentPlayer).status === Status.None &&
            [Status.Burned, Status.ToxicPoison, Status.Resting, Status.Frozen, Status.Paralyzed, Status.Poison].includes(GetActivePokemon(simmedOpponentAfter).status)) {
            points += 50;
            pointCalcs[PointCalculationTypes.EnemyPokemonHasStatus] += 50;
        }

        //We got a stat boost while still having more than 70% health
        if ((GetActivePokemon(simmedPlayerAfter).currentStats.hp / GetActivePokemon(simmedPlayerAfter).originalStats.hp) * 100 >= 70
            && GetStatBoostsAmount(simmedPlayerAfter) > GetStatBoostsAmount(simmedPlayer)) {
            //give it 45 points stat boosts are pretty important;
            points += 45;
            pointCalcs[PointCalculationTypes.AllyStatBoost] += 45;
        }




        if (gameState.winningPlayerId === opponentPlayer.id) {
            points -= 99999;
            pointCalcs[PointCalculationTypes.LostGame] += -99999;
        }

        return {
            moveId: techToSim.id,
            moveName: techToSim.name,
            points: points,
            pointCalcs: pointCalcs,
        };
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

            //if we currently do not have an action already stored.
            
            this.ChooseActionAsync();
            //this.ChooseRandomAction();
        }
    }
    ChoosePokemonToSwitchInto() {
        //Allowing the AI player to switch his fainted pokemon to something else.


        const isAwaitingSwitchAction = this._service.GetCurrentTurn().currentState.type === 'awaiting-switch-action';
        const AIShouldSwitch = this._service.GetCurrentTurn().playersWhoNeedToSwitch.filter(p => p.id === this.GetPlayerFromTurn().id).length > 0;


  
        
        if (isAwaitingSwitchAction && AIShouldSwitch) {

            console.log("ai is choosing pokemon to switch");

            const validPokemon = this._service.GetValidPokemonToSwitchInto(this.GetPlayerFromTurn().id);
            if (validPokemon.length === 0) {
                throw new Error(`ERROR could not get valid pokemon to switch into for AI`);
            }
            const pokemonChosen = shuffle(validPokemon)[0]
            if (validPokemon.length > 0) {
                const switchPokemonAction: SwitchPokemonAction = {
                    playerId: this.GetPlayerFromTurn().id,
                    type: 'switch-pokemon-action',
                    switchPokemonId: pokemonChosen
                }
                this._service.SetSwitchFaintedPokemonAction(switchPokemonAction, false);
            }
        }
        else {

        }
    }

}

export default BasicAI