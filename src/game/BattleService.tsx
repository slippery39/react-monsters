import { Turn, TurnState } from "./BattleController";
import { BattleAction, UseMoveAction, SwitchPokemonAction, UseItemAction } from "./BattleActions";
import { BattleEvent } from "./BattleEvents";
import { Player, Status } from "./interfaces";
import _, { shuffle } from 'lodash';

import { GetActivePokemon, GetPercentageHealth } from "./HelperFunctions"
import { PlayerBuilder } from "./PlayerBuilder";

export interface OnNewTurnLogArgs {
    currentTurnLog: Array<BattleEvent>
    newState: Array<Player>,
    currentTurnState: TurnState,
    waitingForSwitchIds: Array<number>
    winningPlayerId?: number | undefined
}

export interface OnStateChangeArgs {
    newState: Array<Player>
}


class BattleService {
    //so now after every turn, we should create a new turn with copies of the players?
    allyPlayerId: number = 1;
    turns: Array<Turn> = [];
    turnIndex = 0;
    OnNewTurnLog: (args: OnNewTurnLogArgs) => void = (args) => { };

    //mainly for debug purposes
    OnStateChange: (args: OnStateChangeArgs) => void = (args) => { };

    constructor() {

        const player1: Player = new PlayerBuilder(1)
            .WithName("Shayne")
            .WithPokemon("venusaur")
            .WithPokemon("charizard")
            .WithItem("Potion", 1)
            .WithItem("Super Potion", 2)
            .WithItem("Hyper Potion", 3)
            .WithItem("Max Potion", 1)
            .Build();

        const player2: Player = new PlayerBuilder(2)
            .WithName("Bob")
            .WithPokemon("blastoise")
            .WithPokemon("venusaur")
            .WithPokemon("charizard")
            .WithItem("Potion", 1)
            .WithItem("Super Potion", 2)
            .WithItem("Hyper Potion", 3)
            .WithItem("Max Potion", 1)
            .Build();


        this.turns.push(new Turn(1, [player1, player2]))
    }
    GetCurrentTurn() {
        return this.turns[this.turnIndex];
    }
    OnActionError(callback: () => {}) {
        callback();
    }

    //For testing purposes only
    SetStatusOfPokemon(pokemonId: number, status: Status) {
        this.GetCurrentTurn().SetStatusOfPokemon(pokemonId, status);
        this.OnStateChange({ newState: this.GetCurrentTurn().players });
    }

    GetAllyPlayer() {
        return this.GetPlayers().filter(player => player.id === this.allyPlayerId)[0];
    }
    GetEnemyPlayer() {
        return this.GetPlayers().filter(player => player.id !== this.allyPlayerId)[0];
    }


    SetInitialAction(action: BattleAction) {

        console.log('are we setting an action in the battle service?');
        this.GetCurrentTurn().SetInitialPlayerAction(action);

        //Quick here so we can set the AI action for player2.
        const player2 = this.GetCurrentTurn().players[1];

        //NEW AI if current pokemon has 40% health use a potion
        const AIpokemon = GetActivePokemon(player2);


        if (GetPercentageHealth(AIpokemon) <= 40 && player2.items.length > 0) {
            /*
                use a potion on their pokemon instead of attacking
            */

            const itemToUse = shuffle(player2.items)[0].id;

            const action: UseItemAction = {
                type: 'use-item-action',
                playerId: player2.id,
                itemId: itemToUse
            }

            this.GetCurrentTurn().SetInitialPlayerAction(action);

        }
        else {
            //use an attack



            const moveId2 = player2.pokemon.find(p => p.id === player2.currentPokemonId)?.techniques[0].id || -1;
            const player2Action: UseMoveAction = {
                type: 'use-move-action',
                playerId: player2.id,
                pokemonId: player2.currentPokemonId,
                moveId: moveId2
            }
            this.GetCurrentTurn().SetInitialPlayerAction(player2Action);

        }

        //Allowing the AI player to switch his fainted pokemon to something else.
        if (this.GetCurrentTurn().currentState.type === 'awaiting-switch-action' && this.GetCurrentTurn().faintedPokemonPlayers.filter(p => p.id === player2.id).length > 0) {
            const unfaintedPokemon = player2.pokemon.filter(poke => poke.currentStats.health !== 0)[0];

            if (unfaintedPokemon !== undefined) {
                const switchPokemonAction: SwitchPokemonAction = {
                    playerId: player2.id,
                    type: 'switch-pokemon-action',
                    switchPokemonId: unfaintedPokemon.id
                }
                this.SetSwitchFaintedPokemonAction(switchPokemonAction, false);
            }
            //no need to return an new turn log yet, since we will still be adding to it.
            return;
        }
        if (this.OnNewTurnLog !== undefined) {
            this.OnNewTurnLog(
                {
                    currentTurnLog: this.GetCurrentTurn().GetTurnLog(),
                    newState: this.GetPlayers(),
                    winningPlayerId: this.GetCurrentTurn().currentState.winningPlayerId,
                    currentTurnState: this.GetCurrentTurn().currentState.type,
                    waitingForSwitchIds: this.GetCurrentTurn().faintedPokemonPlayers.map(p => p.id)
                }
            );
        }
    }
    SetSwitchFaintedPokemonAction(action: SwitchPokemonAction, diffLog?: Boolean) {

        //cache the turn up to this date.
        const oldTurnLog = this.GetCurrentTurn().GetTurnLog();
        const maxId = Math.max(...oldTurnLog.map(tl => {
            if (tl.id === undefined) { throw new Error('NO ID FOUND FOR TURN LOG') }
            return tl.id
        }));

        this.GetCurrentTurn().SetSwitchFaintedPokemonAction(action);

        var newTurnLog = this.GetCurrentTurn().GetTurnLog();
        if (diffLog === undefined || diffLog === true) {
            newTurnLog = newTurnLog.filter(tl => {
                if (tl.id === undefined) { throw new Error('NO ID FOUND FOR TURN LOG') }
                return tl.id > maxId;
            });
        }

        if (this.OnNewTurnLog !== undefined) {
            this.OnNewTurnLog(
                {
                    currentTurnLog: newTurnLog,
                    newState: this.GetPlayers(),
                    currentTurnState: this.GetCurrentTurn().currentState.type,
                    winningPlayerId: this.GetCurrentTurn().currentState.winningPlayerId,
                    waitingForSwitchIds: this.GetCurrentTurn().faintedPokemonPlayers.map(p => p.id) //after the ui goes through the turn log, it should use this get prompt type to determine what screen we should show.
                }
            );
        }
    }
    SetPlayerAction(action: BattleAction) {

        //Quick here so we can set the AI action for player2.
        const player1 = this.GetCurrentTurn().players[0];
        const player2 = this.GetCurrentTurn().players[1];

        console.log(this.GetCurrentTurn().currentState.type);

        if (this.GetCurrentTurn().currentState.type === 'awaiting-initial-actions') {
            this.SetInitialAction(action);
            console.log(this.GetCurrentTurn().currentState);
        }
        else if (this.GetCurrentTurn().currentState.type === 'awaiting-switch-action') {
            let switchAction = (action as SwitchPokemonAction);
            this.SetSwitchFaintedPokemonAction(switchAction);
        }
        if (this.GetCurrentTurn().currentState.type === 'turn-finished') {
            this.turnIndex++;
            this.turns.push(new Turn(this.turnIndex + 1, [player1, player2]));
        }
    }

    //gets the player state for the current turn?
    GetPlayers(): Array<Player> {
        return _.cloneDeep(this.GetCurrentTurn().players);
    }

}

export default BattleService;