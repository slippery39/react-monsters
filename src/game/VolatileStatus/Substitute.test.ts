/*
TODO - write tests for how substitute works.

*/

import { IPokemon, PokemonBuilder } from "game/Pokemon/Pokemon";
import { Turn } from "game/Turn";
import { GetVolatileStatus, SubstituteVolatileStatus, VolatileStatusType } from "./VolatileStatus";





function CreatePokemonWithSubstitute():IPokemon{
    const pokemon = new PokemonBuilder()
        .OfSpecies("charizard")
        .Build();
   const substitute = GetVolatileStatus(VolatileStatusType.Substitute);
   //apply the substitute to the pokemon
    substitute.ApplyTo(pokemon);

    return pokemon;   
}

function GetSubstituteFromPokemon(pokemon:IPokemon){
    const substitute = pokemon.volatileStatuses.find(vStat=>vStat.type === VolatileStatusType.Substitute);
    if (substitute === undefined){
        throw new Error('Could not find substitute');
    }
    return substitute
}



describe('substitute tests',()=>{

    it('applies preoperly',()=>{

        const pokemon:IPokemon = createDummyPokemon(); 
        
        //sanity check.
        expect(pokemon.hasSubstitute).toBe(false);        
        const substitute = GetVolatileStatus(VolatileStatusType.Substitute);
        substitute.ApplyTo(pokemon);
        expect(pokemon.hasSubstitute).toBe(true);


    });

    it('applies and takes 25% of the pokemons health',()=>{
        const pokemon:IPokemon = CreatePokemonWithSubstitute();
        expect(pokemon.currentStats.health).toBe(75);
        expect(GetSubstituteFromPokemon(pokemon).health).toBe(25);
    });


    it('cannot be applied if pokemon already has substitute',()=>{
        
        const pokemon:IPokemon = CreatePokemonWithSubstitute();
                //need a dummy turn object here.
        const turn = new Turn(1,[]);
        const substitute = GetSubstituteFromPokemon(pokemon);
        //first substitute should be able to be applied to the pokemon
        expect(substitute.CanApply(turn,pokemon)).toBe(true);

        const substitute2 = GetVolatileStatus(VolatileStatusType.Substitute);
        expect(substitute2.CanApply(turn,pokemon)).toBe(false);
    });

    it('cannot have enemy status effects applied to the pokemon when under substitute',()=>{

        const pokemon:IPokemon = CreatePokemonWithSubstitute();

        //try to apply an enemy status move to the pokemon.
        //use thunder wave, it should fail

        //May need to expose the use move field..
        const turn = new Turn(1,[]);

        
        
    });


});