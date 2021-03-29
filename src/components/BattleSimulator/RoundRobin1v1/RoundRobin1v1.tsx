import { Button, InputNumber } from 'antd';
import PokemonImage from 'components/PokemonImage/PokemonImage';
import BasicAI from 'game/AI/AI';
import { OnGameOverArgs } from 'game/BattleGame';
import BattleService from 'game/BattleService';
import { PlayerBuilder } from 'game/Player/PlayerBuilder';
import { GetAllPokemonInfo } from 'game/Pokemon/PremadePokemon';
import { shuffle } from 'lodash';
import React, { useCallback, useState } from 'react';
import { SimmedStats, UpdateStats, WinLoss } from '../SimulatorFunctions';
import WinLossTable from '../WinLossTable';
import * as Icons from '@ant-design/icons';


interface MatchResult {
    winningPokemon: Array<string>,
    losingPokemon: Array<string>,
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

async function RoundRobin1v1(battleEndedFunc: (data: SimmedStats, results: Array<MatchResult>) => void, battleStartedFunc: (id: string) => void, numberOfBattles: number) {
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
            battleEndedFunc(currentStats, matchResults);
        }
    }
}

//These work a little bit differently here than in the Random 6v6. Hopefully can refactor to make things more clear.
function UpdateWinStats(previousStats: SimmedStats, team: Array<string>) {

    const newStats = previousStats;

    team.forEach(poke => {
        if (newStats[poke] === undefined) {
            newStats[poke] = {
                wins: 0,
                losses: 0
            }

        }
        newStats[poke].wins += 1;
    });
    return newStats
}

function UpdateLossStats(previousStats: SimmedStats, team: Array<string>) {

    const newStats = previousStats;

    team.forEach(poke => {
        if (newStats[poke] === undefined) {
            newStats[poke] = {
                wins: 0,
                losses: 0
            }

        }
        newStats[poke].losses += 1;
    });
    return newStats
}


function GetSpecificPokemonWinRates(pokeName:string, results: Array<MatchResult>) {
    let stats: Record<string, WinLoss> = {};


    results.forEach(result => {
        if (result.winningPokemon.map(p=>p.toLowerCase()).includes(pokeName.toLowerCase())) {
            UpdateWinStats(stats, result.losingPokemon);
        }
        if (result.losingPokemon.map(p=>p.toLowerCase()).includes(pokeName.toLowerCase())) {
            UpdateLossStats(stats, result.winningPokemon);
        }
    });

    return stats;
}


interface Props {

}


const RoundRobinSim: React.FunctionComponent<Props> = () => {
    const [simStats, setSimStats] = useState<SimmedStats>({});
    const [numberOfBattles, setNumberOfBattles] = useState<number>(1); //its a string for compatibility issues.
    const [simText, setSimText] = useState<string>("")
    const [currentPokemonName, setCurrentPokemonName] = useState<string>("");
    const [matchResults, setMatchResults] = useState<Array<MatchResult>>([]);

    const battleEndedFunc = useCallback((stats: Record<string, WinLoss>, results: Array<MatchResult>) => {
        console.log(stats);
        const newStats = { ...stats };
        setSimStats(newStats);
        setMatchResults(results);
        setSimText("All battles simulated!");
    }, [setSimStats])

    const startButton = (<Button type="primary" onClick={() => {
        RoundRobin1v1(battleEndedFunc, (num) => setSimText("Simulating Battle " + num), numberOfBattles)
    }
    }> Simulate!</Button>)
    const simSettings = (<div> Number of Battles : <InputNumber min={1} value={numberOfBattles} max={10000} defaultValue={1} onChange={(e) => setNumberOfBattles(e)} />{startButton}</div>)
    const simTextDiv = (<div>{simText}</div>)

    return (<div>
        {simSettings}
        {simTextDiv}
        {currentPokemonName === "" && <WinLossTable onPokemonImageClick={(name) => setCurrentPokemonName(name)} stats={simStats} />}
        {currentPokemonName !== "" && (<div>            <div> Showing Win Loss against other pokemon for {currentPokemonName}</div>
            <span className="clickable" onClick={() => setCurrentPokemonName("")}><PokemonImage type="small" name={currentPokemonName} /><Icons.CloseCircleOutlined /></span>
            <WinLossTable onPokemonImageClick={(name) => setCurrentPokemonName(name)} stats={GetSpecificPokemonWinRates(currentPokemonName, matchResults)} /></div>)}
    </div>
    );
}

export default RoundRobinSim;