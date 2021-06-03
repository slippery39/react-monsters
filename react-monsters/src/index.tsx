import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './components/app/App';
import * as serviceWorker from './serviceWorker';
import { Route, Router, Switch } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import BattleSetupController from 'components/Battle/BattleSetup/BattleSetupController';
import BattleSimulatorMenu from 'components/BattleSimulator/BattleSimulator';
import Layout, { Content, Header } from 'antd/lib/layout/layout';
import { Button } from 'antd';
import Battle from 'components/Battle/Battle';
import BasicAI from 'game/AI/AI';
import LocalBattleService from 'game/BattleService';
import { PlayerBuilder } from 'game/Player/PlayerBuilder';
import { PokemonBuilder } from 'game/Pokemon/Pokemon';
import NetworkPlayController from 'components/NetworkPlay/NetworkPlayController';

const history = createBrowserHistory();

function initializeTestBattle() {

  const zapdos = PokemonBuilder()
    .GetPremadePokemon("Zapdos")
    .WithTechniques([
      "Giga Drain",]);


  const zapdos1 = zapdos.Build();


  const ppPokemon = PokemonBuilder()
    .GetRandomPremade()
    .Build();

  ppPokemon.techniques.forEach(tech => tech.currentPP = 1);
  zapdos1.techniques.forEach(tech => tech.currentPP = 1);



  //const dugtrio2 = dugtrioTest.Build();


  const player1 = new PlayerBuilder()
    .WithName("Shayne")
    .WithCustomPokemon(ppPokemon)
    .Build();

  const player2 = new PlayerBuilder()
    .WithName("Bob")
    .WithCustomPokemon(zapdos1)
    .Build();

  const battleService = new LocalBattleService(true);

  battleService.RegisterPlayer(player1);
  battleService.RegisterPlayer(player2);

  new BasicAI(player2, battleService);
  battleService.Initialize();

  return battleService;
}


const devTestBattle = () => {

  const testBattle = initializeTestBattle();

  return (<Battle allyPlayerID={1} onLoad={() => testBattle.Start()} showDebug battle={testBattle} onEnd={() => history.push("/")} />)
}

const routing = (
  <Router history={history}>
    <Layout>
      <Header className="header">
        <Button type="link" onClick={() => history.push("/")}>Main Menu</Button>
      </Header>
      <Content className="page">
        <Switch>
          <Route exact path="/" component={App} />
          <Route exact path="/battle" component={BattleSetupController} />
          <Route exact path="/battleSimulator" component={BattleSimulatorMenu} />
          <Route exact path="/devtestbattle" render={() => devTestBattle()} />
          <Route exact path="/networked-play" component={NetworkPlayController} />
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
