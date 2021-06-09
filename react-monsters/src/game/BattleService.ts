import { Actions, BattleAction, SwitchPokemonAction, UseMoveAction } from "./BattleActions";
import _ from "lodash";
import { TypedEvent } from "./TypedEvent/TypedEvent";
import { Status } from "./HardStatus/HardStatus";
import { Player } from "./Player/PlayerBuilder";
import BattleGame, { Field, GameBuilder, GameEventArgs, OnActionNeededArgs, OnGameOverArgs, OnNewTurnLogArgs, OnSwitchNeededArgs } from "./BattleGame";

export interface OnStateChangeArgs extends GameEventArgs {
    newField: Field
}

export interface OnNewTurnArgs {

}


export interface GameEventHandler {
    OnNewTurnLog: TypedEvent<OnNewTurnLogArgs>
    OnStateChange: TypedEvent<OnStateChangeArgs>
    OnNewTurn: TypedEvent<OnNewTurnArgs>
    OnSwitchNeeded: TypedEvent<OnSwitchNeededArgs>
    OnActionNeeded: TypedEvent<OnActionNeededArgs>
    OnGameOver: TypedEvent<OnGameOverArgs>
    OnGameStart: TypedEvent<OnGameStartArgs>
}

export interface GameServiceGetters {
    GetPlayers(): Player[],
    GetValidPokemonToSwitchInto(playerId: number): Promise<number[]>
    GetField(): Field
    GetValidActions(playerId: number): Promise<BattleAction[]>
}

export interface GameActionSetters{
    SetInitialAction(action: BattleAction): Promise<boolean>,
    SetPlayerAction(action: BattleAction)  : Promise<boolean>,
    SetSwitchFaintedPokemonAction(action: SwitchPokemonAction, diffLog?: boolean):void,   
    SetStatusOfPokemon(pokemonId: number, status: Status):void
}

export interface ServiceInitializers{
    RegisterPlayer:(player:Player)=>Player,
    Initialize:()=>void,
    Start:()=>void
}


export type BattleService = (GameEventHandler & GameServiceGetters & GameActionSetters & ServiceInitializers)



export interface OnGameStartArgs {
    field: Field
}


//temporary class... hard coded battle service for the second player....
//just want to see if we can get the player vs player going. afterwards we will delete this and refactor our code to handle it.

//Acts as a middleman between the client and the game logic for 1 player.
class LocalBattleService implements BattleService {
    //so now after every turn, we should create a new turn with copies of the players?
    allyPlayerId: number = 1;
    private battle: BattleGame | undefined;
    OnNewTurnLog = new TypedEvent<OnNewTurnLogArgs>();
    OnStateChange = new TypedEvent<OnStateChangeArgs>();
    //the number type is temporary
    OnNewTurn = new TypedEvent<OnNewTurnArgs>();
    OnSwitchNeeded = new TypedEvent<OnSwitchNeededArgs>();
    OnActionNeeded = new TypedEvent<OnActionNeededArgs>();
    OnGameStart: TypedEvent<OnGameStartArgs> = new TypedEvent<OnGameStartArgs>();
    OnGameOver = new TypedEvent<OnGameOverArgs>();

    gameEnded: boolean = false;

    private _gameBuilder :GameBuilder = new GameBuilder();
    


    constructor(saveTurnLog: boolean) {
        //this should be moved out? doesn't make any sense to have it constructed here now...
       this._gameBuilder = new GameBuilder();
       this._gameBuilder.ProcessEvents(saveTurnLog);
    }

    GetBattle() : BattleGame{
        if (this.battle === undefined){
            throw new Error(`Battle has not yet been initialized in the Battle Service`);
        }
        return this.battle;
    }

