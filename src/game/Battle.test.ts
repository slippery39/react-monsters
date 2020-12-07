import { Turn } from './Turn';
import { Player, PlayerBuilder } from './Player/PlayerBuilder';
import 'core-js'
import { PokemonBuilder } from './Pokemon/Pokemon';
import BattleService from './Battle';
import { Status } from './HardStatus/HardStatus';
import { GetTech } from './Techniques/PremadeTechniques';


/*


*/


function SetupBattle(): BattleService {
    const pokemon1 = new PokemonBuilder().
        OfSpecies("Charizard")
        .WithBaseStats({ hp: 1, attack: 1, spAttack: 1, defense: 1, spDefense: 1, speed: 1 })
        .WithTechniques(["roost", "fire blast"])
        .Build();

    pokemon1.status = Status.Poison


    const pokemon2 = new PokemonBuilder()
        .OfSpecies("Charizard")
        .WithBaseStats({ hp: 1, attack: 1, spAttack: 1, defense: 1, spDefense: 1, speed: 1 })
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
        .WithBaseStats({ hp: 200, attack: 1, spAttack: 1, defense: 1, spDefense: 1, speed: 1 })
        .WithTechniques(["roost", "fire blast"])
        .Build();

    pokemon1.status = Status.Poison


    const pokemon2 = new PokemonBuilder()
        .OfSpecies("Charizard")
        .WithBaseStats({ hp: 200, attack: 1, spAttack: 1, defense: 1, spDefense: 1, speed: 1 })
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


    const player1: Player = new PlayerBuilder(1)
    .WithPokemon("blastoise")
    .WithPokemon("venusaur")
    .Build();

    const player2: Player = new PlayerBuilder(2)
    .WithPokemon("blastoise")
    .WithPokemon("venusaur")
    .Build();

    const turn = new Turn (1,[player1,player2]);

    const pokemon = new PokemonBuilder().
        OfSpecies("Charizard")
        .WithBaseStats({ hp: 200, attack: 1, spAttack: 1, defense: 1, spDefense: 1, speed: 1 })
        .WithTechniques(["roost", "fire blast"])
        .Build();
    pokemon.currentStats.hp = 100;
    const technique = GetTech("roost");

    const pokemon2 = new PokemonBuilder().
    OfSpecies("Charizard")
    .WithBaseStats({ hp: 200, attack: 1, spAttack: 1, defense: 1, spDefense: 1, speed: 1 })
    .WithTechniques(["roost", "fire blast"])
    .Build();

    turn.UseTechnique(pokemon,pokemon2,technique);
    expect(pokemon.currentStats.hp).toBeGreaterThan(100);
   
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


