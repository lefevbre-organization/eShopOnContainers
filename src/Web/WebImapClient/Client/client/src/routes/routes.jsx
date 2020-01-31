import React, { Component } from "react";
import { Router, Route, Switch } from "react-router-dom";
import history from "./history";
import PrivateRoute from "./private-route";
import App from "../components/app";
import UserLexon from "../components/user-lexon/UserLexon";
import Login from "../components/login/login";
import Settings from "../components/settings/settings";
import "../styles/main.scss";

class Routes extends Component {
  render() {
    return (
      <Router basename="/" history={history}>
        <Switch>
          <Route exact path="/user/:idUser" component={UserLexon} />
          <Route exact path="/user/:idUser/casefile/:idCaseFile/bbdd/:bbdd/company/:idCompany" component={UserLexon}/>
          <Route exact path="/user/:idUser/bbdd/:bbdd" component={UserLexon} />
          <Route exact path="/login" render={() => <Login />} />
          <PrivateRoute exact path="/" component={App} />
          <PrivateRoute exact path="/settings" component={Settings} />
        </Switch>
      </Router>
    );
  }
}

export default Routes;
