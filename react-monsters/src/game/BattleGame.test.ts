import 'core-js'
import BattleGame, { GameBuilder } from './BattleGame';
import { PlayerBuilder } from './Player/PlayerBuilder';


describe('Players are initialized in the game with proper ids',()=>{

    it ('gives the first player an id of 1',()=>{
        const player1 = new PlayerBuilder()
        .WithName("Shayne")
        .WithRandomPokemon(6)
        .Build();

        //player id should not be set yet.
        expect(player1.id).toBe(-1);
    
        const gameBuilder = new GameBuilder();
        const updatedPlayer = gameBuilder.AddPlayer(player1);
        expect(updatedPlayer.id).toBe(1);
    });

    it('gives the second player an id of 2',()=>{
        const player1 = new PlayerBuilder()
        .WithName("Bob")
        .WithRandomPokemon(6)
        .Build();

        const player2 = new PlayerBuilder()
        .WithName("John")
        .WithRandomPokemon(6)
        .Build();

        expect(player1.id).toBe(-1);
        expect(player2.id).toBe(-1);

        const gameBuilder = new GameBuilder();
        const updatedPlayer1 = gameBuilder.AddPlayer(player1);
        expect(updatedPlayer1.id).toBe(1);

        const updatedPlayer2 = gameBuilder.AddPlayer(player2);
        expect(updatedPlayer2.id).toBe(2);

    });
});



