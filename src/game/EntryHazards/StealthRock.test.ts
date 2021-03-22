import 'core-js'
import { GetActivePokemon } from 'game/HelperFunctions';
import { Player, PlayerBuilder } from 'game/Player/PlayerBuilder';
import { Field, Turn } from 'game/Turn';
import { ApplyEntryHazard, EntryHazardType } from './EntryHazard';



function SwitchToOtherPokemon(turn:Turn,player:Player){
    const otherPokemon = player.pokemon.filter(poke=>poke.id!==player.currentPokemonId)[0];
    
    if (otherPokemon === undefined){
        throw new Error(`Could not find pokemon in call to switch to other pokemon`);
    }
    
    turn.SwitchPokemon(player,otherPokemon);

}

//TEMPORARY

function InitializeGameState(gameState:Field){
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

            //Auto Assign all the ids
    AutoAssignPokemonIds(gameState.players);
    AutoAssignCurrentPokemonIds(gameState.players);
    AutoAssignItemIds(gameState.players);
    AutoAssignTechniqueIds(gameState.players);  
}

describe('stealth rock tests',()=>{
    it('applies only to the enemy if it is on their side',()=>{

        //Set up a game state with 2 players, some random pokemon
        const player1 = new PlayerBuilder(1)
        .WithName("Test-1")
        .WithPokemon("Charizard")
        .WithPokemon("Blastoise")
        .Build();

        const player2 = new PlayerBuilder(2)
        .WithName("Test-2")
        .WithPokemon("Charizard")
        .WithPokemon("Blastoise")
        .Build();

        let gameState = {
            players:[player1,player2]               
        }
        InitializeGameState(gameState);

        const turn = new Turn(1,gameState,true);

        ApplyEntryHazard(turn,turn.GetPlayers()[1],EntryHazardType.StealthRock);
        SwitchToOtherPokemon(turn,turn.GetPlayers()[0]);
        //Pokemon 1 should not take damage
        const activePokemon = GetActivePokemon(turn.GetPlayers()[0]);
        expect(activePokemon.currentStats.hp).toBe(activePokemon.originalStats.hp);

        //Pokemon 2 should take damage
        SwitchToOtherPokemon(turn,turn.GetPlayers()[1]);
        expect(GetActivePokemon(turn.GetPlayers()[1]).currentStats.hp).toBeLessThan(GetActivePokemon(turn.GetPlayers()[1]).originalStats.hp)

        
    })
});