import { GetActivePokemon } from "./HelperFunctions";
import { Player } from "./Player/PlayerBuilder";
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
    type: Actions.SwitchPokemon,
    switchPokemonName?:string,
    switchOutPokemonName?:string
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
    SwitchPokemon = 'switch-pokemon-action',
    UseItem = 'use-item-action',
    UseTechnique = 'use-move-action',
    ForcedTechnique = 'forced-technique-action'
}



export function CreateTechniqueAction(player:Player,technique:Technique):UseMoveAction{

    const pokemon = GetActivePokemon(player);
    const action: UseMoveAction = {
        playerId:player.id,
        moveId:technique.id,
        moveName:technique.name,
        pokemonId:pokemon.id,
        pokemonName:pokemon.name,
        type:Actions.UseTechnique
    }
    return action;
}

export function CreateSwitchAction(player:Player,pokemonId:number):SwitchPokemonAction{
    const action :SwitchPokemonAction = {
        playerId:player.id,
        switchOutPokemonName: player.pokemon.find(poke=>poke.id === player.currentPokemonId)!.name,
        switchPokemonId:pokemonId,
        switchPokemonName: player.pokemon.find(poke=>poke.id===pokemonId)!.name,
        type:Actions.SwitchPokemon
    }
    return action;
}


export type BattleAction = UseMoveAction | SwitchPokemonAction | UseItemAction | ForcedTechniqueAction