import React from 'react';
import { Player } from './interfaces';
import { Turn } from './Turn';
import { PlayerBuilder } from './PlayerBuilder';
import 'core-js'


/*


*/
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

            return [player1,player2]
    }


    /*
    -Set up a Turn
    -Add events
    */

    it('test the event emitters', () => {
        const turn = new Turn(1,CreateTestPlayers());

        let switchNeededVar = 1;
        turn.OnSwitchNeeded.on((args)=>{
            switchNeededVar+=1;
        })

        let switchNeededVar2 = 2;

        turn.OnSwitchNeeded.on((args)=>{
            switchNeededVar2 = 4;
        });

        turn.OnSwitchNeeded.emit({});

        expect(switchNeededVar).toBe(2);
        expect(switchNeededVar2).toBe(4)

        let turnEndVar = 1;

        turn.OnTurnEnd.on((args)=>{
            turnEndVar+=2;
        })
        turn.OnTurnEnd.emit({});

        expect(turnEndVar).toBe(3);

       

    });

    



});


