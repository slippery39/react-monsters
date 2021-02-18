import { OnNewTurnLogArgs, Turn } from "./Turn";
import { BattleAction, SwitchPokemonAction } from "./BattleActions";
import _ from "lodash";

import { TypedEvent } from "./TypedEvent/TypedEvent";
import { Status } from "./HardStatus/HardStatus";
import { Player } from "./Player/PlayerBuilder";
import BattleGame from "./BattleGame";



export interface OnStateChangeArgs {
    newState: Array<Player>
}

export interface OnNewTurnArgs {

}
export interface OnSwitchNeededArgs {

}



class BattleService {
    //so now after every turn, we should create a new turn with copies of the players?
    allyPlayerId: number = 1;
    battle: BattleGame;
    onNewTurnLog = new TypedEvent<OnNewTurnLogArgs>();
    onStateChange = new TypedEvent<OnStateChangeArgs>();
    //the number type is temporary
    OnNewTurn = new TypedEvent<OnNewTurnArgs>();
    OnSwitchNeeded = new TypedEvent<OnSwitchNeededArgs>();



    constructor(player1: Player, player2: Player) {
        this.battle = new BattleGame([player1, player2]);
    }

    GetCurrentTurn(): Turn {
        return this.battle.GetCurrentTurn();
    }

    //For testing purposes only
    SetStatusOfPokemon(pokemonId: number, status: Status) {
        this.GetCurrentTurn().SetStatusOfPokemon(pokemonId, status);
        this.onStateChange.emit({ newState: _.cloneDeep(this.GetCurrentTurn().GetPlayers()) });
    }

    GetAllyPlayer() {
        return this.GetPlayers().filter(player => player.id === this.allyPlayerId)[0];
    }
    GetEnemyPlayer() {
        return this.GetPlayers().filter(player => player.id !== this.allyPlayerId)[0];
    }

    //eventually this will run a start event or something.
    Initialize() {
        this.battle.Initialize();
        //TODO - working on this.
        this.battle.OnNewTurn.on(() => {
            this.OnNewTurn.emit({});
        });

        this.battle.OnNewLogReady.on((info) => {
            console.log(info);
            this.onNewTurnLog.emit(info);
        });
    }

    Start(){
        this.battle.StartGame();
    }

    SetInitialAction(action: BattleAction) {
        console.warn("are we setting an initial action?")
        this.GetCurrentTurn().SetInitialPlayerAction(action);
        //TODO - remove this
        if (this.GetCurrentTurn().currentState.type === 'awaiting-switch-action') {
            this.OnSwitchNeeded.emit({});
        }

    }
    SetSwitchFaintedPokemonAction(action: SwitchPokemonAction, diffLog?: Boolean) {
        this.GetCurrentTurn().SetSwitchPromptAction(action);
     }
    SetPlayerAction(action: BattleAction) {

        if (this.GetCurrentTurn().currentState.type === 'awaiting-initial-actions') {
            this.SetInitialAction(action);
            console.log(this.GetCurrentTurn())
            console.log(action);
        }
        else if (this.GetCurrentTurn().currentState.type === 'awaiting-switch-action') {
            let switchAction = (action as SwitchPokemonAction);
            this.SetSwitchFaintedPokemonAction(switchAction);
        }
    }

    //Gets a cloned version of the game state, nobody outside of here should be able to modify the state directly.
    GetPlayers(): Array<Player> {
        return _.cloneDeep(this.GetCurrentTurn().GetPlayers());
    }
}

export default BattleService;