/*
Battle Actions
*/
export interface UseMoveAction {
    playerId: number,
    pokemonId: number,
    moveId: number
    type: 'use-move-action'
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
export type BattleAction = UseMoveAction | SwitchPokemonAction | UseItemAction