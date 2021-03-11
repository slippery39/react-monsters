import { GetActivePokemon } from "./HelperFunctions";
import { Player } from "./Player/PlayerBuilder";
import { Pokemon } from "./Pokemon/Pokemon";
import { Technique } from "./Techniques/Technique";

/*
Battle Actions
*/
export interface UseMoveAction {
    playerId: number,
    pokemonId: number,
    pokemonName?:string
    moveId: number,
    moveName?:string,
    type: Actions.UseTechnique
}

export interface SwitchPokemonAction {
    playerId: number
    switchPokemonId: number
    type: 'switch-pokemon-action'
}

export interface UseItemAction {
    playerId: number
    itemId: number
    type: 'use-item-action'
}

export interface ForcedTechniqueAction{
    playerId:number,
    pokemonId:number,
    technique:Technique,
    type:Actions.ForcedTechnique
}


export enum Actions {
    UseTechnique = 'use-move-action',
    ForcedTechnique = 'forced-technique-action'
}



export function CreateTechniqueAction(player:Player,technique:Technique):UseMoveAction{
    const action: UseMoveAction = {
        playerId:player.id,
        moveId:technique.id,
        pokemonId:GetActivePokemon(player).id,
        type:Actions.UseTechnique
    }
    return action;
}

export function CreateSwitchAction(player:Player,pokemonId:number):SwitchPokemonAction{
    const action :SwitchPokemonAction = {
        playerId:player.id,
        switchPokemonId:pokemonId,
        type:"switch-pokemon-action"
    }
    return action;
}


export type BattleAction = UseMoveAction | SwitchPokemonAction | UseItemAction | ForcedTechniqueAction