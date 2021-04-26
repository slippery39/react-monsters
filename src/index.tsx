import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './components/app/App';
import * as serviceWorker from './serviceWorker';
import { Route, Router,Switch } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import BattleSetupController from 'components/Battle/BattleSetup/BattleSetupController';
import BattleSimulatorMenu from 'components/BattleSimulator/BattleSimulator';
import Layout, { Content, Header } from 'antd/lib/layout/layout';
import { Button } from 'antd';
import Battle from 'components/Battle/Battle';
import BasicAI from 'game/AI/AI';
import BattleService from 'game/BattleService';
import { PlayerBuilder } from 'game/Player/PlayerBuilder';
import { PokemonBuilder } from 'game/Pokemon/Pokemon';
import RemoteAIvsAIBattle from 'components/Battle/RemoteAIvsAIBattle/RemoteAIvsAI';

const history = createBrowserHistory();

function initializeTestBattle(){

  const dugtrioTest = PokemonBuilder()
  .GetPremadePokemon("Dugtrio")
  .WithTechniques([
    "Quick Attack",  ]);

  
  const dugtrio1 = dugtrioTest.Build();


  const dugtrio2 = dugtrioTest.Build();


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
        <Route exact path="/devtestbattle" render={()=><Battle allyPlayerID={1} showDebug battle={initializeTestBattle()} onEnd={()=>history.push("/")}/>}/>
        <Route exact path="/remotebattle" render={()=><RemoteAIvsAIBattle/>}/>
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
