import 'core-js'
import { Player, PlayerBuilder } from 'game/Player/PlayerBuilder';
import { Field, Turn } from 'game/Turn';
import { DoEffect, EffectSource, EffectType } from './Effects';


//TEMPORARY FUNCTION
function InitializeGameState(gameState: Field) {
    function AutoAssignPokemonIds(players: Array<Player>): void {

        let nextPokemonId = 1;

        players.flat().map(player => {
            return player.pokemon
        }).flat().forEach(pokemon => {
            pokemon.id = nextPokemonId++
        });
    }

    function AutoAssignItemIds(players: Array<Player>): void {

        let nextItemId = 1;

        players.flat().map(player => {
            return player.items
        }).flat().forEach(item => {
            if (item.id === -1) {
                item.id = nextItemId++;
            }
        });
    }

    function AutoAssignCurrentPokemonIds(players: Array<Player>): void {
        if (players[0].currentPokemonId === -1) {
            players[0].currentPokemonId = players[0].pokemon[0].id;
        }
        if (players[1].currentPokemonId === -1) {
            players[1].currentPokemonId = players[1].pokemon[0].id;
        }
    }

    function AutoAssignTechniqueIds(players: Array<Player>): void {

        let nextTechId = 1;

        players.flat().map(player => {
            return player.pokemon
        }).flat().map(pokemon => {
            return pokemon.techniques
        }).flat().forEach(tech => {
            tech.id = nextTechId++;
        });
    }

    //Auto Assign all the ids
    AutoAssignPokemonIds(gameState.players);
    AutoAssignCurrentPokemonIds(gameState.players);
    AutoAssignItemIds(gameState.players);
    AutoAssignTechniqueIds(gameState.players);
}


describe('testing haze', () => {
    it('resets stat boosts correctly', () => {

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
            players: [player1, player2]
        }

        player1.pokemon[0].statBoosts.accuracy = 6;
        player1.pokemon[0].statBoosts.attack = 6;
        player1.pokemon[0].statBoosts.defense = 6;
        player1.pokemon[0].statBoosts['special-attack'] = 6;
        player1.pokemon[0].statBoosts['special-defense'] = 6;
        player1.pokemon[0].statBoosts.speed = 6;

        player2.pokemon[0].statBoosts.accuracy = 6;
        player2.pokemon[0].statBoosts.attack = 6;
        player2.pokemon[0].statBoosts.defense = 6;
        player2.pokemon[0].statBoosts['special-attack'] = 6;
        player2.pokemon[0].statBoosts['special-defense'] = 6;
        player2.pokemon[0].statBoosts.speed = 6;

        InitializeGameState(gameState);

        const turn = new Turn(1, gameState);

      

        const eSource: EffectSource = {

        }

        expect(turn.GetPlayers()[0].pokemon[0].statBoosts.accuracy).toBe(6);
        DoEffect(turn, turn.GetPlayers()[0].pokemon[0], { type: EffectType.RemoveStatBoosts }, eSource);

        //they should all be 0 now
        expect(turn.GetPlayers()[0].pokemon[0].statBoosts.accuracy).toBe(0);
        expect(turn.GetPlayers()[0].pokemon[0].statBoosts.attack).toBe(0);
        expect(turn.GetPlayers()[0].pokemon[0].statBoosts.defense).toBe(0);
        expect(turn.GetPlayers()[0].pokemon[0].statBoosts['special-attack']).toBe(0);
        expect(turn.GetPlayers()[0].pokemon[0].statBoosts['special-defense']).toBe(0);
        expect(turn.GetPlayers()[0].pokemon[0].statBoosts.speed).toBe(0);

        //they should all be 0 now
        expect(turn.GetPlayers()[1].pokemon[0].statBoosts.accuracy).toBe(0);
        expect(turn.GetPlayers()[1].pokemon[0].statBoosts.attack).toBe(0);
        expect(turn.GetPlayers()[1].pokemon[0].statBoosts.defense).toBe(0);
        expect(turn.GetPlayers()[1].pokemon[0].statBoosts['special-attack']).toBe(0);
        expect(turn.GetPlayers()[1].pokemon[0].statBoosts['special-defense']).toBe(0);
        expect(turn.GetPlayers()[1].pokemon[0].statBoosts.speed).toBe(0);
    



})
});