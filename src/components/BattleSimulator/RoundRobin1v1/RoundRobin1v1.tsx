import PokemonImage from 'components/PokemonImage/PokemonImage';
import BasicAI from 'game/AI/AI';
import { OnGameOverArgs } from 'game/BattleGame';
import BattleService from 'game/BattleService';
import { PlayerBuilder } from 'game/Player/PlayerBuilder';
import { GetAllPokemonInfo } from 'game/Pokemon/PremadePokemon';
import { shuffle } from 'lodash';
import React, { useCallback, useState } from 'react';
import { SimmedStats, WinLoss } from '../BattleSimulator';


interface MatchResult {
    winningPokemon: Array<string>,
    losingPokemon: Array<string>,
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


//Testing promise resolving here
async function RunRoundRobinBattle1v1(pokemon1: string, pokemon2: string): Promise<OnGameOverArgs> {

    return new Promise(resolve => {
        const ai1 = new PlayerBuilder(1)
            .WithName("AI Joe")
            .WithPokemon(pokemon1)
            .Build();

        const ai2 = new PlayerBuilder(2)
            .WithName("AI Shayne")
            .WithPokemon(pokemon2)
            .Build();


        let battleService = new BattleService(ai1, ai2, false);
        new BasicAI(ai1, battleService);
        new BasicAI(ai2, battleService);


        battleService.OnGameOver.on((args) => {
            resolve(args);
        })

        battleService.Initialize();
        battleService.Start();
    });
}

async function RoundRobin1v1(battleEndedFunc: (data: SimmedStats,results:Array<MatchResult>) => void, battleStartedFunc: (id: string) => void, numberOfBattles: number) {
    const pokemonList = GetAllPokemonInfo().map(poke => poke.species);
    //generate an array of round robin info
    /*var allMatchups = pokemonList.flatMap(
        (v, i) => pokemonList.slice(i+1).map( w => v + ' ' + w )
    );*/

    let currentStats: SimmedStats = {};
    let matchResults: Array<MatchResult> = [];

    for (var i = 0; i < numberOfBattles; i++) {

        var allMatchups = pokemonList.flatMap(
            (v, i) => pokemonList.slice(i + 1).map(w => { return { pokemon1: v, pokemon2: w } })
        );

        allMatchups = shuffle(allMatchups);        

        for (let i in allMatchups) {
            battleStartedFunc(i);
            const matchup = allMatchups[i];
            console.log("simming matchup", matchup);
            const result = await RunRoundRobinBattle1v1(matchup.pokemon1, matchup.pokemon2);
            matchResults.push({
                winningPokemon: result.winningPlayer!.pokemon.map(poke => poke.name),
                losingPokemon: result.losingPlayer!.pokemon.map(poke => poke.name)
            });    
            UpdateStats(currentStats, result);
            battleEndedFunc(currentStats,matchResults);
        }
    }
}


interface Props {

}

enum MenuState{
    ShowWinLoss = "ShowWinLoss",
    ShowResults = "ShowResults"
}

const RoundRobinSim: React.FunctionComponent<Props> = () => {

    const [menuState,setMenuState] = useState<MenuState>(MenuState.ShowWinLoss);
    const [simStats, setSimStats] = useState<SimmedStats>({});
    const [numberOfBattles, setNumberOfBattles] = useState<string>("1"); //its a string for compatibility issues.
    const [simText, setSimText] = useState<string>("")
    const [results,setMatchResults] = useState<Array<MatchResult>>([]);

    const battleEndedFunc = useCallback((stats: Record<string, WinLoss>,results:Array<MatchResult>) => {
        console.log(stats);
        const newStats = { ...stats };
        setSimStats(newStats);
        setMatchResults([...results]);
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

    const displayResults = function(){
        const rows = results.map( (result,index)=>{
            const winningPokemon = result.winningPokemon.map(p=>(<PokemonImage type="small" name={p}/>))
            const losingPokemon = result.losingPokemon.map(p=><PokemonImage type="small" name={p}/>)
            return (<tr key={index}><td>{winningPokemon}</td><td>{losingPokemon}</td></tr>)
        });

        return (
            <table className='match-results-table'>
                <tbody>
                    <th>Winning Pokemon</th><th>Losing Pokemon</th>
                </tbody>
                {rows}
            </table>
        )
    }



    const simSettings = (<div> Number of battles per matchup : <input type="text" pattern="[0-9]" onChange={(e) => setNumberOfBattles(e.target.value)} value={numberOfBattles} /></div>)
    const startButton = (<button onClick={() => { RoundRobin1v1(battleEndedFunc, (num) => setSimText("Simulating Battle " + num),parseFloat(numberOfBattles)) }} type="button" value="Run!">Simulate Battles!</button>)
    const simTextDiv = (<div>{simText}</div>)

    return (
        <div>
            {simSettings}
            {startButton}
            {simTextDiv}
            <div onClick={()=>setMenuState(MenuState.ShowWinLoss)}>Win Loss Table</div><div onClick={()=>setMenuState(MenuState.ShowResults)}>Match Results</div>
            {menuState === MenuState.ShowWinLoss &&(<table><tbody><tr><td></td><td>Name</td><td>Wins</td><td>Losses</td><td>Win Percentage</td></tr>
                {displayStats()}
            </tbody>
            </table>)}
            {menuState === MenuState.ShowResults && displayResults()}
        </div>
    );
}

export default RoundRobinSim;