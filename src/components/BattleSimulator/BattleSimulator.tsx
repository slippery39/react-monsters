import PokemonImage from 'components/PokemonImage/PokemonImage';
import BasicAI from 'game/AI/AI';
import BattleService from 'game/BattleService';
import { PlayerBuilder } from 'game/Player/PlayerBuilder';
import { PokemonBuilder } from 'game/Pokemon/Pokemon';
import { OnGameOverArgs } from 'game/Turn';
import { cloneDeep } from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';

interface Props {
}


interface WinLoss {
    wins: number,
    losses: number,
}


type SimmedStats = Record<string, WinLoss>;




//Testing promise resolving here


async function RunAIvsAIBattle():Promise<OnGameOverArgs>{

    return new Promise(resolve=>{

    const ai1 = new PlayerBuilder(1)
        .WithName("AI John")
        .WithPokemon("Sharpedo")
        .WithPokemon("Sharpedo")
        .WithPokemon("Sharpedo")
        .WithPokemon("Sharpedo")
        .Build();

    const ai2 = new PlayerBuilder(2)
        .WithName("AI Bob")
        .WithPokemon("Sharpedo")
        .WithPokemon("Sharpedo")
        .WithPokemon("Sharpedo")
        .WithPokemon("Sharpedo")
        .Build();


    let battleService = new BattleService(ai1, ai2);
    new BasicAI(ai1, battleService);
    new BasicAI(ai2, battleService);

    battleService.OnGameOver.on( (args)=>{
        console.log("game is over");
        resolve(args);
    })

    battleService.Initialize();
    battleService.Start();

    }

    );
}




function UpdateStats(previousStats: SimmedStats, args: OnGameOverArgs) {
    const newStats = previousStats;
    if (args.winningPlayer !== undefined) {

        args.winningPlayer.pokemon.forEach(poke => {
            if (newStats[poke.name] === undefined) {
                newStats[poke.name] = {
                    wins: 0,
                    losses: 0
                }

            }
            newStats[poke.name].wins += 1;

        });

        if (args.losingPlayer !== undefined) {

            args.losingPlayer.pokemon.forEach(poke => {
                if (newStats[poke.name] === undefined) {
                    newStats[poke.name] = {
                        wins: 0,
                        losses: 0
                    }

                }
                newStats[poke.name].losses++;
            })
        }
    }
    return newStats
}


async function RunNBattles(numberOfBattles: number, battleEndedFunc: (data: SimmedStats) => void) {
    let stats: Record<string, WinLoss> = {};

    for (var i=0;i<numberOfBattles;i++){
        console.log("running battle" + i);
        const results = await RunAIvsAIBattle();
        UpdateStats(stats,results);
        battleEndedFunc(stats);
    }
    return stats;
}





const BattleSimulatorMenu: React.FunctionComponent<Props> = () => {

    const [simStats, setSimStats] = useState<SimmedStats>({});
 
    const battleEndedFunc = useCallback((stats: Record<string, WinLoss>) => {
        const newStats = { ...stats };
        setSimStats(newStats);
    }, [setSimStats])

    useEffect(() => {
        RunNBattles(300, battleEndedFunc);
    }, [battleEndedFunc]);


    useEffect(() => {
        //RoundRobin1v1(battleEndedFunc);
    }, []);

    const displayStats = function () {
        const recordsAsArr = [];
        for (let key in simStats) {

            const record = simStats[key]
            recordsAsArr.push(
                {
                    name: key,
                    wins: record.wins,
                    losses: record.losses,
                    percentage: Math.round(100 * (record.wins / (record.losses + record.wins)))
                });

        }
        const elements = recordsAsArr.sort((a, b) =>
            b.percentage - a.percentage || b.wins - a.wins).map(record =>
                (<tr key={record.name}><td><PokemonImage name={record.name} type="front" /></td><td>{record.name}</td><td>{record.wins}</td><td>{record.losses}</td><td>{record.percentage}</td></tr>));
        return elements;
    }



    return (
        <div className="battle-simulator-menu">
            <div> Battle Simulator!</div>
            <table><tbody><tr><td></td><td>Name</td><td>Wins</td><td>Losses</td><td>Win Percentage</td></tr>
                {displayStats()}
            </tbody>
            </table>
        </div>
    );
}

export default BattleSimulatorMenu;