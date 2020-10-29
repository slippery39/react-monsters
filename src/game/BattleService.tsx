import { Turn, TurnState } from "./BattleController";
import { BattleAction, SwitchPokemonAction } from "./BattleActions";
import { BattleEvent } from "./BattleEvents";
import { Player, Status } from "./interfaces";
import _ from "lodash";

import { TypedEvent } from "./TypedEvent/TypedEvent";

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

    onNewTurnLog = new TypedEvent<OnNewTurnLogArgs>();
    onStateChange = new TypedEvent<OnStateChangeArgs>();

    //the number type is temporary
    OnNewTurn = new TypedEvent<number>();
    OnSwitchNeeded = new TypedEvent<number>();


    constructor(player1: Player, player2: Player) {
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
        this.onStateChange.emit({ newState: this.GetCurrentTurn().players });
    }

    GetAllyPlayer() {
        return this.GetPlayers().filter(player => player.id === this.allyPlayerId)[0];
    }
    GetEnemyPlayer() {
        return this.GetPlayers().filter(player => player.id !== this.allyPlayerId)[0];
    }

    //eventually this will run a start event or something.
    Start(){
        console.log('battle has started!');
        this.OnNewTurn.emit(1);
    }


    SetInitialAction(action: BattleAction) {

        console.log('are we setting an action in the battle service?');
        this.GetCurrentTurn().SetInitialPlayerAction(action);

        //THIS WILL NOT NECESSARILY HAPPEN IMMEDIATLEY, WE NEED TO WAIT UNTIL WE RECIEVE THE GO AHEAD

        //if we are still waiting for more actions then return.
        if (this.GetCurrentTurn().currentState.type === 'awaiting-initial-actions'){
            return;
        }

        //otherwise send the turn log over
        const args = {
            currentTurnLog: this.GetCurrentTurn().GetTurnLog(),
            newState: this.GetPlayers(),
            winningPlayerId: this.GetCurrentTurn().currentState.winningPlayerId,
            currentTurnState: this.GetCurrentTurn().currentState.type,
            waitingForSwitchIds: this.GetCurrentTurn().faintedPokemonPlayers.map(p => p.id)
        }

        this.onNewTurnLog.emit(args);

        if (this.GetCurrentTurn().currentState.type ==='awaiting-switch-action'){
            this.OnSwitchNeeded.emit(1);
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


        //This should work for now, but we might run into issues with this later on, i.e. if there is someway a pokemon could die on switch
        //like with the move Spikes or something.
        //So eventually get rid of this and try to use some sort of an event based approach instead.

        /*like Turn.LogCalculated.On((args)=>{
            this.onNewTurnLog.emit(args);
        })
        */
        if (this.GetCurrentTurn().currentState.type === 'awaiting-switch-action'){
            return;
        }

        const args = {
            currentTurnLog: this.GetCurrentTurn().GetTurnLog(),
            newState: this.GetPlayers(),
            winningPlayerId: this.GetCurrentTurn().currentState.winningPlayerId,
            currentTurnState: this.GetCurrentTurn().currentState.type,
            waitingForSwitchIds: this.GetCurrentTurn().faintedPokemonPlayers.map(p => p.id)
        }

        this.onNewTurnLog.emit(args);

    }
    SetPlayerAction(action: BattleAction) {

        if (this.GetCurrentTurn().currentState.type === 'awaiting-initial-actions') {
            this.SetInitialAction(action);
        }
        else if (this.GetCurrentTurn().currentState.type === 'awaiting-switch-action') {
            let switchAction = (action as SwitchPokemonAction);
            this.SetSwitchFaintedPokemonAction(switchAction);
        }

        //This is awkward an unexpected to have this in the player action.

        console.log('this is not undefined though?');
        console.log(this.GetCurrentTurn());
        if (this.GetCurrentTurn().currentState.type === 'turn-finished') {           
            
            console.log('why is his undefined');
            console.log(this.GetCurrentTurn());
            const player1 = this.GetCurrentTurn().players[0];
            const player2 = this.GetCurrentTurn().players[1];
            this.turns.push(new Turn(this.turnIndex++, [player1, player2]));
            this.OnNewTurn.emit(1); //AI would respond to this event.
        }
    }

    //gets the player state for the current turn?
    GetPlayers(): Array<Player> {
        return _.cloneDeep(this.GetCurrentTurn().players);
    }

}

export default BattleService;