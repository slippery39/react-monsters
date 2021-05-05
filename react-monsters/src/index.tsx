import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './components/app/App';
import * as serviceWorker from './serviceWorker';
import { Route, Router,Switch} from 'react-router-dom';
import { createBrowserHistory } from 'history';
import BattleSetupController from 'components/Battle/BattleSetup/BattleSetupController';
import BattleSimulatorMenu from 'components/BattleSimulator/BattleSimulator';
import Layout, { Content, Header } from 'antd/lib/layout/layout';
import { Button } from 'antd';
import Battle from 'components/Battle/Battle';
import BasicAI from 'game/AI/AI';
import LocalBattleService from 'game/BattleService';
import { PlayerBuilder } from 'game/Player/PlayerBuilder';
import RemoteAIvsAIBattle from 'components/Battle/RemoteBattle/RemoteBattle';
import { PokemonBuilder } from 'game/Pokemon/Pokemon';

const history = createBrowserHistory();

function initializeTestBattle(){

  const dugtrioTest = PokemonBuilder()
  .GetPremadePokemon("Sceptile")
  .WithTechniques([
    "Giga Drain",  ]);

  
  const dugtrio1 = dugtrioTest.Build();

  dugtrio1.currentStats.hp = 1;
  dugtrio1.currentStats.speed = 99999;


  //const dugtrio2 = dugtrioTest.Build();


  const player1 = new PlayerBuilder()
  .WithName("Shayne")
  .WithCustomPokemon(dugtrio1)
  .Build();

const player2 = new PlayerBuilder()
  .WithName("Bob")
  .WithRandomPokemon(6)
  .Build();

  let battleService = new LocalBattleService(true);
  new BasicAI(player2, battleService);
  battleService.Initialize();

  return battleService;
}


const devTestBattle = ()=>{

  const testBattle = initializeTestBattle();

  return (<Battle allyPlayerID={1} onLoad={()=>testBattle.Start()} showDebug battle={testBattle} onEnd={()=>history.push("/")}/>)
}

interface RemoteBattleParams{
  id:string | undefined
}

interface Props{

}



const routing = (
  <Router history={history}>
   <Layout>
     <Header className="header">
       <Button type="link" onClick={()=>history.push("/")}>Main Menu</Button>
     </Header>
     <Content className="page">
     <Switch>
        <Route exact path="/" component={App}/>
        <Route exact path="/battle" component={BattleSetupController}/>
        <Route exact path="/battleSimulator" component={BattleSimulatorMenu}/>
        <Route exact path="/devtestbattle" render={()=>devTestBattle()}/>
        <Route exact path="/remotebattle1/" render={(props)=><RemoteAIvsAIBattle playerId={1}/>}/>
        <Route exact path="/remotebattle2/" render={(props)=><RemoteAIvsAIBattle playerId={2}/>}/>
      </Switch>
     </Content>
   </Layout>
  </Router>
)

ReactDOM.render(
    routing,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
