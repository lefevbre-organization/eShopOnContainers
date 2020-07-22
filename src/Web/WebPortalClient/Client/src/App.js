import React, { Component } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import './App.css';

//import { NotFound } from "./components/not-found/NotFound";
import { PageGoTo } from './pages/PageGoTo';
import { PageGoToLegacy } from './pages/PageGoToLegacy';
import Login from './components/login/Login';

class App extends Component {
  componentDidMount() {
    console.log('ENVIRONMENT ->', window.REACT_APP_ENVIRONMENT);
    window.opener = null;
  }

    render() {
        
     return (
      <Switch>
        <Route
          path='/user/:userId?/encrypt/:encrypt?'
          component={PageGoToLegacy}
        />
        <Route
          path='/user/:userId?/encrypt/:encrypt?/casefile/:idCaseFile/bbdd/:bbdd/company/:idCompany'
          component={PageGoToLegacy}
        />
        <Route path='/access/:token' component={PageGoTo} />
            <Route path='/user/:userId?' component={PageGoTo} />           
            <Route path='/login' component={Login} />
            <Route exact path="/" render={() => { window.location.href = "home/index.html" }} />
      </Switch>
    );
  }
}

export default App;
