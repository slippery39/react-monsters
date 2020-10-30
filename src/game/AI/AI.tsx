import { shuffle } from "lodash";
import { servicesVersion } from "typescript";
import { SwitchPokemonAction, UseItemAction, UseMoveAction } from "../BattleActions";
import BattleService from "../Battle";
import { GetActivePokemon, GetPercentageHealth } from "../HelperFunctions";
import { Player } from "../interfaces";

interface AI {
    ChooseAction: () => void
    ChooseFaintedPokemonSwitch: () => void
}

class BasicAI implements AI {

    private _player: Player;
    private _service: BattleService;

    constructor(aiPlayer: Player, service: BattleService) {
        this._player = aiPlayer;
        this._service = service;

        this._service.OnNewTurn.on((arg) => {
            this.ChooseAction();
        })
        this._service.OnSwitchNeeded.on((arg) => {
            this.ChooseFaintedPokemonSwitch();
        })
    }
    ChooseAction() {
        //NEW AI if current pokemon has 40% health use a potion
        const AIpokemon = GetActivePokemon(this._player);


        if (GetPercentageHealth(AIpokemon) <= 40 && this._player.items.length > 0) {
            /*
                use a potion on their pokemon instead of attacking
            */
            const itemToUse = shuffle(this._player.items)[0].id;

            const action: UseItemAction = {
                type: 'use-item-action',
                playerId: this._player.id,
                itemId: itemToUse
            }

            this._service.SetInitialAction(action);

        }
        else {

            const moveId2 = this._player.pokemon.find(p => p.id === this._player.currentPokemonId)?.techniques[0].id || -1;
            const action: UseMoveAction = {
                type: 'use-move-action',
                playerId: this._player.id,
                pokemonId: this._player.currentPokemonId,
                moveId: moveId2
            }
            console.log('ai brain has chosen an action');
            this._service.SetInitialAction(action);

        }
    }
    ChooseFaintedPokemonSwitch() {
                //Allowing the AI player to switch his fainted pokemon to something else.
                if (this._service.GetCurrentTurn().currentState.type === 'awaiting-switch-action' && this._service.GetCurrentTurn().faintedPokemonPlayers.filter(p => p.id === this._player.id).length > 0) {

                    console.log('ai brain is choosing a pokemon to switch');
                    const unfaintedPokemon = this._player.pokemon.filter(poke => poke.currentStats.health !== 0)[0];
        
                    if (unfaintedPokemon !== undefined) {
                        const switchPokemonAction: SwitchPokemonAction = {
                            playerId: this._player.id,
                            type: 'switch-pokemon-action',
                            switchPokemonId: unfaintedPokemon.id
                        }
                       this._service.SetSwitchFaintedPokemonAction(switchPokemonAction, false);
                    }
                }
    }

}

export default BasicAI