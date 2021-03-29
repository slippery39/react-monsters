import { Button, InputNumber, Tabs } from 'antd';
import PokemonImage from 'components/PokemonImage/PokemonImage';
import BasicAI from 'game/AI/AI';
import waitForSeconds from 'game/AI/CoroutineTest';
import { OnGameOverArgs } from 'game/BattleGame';
import BattleService from 'game/BattleService';
import { PlayerBuilder } from 'game/Player/PlayerBuilder';
import _ from 'lodash';
import React, { useCallback, useState } from 'react';
import { SimmedStats, UpdateStats, WinLoss } from '../SimulatorFunctions';
import WinLossTable from '../WinLossTable';
import "./randomTeams.css";
import * as Icons from '@ant-design/icons';

const { TabPane } = Tabs



export interface MatchResult {
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


//testing ones without the OnGameOverArgs
export function UpdateAllyWinStats(previousStats: SimmedStats, team: Array<string>) {

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

export function UpdateAllyLossStats(previousStats: SimmedStats, team: Array<string>) {
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

function GetPokemonAllyTeamWinRates(pokeName: Array<string>, results: Array<MatchResult>) {
    let stats: Record<string, WinLoss> = {};


    const hasAll = (arrToCheck: Array<any>, arrWithValues: Array<any>) => {
        return arrWithValues.every((val: any) => arrToCheck.includes(val))
    }

    const names = pokeName.map(name => name.toLowerCase());


    results.forEach(result => {
        if (hasAll(result.winningPokemon.map(p => p.toLowerCase()), names)) {
            UpdateAllyWinStats(stats, result.winningPokemon);
        }
        if (hasAll(result.losingPokemon.map(p => p.toLowerCase()), names)) {
            UpdateAllyLossStats(stats, result.losingPokemon);
        }
    });

    return stats;
}

function GetPokemonOpponentTeamRates(pokeName: Array<string>, results: Array<MatchResult>) {
    let stats: Record<string, WinLoss> = {};

    const hasAll = (arrToCheck: Array<any>, arrWithValues: Array<any>) => {
        return arrWithValues.every((val: any) => arrToCheck.includes(val))
    }

    const names = pokeName.map(name => name.toLowerCase());

    //Should be the inverse of the ally team rates?
    results.forEach(result => {
        if (hasAll(result.winningPokemon.map(p => p.toLowerCase()), names)) {
            //take the result that has the pokemon on their team.
            UpdateAllyLossStats(stats, result.losingPokemon);
            //stuff
        }
        if (hasAll(result.losingPokemon.map(p => p.toLowerCase()), names)) {
            UpdateAllyWinStats(stats, result.winningPokemon);
        }

    });

    return stats;

}




interface Props {
}



const RandomTeamsSimMenu: React.FunctionComponent<Props> = () => {
    const [simStats, setSimStats] = useState<SimmedStats>({});
    const [numberOfBattles, setNumberOfBattles] = useState<number>(500); //its a string for compatibility issues.
    const [simText, setSimText] = useState<string>("")
    const [matchResults, setMatchResults] = useState<Array<MatchResult>>([]);

    const [currentPokeName, setCurrentPokeName] = useState<Array<string>>([]);

    const battleEndedFunc = useCallback((stats: Record<string, WinLoss>, results: Array<MatchResult>) => {
        console.log(stats);
        const newStats = { ...stats };
        setSimStats(newStats);
        setSimText("All battles simulated!");
        setMatchResults(results);
    }, [])

    const startButton = (<Button type="primary" onClick={() => {
        RunNBattles(numberOfBattles, battleEndedFunc, (num) => setSimText("Simulating Battle " + num));

    }}> Simulate!</Button>)
    const simSettings = (<div> Number of Battles : <InputNumber min={1} value={numberOfBattles} max={10000} defaultValue={500} onChange={(e) => setNumberOfBattles(e)} />{startButton}</div>)
    const simTextDiv = (<div>{simText}</div>)


    const removePokeName = (name: string, currentArr: Array<string>) => {
        console.log("Removing pokemon",name);
        _.remove(currentArr, (el) => {
            return el === name;
        });
        console.log(currentArr);

        return [...currentArr];
    }

    const teamFilteredWinLossTables = () => {
        return (
            <div>
                <Tabs defaultActiveKey="1">
                    <TabPane tab="Ally Team Win Loss" key="1">
                        <div> Showing Win Loss stats for pokemon that were on teams <b>with</b> {currentPokeName.join(",")}<div>
                            {currentPokeName.map(pn => (<span className="clickable" onClick={() => setCurrentPokeName(removePokeName(pn, currentPokeName))}><PokemonImage type="small" name={pn} /><Icons.CloseCircleOutlined /></span>))}
                        </div>
                        </div>
                        <WinLossTable onPokemonImageClick={(name) => setCurrentPokeName(pn => pn.includes(name) ? pn :pn.concat([name]))} stats={GetPokemonAllyTeamWinRates(currentPokeName, matchResults)} />
                    </TabPane>
                    <TabPane tab="Enemy Team Win Loss" key="2">
                        <div> Showing Win Loss stats for pokemon that were on teams <b>against</b> {currentPokeName.join(",")}<div>
                            {currentPokeName.map(pn => (<span className="clickable" onClick={() => setCurrentPokeName(removePokeName(pn, currentPokeName))}><PokemonImage type="small" name={pn} /><Icons.CloseCircleOutlined /></span>))}</div></div>
                        <WinLossTable onPokemonImageClick={(name) => setCurrentPokeName(pn => pn.includes(name)?  pn : pn.concat([name]))} stats={GetPokemonOpponentTeamRates(currentPokeName, matchResults)} />
                    </TabPane>
                </Tabs> </div>)
    }

    return (
        <div>
            {simSettings}
            {simTextDiv}
            {currentPokeName.length === 0 && <WinLossTable onPokemonImageClick={(name) => setCurrentPokeName(p => p.concat([name]))} stats={simStats} />}
            {currentPokeName.length > 0 && teamFilteredWinLossTables()}
        </div>
    );
}

export default RandomTeamsSimMenu;