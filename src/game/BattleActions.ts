import { Technique } from "./Techniques/Technique";

/*
Battle Actions
*/
export interface UseMoveAction {
    playerId: number,
    pokemonId: number,
    moveId: number
    type: Actions.UseMove
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
    UseMove = 'use-move-action',
    ForcedTechnique = 'forced-technique-action'
}

export type BattleAction = UseMoveAction | SwitchPokemonAction | UseItemAction | ForcedTechniqueAction