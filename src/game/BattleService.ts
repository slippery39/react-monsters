import { Turn, TurnState } from "./Turn";
import { BattleAction, SwitchPokemonAction } from "./BattleActions";
import { BattleEvent } from "./BattleEvents";
import _ from "lodash";

import { TypedEvent } from "./TypedEvent/TypedEvent";
import { Status } from "./HardStatus/HardStatus";
import { Player } from "./Player/PlayerBuilder";
import BattleGame from "./BattleGame";

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

export interface OnNewTurnArgs {

}
export interface OnSwitchNeededArgs{

}

class BattleService {
    //so now after every turn, we should create a new turn with copies of the players?
    allyPlayerId: number = 1;
    battle:BattleGame;
    onNewTurnLog = new TypedEvent<OnNewTurnLogArgs>();
    onStateChange = new TypedEvent<OnStateChangeArgs>();
    //the number type is temporary
    OnNewTurn = new TypedEvent<OnNewTurnArgs>();
    OnSwitchNeeded = new TypedEvent<OnSwitchNeededArgs>();



    constructor(player1: Player, player2: Player) {
        this.battle = new BattleGame([player1,player2]);
    }

    GetCurrentTurn(): Turn {
        return this.battle.GetCurrentTurn();
    }

    //For testing purposes only
    SetStatusOfPokemon(pokemonId: number, status: Status) {
        this.GetCurrentTurn().SetStatusOfPokemon(pokemonId, status);
        this.onStateChange.emit({ newState: this.GetCurrentTurn().GetPlayers() });
    }

    GetAllyPlayer() {
        return this.GetPlayers().filter(player => player.id === this.allyPlayerId)[0];
    }
    GetEnemyPlayer() {
        return this.GetPlayers().filter(player => player.id !== this.allyPlayerId)[0];
    }

    //eventually this will run a start event or something.
    Start(){
        this.battle.Initialize();
        this.battle.StartGame();
        this.OnNewTurn.emit({});
    }

    SetInitialAction(action: BattleAction) {
        this.GetCurrentTurn().SetInitialPlayerAction(action);

        //THIS WILL NOT NECESSARILY HAPPEN IMMEDIATLEY, WE NEED TO WAIT UNTIL WE RECIEVE THE GO AHEAD

        //if we are still waiting for more actions then return.
        if (this.GetCurrentTurn().currentState.type === 'awaiting-initial-actions'){
            return;
        }

        //otherwise send the turn log over
        const args = {
            currentTurnLog: this.GetCurrentTurn().GetEventLog(),
            newState: this.GetPlayers(),
            winningPlayerId: this.GetCurrentTurn().currentState.winningPlayerId,
            currentTurnState: this.GetCurrentTurn().currentState.type,
            waitingForSwitchIds: this.GetCurrentTurn().switchPromptedPlayers.map(p => p.id)
        }

        this.onNewTurnLog.emit(args);

        if (this.GetCurrentTurn().currentState.type ==='awaiting-switch-action'){
            this.OnSwitchNeeded.emit({});
        }

    }
    SetSwitchFaintedPokemonAction(action: SwitchPokemonAction, diffLog?: Boolean) {

        //cache the turn up to this date.
        const oldTurnLog = this.GetCurrentTurn().GetEventLog();
        const maxId = Math.max(...oldTurnLog.map(tl => {
            if (tl.id === undefined) { throw new Error('NO ID FOUND FOR TURN LOG') }
            return tl.id
        }));

        this.GetCurrentTurn().SetSwitchPromptAction(action);

        var newTurnLog = this.GetCurrentTurn().GetEventLog();
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
            currentTurnLog: newTurnLog,
            newState: this.GetPlayers(),
            winningPlayerId: this.GetCurrentTurn().currentState.winningPlayerId,
            currentTurnState: this.GetCurrentTurn().currentState.type,
            waitingForSwitchIds: this.GetCurrentTurn().switchPromptedPlayers.map(p => p.id)
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
        //Right here.. the BattleGame should throw an event saying the turn has finished / a new turn has started
        //This should not be calling NextTurn();

        if (this.GetCurrentTurn().currentState.type === 'turn-finished') {           
            this.battle.NextTurn();
            //emit a new turn here.
            this.OnNewTurn.emit({});
        }
    }

    //Gets a cloned version of the game state, nobody outside of here should be able to modify the state directly.
    GetPlayers(): Array<Player> {
        return _.cloneDeep(this.GetCurrentTurn().GetPlayers());
    }
}

export default BattleService;