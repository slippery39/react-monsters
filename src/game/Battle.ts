import { GameState, Turn, TurnState } from "./Turn";
import { BattleAction, SwitchPokemonAction } from "./BattleActions";
import { BattleEvent } from "./BattleEvents";
import _ from "lodash";

import { TypedEvent } from "./TypedEvent/TypedEvent";
import { Status } from "./HardStatus/HardStatus";
import { Player } from "./Player/PlayerBuilder";

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
        this.Initialize([player1,player2])          
    }

    Initialize(players:Array<Player>){
         
        //this would go into the new battle class
          //Auto Assign all the ids
          this.AutoAssignPokemonIds(players);
          this.AutoAssignCurrentPokemonIds(players);
          this.AutoAssignItemIds(players);
          this.AutoAssignTechniqueIds(players);

          const initialState : GameState = {
            players:players,
            entryHazards:[]
        }

        const turn = new Turn(1,initialState);
        this.turns.push(turn)   
    }

    GetCurrentTurn() {
        return this.turns[this.turnIndex];
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
        this.OnNewTurn.emit(1);
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
            this.OnSwitchNeeded.emit(1);
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

        if (this.GetCurrentTurn().currentState.type === 'turn-finished') {           
            const player1 = this.GetCurrentTurn().GetPlayers()[0];
            const player2 = this.GetCurrentTurn().GetPlayers()[1];

            const initialState = {
                players:[player1,player2],
                entryHazards:this.GetCurrentTurn().GetEntryHazards()
            }

            const turn = new Turn(this.turnIndex++,initialState);
            this.turns.push(turn);
            this.OnNewTurn.emit(1); //AI would respond to this event.
        }
    }

    //gets the player state for the current turn?
    GetPlayers(): Array<Player> {
        return _.cloneDeep(this.GetCurrentTurn().GetPlayers());
    }

    
    private AutoAssignPokemonIds(players:Array<Player>): void {

        let nextPokemonId = 1;

        players.flat().map(player => {
            return player.pokemon
        }).flat().forEach(pokemon => {
                pokemon.id = nextPokemonId++
        });
    }

    private AutoAssignItemIds(players:Array<Player>): void {

        let nextItemId = 1;

        players.flat().map(player => {
            return player.items
        }).flat().forEach(item => {
            if (item.id === -1) {
                item.id = nextItemId++;
            }
        });
    }

    private AutoAssignCurrentPokemonIds(players:Array<Player>): void {
        if (players[0].currentPokemonId === -1) {
            players[0].currentPokemonId = players[0].pokemon[0].id;
        }
        if (players[1].currentPokemonId === -1) {
            players[1].currentPokemonId = players[1].pokemon[0].id;
        }
    }

    private AutoAssignTechniqueIds(players:Array<Player>): void{

        let nextTechId = 1;

        players.flat().map(player=>{
            return player.pokemon
        }).flat().map(pokemon=>{
            return pokemon.techniques
        }).flat().forEach(tech=>{
            tech.id = nextTechId++;
        });
    }

}

export default BattleService;