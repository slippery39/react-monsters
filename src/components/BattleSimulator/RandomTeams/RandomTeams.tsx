import PokemonImage from 'components/PokemonImage/PokemonImage';
import BasicAI from 'game/AI/AI';
import BattleService from 'game/BattleService';
import { PlayerBuilder } from 'game/Player/PlayerBuilder';
import { OnGameOverArgs } from 'game/Turn';
import React, { useCallback, useEffect, useState } from 'react';
import{ SimmedStats, WinLoss } from '../BattleSimulator';



async function RunAIvsAIBattle():Promise<OnGameOverArgs>{

    return new Promise(resolve=>{
/*
    const ai1 = new PlayerBuilder(1)
        .WithName("AI John")
        .WithPokemon("Arcanine")
        .WithPokemon("Arcanine")
        .WithPokemon("Arcanine")
        .WithPokemon("Arcanine")
        .Build();

    const ai2 = new PlayerBuilder(2)
        .WithName("AI Bob")
        .WithPokemon("Milotic")
        .WithPokemon("Milotic")
        .WithPokemon("Milotic")
        .WithPokemon("Milotic")
        .Build();
  */  
        



       const ai1 = new PlayerBuilder(1)
       .WithName("AI John")
       .WithRandomPokemon(6)
       .Build();

   const ai2 = new PlayerBuilder(2)
       .WithName("AI Bob")
       .WithRandomPokemon(6)
       .Build();

       
       
       


    let battleService = new BattleService(ai1, ai2,false);
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


async function RunNBattles(numberOfBattles: number, battleEndedFunc: (data: SimmedStats) => void,battleStartedFunc:(id:number)=>void) {
    let stats: Record<string, WinLoss> = {};
    for (var i=0;i<numberOfBattles;i++){
        battleStartedFunc((i+1));
        const results = await RunAIvsAIBattle();
        UpdateStats(stats,results);
        battleEndedFunc(stats);
    }
    return stats;
}


interface Props{

}


const RandomTeamsSimMenu: React.FunctionComponent<Props> = () => {

    const [simStats, setSimStats] = useState<SimmedStats>({});
    const [numberOfBattles,setNumberOfBattles] = useState<string>("50"); //its a string for compatibility issues.
    const [simText,setSimText] = useState<string>("")
 
    const battleEndedFunc = useCallback((stats: Record<string, WinLoss>) => {
        console.log(stats);
        const newStats = { ...stats };
          setSimStats(newStats);
          setSimText("All battles simulated!");
    }, [setSimStats])


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


    const simSettings = (<div> Number of Battles : <input type="text" pattern="[0-9]" onChange={(e)=>setNumberOfBattles(e.target.value)} value={numberOfBattles}/></div>)
    const startButton = (<button onClick={()=>{RunNBattles(parseFloat(numberOfBattles),battleEndedFunc,(num)=>setSimText("Simulating Battle " + num))}} type="button" value="Run!">Simulate Battles!</button>)
    const simTextDiv = (<div>{simText}</div>)




    return (
        <div>
            {simSettings}
            {startButton}
            {simTextDiv}
            <table><tbody><tr><td></td><td>Name</td><td>Wins</td><td>Losses</td><td>Win Percentage</td></tr>
                {displayStats()}
            </tbody>
            </table>
        </div>
    );
}

export default RandomTeamsSimMenu;