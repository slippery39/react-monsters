import React, { useState } from 'react';
import './App.css';
import Battle from "components/Battle/Battle";
import StartGameScreen from 'components/StartGameScreen/StartGameScreen';
import { PlayerBuilder } from 'game/Player/PlayerBuilder';
import BattleService from 'game/BattleService';
import BasicAI from 'game/AI/AI';
import BattleSimulator from 'components/BattleSimulator/BattleSimulator';

enum AppState {
  MainMenu = 'main-menu',
  InBattle = 'in-battle',
  SimulatingAIGames = 'sim-ai-games'
}


function App() {

  const [appState, setAppState] = useState<AppState>(AppState.MainMenu);


  function handleStartClick() {
    setAppState(AppState.InBattle);
  }
  function handleBattleSimClick(){
    setAppState(AppState.SimulatingAIGames);
  }
  function handleEndGame() {
    setAppState(AppState.MainMenu);
  }



  function initializeBattle() {

    //MISSINGNO!


    //testPokemon.currentStats.hp = 1;











    const player1 = new PlayerBuilder(1)
      .WithName("Shayne")
      .WithPokemon("Zapdos")
      .WithRandomPokemon(6)
      .Build();

    const player2 = new PlayerBuilder(2)
      .WithName("Bob")
      .WithRandomPokemon(6)
      .Build();

    let battleService = new BattleService(player1, player2);
    new BasicAI(player2, battleService);
    battleService.Initialize();
    //battleService.Start();


    return battleService;
  }


  const showScreen = function () {
    switch (appState) {
      case AppState.MainMenu: {
        return (<StartGameScreen 
          onStartClick={handleStartClick}
          onBattleSimClick={handleBattleSimClick}
          />)
      }
      case AppState.InBattle: {
        return <Battle battle={initializeBattle()} onEnd={handleEndGame} />
      }
      case AppState.SimulatingAIGames: {
        return <BattleSimulator />
      }
      default:{
        return <div> Error: Invalid App State </div>
      }
    }
  }



  return (
    <div className='app-window'>
      {showScreen()}
    </div>
  )
}

export default App;
