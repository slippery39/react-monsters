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

const history = createBrowserHistory();

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
        <Route exact path="/devtestbattle" render={()=><Battle showDebug battle={initializeTestBattle()} onEnd={()=>history.push("/")}/>}/>
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
