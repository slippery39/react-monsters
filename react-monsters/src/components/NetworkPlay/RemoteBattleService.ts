import { BattleAction, Actions, SwitchPokemonAction } from "game/BattleActions";
import { OnNewTurnLogArgs, OnSwitchNeededArgs, OnActionNeededArgs, OnGameOverArgs, Field } from "game/BattleGame";
import { BattleService, OnStateChangeArgs, OnNewTurnArgs, OnGameStartArgs } from "game/BattleService";
import { Status } from "game/HardStatus/HardStatus";
import { Player } from "game/Player/PlayerBuilder";
import { TypedEvent } from "game/TypedEvent/TypedEvent";
import { io } from "socket.io-client";
import { NetworkInfo } from "./NetworkPlayController";

export class RemoteBattleService2 implements BattleService {


    OnNewTurnLog = new TypedEvent<OnNewTurnLogArgs>();
    OnStateChange = new TypedEvent<OnStateChangeArgs>();
    //the number type is temporary
    OnNewTurn = new TypedEvent<OnNewTurnArgs>();
    OnSwitchNeeded = new TypedEvent<OnSwitchNeededArgs>();
    OnActionNeeded = new TypedEvent<OnActionNeededArgs>();
    OnGameOver = new TypedEvent<OnGameOverArgs>();
    OnGameStart = new TypedEvent<OnGameStartArgs>();


    //Temp Saved State
    private savedState: { field: Field } = {
        field: {
            players: [],
            entryHazards: [],
        },
    }

    private playerName = "";
    //Out of date info.
    private URL = "http://192.168.0.12:8000";
    private socket = io(this.URL);

    constructor(options: NetworkInfo) {
        this.URL = options.serverAddress;
        this.socket = options.socket!; //todo , fix this.
        this.playerName = options.currentPlayer;
    }

    Initialize() {

        let socket = this.socket;
        socket.emit("game-ready");
        console.log("we are being initialized");
        socket.onAny((event, ...args) => {
            if (event === "gamestart") {
                let gameStartArgs = args[0] as unknown as OnGameStartArgs;
                this.savedState.field = gameStartArgs.field;

                console.log("about to start the game",args,this);
                this.OnGameStart.emit(gameStartArgs);
            }
            if (event === "newturnlog") {
                var evtLog = args[0] as unknown as OnNewTurnLogArgs;

                this.OnNewTurnLog.emit(evtLog);
                console.log(evtLog);
                console.log("event found was the new turn log!");

                //save our field and state....                 
                this.savedState.field = evtLog.field;
            }
            if (event === "gameover") {
                this.OnGameOver.emit(args[0] as unknown as OnGameOverArgs)
                console.log("event found was game over!");
            }
            if (event === "update-state") {
                let stateChangeArgs = args[0] as unknown as OnStateChangeArgs;
                this.OnStateChange.emit(stateChangeArgs);
                this.savedState.field = stateChangeArgs.newField;
            }
        });
    }

    Start() {
        //not tested yet.
        this.socket.emit("gamestartready", []);
    }

    RegisterPlayer(player: Player) {
        throw new Error(`Register Player has not been implemented in RemoteBattleService2`);
        return player;
    }

    GetPlayers() {
        return this.savedState.field.players;
    }
    async GetValidPokemonToSwitchInto(playerId: number) {
        //TODO - the player here should be dynamic.
        //we will need to grab this from the server.

        //possible bug here with Dugtrio's Arena Trap... test this out to see if the player can still switch out properly.

        let url = new URL(this.URL);
        url.searchParams.append("username", this.playerName);
        console.log("URL WE ARE SENDNIG", url.toString());
        const validActions = await fetch(url.toString());
        const validActionsConverted = validActions.json() as unknown as BattleAction[];

        const validSwitchActions = validActionsConverted.filter(act => act.type === Actions.SwitchPokemon);

        const validSwitchIds = validSwitchActions.map(act => {
            if (act.type === Actions.SwitchPokemon) {
                return act.switchPokemonId;
            }
            else {
                throw new Error('invalid action type');
            }
        });

        return validSwitchIds;
    }
    GetField() {
        return this.savedState.field;
    }

    //this needs to change for 
    async GetValidActions(playerId: number) {

        let url = new URL(this.URL + "/getvalidactions");


        url.searchParams.append("username", this.playerName);

        console.log("URL WE ARE SENDNIG", url.toString());
        const validActions = await fetch(url.toString());
        const validActionsConverted = validActions.json() as unknown as BattleAction[];
        return validActionsConverted;
    }
    async SetInitialAction(action: BattleAction): Promise<boolean> {
        const success = await new Promise<boolean>(resolve => {
            return this.socket.emit("action", action,
                (data: { success: boolean }) => resolve(data.success))
        })


        return success;
    }
    async SetPlayerAction(action: BattleAction): Promise<boolean> {

        console.log("attempting an action");
        const success = await new Promise<boolean>(resolve => {
            return this.socket.emit("action", action,
                (data: { success: boolean }) => resolve(data.success))
        })
        console.log(success);
        return success;
    }
    async SetSwitchFaintedPokemonAction(action: SwitchPokemonAction, diffLog?: boolean): Promise<void> {
        await new Promise<boolean>(resolve => {
            return this.socket.emit("action", action,
                (data: { success: boolean }) => resolve(data.success))
        })
    }
    SetStatusOfPokemon(pokemonId: number, status: Status): void {
        throw new Error("Method not implemented.");
    }

}
