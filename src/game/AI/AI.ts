import { shuffle } from "lodash";
import { CreateSwitchAction } from "game/BattleActions";
import BattleService from "game/BattleService";
import { Player } from "game/Player/PlayerBuilder";
import MiniMax from "./MiniMax";
import { OnSwitchNeededArgs } from "game/BattleGame";




interface AI {
    ChooseAction: () => void
    ChoosePokemonToSwitchInto: (args: OnSwitchNeededArgs) => void
}

class BasicAI implements AI {

    private _playerID: number;
    private _service: BattleService;

    constructor(aiPlayer: Player, service: BattleService) {
        this._playerID = aiPlayer.id;
        this._service = service;
        this._service.OnActionNeeded.on((args) => {
            if (args.playerIDsNeeded.includes(this._playerID)) {
                this.ChooseAction();
            }
        })
        this._service.OnSwitchNeeded.on((args) => {
            this.ChoosePokemonToSwitchInto(args);

        })
    }

    private GetPlayerFromTurn(): Player {
        const player = this._service.battle.GetPlayers().find(player => player.id === this._playerID);

        if (player === undefined) {
            throw new Error(`Could not find player with id ${this._playerID} in the game state to use for AI Brain`);
        }

        return player;
    }

    async ChooseAction() { //this is run simulation
        const aiPlayer = this.GetPlayerFromTurn();
        const minMaxAlgo = new MiniMax();
        const calculatedPointsForUs = await minMaxAlgo.RunSimulation(aiPlayer, this._service.battle.field);
        const chosenAction = calculatedPointsForUs[0].action;
        this._service.SetPlayerAction(chosenAction);
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
        const switchPokemonAction = CreateSwitchAction(this.GetPlayerFromTurn(),pokemonChosen);
        this._service.SetSwitchFaintedPokemonAction(switchPokemonAction, false);
    }

    private async SwitchPokemonSmart(validPokemon: Array<number>) {
        const miniMax = new MiniMax();
        let maxPoints = -999999999;
        let bestPokemon = undefined;
        for (var key in validPokemon) {
            const pokeId = validPokemon[key];
            const clonedTurn = this._service.battle.Clone();
            const player = clonedTurn.GetPlayers().find(p => p.id === this._playerID)!;
            clonedTurn.SetSwitchPromptAction(CreateSwitchAction(player, pokeId));
            const afterSwitchField = clonedTurn.field;
            const result = await miniMax.SimulateAllActions(player, afterSwitchField, true, undefined);
            if (result[0].points > maxPoints) {
                maxPoints = result[0].points;
                bestPokemon = pokeId;
            }
        }

        if (bestPokemon === undefined) {
            throw new Error(`Could not find best pokemon to switch into... choosing at random instead`);
        }
        //we found the best pokemon lets switch into it!
        const pokemonSwitchActionSelected = CreateSwitchAction(this.GetPlayerFromTurn(), bestPokemon);
        this._service.SetSwitchFaintedPokemonAction(pokemonSwitchActionSelected, false);
    }


    async ChoosePokemonToSwitchInto(args: OnSwitchNeededArgs) {
        //Allowing the AI player to switch his fainted pokemon to something else.

        const AIShouldSwitch = args.playerIDsNeeded.includes(this._playerID);
        if (AIShouldSwitch) {

            //TODO - If both players switch, pick randomly.
            const validPokemon = this._service.GetValidPokemonToSwitchInto(this.GetPlayerFromTurn().id);
            if (validPokemon.length ===0 ){
                console.error(args,this._service,this._service.battle);
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