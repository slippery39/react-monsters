import { Player, PlayerBuilder } from "game/Player/PlayerBuilder";
import { Field, Turn } from "game/Turn";

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

    const initialState : Field = {
        players:[player1,player2],
       }

    const turn = new Turn (1,initialState);

    return turn;
}