    //For testing purposes only
    SetStatusOfPokemon(pokemonId: number, status: Status) {
        this.GetBattle().SetStatusOfPokemon(pokemonId, status);
        this.OnStateChange.emit({ newField: _.cloneDeep(this.GetBattle().field),currentTurnState:this.GetBattle().currentState,actionsNeededIds:this.GetBattle().GetPlayerIdsThatNeedActions() });
    }
    //eventually this will run a start event or something.
    Initialize() {


        this._gameBuilder.ValidateSettings();
        this.battle = this._gameBuilder.Build();

        this.GetBattle().OnNewTurn.on((args) => {
            this.OnNewTurn.emit(args);
        });
        this.GetBattle().OnNewLogReady.on((info) => {
            this.OnNewTurnLog.emit(info);
        });
        this.GetBattle().OnSwitchNeeded.on(args => this.OnSwitchNeeded.emit(args));
        this.GetBattle().OnGameOver.on(args => this.OnGameOver.emit(args));
        this.GetBattle().OnActionNeeded.on(args => {
            this.OnActionNeeded.emit(args);
        });
        this.GetBattle().Initialize();
        //TODO - working on this.

    }

    Start() {
        this.OnGameStart.emit({ field: this.GetBattle().field });
        this.GetBattle().StartGame();
    }

    RegisterPlayer(player:Player){
        const updatedPlayerInfo = this._gameBuilder.AddPlayer(player);
        console.log("register player testing, original player object vs updated player object", player === updatedPlayerInfo,player,updatedPlayerInfo);
        return updatedPlayerInfo;
    }

    async SetInitialAction(action: BattleAction): Promise<boolean> {
        const player = this.GetPlayers().find(p => p.id === action.playerId);
        if (player === undefined) {
            throw new Error(`Could not find player to set initial action`);
        }

        const actions = await this.GetValidActions(player.id);
        
        const validActions = actions.filter(act => {
            if (action.type === Actions.SwitchPokemon) {
                const switchPokemonAction = act as SwitchPokemonAction;
                return switchPokemonAction.playerId === act.playerId && switchPokemonAction.switchPokemonId === action.switchPokemonId;
            }
            else if (action.type === Actions.UseTechnique) {
                const useTechniqueAction = act as UseMoveAction;
                return useTechniqueAction.playerId === action.playerId && useTechniqueAction.moveId === action.moveId;
            }
            return true;
        });

        if (validActions.length === 0) {
            //console.error(`Invalid action set for player ${player.name}`,action,this.GetValidActions(player.id));
            return false;
        }

        this.GetBattle().SetInitialPlayerAction(action);
        return true;
    }
    SetSwitchFaintedPokemonAction(action: SwitchPokemonAction, diffLog?: boolean) {
        this.GetBattle().SetSwitchPromptAction(action);
    }
    async SetPlayerAction(action: BattleAction) {

        console.log("setting player action");

        if (this.gameEnded) {
            return false;
        }
        if (this.GetBattle().GetCurrentState() === 'awaiting-initial-actions') {
            return this.SetInitialAction(action);

        }
        else if (this.GetBattle().GetCurrentState() === 'awaiting-switch-action') {
            //RIGHT HERE IS WHERE IT'S HAPPENING!, WE NEED TO VALIDATE HERE....
            if (action.type !== 'switch-pokemon-action') {
                console.error(`Somehow a wrong action type got into the awaiting-switch-action branch of SetPlayerAction...`);
                return false;
            }
            let switchAction = (action as SwitchPokemonAction);
            const validPokemon = await this.GetValidPokemonToSwitchInto(action.playerId);

            if (validPokemon.includes(action.switchPokemonId)) {
              
                this.SetSwitchFaintedPokemonAction(switchAction);
                console.log("player switch action success!")
                return true;
            }
            else {
                console.log("player switch action failed");
                return false;
            }
        }
        return false;
    }

    //Gets a cloned version of the game state, nobody outside of here should be able to modify the state directly.
    GetPlayers(){
        return _.cloneDeep(this.GetBattle().GetPlayers());
    }

    GetValidPokemonToSwitchInto(playerId: number) {
        const player = this.GetBattle().GetPlayerById(playerId);
        return Promise.resolve(player.pokemon.filter(poke => poke.id !== player.currentPokemonId && poke.currentStats.hp > 0).map(poke => poke.id))
    }

    GetField(): Field {
        return _.cloneDeep(this.GetBattle().field);
    }

    GetValidActions(playerId: number) {
        const player = this.GetBattle().GetPlayers().find(p => p.id === playerId);
        if (player === undefined) {
            throw new Error(`Could not find player`);
        }
        return Promise.resolve(this.GetBattle().GetValidActions(player));
    }
}

export default LocalBattleService;