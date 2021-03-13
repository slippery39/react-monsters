import React, { useState } from 'react';
import './App.css';
import Battle from "components/Battle/Battle";
import StartGameScreen from 'components/StartGameScreen/StartGameScreen';
import { PlayerBuilder } from 'game/Player/PlayerBuilder';
import BattleService from 'game/BattleService';
import BasicAI from 'game/AI/AI';
import BattleSimulator from 'components/BattleSimulator/BattleSimulator';
import _ from 'lodash';
import { CloneField } from 'game/HelperFunctions';

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
    const player1 = new PlayerBuilder(1)
      .WithName("Shayne")
      .WithRandomPokemon(6)
      .Build();

    const player2 = new PlayerBuilder(2)
      .WithName("Bob")
      .WithRandomPokemon(6)
      .Build();

    let battleService = new BattleService(player1, player2,true);
    new BasicAI(player2, battleService);
    battleService.Initialize();

/*
    const testIterations = 10000;
    console.time("cloneDeep")
    for (var i=0;i<testIterations;i++){
      _.cloneDeep(battleService.GetCurrentTurn().field);
    }
    console.timeEnd("cloneDeep");


    console.time("clone field");
    for (var i=0;i<testIterations;i++){
      CloneField(battleService.GetCurrentTurn().field);
    }
    console.timeEnd("clone field");


    
*/




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
