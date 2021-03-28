import { Button, InputNumber } from 'antd';
import BasicAI from 'game/AI/AI';
import { OnGameOverArgs } from 'game/BattleGame';
import BattleService from 'game/BattleService';
import { PlayerBuilder } from 'game/Player/PlayerBuilder';
import { GetAllPokemonInfo } from 'game/Pokemon/PremadePokemon';
import { shuffle } from 'lodash';
import React, { useCallback, useState } from 'react';
import { SimmedStats, UpdateStats, WinLoss } from '../SimulatorFunctions';
import WinLossTable from '../WinLossTable';


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


interface Props {

}


const RoundRobinSim: React.FunctionComponent<Props> = () => {
    const [simStats, setSimStats] = useState<SimmedStats>({});
    const [numberOfBattles, setNumberOfBattles] = useState<number>(1); //its a string for compatibility issues.
    const [simText, setSimText] = useState<string>("")

    const battleEndedFunc = useCallback((stats: Record<string, WinLoss>, results: Array<MatchResult>) => {
        console.log(stats);
        const newStats = { ...stats };
        setSimStats(newStats);
        setSimText("All battles simulated!");
    }, [setSimStats])

    const startButton = (<Button type="primary" onClick={() => {
        RoundRobin1v1(battleEndedFunc, (num) => setSimText("Simulating Battle " + num), numberOfBattles)
    }
    }> Simulate!</Button>)
    const simSettings = (<div> Number of Battles : <InputNumber min={1} value={numberOfBattles} max={10000} defaultValue={1} onChange={(e) => setNumberOfBattles(e)} />{startButton}</div>)
    const simTextDiv = (<div>{simText}</div>)

    return (
        <div>
            {simSettings}
            {simTextDiv}
            <WinLossTable stats={simStats}/>
        </div>
    );
}

export default RoundRobinSim;