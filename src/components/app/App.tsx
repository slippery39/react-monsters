import React, { useState } from 'react';
import './App.css';
import Battle from "components/Battle/Battle";
import StartGameScreen from 'components/StartGameScreen/StartGameScreen';


enum AppState{
  StartMenu = 'start-menu',
  InBattle = 'in-battle'
}

function App() {

  const [appState,setAppState] = useState<AppState>(AppState.StartMenu)

  function handleStartClick(){
    setAppState(AppState.InBattle);
  }
  function handleEndGame(){
    setAppState(AppState.StartMenu);
  }

  return (
    <div className= 'app-window'>
    {appState === AppState.StartMenu ? <StartGameScreen onStartClick={handleStartClick}/> : <Battle onEnd={handleEndGame}/>}
    </div>
  )
}

export default App;
