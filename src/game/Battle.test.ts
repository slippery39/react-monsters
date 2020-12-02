import React from 'react';
import { Turn } from './Turn';
import { Player, PlayerBuilder } from './Player/PlayerBuilder';
import 'core-js'
import { PokemonBuilder } from './Pokemon/Pokemon';
import BattleService from './Battle';
import { Status } from './HardStatus/HardStatus';
import { triggerAsyncId } from 'async_hooks';


/*


*/


function SetupBattle(): BattleService {
    const pokemon1 = new PokemonBuilder().
        OfSpecies("Charizard")
        .WithBaseStats({ health: 1, attack: 1, specialAttack: 1, defence: 1, specialDefence: 1, speed: 1 })
        .WithTechniques(["roost", "fire blast"])
        .Build();

    pokemon1.status = Status.Poison


    const pokemon2 = new PokemonBuilder()
        .OfSpecies("Charizard")
        .WithBaseStats({ health: 1, attack: 1, specialAttack: 1, defence: 1, specialDefence: 1, speed: 1 })
        .WithTechniques(["roost", "fire blast"])
        .Build();

    pokemon2.status = Status.Poison;


    const player1: Player = new PlayerBuilder(1)
        .WithCustomPokemon(pokemon1)
        .WithPokemon("blastoise")
        .WithPokemon("venusaur")
        .Build();


    const player2: Player = new PlayerBuilder(2)
        .WithCustomPokemon(pokemon2)
        .WithPokemon("blastoise")
        .WithPokemon("venusaur")
        .Build();


    const battle = new BattleService(player1, player2);

    return battle;
}


function SetupTurn(): Turn {

    const pokemon1 = new PokemonBuilder().
        OfSpecies("Charizard")
        .WithBaseStats({ health: 200, attack: 1, specialAttack: 1, defence: 1, specialDefence: 1, speed: 1 })
        .WithTechniques(["roost", "fire blast"])
        .Build();

    pokemon1.status = Status.Poison


    const pokemon2 = new PokemonBuilder()
        .OfSpecies("Charizard")
        .WithBaseStats({ health: 200, attack: 1, specialAttack: 1, defence: 1, specialDefence: 1, speed: 1 })
        .WithTechniques(["roost", "fire blast"])
        .Build();

    pokemon2.status = Status.Poison;


    const player1: Player = new PlayerBuilder(1)
        .WithCustomPokemon(pokemon1)
        .WithPokemon("blastoise")
        .WithPokemon("venusaur")
        .Build();


    const player2: Player = new PlayerBuilder(2)
        .WithCustomPokemon(pokemon2)
        .WithPokemon("blastoise")
        .WithPokemon("venusaur")
        .Build();


    const players: Array<Player> = [player1, player2];

    const turn = new Turn(1, players);

    return turn;

}


describe('Roost heals the proper pokemon', () => {

    const turn = SetupTurn();

    turn.players.forEach(player=>{
        player.pokemon.forEach(poke=>{
            poke.currentStats.health=100;
        })
    })

    const player1 = turn.players[0];
    const player2 = turn.players[1];


    turn.SetInitialPlayerAction({
        playerId: 1, //todo : get player id
        pokemonId: player1.currentPokemonId, //todo: get proper pokemon id
        moveId: player1.pokemon[0].techniques[0].id,
        type: 'use-move-action'
    });

    turn.SetInitialPlayerAction({
        playerId: 2, //todo : get player id
        pokemonId: player2.currentPokemonId, //todo: get proper pokemon id
        moveId: player2.pokemon[0].techniques[0].id,
        type: 'use-move-action'
    })

   console.log(turn.GetEventLog());

    expect(player1.pokemon[0].currentStats.health).toBeGreaterThan(100);
    expect(player2.pokemon[0].currentStats.health).toBeGreaterThan(100);
    

    


    




});

describe('ids are assined to pokemon with no overlap', () => {


    let battle = SetupBattle();

    const pokemon = battle.GetPlayers().map((player) => {
        return player.pokemon;
    }).flat().map((pokemon) => pokemon.id);

    function onlyUnique(value: any, index: any, self: string | any[]) {
        return self.indexOf(value) === index;
    }
    var uniquePokemon = pokemon.filter(onlyUnique);

    //the length should be the same if ids are unique.
    expect(uniquePokemon.length).toBe(pokemon.length);

});

describe('nothing breaks when both players have to switch at the same time', () => {

    var battle = SetupBattle();
    battle.Start();

    const player1 = battle.GetPlayers()[0];
    const player2 = battle.GetPlayers()[1];
    //They will both use the move ROOST
    battle.SetPlayerAction({
        playerId: 1, //todo : get player id
        pokemonId: player1.currentPokemonId, //todo: get proper pokemon id
        moveId: player1.pokemon[0].techniques[0].id,
        type: 'use-move-action'
    });

    //console.log(player1.pokemon.map((poke) => poke.id));
    //console.log(player2.pokemon.map((poke) => poke.id));


    battle.SetPlayerAction({
        playerId: 2, //todo : get player id
        pokemonId: player2.currentPokemonId, //todo: get proper pokemon id
        moveId: player2.pokemon[0].techniques[0].id,
        type: 'use-move-action'
    });


    //They should both die and there should be no errors at this point.

    //Both player should then choose to switch to their other pokemon.


    /*
    How do we set the actions here?
    */



});


describe('Turn Event Emitting Correctly Works', () => {
    //what do we need to test here


    function CreateTestPlayers() {
        const player1: Player = new PlayerBuilder(1)
            .WithName("Shayne")
            .WithPokemon("venusaur")
            .WithPokemon("charizard")
            .WithPokemon("blastoise")
            .WithItem("Potion", 1)
            .WithItem("Super Potion", 2)
            .WithItem("Hyper Potion", 3)
            .WithItem("Max Potion", 1)
            .Build();

        const player2: Player = new PlayerBuilder(2)
            .WithName("Bob")
            .WithPokemon("blastoise")
            .WithPokemon("venusaur")
            .WithPokemon("charizard")
            .WithItem("Potion", 1)
            .WithItem("Super Potion", 2)
            .WithItem("Hyper Potion", 3)
            .WithItem("Max Potion", 1)
            .Build();

        return [player1, player2]
    }


    /*
    -Set up a Turn
    -Add events
    */

    it('test the event emitters', () => {
        const turn = new Turn(1, CreateTestPlayers());

        let switchNeededVar = 1;
        turn.OnSwitchNeeded.on((args) => {
            switchNeededVar += 1;
        })

        let switchNeededVar2 = 2;

        turn.OnSwitchNeeded.on((args) => {
            switchNeededVar2 = 4;
        });

        turn.OnSwitchNeeded.emit({});

        expect(switchNeededVar).toBe(2);
        expect(switchNeededVar2).toBe(4)

        let turnEndVar = 1;

        turn.OnTurnEnd.on((args) => {
            turnEndVar += 2;
        })
        turn.OnTurnEnd.emit({});

        expect(turnEndVar).toBe(3);



    });





});


