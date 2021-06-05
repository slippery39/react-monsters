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
import NetworkPlayController from 'components/NetworkPlay/NetworkPlayController';
import DevTestBattle from 'components/DevTestBattle/DevTestBattle';

const history = createBrowserHistory();


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
          <Route exact path="/devtestbattle" render={() => <DevTestBattle onEnd={()=>history.push("/")}/>} />
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
