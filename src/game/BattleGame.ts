import _ from "lodash";
import { BattleEvent } from "./BattleEvents";
import { Player } from "./Player/PlayerBuilder";
import { GameState, Turn, TurnState } from "./Turn";
import { TypedEvent } from "./TypedEvent/TypedEvent";


/*
This file is for testing out our new updated battle class and what we want from it.
*/

function AutoAssignPokemonIds(players: Array<Player>): void {

    let nextPokemonId = 1;

    players.flat().map(player => {
        return player.pokemon
    }).flat().forEach(pokemon => {
        pokemon.id = nextPokemonId++
    });
}

function AutoAssignItemIds(players: Array<Player>): void {

    let nextItemId = 1;

    players.flat().map(player => {
        return player.items
    }).flat().forEach(item => {
        if (item.id === -1) {
            item.id = nextItemId++;
        }
    });
}

function AutoAssignCurrentPokemonIds(players: Array<Player>): void {
    if (players[0].currentPokemonId === -1) {
        players[0].currentPokemonId = players[0].pokemon[0].id;
    }
    if (players[1].currentPokemonId === -1) {
        players[1].currentPokemonId = players[1].pokemon[0].id;
    }
}

function AutoAssignTechniqueIds(players: Array<Player>): void {

    let nextTechId = 1;

    players.flat().map(player => {
        return player.pokemon
    }).flat().map(pokemon => {
        return pokemon.techniques
    }).flat().forEach(tech => {
        tech.id = nextTechId++;
    });
}


export interface OnNewTurnLogArgs {
    currentTurnLog: Array<BattleEvent>
    newState: Array<Player>,
    currentTurnState: TurnState,
    waitingForSwitchIds: Array<number>
    winningPlayerId?: number | undefined
}

class BattleGame {

    //note this variable gets set at the start but doesn't get updated at the moment, once we move more of the turn stuff over into here we can deal with that.
    private gameState: GameState;
    turnHistory: Array<Turn> = [];
    OnNewTurn = new TypedEvent<{}>();
    OnNewLogReady = new TypedEvent<OnNewTurnLogArgs>();

    constructor(players: Array<Player>) {
        if (players.length !== 2) {
            throw new Error(`Need exactly 2 players to properly initialize a battle`);
        }
        this.gameState = {
            players: _.cloneDeep(players),
            entryHazards: []
        }
    }

    Initialize() {
        AutoAssignPokemonIds(this.gameState.players);
        AutoAssignCurrentPokemonIds(this.gameState.players);
        AutoAssignItemIds(this.gameState.players);
        AutoAssignTechniqueIds(this.gameState.players);
    }

    GetCurrentTurn(): Turn {
        const index = this.turnHistory.length - 1;
        return this.turnHistory[index];
    }

    private NextTurn() {
        //This is leftover from the BattleService class, but we are going to handle the state directly in the battle class instead.
        const initialState = {
            players: this.GetCurrentTurn().GetPlayers(),
            entryHazards: this.GetCurrentTurn().GetEntryHazards()
        }
        const turn = new Turn(this.turnHistory.length + 1, initialState);
        this.turnHistory.push(turn);
        turn.OnTurnFinished.on(() => {
            this.NextTurn();
            this.OnNewTurn.emit({});
        });
        turn.OnNewLogReady.on(() => {
            const args: OnNewTurnLogArgs = {
                currentTurnLog: _.cloneDeep(turn.GetEventLog()),
                newState: _.cloneDeep(turn.GetPlayers()),
                winningPlayerId: turn.currentState.winningPlayerId,
                currentTurnState: turn.currentState.type,
                waitingForSwitchIds: turn.switchPromptedPlayers.map(p => p.id)
            }
            this.OnNewLogReady.emit(args);
        });
    }

    GetPlayers(): Array<Player> {
        return this.GetCurrentTurn().currentGameState.players;
    }

    StartGame() {
        const firstTurn = new Turn(1, this.gameState);
        this.turnHistory.push(firstTurn);
        firstTurn.OnTurnFinished.on(() => {

            console.warn('BATTLE GAME --> finishing first turn');
            this.NextTurn();
            this.OnNewTurn.emit({});
        })
        firstTurn.OnNewLogReady.on(() => {
            const args: OnNewTurnLogArgs = {
                currentTurnLog: _.cloneDeep(firstTurn.GetEventLog()),
                newState: _.cloneDeep(firstTurn.GetPlayers()),
                winningPlayerId: firstTurn.currentState.winningPlayerId,
                currentTurnState: firstTurn.currentState.type,
                waitingForSwitchIds: firstTurn.switchPromptedPlayers.map(p => p.id)
            }
            this.OnNewLogReady.emit(args);
        });

        //Pokemon will enter the battle, and trigger any on entry ability effects
    }
}

export default BattleGame;