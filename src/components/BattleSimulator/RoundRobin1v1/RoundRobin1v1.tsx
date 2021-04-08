import { Button, Card, Collapse, InputNumber, message} from 'antd';
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
import Pokeball from 'components/Pokeball/Pokeball';
import { Bouncy } from 'components/_General/General';
import TeamSelector from 'components/TeamSelector/TeamSelector';

const { Panel } = Collapse;


interface MatchResult {
    winningPokemon: string[],
    losingPokemon: string[],
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


function GetAllMatchups(pool: string[]) {
    let allMatchups = pool.flatMap(
        (v, i) => pool.slice(i + 1).map(w => { return { pokemon1: v, pokemon2: w } })
    );

    return allMatchups;
}

interface RoundRobin1v1Settings {
    onBattleEnd: (data: SimmedStats, results: MatchResult[]) => void
    onBattleStart: (id: string) => void
    numberOfBattles: number,
    pool: string[]
}

async function RoundRobin1v1(settings: RoundRobin1v1Settings) {

    let currentStats: SimmedStats = {};
    let matchResults: MatchResult[] = [];


    let allMatchups = GetAllMatchups(settings.pool);
    let allBattles = [...allMatchups];

    let numberOfBattles = settings.numberOfBattles
    if (numberOfBattles > 1) {
        for (let i = 1; i < numberOfBattles; i++) {
            allBattles = allBattles.concat([...allMatchups])
        }
    }

    allBattles = shuffle(allBattles);
    for (let i in allBattles) {
        settings.onBattleStart(i);
        const matchup = allBattles[i];
        const result = await RunRoundRobinBattle1v1(matchup.pokemon1, matchup.pokemon2);
        matchResults.push({
            winningPokemon: result.winningPlayer!.pokemon.map(poke => poke.name),
            losingPokemon: result.losingPlayer!.pokemon.map(poke => poke.name)
        });
        UpdateStats(currentStats, result);
        settings.onBattleEnd(currentStats, matchResults);
    }
}


//These work a little bit differently here than in the Random 6v6. Hopefully can refactor to make things more clear.
function UpdateWinStats(previousStats: SimmedStats, team: string[]) {

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

function UpdateLossStats(previousStats: SimmedStats, team: string[]) {

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


function GetSpecificPokemonWinRates(pokeName: string, results: MatchResult[]) {
    let stats: Record<string, WinLoss> = {};


    results.forEach(result => {
        if (result.winningPokemon.map(p => p.toLowerCase()).includes(pokeName.toLowerCase())) {
            UpdateWinStats(stats, result.losingPokemon);
        }
        if (result.losingPokemon.map(p => p.toLowerCase()).includes(pokeName.toLowerCase())) {
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
    const [matchResults, setMatchResults] = useState<MatchResult[]>([]);
    const [isSimming, setIsSimming] = useState<boolean>(false);

    const pool = GetAllPokemonInfo().map(poke => poke.species); //all the pokemon;
    const [currentPool, setCurrentPool] = useState<string[]>(pool);

    //shared with out random teams simulator... extact into its own component i am thinking., functionality should be the same.
    const pokemonPoolSettings = () => {
        return (
            <Card>
                <Collapse defaultActiveKey={'1'}>
                    <Panel header="Select Simulation Pool" key="1">
                        <TeamSelector amountNeededMessage={""} onChange={(pool: React.SetStateAction<string[]>) => setCurrentPool(pool)} defaultPokemon={currentPool} maxPokemon={999} />
                    </Panel>
                </Collapse>
            </Card>
        )
    }

    const handleBattleEnded = useCallback((stats: Record<string, WinLoss>, results: Array<MatchResult>) => {
        const newStats = { ...stats };
        setSimStats(newStats);
        setMatchResults(results);
        setSimText("All battles simulated!");
    }, [setSimStats])

    const startButton = (<Button disabled={isSimming} type="primary" onClick={async () => {

        if (currentPool.length<2){
            message.error("Please select at least 2 pokemon in your pool");
            return;
        }

        setIsSimming(true);

        const settings: RoundRobin1v1Settings = {
            onBattleEnd: handleBattleEnded,
            onBattleStart: (num) => setSimText("Simulating Battle " + num),
            numberOfBattles: numberOfBattles,
            pool: currentPool
        }
        await RoundRobin1v1(settings);
        setIsSimming(false);
    }
    }> Simulate!</Button>)
    const simSettings = (<div> Number of Battles Per Matchup : (Total Battles: {GetAllMatchups(currentPool).length * numberOfBattles}) <InputNumber min={1} value={numberOfBattles} max={10} defaultValue={1} onChange={(e) => setNumberOfBattles(e)} />{startButton}</div>)
    const simTextDiv = (isSimming ? (<div><Bouncy><Pokeball /></Bouncy>&nbsp;{simText}&nbsp;<Bouncy><Pokeball /></Bouncy></div>) : <div>{simText}</div>);

    return (<div>
        {pokemonPoolSettings()}
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