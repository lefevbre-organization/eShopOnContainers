import React, { Component } from "react";
import { Switch, Route } from "react-router-dom";

import "./App.css";

import { NotFound } from "./components/not-found/NotFound";
import { PageGoTo } from "./pages/PageGoTo";
import { PageGoToLegacy } from "./pages/PageGoToLegacy";

class App extends Component {
  componentDidMount() {
    console.log("ENVIRONMENT ->", window.REACT_APP_ENVIRONMENT);
  }

  render() {
    return (
      <Switch>
        <Route path="/user/:userId?/encrypt/:encrypt?" component={PageGoToLegacy} />
        <Route path="/user/:userId?/encrypt/:encrypt?/casefile/:idCaseFile/bbdd/:bbdd/company/:idCompany" component={PageGoToLegacy} />
        <Route path="/access/:token" component={PageGoTo} />
        <Route path="/user/:userId?" component={PageGoTo} />
        <Route component={NotFound} />
      </Switch>
    );
  }
}

export default App;
