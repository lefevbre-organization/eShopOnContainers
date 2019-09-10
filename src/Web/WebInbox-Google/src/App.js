import React, { Component } from "react";
import { BrowserRouter as Router, Switch } from "react-router-dom";
import { Route } from "react-router-dom";
import AppContainer from "./AppContainer";
import UserLexon from "./components/user-lexon/UserLexon";
import Login from "./components/login/Login";

import "./App.css";

class App extends Component {
  render() {
    return (
      <Router>
        <Switch>
          <Route exact path="/user/:id" component={UserLexon} />
          <Route exact path="/login" component={Login} />
          <Route exact path="/" component={AppContainer} />
          {/* <AppContainer /> */}
        </Switch>
      </Router>
    );
  }
}

export default App;
