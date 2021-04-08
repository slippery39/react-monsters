import './App.css';
import React from 'react';
import StartGameScreen from 'components/StartGameScreen/StartGameScreen';
import { useHistory } from 'react-router-dom';

function App() {
  const history = useHistory();
  

  function handleHumanVsCPU() {
    history.push('/battle');
  }
  function handleBattleSimClick(){
    history.push('./battleSimulator')
  }
  function handleTestGameClick(){
    history.push("./devtestbattle");
  }

  return (
    <div className='app-window'>
       <StartGameScreen 
          onStartClick={handleHumanVsCPU}
          onBattleSimClick={handleBattleSimClick}
          onTestGameClick={handleTestGameClick}
          />
    </div>
  )
}

export default App;
