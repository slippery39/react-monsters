import { shuffle } from "lodash";
import { SwitchPokemonAction, UseItemAction, UseMoveAction } from "game/BattleActions";
import BattleService from "game/Battle";
import { GetActivePokemon, GetPercentageHealth } from "game/HelperFunctions";
import { Player } from "game/Player/PlayerBuilder";


interface AI {
    ChooseAction: () => void
    ChooseFaintedPokemonSwitch: () => void
}

class BasicAI implements AI {

    private _playerID: number;
    private _service: BattleService;

    constructor(aiPlayer: Player, service: BattleService) {
        this._playerID = aiPlayer.id;
        this._service = service;

        this._service.OnNewTurn.on((arg) => {
            this.ChooseAction();
        })
        this._service.OnSwitchNeeded.on((arg) => {
            this.ChooseFaintedPokemonSwitch();
        })
    }

    private GetPlayerFromTurn(): Player{
       const player = this._service.GetCurrentTurn().GetPlayers().find(player=>player.id === this._playerID);

       if (player === undefined){
           throw new Error(`Could not find player with id ${this._playerID} in the game state to use for AI Brain`);
       }

       return player;
    }

    ChooseAction() {
        //NEW AI if current pokemon has 40% health use a potion
        const AIpokemon = GetActivePokemon(this.GetPlayerFromTurn());


        if (GetPercentageHealth(AIpokemon) <= 40 && this.GetPlayerFromTurn().items.length > 0) {
            /*
                use a potion on their pokemon instead of attacking
            */
            const itemToUse = shuffle(this.GetPlayerFromTurn().items)[0].id;

            const action: UseItemAction = {
                type: 'use-item-action',
                playerId: this.GetPlayerFromTurn().id,
                itemId: itemToUse
            }

            this._service.SetInitialAction(action);

        }
        else {


            const unfaintedPokemon = this.GetPlayerFromTurn().pokemon.filter(poke => poke.currentStats.hp !== 0 && poke.id!=this.GetPlayerFromTurn().currentPokemonId)[0];
        
            if (unfaintedPokemon !== undefined) {
                const switchPokemonAction: SwitchPokemonAction = {
                    playerId: this.GetPlayerFromTurn().id,
                    type: 'switch-pokemon-action',
                    switchPokemonId: unfaintedPokemon.id
                }
               this._service.SetInitialAction(switchPokemonAction);
            }

            return;

            const moveId2 = shuffle(this.GetPlayerFromTurn().pokemon.find(p => p.id === this.GetPlayerFromTurn().currentPokemonId)?.techniques)[0].id || -1;
            const action: UseMoveAction = {
                type: 'use-move-action',
                playerId: this.GetPlayerFromTurn().id,
                pokemonId: this.GetPlayerFromTurn().currentPokemonId,
                moveId: moveId2
            }
            this._service.SetInitialAction(action);
        }
    }
    ChooseFaintedPokemonSwitch() {
                //Allowing the AI player to switch his fainted pokemon to something else.
                if (this._service.GetCurrentTurn().currentState.type === 'awaiting-switch-action' && this._service.GetCurrentTurn().switchPromptedPlayers.filter(p => p.id === this.GetPlayerFromTurn().id).length > 0) {

                    console.log('ai brain is choosing a pokemon to switch');
                    console.log(this.GetPlayerFromTurn());
                    const unfaintedPokemon = this.GetPlayerFromTurn().pokemon.filter(poke => poke.currentStats.hp !== 0)[0];
        
                    if (unfaintedPokemon !== undefined) {
                        const switchPokemonAction: SwitchPokemonAction = {
                            playerId: this.GetPlayerFromTurn().id,
                            type: 'switch-pokemon-action',
                            switchPokemonId: unfaintedPokemon.id
                        }
                       this._service.SetSwitchFaintedPokemonAction(switchPokemonAction, false);
                    }
                }
    }

}

export default BasicAI