import { Player, PlayerBuilder } from "game/Player/PlayerBuilder";
import { Turn } from "game/Turn";

//A mock turn object for testing purposes.
export function CreateMockTurn(){
    const player1: Player = new PlayerBuilder(1)
    .WithPokemon("blastoise")
    .WithPokemon("venusaur")
    .Build();

    const player2: Player = new PlayerBuilder(2)
    .WithPokemon("blastoise")
    .WithPokemon("venusaur")
    .Build();

    const turn = new Turn (1,[player1,player2]);

    return turn;
}