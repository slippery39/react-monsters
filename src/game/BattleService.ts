import { Field, OnNewTurnLogArgs, Turn } from "./Turn";
import { BattleAction, SwitchPokemonAction } from "./BattleActions";
import _ from "lodash";

import { TypedEvent } from "./TypedEvent/TypedEvent";
import { Status } from "./HardStatus/HardStatus";
import { Player } from "./Player/PlayerBuilder";
import BattleGame from "./BattleGame";



export interface OnStateChangeArgs {
    newField: Field
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

    gameEnded:boolean = false;


    constructor(player1: Player, player2: Player) {
        this.battle = new BattleGame([player1, player2],true);
    }

    GetCurrentTurn(): Turn {
        return this.battle.GetCurrentTurn();
    }

    //For testing purposes only
    SetStatusOfPokemon(pokemonId: number, status: Status) {
        this.GetCurrentTurn().SetStatusOfPokemon(pokemonId, status);
        this.onStateChange.emit({ newField: _.cloneDeep(this.GetCurrentTurn().field) });
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
            this.onNewTurnLog.emit(info);
        });
        this.battle.OnSwitchNeeded.on(args=>this.OnSwitchNeeded.emit({}));
    }

    Start(){
        this.battle.StartGame();
    }
    //Used for our AI vs AI, so we have an off switch in case of never ending games.
    EndGame(){
        this.gameEnded = true;
    }

    SetInitialAction(action: BattleAction) {
        this.GetCurrentTurn().SetInitialPlayerAction(action);
        //TODO - remove this
        /*
        if (this.GetCurrentTurn().currentState.type === 'awaiting-switch-action') {
            this.OnSwitchNeeded.emit({});
        }
        */
    }
    SetSwitchFaintedPokemonAction(action: SwitchPokemonAction, diffLog?: Boolean) {
        this.GetCurrentTurn().SetSwitchPromptAction(action);
     }
    SetPlayerAction(action: BattleAction) {
        if (this.gameEnded){
            console.log("game ended for some reason?");
            return;
        }
        if (this.GetCurrentTurn().currentState.type === 'awaiting-initial-actions') {
            console.log("setting initial action");
            this.SetInitialAction(action);
        }
        else if (this.GetCurrentTurn().currentState.type === 'awaiting-switch-action') {
            //RIGHT HERE IS WHERE IT'S HAPPENING!, WE NEED TO VALIDATE HERE....

            if (action.type!=='switch-pokemon-action'){
                console.error(`Somehow a wrong action type got into the awaiting-switch-action branch of SetPlayerAction...`);
                return;
            }
            let switchAction = (action as SwitchPokemonAction);
            this.SetSwitchFaintedPokemonAction(switchAction);

            /*
            if (this.GetCurrentTurn().currentState.type === 'awaiting-switch-action') {
                this.OnSwitchNeeded.emit({});
            }
            */
        }
    }

    //Gets a cloned version of the game state, nobody outside of here should be able to modify the state directly.
    GetPlayers(): Array<Player> {
        return _.cloneDeep(this.GetCurrentTurn().GetPlayers());
    }

    GetValidPokemonToSwitchInto(playerId:number){
        const player = this.battle.GetPlayerById(playerId);
        return player.pokemon.filter(poke=>poke.id!==player.currentPokemonId && poke.currentStats.hp>0).map(poke=>poke.id);
    }

    GetField():Field{
        return _.cloneDeep(this.GetCurrentTurn().field);
    }
}

export default BattleService;