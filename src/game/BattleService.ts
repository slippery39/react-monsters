import { Actions, BattleAction, SwitchPokemonAction, UseMoveAction } from "./BattleActions";
import _ from "lodash";

import { TypedEvent } from "./TypedEvent/TypedEvent";
import { Status } from "./HardStatus/HardStatus";
import { Player } from "./Player/PlayerBuilder";
import BattleGame, { Field, OnActionNeededArgs, OnGameOverArgs, OnNewTurnLogArgs, OnSwitchNeededArgs } from "./BattleGame";



export interface OnStateChangeArgs {
    newField: Field
}

export interface OnNewTurnArgs {

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
    OnActionNeeded = new TypedEvent<OnActionNeededArgs>();
    OnGameOver = new TypedEvent<OnGameOverArgs>();

    gameEnded: boolean = false;


    constructor(player1: Player, player2: Player, saveTurnLog: boolean) {
        this.battle = new BattleGame([player1, player2], saveTurnLog);
    }

    //For testing purposes only
    SetStatusOfPokemon(pokemonId: number, status: Status) {
        this.battle.SetStatusOfPokemon(pokemonId, status);
        this.onStateChange.emit({ newField: _.cloneDeep(this.battle.field) });
    }

    GetAllyPlayer() {
        return this.GetPlayers().filter(player => player.id === this.allyPlayerId)[0];
    }
    GetEnemyPlayer() {
        return this.GetPlayers().filter(player => player.id !== this.allyPlayerId)[0];
    }



    //eventually this will run a start event or something.
    Initialize() {
        this.battle.OnNewTurn.on((args) => {
            this.OnNewTurn.emit(args);
        });
        this.battle.OnNewLogReady.on((info) => {
            this.onNewTurnLog.emit(info);
        });
        this.battle.OnSwitchNeeded.on(args => this.OnSwitchNeeded.emit(args));
        this.battle.OnGameOver.on(args => this.OnGameOver.emit(args));
        this.battle.OnActionNeeded.on(args => {
            this.OnActionNeeded.emit(args);
        });
        this.battle.Initialize();
        //TODO - working on this.

    }

    Start() {
        this.battle.StartGame();
    }
    //Used for our AI vs AI, so we have an off switch in case of never ending games.
    EndGame() {
        this.gameEnded = true;
    }

    //Returns a boolean to dictate whether the action was successful or not, for UI purposes.
    SetInitialAction(action: BattleAction) : boolean{


        const player = this.GetPlayers().find(p=>p.id === action.playerId);
        if (player === undefined){
            throw new Error(`Could not find player to set initial action`);            
        }

        const validActions = this.GetValidActions(player.id).filter(act=>{
             if (action.type === Actions.SwitchPokemon){
                const switchPokemonAction = act as SwitchPokemonAction;
                return switchPokemonAction.playerId === act.playerId && switchPokemonAction.switchPokemonId === action.switchPokemonId;
             }
             else if (action.type === Actions.UseTechnique){
               const useTechniqueAction = act as UseMoveAction;
               return useTechniqueAction.playerId === action.playerId && useTechniqueAction.moveId === action.moveId;
             
             }
             return true;
            });

        if (validActions.length === 0){
            //console.error(`Invalid action set for player ${player.name}`,action,this.GetValidActions(player.id));
            return false;
            
        }
    

        this.battle.SetInitialPlayerAction(action);
        return true;
    }
    SetSwitchFaintedPokemonAction(action: SwitchPokemonAction, diffLog?: boolean) {
        this.battle.SetSwitchPromptAction(action);
    }
    SetPlayerAction(action: BattleAction) {
        
        if (this.gameEnded) {
            return;
        }
        if (this.battle.GetCurrentState()=== 'awaiting-initial-actions') {
            return this.SetInitialAction(action);
            
        }
        else if (this.battle.GetCurrentState()=== 'awaiting-switch-action') {
            //RIGHT HERE IS WHERE IT'S HAPPENING!, WE NEED TO VALIDATE HERE....
            if (action.type !== 'switch-pokemon-action') {
                console.error(`Somehow a wrong action type got into the awaiting-switch-action branch of SetPlayerAction...`);
                return;
            }
            let switchAction = (action as SwitchPokemonAction);
            
            if (this.GetValidPokemonToSwitchInto(action.playerId).includes(action.switchPokemonId)){
            this.SetSwitchFaintedPokemonAction(switchAction);
               return true;
            }
            else{
                return false;
            }
        }
    }

    //Gets a cloned version of the game state, nobody outside of here should be able to modify the state directly.
    GetPlayers(): Array<Player> {
        return _.cloneDeep(this.battle.GetPlayers());
    }

    GetValidPokemonToSwitchInto(playerId: number) {
        const player = this.battle.GetPlayerById(playerId);
        return player.pokemon.filter(poke => poke.id !== player.currentPokemonId && poke.currentStats.hp > 0).map(poke => poke.id)
    }

    GetField(): Field {
        return _.cloneDeep(this.battle.field);
    }

    GetValidActions(playerId: number) {
        const player = this.battle.GetPlayers().find(p => p.id === playerId);
        if (player === undefined) {
            throw new Error(`Could not find player`);
        }
        return this.battle.GetValidActions(player);
    }
}

export default BattleService;