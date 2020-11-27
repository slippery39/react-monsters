/*
TODO - write tests for how substitute works.

*/

import { InflictStatus, InflictVolatileStatus } from "game/Effects/Effects";
import { Status } from "game/HardStatus/HardStatus";
import { PlayerBuilder } from "game/Player/PlayerBuilder";
import { IPokemon, PokemonBuilder } from "game/Pokemon/Pokemon";
import { Turn } from "game/Turn";
import { GetVolatileStatus, SubstituteVolatileStatus, VolatileStatusType } from "./VolatileStatus";


function CreateMockTurn() {
    const player1 = new PlayerBuilder(1)
        .WithName("Shayne")
        .WithPokemon("charizard")
        .WithPokemon("venusaur")
        .WithPokemon("blastoise")
        .WithPokemon("raichu")
        .WithPokemon("alakazam")
        .WithItem("Full Restore", 3)
        .WithItem("Antidote", 2)
        .WithItem("Hyper Potion", 3)
        .WithItem("Max Potion", 1)
        .Build();

    const player2 = new PlayerBuilder(2)
        .WithName("Bob")
        .WithPokemon("charizard")
        .WithPokemon("venusaur")
        .WithPokemon("blastoise")
        .WithPokemon("raichu")
        .WithPokemon("alakazam")
        .WithItem("Potion", 1)
        .WithItem("Super Potion", 2)
        .WithItem("Hyper Potion", 3)
        .WithItem("Max Potion", 1)
        .Build();
    return new Turn(1, [player1, player2]);
}


function CreatePokemonWithSubstitute(): IPokemon {
    const pokemon = new PokemonBuilder()
        .OfSpecies("charizard")
        .Build();

    pokemon.currentStats.health = 100;
    pokemon.originalStats.health = 100;
    const substitute = GetVolatileStatus(VolatileStatusType.Substitute);
    pokemon.volatileStatuses.push(substitute);
    substitute.OnApply(CreateMockTurn(), pokemon);
    return pokemon;
}

function GetSubstituteFromPokemon(pokemon: IPokemon): SubstituteVolatileStatus {
    const substitute = pokemon.volatileStatuses.find(vStat => vStat.type === VolatileStatusType.Substitute);
    if (substitute === undefined) {
        throw new Error('Could not find substitute');
    }
    return substitute as SubstituteVolatileStatus;
}



describe('substitute tests', () => {

    it('applies preoperly', () => {

        const pokemon: IPokemon = new PokemonBuilder()
            .OfSpecies("charizard")
            .Build();

        //sanity check.
        expect(pokemon.hasSubstitute).toBe(false);
        const substitute = GetVolatileStatus(VolatileStatusType.Substitute);
        pokemon.volatileStatuses.push(substitute);
        substitute.OnApply(CreateMockTurn(), pokemon);
        expect(pokemon.hasSubstitute).toBe(true);

    });

    it('applies and takes 25% of the pokemons health', () => {
        const pokemon: IPokemon = CreatePokemonWithSubstitute();
        expect(pokemon.currentStats.health).toBe(75);
        expect(GetSubstituteFromPokemon(pokemon).substituteHealth).toBe(25);
    });


    it('cannot be applied if pokemon already has substitute', () => {

        const pokemon: IPokemon = new PokemonBuilder()
            .OfSpecies("charizard")
            .Build();
        //need a dummy turn object here.
        const turn = CreateMockTurn();
        const substitute = GetVolatileStatus(VolatileStatusType.Substitute);
        //first substitute should be able to be applied to the pokemon
        expect(substitute.CanApply(turn, pokemon)).toBe(true);

        InflictVolatileStatus(turn, pokemon, VolatileStatusType.Substitute);


        const substitute2 = GetVolatileStatus(VolatileStatusType.Substitute);
        expect(substitute2.CanApply(turn, pokemon)).toBe(false);
    });

    it('cannot have enemy hard status effects applied to the pokemon when under substitute', () => {
        const pokemon: IPokemon = CreatePokemonWithSubstitute();
        const enemyPokemon: IPokemon = CreatePokemonWithSubstitute();
        //try to apply a status to the pokemon from an enemy move.
        //i.e. thunder wave should fail      
        //May need to expose the use move field..

        InflictStatus(CreateMockTurn(), pokemon, Status.Paralyzed);
        expect(pokemon.status).toBe(Status.None);
        //try with a few more statuses

        //no enemy statuses should be able to be applied

        const statuses = [Status.Paralyzed, Status.Burned, Status.ToxicPoison, Status.Sleep, Status.Poison];

        statuses.forEach((status) => {
            const applyStatusResult2 = InflictStatus(CreateMockTurn(), pokemon, status);
            expect(pokemon.status).toBe(Status.None);
        });


        it('can have its self-inflicted statuses applied when under substitute', () => {

            //we need to refactor our code to allow having a "source" for each effect. if the source is the same as the target pokemon than the status effect should go through.
            expect(0).toBe(100);
        });

        it('cannot have enemy volatile statuses applied when under substitute', () => {
            expect(0).toBe(100);
        });


        it('can have self inflicted volatile statuses under substitute', () => {
            expect(0).toBe(100);
        });

    });


});