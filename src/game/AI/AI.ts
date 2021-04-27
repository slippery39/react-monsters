import { shuffle } from "lodash";
import { CreateSwitchAction, SwitchPokemonAction } from "game/BattleActions";
import LocalBattleService from "game/BattleService";
import { Player } from "game/Player/PlayerBuilder";
import MiniMax from "./MiniMax";
import { OnSwitchNeededArgs } from "game/BattleGame";




interface AI {
    ChooseAction: () => void
    ChoosePokemonToSwitchInto: (args: OnSwitchNeededArgs) => void
}

class BasicAI implements AI {

    private _playerID: number;
    private _service: LocalBattleService;

    constructor(aiPlayer: Player, service: LocalBattleService) {
        this._playerID = aiPlayer.id;
        this._service = service;
        this._service.OnActionNeeded.on((args: { playerIDsNeeded: number[]; }) => {
            if (args.playerIDsNeeded.includes(this._playerID)) {
                this.ChooseAction();
            }
        })
        this._service.OnSwitchNeeded.on((args: OnSwitchNeededArgs) => {
            this.ChoosePokemonToSwitchInto(args);
        })
    }

    private GetPlayerFromTurn(): Player {
        const player = this._service.GetPlayers().find(player => player.id === this._playerID);

        if (player === undefined) {
            throw new Error(`Could not find player with id ${this._playerID} in the game state to use for AI Brain`);
        }

        return player;
    }

    async ChooseAction() { //this is run simulation
        const aiPlayer = this.GetPlayerFromTurn();
        const minMaxAlgo = new MiniMax();
        const calculatedPointsForUs = await minMaxAlgo.RunSimulation(aiPlayer,await this._service.GetField());
        const chosenAction = calculatedPointsForUs[0].action;
        await this._service.SetPlayerAction(chosenAction);
    }

    GetOtherPlayer(players: Array<Player>) {
        const otherPlayer = players.find(p => p.id !== this._playerID);
        if (otherPlayer === undefined) {
            throw new Error(`Could not find other player`);
        }
        return otherPlayer;
    }

    private SwitchRandomPokemon(validPokemon: Array<number>) {
        if (validPokemon.length === 0) {
            throw new Error(`ERROR could not get valid pokemon to switch into for AI`);
        }
        const pokemonChosen = shuffle(validPokemon)[0]
        const switchPokemonAction = CreateSwitchAction(this.GetPlayerFromTurn(), pokemonChosen);
        this._service.SetSwitchFaintedPokemonAction(switchPokemonAction, false);
    }

    private async SwitchPokemonSmart(validPokemon: Array<number>) {
        const miniMax = new MiniMax();
        const switches = await miniMax.GetBestPokemonSwitch(this.GetPlayerFromTurn(), this._service.battle);

        if (switches.length === 0) {
            console.error(`error in SwitchPokemonSmart .... needed to switch but had no valid switches for our AI`, this, this._service,await  this._service.GetField());
        }
        this._service.SetSwitchFaintedPokemonAction(switches[0].action as SwitchPokemonAction, false);
    }


    async ChoosePokemonToSwitchInto(args: OnSwitchNeededArgs) {
        //Allowing the AI player to switch his fainted pokemon to something else.

        const AIShouldSwitch = args.playerIDsNeeded.includes(this._playerID);
        if (AIShouldSwitch) {

            //TODO - If both players switch, pick randomly.
            const validPokemon = await this._service.GetValidPokemonToSwitchInto(this.GetPlayerFromTurn().id);
            if (validPokemon.length === 0) {
                console.error(args, this._service, this._service.battle);
                throw new Error(`No valid pokemon for ChoosePokemonToSwitchInto`);

            }
            //in the case where both players are switching at the same time then we should just pick randomly, also no need to use smart switch if we only have 1 pokemon left.
            if (args.playerIDsNeeded.length > 1 || validPokemon.length === 1) {
                this.SwitchRandomPokemon(validPokemon);
                return;
            }
            else {
                await this.SwitchPokemonSmart(validPokemon);
            }
        }
        else {

        }
    }

}

export default BasicAI