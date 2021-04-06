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

const history = createBrowserHistory();

const routing = (
  <Router history={history}>
   <Layout className="page">
     <Header>
     </Header>
     <Content>
     <Switch>
        <Route exact path="/" component={App}/>
        <Route exact path="/battle" component={BattleSetupController}/>
        <Route exact path="/battleSimulator" component={BattleSimulatorMenu}/>
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
