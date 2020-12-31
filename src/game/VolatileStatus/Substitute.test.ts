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

    const initialState = {
        players:[player1,player2]
    }
    return new Turn(1,initialState);
}


function CreatePokemonWithSubstitute(): IPokemon {
    const pokemon = 
        PokemonBuilder()
        .OfSpecies("charizard")
        .Build();

    pokemon.currentStats.hp = 100;
    pokemon.originalStats.hp = 100;
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

        const pokemon: IPokemon =
            PokemonBuilder()
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
        expect(pokemon.currentStats.hp).toBe(75);
        expect(GetSubstituteFromPokemon(pokemon).substituteHealth).toBe(25);
    });


    it('cannot be applied if pokemon already has substitute', () => {

        const pokemon: IPokemon = 
        PokemonBuilder()
            .OfSpecies("charizard")
            .Build();

        const enemyPokemon: IPokemon = CreatePokemonWithSubstitute();
        //need a dummy turn object here.
        const turn = CreateMockTurn();
        const substitute = GetVolatileStatus(VolatileStatusType.Substitute);
        //first substitute should be able to be applied to the pokemon
        expect(substitute.CanApply(turn, pokemon)).toBe(true);

        InflictVolatileStatus(turn, pokemon, VolatileStatusType.Substitute, enemyPokemon);


        const substitute2 = GetVolatileStatus(VolatileStatusType.Substitute);
        expect(substitute2.CanApply(turn, pokemon)).toBe(false);
    });

    it('cannot have enemy hard status effects applied to the pokemon when under substitute', () => {
        const pokemon: IPokemon = CreatePokemonWithSubstitute();
        const enemyPokemon: IPokemon = CreatePokemonWithSubstitute();
        //try to apply a status to the pokemon from an enemy move.
        //i.e. thunder wave should fail      
        //May need to expose the use move field..

        InflictStatus(CreateMockTurn(), pokemon, Status.Paralyzed, enemyPokemon);
        expect(pokemon.status).toBe(Status.None);
        //try with a few more statuses

        //no enemy statuses should be able to be applied

        const statuses = [Status.Paralyzed, Status.ToxicPoison, Status.Sleep, Status.Poison];

        statuses.forEach((status) => {

            InflictStatus(CreateMockTurn(), pokemon, status, enemyPokemon);
            expect(pokemon.status).toBe(Status.None);
        });
    });


    it('can have its self-inflicted statuses applied when under substitute', () => {
        const pokemon: IPokemon = CreatePokemonWithSubstitute();
        //try to apply a status to the pokemon from an enemy move.
        //i.e. thunder wave should fail      
        //May need to expose the use move field..

        InflictStatus(CreateMockTurn(), pokemon, Status.Paralyzed, pokemon);
        expect(pokemon.status).toBe(Status.Paralyzed);
        //try with a few more statuses

        //no enemy statuses should be able to be applied

        const statuses = [Status.Paralyzed, Status.ToxicPoison, Status.Sleep, Status.Poison];

        statuses.forEach((status) => {
            pokemon.status = Status.None;
            InflictStatus(CreateMockTurn(), pokemon, status, pokemon);
            expect(pokemon.status).toBe(status);
        });

    });

    it('cannot have enemy volatile statuses applied when under substitute', () => {
        const pokemon: IPokemon = CreatePokemonWithSubstitute();
        const enemyPokemon: IPokemon = CreatePokemonWithSubstitute();
        InflictVolatileStatus(CreateMockTurn(), pokemon, VolatileStatusType.Flinch, enemyPokemon);

        //should not find the volatile status here
        const hasFlinch = pokemon.volatileStatuses.find((vStat) => {
            return vStat.type === VolatileStatusType.Flinch
        }) !== undefined;

        expect(hasFlinch).toBe(false);
    });


    it('can have self inflicted volatile statuses under substitute', () => {
        const pokemon: IPokemon = CreatePokemonWithSubstitute();
        InflictVolatileStatus(CreateMockTurn(), pokemon, VolatileStatusType.Flinch, pokemon);

        //should not find the volatile status here
        const hasFlinch = pokemon.volatileStatuses.find((vStat) => {
            return vStat.type === VolatileStatusType.Flinch
        }) !== undefined;

        expect(hasFlinch).toBe(true);
    });

    it('takes technique damage instead of the pokemon', () => {
        const pokemon: IPokemon = CreatePokemonWithSubstitute();
        const enemyPokemon: IPokemon = CreatePokemonWithSubstitute();
        const turn = CreateMockTurn();
        turn.ApplyDamage(enemyPokemon, pokemon, 10, {});
        expect(pokemon.currentStats.hp).toBe(75);
        expect(GetSubstituteFromPokemon(pokemon).substituteHealth).toBe(15);
    });

    it('still takes indirect damage (poison,burn)', () => {
        const pokemon: IPokemon = CreatePokemonWithSubstitute();
        const turn = CreateMockTurn();
        turn.ApplyIndirectDamage(pokemon, 25);
        expect(pokemon.currentStats.hp).toBe(50);
        expect(GetSubstituteFromPokemon(pokemon).substituteHealth).toBe(25);
    })

    it('can break',()=>{
        const pokemon: IPokemon = CreatePokemonWithSubstitute();
        const enemyPokemon: IPokemon = CreatePokemonWithSubstitute();
        const turn = CreateMockTurn();
        turn.ApplyDamage(enemyPokemon, pokemon, 100, {});
        expect(pokemon.currentStats.hp).toBe(75);
        expect(pokemon.hasSubstitute).toBe(false);
        expect(pokemon.volatileStatuses.find(vStat=>vStat.type === VolatileStatusType.Substitute)).toBe(undefined);
    });
});
