import _ from "lodash";
import { GetActivePokemon } from "./HelperFunctions";
import { Player } from "./Player/PlayerBuilder";
import { Field, OnActionNeededArgs, OnGameOverArgs, OnNewTurnLogArgs, Turn } from "./Turn";
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


interface GameOptions {
    processEvents: boolean
}




class BattleGame {
    //note this variable gets set at the start but doesn't get updated at the moment, once we move more of the turn stuff over into here we can deal with that.
    gameState: Field;
    turnHistory: Array<Turn> = [];
    OnNewTurn = new TypedEvent<{}>();
    OnNewLogReady = new TypedEvent<OnNewTurnLogArgs>();
    OnSwitchNeeded = new TypedEvent<{}>();
    OnActionNeeded = new TypedEvent<OnActionNeededArgs>();
    OnGameOver = new TypedEvent<OnGameOverArgs>();
    shouldProcessEvents: boolean = false;

    constructor(players: Array<Player>, processEvents: boolean) {
        if (players.length !== 2) {
            throw new Error(`Need exactly 2 players to properly initialize a battle`);
        }
        this.gameState = {
            players: _.cloneDeep(players), //TODO: testing non clone deeped vs clone deeped.
            entryHazards: [],
            weather: undefined,
            fieldEffects: []
        }
        this.shouldProcessEvents = processEvents;
    }

    Initialize() {
        AutoAssignPokemonIds(this.gameState.players);
        AutoAssignCurrentPokemonIds(this.gameState.players);
        AutoAssignItemIds(this.gameState.players);
        AutoAssignTechniqueIds(this.gameState.players);
        this.NextTurn(this.gameState);
    }

    GetCurrentTurn(): Turn {
        const index = this.turnHistory.length - 1;
        return this.turnHistory[index];
    }

    private NextTurn(initialState: Field) {
         const turn = new Turn(this.turnHistory.length + 1, initialState, this.shouldProcessEvents);
        this.turnHistory.push(turn);

        turn.OnNewLogReady.on((args) => {
            this.OnNewLogReady.emit(args);
        });
        turn.OnTurnFinished.on(() => {
            this.OnNewTurn.emit({});
            this.NextTurn(_.cloneDeep(this.GetCurrentTurn().field));
        });
        turn.OnSwitchNeeded.on(args => this.OnSwitchNeeded.emit(args))
        turn.OnGameOver.on(args => this.OnGameOver.emit(args));
        turn.OnActionNeeded.on(args=>this.OnActionNeeded.emit(args));
        turn.StartTurn();
    }

    GetPlayers(): Array<Player> {
        return this.GetCurrentTurn().field.players;
    }
    GetPlayerById(id: number) {
        const player = this.GetCurrentTurn().field.players.find(p => p.id === id);
        if (player === undefined) {
            throw new Error(`Could not find player with id ${id} in GetPlayerById`);
        }
        return player;
    }

    StartGame() {
        const firstTurn = this.turnHistory[0];
        //Pokemon will enter the battle, and trigger any on entry ability effects
        const pokemon1 = GetActivePokemon(firstTurn.GetPlayers()[0]);
        const pokemon2 = GetActivePokemon(firstTurn.GetPlayers()[1]);
        firstTurn.GetBehavioursForPokemon(pokemon1).forEach(b => {
            b.OnPokemonEntry(firstTurn, pokemon1)
        });
        firstTurn.GetBehavioursForPokemon(pokemon2).forEach(b => {
            b.OnPokemonEntry(firstTurn, pokemon2);
        });

        //something like this to emit the turn logs...

        //todo, make this into a function on the turn class.
        if (firstTurn.eventLogSinceLastAction.length > 0) {
            firstTurn.EmitNewTurnLog();
        }
        this.OnNewTurn.emit({});

    }
}

export default BattleGame;