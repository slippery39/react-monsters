import './App.css';
import React, { useState } from 'react';
import Battle from "components/Battle/Battle";
import StartGameScreen from 'components/StartGameScreen/StartGameScreen';
import { PlayerBuilder } from 'game/Player/PlayerBuilder';
import BattleService from 'game/BattleService';
import BasicAI from 'game/AI/AI';
import BattleSimulator from 'components/BattleSimulator/BattleSimulator';
import BattleSetupController from 'components/Battle/BattleSetup/BattleSetupController';




enum AppState {
  MainMenu = 'main-menu',
  PlayerBattle = 'player-battle',
  SimulatingAIGames = 'sim-ai-games',
  TestGame = 'test-game'
}


function App() {

  const [appState, setAppState] = useState<AppState>(AppState.MainMenu);


  function handleHumanVsCPU() {
    setAppState(AppState.PlayerBattle);
  }
  function handleBattleSimClick(){
    setAppState(AppState.SimulatingAIGames);
  }
  function handleTestGameClick(){
    setAppState(AppState.TestGame);
  }
  function handleEndGame() {
    setAppState(AppState.MainMenu);
  }


  function initializeTestBattle(){

    const player1 = new PlayerBuilder(1)
    .WithName("Shayne")
    .WithPokemon("Skarmory")
    .WithRandomPokemon(6)
    .Build();

  const player2 = new PlayerBuilder(2)
    .WithName("Bob")
    .WithPokemon("Skarmory")
    .Build();

    let battleService = new BattleService(player1, player2,true);
    new BasicAI(player2, battleService);
    battleService.Initialize();

    return battleService;
  }

  const showScreen = function () {
    switch (appState) {
      case AppState.MainMenu: {
        return (<StartGameScreen 
          onStartClick={handleHumanVsCPU}
          onBattleSimClick={handleBattleSimClick}
          onTestGameClick={handleTestGameClick}
          />)
      }
      case AppState.PlayerBattle: {
        return <BattleSetupController/>
      }
      case AppState.SimulatingAIGames: {
        return <BattleSimulator />
      }
      case AppState.TestGame:{
        return <Battle showDebug battle={initializeTestBattle()} onEnd={handleEndGame}/>
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
