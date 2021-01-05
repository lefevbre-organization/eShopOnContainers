import React, { Component } from 'react';
import { Router, Route, Switch } from 'react-router-dom';
import history from './history';
import PrivateRoute from './private-route';
import App from '../components/app';
import Calendar from '../components/calendar';

import UserLexon from '../components/user-lexon/UserLexon';
import Login from '../components/login/login';
import Settings from '../components/settings/settings';
import ErrorScreen from '../components/error/error';
import '../styles/main.scss';

class Routes extends Component {
  componentDidMount() {
    console.log('');
  }

  render() {
    return (
      <Router basename='/' history={history}>
        <Switch>
          <Route exact path='/access/:token' component={UserLexon} />
          <Route
            exact
            path='/user/:idUser/folder/:idFolder/message/:idMessage/casefile/:idCaseFile/bbdd/:bbdd'
            component={UserLexon}
          />
          <Route
            exact
            path='/user/:idUser/folder/:idFolder/message/:idMessage/bbdd/:bbdd'
            component={UserLexon}
          />
          <Route
            exact
            path='/user/:idUser/casefile/:idCaseFile/bbdd/:bbdd'
            component={UserLexon}
          />
          <Route
            exact
            path='/user/:idUser/contacts/:mailContacts/bbdd/:bbdd'
            component={UserLexon}
          />
          <Route exact path='/user/:idUser/bbdd/:bbdd' component={UserLexon} />
          <Route exact path='/user/:idUser' component={UserLexon} />
          <Route exact path='/calendar/user/:idUser' component={UserLexon} />
          <Route exact path='/calendar/access/:token' component={UserLexon} />
          <Route path='/calendar' component={Calendar} />
          <Route exact path='/login' render={() => <Login />} />
          <Route path='/error/:id' component={ErrorScreen} />
          <PrivateRoute exact path='/' component={App} />
          <PrivateRoute exact path='/settings' component={Settings} />
        </Switch>
      </Router>
    );
  }
}

export default Routes;
