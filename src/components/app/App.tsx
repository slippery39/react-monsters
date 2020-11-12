import React, { useState } from 'react';
import './App.css';
import Battle from "components/Battle/Battle";
import StartGameScreen from 'components/StartGameScreen/StartGameScreen';
import { PlayerBuilder } from 'game/Player/PlayerBuilder';
import BattleService from 'game/Battle';
import BasicAI from 'game/AI/AI';


enum AppState{
  StartMenu = 'start-menu',
  InBattle = 'in-battle'
}

function App() {

  const [appState,setAppState] = useState<AppState>(AppState.StartMenu);


  function handleStartClick(){
    setAppState(AppState.InBattle);
  }
  function handleEndGame(){
    setAppState(AppState.StartMenu);
  }

  function initializeBattle(){
    const player1 = new PlayerBuilder(1)
    .WithName("Shayne")
    .WithPokemon("venusaur")
    .WithPokemon("venusaur")
    .WithPokemon("blastoise")
    .WithItem("Full Restore", 3)
    .WithItem("Antidote", 2)
    .WithItem("Hyper Potion", 3)
    .WithItem("Max Potion", 1)
    .Build();

const player2 = new PlayerBuilder(2)
    .WithName("Bob")
    .WithPokemon("blastoise")
    .WithPokemon("blastoise")
    .WithPokemon("charizard")
    .WithItem("Potion", 1)
    .WithItem("Super Potion", 2)
    .WithItem("Hyper Potion", 3)
    .WithItem("Max Potion", 1)
    .Build();

    let battleService = new BattleService(player1, player2);
    new BasicAI(player2, battleService);
    battleService.Start();

    return battleService;
  }

  return (
    <div className= 'app-window'>
    {appState === AppState.StartMenu ? <StartGameScreen onStartClick={handleStartClick}/> : <Battle battle={initializeBattle()} onEnd={handleEndGame}/>}
    </div>
  )
}

export default App;
