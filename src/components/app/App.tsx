import './App.css';
import React, { useState } from 'react';
import Battle from "components/Battle/Battle";
import StartGameScreen from 'components/StartGameScreen/StartGameScreen';
import { PlayerBuilder } from 'game/Player/PlayerBuilder';
import BattleService from 'game/BattleService';
import BasicAI from 'game/AI/AI';
import { PokemonBuilder } from 'game/Pokemon/Pokemon';
import { useHistory } from 'react-router-dom';





enum AppState {
  MainMenu = 'main-menu',
  PlayerBattle = 'player-battle',
  SimulatingAIGames = 'sim-ai-games',
  TestGame = 'test-game'
}


function App() {

  const history = useHistory();
  const [appState, setAppState] = useState<AppState>(AppState.MainMenu);
  

  function handleHumanVsCPU() {
    history.push('/battle');
  }
  function handleBattleSimClick(){
    history.push('./battleSimulator')
  }
  function handleTestGameClick(){
    setAppState(AppState.TestGame);
  }
  function handleEndGame() {
    setAppState(AppState.MainMenu);
  }


  function initializeTestBattle(){

    const dugtrioTest = PokemonBuilder()
    .GetPremadePokemon("Dugtrio")
    .WithTechniques([
      "Stealth Rock",
      "Spikes"
    ]);

    
    const dugtrio1 = dugtrioTest.Build();
    dugtrio1.techniques[0].currentPP = 2;
    dugtrio1.techniques[1].currentPP = 2;

    const dugtrio2 = dugtrioTest.Build();
    dugtrio2.techniques[0].currentPP = 2;
    dugtrio2.techniques[1].currentPP = 2;

    const player1 = new PlayerBuilder(1)
    .WithName("Shayne")
    .WithCustomPokemon(dugtrio1)
    .Build();

  const player2 = new PlayerBuilder(2)
    .WithName("Bob")
    .WithCustomPokemon(dugtrio2)
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
