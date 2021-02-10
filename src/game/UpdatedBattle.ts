import _ from "lodash";
import { Player } from "./Player/PlayerBuilder";
import { GameState, Turn } from "./Turn";


/*
This file is for testing out our new updated battle class and what we want from it.
*/

function AutoAssignPokemonIds(players:Array<Player>): void {

    let nextPokemonId = 1;

    players.flat().map(player => {
        return player.pokemon
    }).flat().forEach(pokemon => {
            pokemon.id = nextPokemonId++
    });
}

function AutoAssignItemIds(players:Array<Player>): void {

    let nextItemId = 1;

    players.flat().map(player => {
        return player.items
    }).flat().forEach(item => {
        if (item.id === -1) {
            item.id = nextItemId++;
        }
    });
}

function AutoAssignCurrentPokemonIds(players:Array<Player>): void {
    if (players[0].currentPokemonId === -1) {
        players[0].currentPokemonId = players[0].pokemon[0].id;
    }
    if (players[1].currentPokemonId === -1) {
        players[1].currentPokemonId = players[1].pokemon[0].id;
    }
}

function AutoAssignTechniqueIds(players:Array<Player>): void{

    let nextTechId = 1;

    players.flat().map(player=>{
        return player.pokemon
    }).flat().map(pokemon=>{
        return pokemon.techniques
    }).flat().forEach(tech=>{
        tech.id = nextTechId++;
    });
}

/*
class UpdatedBattle{

    gameState:GameState;
    turnHistory:Array<Turn> = [];    

    constructor(players:Array<Player>){
        if (players.length!==2){
            throw new Error(`Need exactly 2 players to properly initialize a battle`);            
        }
        this.gameState = {
            players:_.cloneDeep(players),
            entryHazards:[]
        }
    }

    Initialize(){
        AutoAssignPokemonIds(this.gameState.players);
        AutoAssignCurrentPokemonIds(this.gameState.players);
        AutoAssignItemIds(this.gameState.players);
        AutoAssignTechniqueIds(this.gameState.players);
    }


    StartGame(){
        this.GetAllBattleBehaviours(player1).OnPokemonEntry(this,pokemon);
        this.GetAllBattleBehaviors(player2).OnPokemonEntry(this,pokemon);
    }
}
*/