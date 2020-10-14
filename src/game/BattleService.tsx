import { Turn,TurnState} from "./BattleController";
import {BattleAction, UseMoveAction,SwitchPokemonAction} from "./BattleActions";
import {BattleEvent} from "./BattleEffects";
import { Player } from "./interfaces";
import _ from 'lodash';
import { createCharizard, createVenusaur, createBlastoise } from "./premadePokemon";
import {createItem} from "./PremadeItems";


export interface OnNewTurnLogArgs {
    currentTurnLog: Array<BattleEvent>,
    newState: Array<Player>,
    currentTurnState: TurnState
}

class BattleService {
    //so now after every turn, we should create a new turn with copies of the players?
    allyPlayerId:number = 1;
    turns: Array<Turn> = [];
    turnIndex = 0;
    OnNewTurnLog: (args: OnNewTurnLogArgs) => void = (args) => { };

    constructor() {



        const player1: Player = {
            id: 1,
            name: 'Shayne',
            pokemon: [
                createCharizard(1),
                createVenusaur(2),
                createBlastoise(3)
            ],
            currentPokemonId: 1,
            items: [createItem("Potion",1,1),createItem("Super Potion",2,1),createItem("Hyper Potion",3,1),createItem("Max Potion",4,1)]
        }
        const player2: Player = {
            id: 2,
            name: 'Bob',
            pokemon: [
                createBlastoise(4),
                createVenusaur(5),
                createCharizard(6)
            ],
            currentPokemonId: 4,
            items: []
        }
        this.turns.push(new Turn(1, [player1, player2]))
    }
    GetCurrentTurn() {
        return this.turns[this.turnIndex];
    }
    OnActionError(callback: () => {}) {
        callback();
    }

    GetAllyPlayer(){
        return this.GetPlayers().filter(player=>player.id === this.allyPlayerId)[0];
    }
    GetEnemyPlayer(){
        return this.GetPlayers().filter(player=>player.id !== this.allyPlayerId)[0];
    }

    SetInitialAction(action: BattleAction) {
        this.GetCurrentTurn().SetInitialPlayerAction(action);

        //Quick here so we can set the AI action for player2.
        const player2 = this.GetCurrentTurn().players[1];

        const moveId2 = player2.pokemon.find(p => p.id === player2.currentPokemonId)?.techniques[0].id || -1;
        const player2Action: UseMoveAction = {
            type: 'use-move-action',
            playerId: player2.id,
            pokemonId: player2.currentPokemonId,
            moveId: moveId2
        }
        this.GetCurrentTurn().SetInitialPlayerAction(player2Action);

        //Allowing the AI player to switch his fainted pokemon to something else.
        if (this.GetCurrentTurn().currentState.type ==='awaiting-switch-action' && this.GetCurrentTurn().currentState.playerId === player2.id){
            const unfaintedPokemon = player2.pokemon.filter(poke=>poke.currentStats.health!=0)[0];
            const switchPokemonAction:SwitchPokemonAction = {
                playerId : player2.id,
                type:'switch-pokemon-action',
                switchPokemonId: unfaintedPokemon.id
            }
            this.SetSwitchFaintedPokemonAction(switchPokemonAction,false);
            //no need to return an new turn log yet, since we will still be adding to it.
            return;
        }
        if (this.OnNewTurnLog !== undefined) {
            this.OnNewTurnLog(
                {
                    currentTurnLog: this.GetCurrentTurn().GetTurnLog(),
                    newState: this.GetPlayers(),
                    currentTurnState: this.GetCurrentTurn().currentState.type //after the ui goes through the turn log, it should use this get prompt type to determine what screen we should show.
                }
            );
        }
    }
    SetSwitchFaintedPokemonAction(action: SwitchPokemonAction, diffLog?:Boolean) {
        
        //cache the turn up to this date.
        const oldTurnLog = this.GetCurrentTurn().GetTurnLog();
        const maxId = Math.max(...oldTurnLog.map(tl=>tl.id));

        this.GetCurrentTurn().SetSwitchFaintedPokemonAction(action);

        var newTurnLog = this.GetCurrentTurn().GetTurnLog();
        if (diffLog == undefined || diffLog==true ){
             newTurnLog = newTurnLog.filter(tl=>tl.id>maxId);
        }

        if (this.OnNewTurnLog !== undefined) {
            this.OnNewTurnLog(
                {
                    currentTurnLog: newTurnLog,//need to only gather new turn logs, not the whole thing. //possibly an id system?
                    newState: this.GetPlayers(),
                    currentTurnState: this.GetCurrentTurn().currentState.type //after the ui goes through the turn log, it should use this get prompt type to determine what screen we should show.
                }
            );
        }
    }
    SetPlayerAction(action: BattleAction) {

        //Quick here so we can set the AI action for player2.
        const player1 = this.GetCurrentTurn().players[0];
        const player2 = this.GetCurrentTurn().players[1];

        if (this.GetCurrentTurn().currentState.type === 'awaiting-initial-actions') {
            this.SetInitialAction(action);
            console.log(this.GetCurrentTurn().currentState);
        }
        else if (this.GetCurrentTurn().currentState.type === 'awaiting-switch-action'){
            let switchAction = (action as SwitchPokemonAction);
            this.SetSwitchFaintedPokemonAction(switchAction);
        }

        console.log('testing the state of the turn');
        console.log(this.GetCurrentTurn().currentState.type);
        if (this.GetCurrentTurn().currentState.type === 'turn-finished') {
            console.log('has the turn been finished?');
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