import { Button, InputNumber} from 'antd';
import BasicAI from 'game/AI/AI';
import waitForSeconds from 'game/AI/CoroutineTest';
import { OnGameOverArgs } from 'game/BattleGame';
import BattleService from 'game/BattleService';
import { PlayerBuilder } from 'game/Player/PlayerBuilder';
import React, { useCallback, useState } from 'react';
import { SimmedStats, UpdateStats, WinLoss } from '../SimulatorFunctions';
import WinLossTable from '../WinLossTable';

import "./randomTeams.css";

interface MatchResult {
    winningPokemon: Array<string>,
    losingPokemon: Array<string>,
}

async function RunAIvsAIBattle(): Promise<OnGameOverArgs> {

    return new Promise(resolve => {

        const ai1 = new PlayerBuilder(1)
            .WithName("AI John")
            .WithRandomPokemon(6)
            .Build();

        const ai2 = new PlayerBuilder(2)
            .WithName("AI Bob")
            .WithRandomPokemon(6)
            .Build();


        let battleService = new BattleService(ai1, ai2, false);
        new BasicAI(ai1, battleService);
        new BasicAI(ai2, battleService);

        battleService.OnGameOver.on((args) => {
            console.log("game is over");
            resolve(args);
        })

        battleService.Initialize();
        battleService.Start();
    }
    );
}

async function RunNBattles(numberOfBattles: number, battleEndedFunc: (data: SimmedStats, results: Array<MatchResult>) => void, battleStartedFunc: (id: number) => void) {

    let matchResults: Array<MatchResult> = [];
    let stats: Record<string, WinLoss> = {};
    await waitForSeconds(0);
    for (var i = 0; i < numberOfBattles; i++) {
        battleStartedFunc((i + 1));
        const results = await RunAIvsAIBattle();
        UpdateStats(stats, results);
        matchResults.push({
            winningPokemon: results.winningPlayer!.pokemon.map(poke => poke.name),
            losingPokemon: results.losingPlayer!.pokemon.map(poke => poke.name)
        });

        battleEndedFunc(stats, matchResults);
    }
}

interface Props {
}



const RandomTeamsSimMenu: React.FunctionComponent<Props> = () => {
    const [simStats, setSimStats] = useState<SimmedStats>({});
    const [numberOfBattles, setNumberOfBattles] = useState<number>(500); //its a string for compatibility issues.
    const [simText, setSimText] = useState<string>("")

    const battleEndedFunc = useCallback((stats: Record<string, WinLoss>, results: Array<MatchResult>) => {
        console.log(stats);
        const newStats = { ...stats };
        setSimStats(newStats);
        setSimText("All battles simulated!");
    }, [])
    
    const startButton = (<Button type="primary" onClick={() => {
        RunNBattles(numberOfBattles, battleEndedFunc, (num) => setSimText("Simulating Battle " + num));

    }}> Simulate!</Button>)
    const simSettings = (<div> Number of Battles : <InputNumber min={1} value={numberOfBattles} max={10000} defaultValue={500} onChange={(e) => setNumberOfBattles(e)} />{startButton}</div>)
    const simTextDiv = (<div>{simText}</div>)

    return (
        <div>
            {simSettings}
            {simTextDiv}
           <WinLossTable stats={simStats}/>
        </div>
    );
}

export default RandomTeamsSimMenu;