import { Button, InputNumber, message, Tabs } from 'antd';
import PokemonImage from 'components/PokemonImage/PokemonImage';
import BasicAI from 'game/AI/AI';
import waitForSeconds from 'game/AI/CoroutineTest';
import { OnGameOverArgs } from 'game/BattleGame';
import LocalBattleService from 'game/BattleService';
import { PlayerBuilder } from 'game/Player/PlayerBuilder';
import _ from 'lodash';
import React, { useCallback, useState } from 'react';
import { SimmedStats, UpdateStats, WinLoss } from '../SimulatorFunctions';
import WinLossTable from '../WinLossTable';
import "./randomTeams.css";
import * as Icons from '@ant-design/icons';
import { GetAllPokemonInfo } from 'game/Pokemon/PremadePokemon';
import Pokeball from 'components/Pokeball/Pokeball';
import { Bouncy } from 'components/_General/General';
import PokemonPoolSelector from '../PoolSelector';

const { TabPane } = Tabs;

export interface MatchResult {
    winningPokemon: string[],
    losingPokemon: string[],
}

async function RunAIvsAIBattle(teamSize: number, pokemonPool: string[]): Promise<OnGameOverArgs> {

    return new Promise(resolve => {
        const randomizedPool = _.shuffle(_.cloneDeep(pokemonPool));
        const aiBuilder1 = new PlayerBuilder()
            .WithName("AI John");
        const randomPokemon = _.take(randomizedPool, teamSize);

        randomPokemon.forEach(poke => {
            aiBuilder1.WithPokemon(poke);
        })
        const ai1 = aiBuilder1.Build();

        const aiBuilder2 = new PlayerBuilder()
            .WithName("AI Bob")
        const randomPokemon2 = _.take(_.shuffle(randomizedPool), teamSize);

        randomPokemon2.forEach(poke => {
            aiBuilder2.WithPokemon(poke);
        });
        const ai2 = aiBuilder2.Build();


        let battleService = new LocalBattleService(false);
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

async function RunNBattles(numberOfBattles: number, teamSize: number, battleEndedFunc: (data: SimmedStats, results: MatchResult[]) => void, battleStartedFunc: (id: number) => void, pokemonPool: string[]) {

    let matchResults: Array<MatchResult> = [];
    let stats: Record<string, WinLoss> = {};
    await waitForSeconds(0);
    for (var i = 0; i < numberOfBattles; i++) {
        battleStartedFunc((i + 1));
        const results = await RunAIvsAIBattle(teamSize, pokemonPool);
        UpdateStats(stats, results);
        matchResults.push({
            winningPokemon: results.winningPlayer!.pokemon.map(poke => poke.name),
            losingPokemon: results.losingPlayer!.pokemon.map(poke => poke.name)
        });

        battleEndedFunc(stats, matchResults);
    }
    //Saving this so we can use this later to check stats.
    console.log(JSON.stringify(matchResults));
}


//testing ones without the OnGameOverArgs
export function UpdateAllyWinStats(previousStats: SimmedStats, team: string[]) {

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

export function UpdateAllyLossStats(previousStats: SimmedStats, team: string[]) {
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

function GetPokemonAllyTeamWinRates(pokeName: Array<string>, results: MatchResult[]) {
    let stats: Record<string, WinLoss> = {};


    const hasAll = (arrToCheck: Array<any>, arrWithValues: Array<any>) => {
        return arrWithValues.every((val: any) => arrToCheck.includes(val))
    }

    const names = pokeName.map(name => name.toLowerCase());

    let overallWins = 0;
    let overallLosses = 0;

    results.forEach(result => {
        if (hasAll(result.winningPokemon.map(p => p.toLowerCase()), names)) {
            UpdateAllyWinStats(stats, result.winningPokemon);
            overallWins++;
        }
        if (hasAll(result.losingPokemon.map(p => p.toLowerCase()), names)) {
            UpdateAllyLossStats(stats, result.losingPokemon);
            overallLosses++;
        }
    });

    return { stats: stats, winRate: 100 * (overallWins / (overallWins + overallLosses)) };
}

function GetPokemonOpponentTeamRates(pokeName: Array<string>, results: MatchResult[]) {
    let stats: Record<string, WinLoss> = {};

    const hasAll = (arrToCheck: Array<any>, arrWithValues: any[]) => {
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
    const [matchResults, setMatchResults] = useState<MatchResult[]>([]);
    const [isSimming, setIsSimming] = useState<boolean>(false);

    const [currentPokemonFilter, setCurrentPokemonFilter] = useState<string[]>([]);
    const [teamSize, setTeamSize] = useState<number>(6);

    const battleEndedFunc = useCallback((stats: Record<string, WinLoss>, results: MatchResult[]) => {
        const newStats = { ...stats };
        setSimStats(newStats);
        setSimText("All battles simulated!");
        setMatchResults(results);

    }, [])

    const pool = GetAllPokemonInfo().map(poke => poke.species); //all the pokemon;
    const [currentPool, setCurrentPool] = useState<string[]>(pool);

    const startButton = (<Button disabled={isSimming} type="primary" onClick={async () => {

        if (currentPool.length<=teamSize){
                message.error("The pokemon pool you choose from must be larger than the team sizes");
                return;
        }

        setIsSimming(true);
        await RunNBattles(numberOfBattles, teamSize, battleEndedFunc, (num) => setSimText("Simulating Battle " + num), currentPool);
        setIsSimming(false);
    }}> Simulate!</Button>)

    const teamSizeInput = (<div> Team Size : <InputNumber min={2} value={teamSize} max={6} defaultValue={6} onChange={(e) => setTeamSize(e)} /></div>);
    const numberOfBattlesInput = (<div> Number of Battles : <InputNumber min={1} value={numberOfBattles} max={100000} defaultValue={500} onChange={(e) => setNumberOfBattles(e)} />{startButton}</div>)
    const simTextDiv = (isSimming ? (<div><Bouncy><Pokeball /></Bouncy>&nbsp;{simText}&nbsp;<Bouncy><Pokeball /></Bouncy></div>) : <div>{simText}</div>);

    const removePokeName = (name: string, currentArr: Array<string>) => {
        _.remove(currentArr, (el) => {
            return el === name;
        });
        return [...currentArr];
    }


    const addToPokemonFilter = (name: string) => {
        setCurrentPokemonFilter(pn => pn.includes(name) ? pn : pn.concat([name]));
    }
    const removeFromPokemonFilter = (name: string) => {
        setCurrentPokemonFilter(removePokeName(name, currentPokemonFilter));
    }


    const teamFilteredWinLossTables = () => {
        return (
            <div>
                <Tabs defaultActiveKey="1">
                    <TabPane tab="Ally Team Win Loss" key="1">
                        <div> Showing Win Loss stats for pokemon that were on teams <b>with</b> {currentPokemonFilter.join(",")} (Win Rate : {Math.round(GetPokemonAllyTeamWinRates(currentPokemonFilter, matchResults).winRate)}%)<div>
                            {currentPokemonFilter.map(pn => (<span className="clickable" onClick={() => removeFromPokemonFilter(pn)}><PokemonImage type="small" name={pn} /><Icons.CloseCircleOutlined /></span>))}
                        </div>
                        </div>
                        <WinLossTable onPokemonImageClick={(name) => addToPokemonFilter(name)} overallWinRates={simStats} filteredTeam={{ team: currentPokemonFilter, winRate: GetPokemonAllyTeamWinRates(currentPokemonFilter, matchResults).winRate }} stats={GetPokemonAllyTeamWinRates(currentPokemonFilter, matchResults).stats} />
                    </TabPane>
                    <TabPane tab="Enemy Team Win Loss" key="2">
                        <div> Showing Win Loss stats for pokemon that were on teams <b>against</b> {currentPokemonFilter.join(",")}<div>
                            {currentPokemonFilter.map(pn => (<span className="clickable" onClick={() => removeFromPokemonFilter(pn)}><PokemonImage type="small" name={pn} /><Icons.CloseCircleOutlined /></span>))}</div></div>
                        <WinLossTable onPokemonImageClick={(name) => addToPokemonFilter(name)} stats={GetPokemonOpponentTeamRates(currentPokemonFilter, matchResults)} />
                    </TabPane>
                </Tabs> </div>)
    }

    return (
        <div>
            {teamSizeInput}
            <PokemonPoolSelector onChange={(pool: React.SetStateAction<string[]>) => setCurrentPool(pool)} defaultPokemon={currentPool} />
            {numberOfBattlesInput}
            {simTextDiv}
            {currentPokemonFilter.length === 0 && <WinLossTable onPokemonImageClick={(name) => setCurrentPokemonFilter(p => p.concat([name]))} stats={simStats} />}
            {currentPokemonFilter.length > 0 && teamFilteredWinLossTables()}
        </div>
    );
}

export default RandomTeamsSimMenu;