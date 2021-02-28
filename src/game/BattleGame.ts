import _ from "lodash";
import { GetActivePokemon, GetPokemonOwner } from "./HelperFunctions";
import { Player } from "./Player/PlayerBuilder";
import { Field, OnNewTurnLogArgs, Turn } from "./Turn";
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




class BattleGame {

    //note this variable gets set at the start but doesn't get updated at the moment, once we move more of the turn stuff over into here we can deal with that.
    private gameState: Field;
    turnHistory: Array<Turn> = [];
    OnNewTurn = new TypedEvent<{}>();
    OnNewLogReady = new TypedEvent<OnNewTurnLogArgs>();

    constructor(players: Array<Player>) {
        if (players.length !== 2) {
            throw new Error(`Need exactly 2 players to properly initialize a battle`);
        }
        this.gameState = {
            players: _.cloneDeep(players),
            entryHazards: [],
            weather:undefined,
            fieldEffects:[]
        }
    }

    Initialize() {
        AutoAssignPokemonIds(this.gameState.players);
        AutoAssignCurrentPokemonIds(this.gameState.players);
        AutoAssignItemIds(this.gameState.players);
        AutoAssignTechniqueIds(this.gameState.players);

        

        const firstTurn = new Turn(1, this.gameState);
        this.turnHistory.push(firstTurn);
        firstTurn.OnTurnFinished.on(() => {
            this.NextTurn();
            this.OnNewTurn.emit({});
        })
        firstTurn.OnNewLogReady.on((args) => {
            this.OnNewLogReady.emit(args);
        });

    }

    GetCurrentTurn(): Turn {
        const index = this.turnHistory.length - 1;
        return this.turnHistory[index];
    }

    private NextTurn() {
        //This is leftover from the BattleService class, but we are going to handle the state directly in the battle class instead.
        const initialState = _.cloneDeep(this.GetCurrentTurn().field);

        const turn = new Turn(this.turnHistory.length + 1, initialState);
        this.turnHistory.push(turn);
     
        turn.OnNewLogReady.on((args) => {
            this.OnNewLogReady.emit(args);
        });
        turn.OnTurnFinished.on(() => {
            this.NextTurn();           
            this.OnNewTurn.emit({});
        });

        const pokemon1 = GetActivePokemon(initialState.players[0]);
        const pokemon2 = GetActivePokemon(initialState.players[1]);

        /*
            Forced Actions i.e. moves that must be repeated like Rollout or Outrage happen here.
            ForcedActions mean's the user won't even get to select any action for their turn.
        */
        turn.GetBehavioursForPokemon(pokemon1).forEach(b => {
            b.ForceAction(turn, GetPokemonOwner(initialState.players, pokemon1), pokemon1);
         });
         turn.GetBehavioursForPokemon(pokemon2).forEach(b => {
            b.ForceAction(turn, GetPokemonOwner(initialState.players, pokemon2), pokemon2);
         });
    }

    GetPlayers(): Array<Player> {
        return this.GetCurrentTurn().field.players;
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
        if (firstTurn.eventLogSinceLastAction.length>0){
            firstTurn.EmitNewTurnLog();
        }
        this.OnNewTurn.emit({});

    }
}

export default BattleGame;