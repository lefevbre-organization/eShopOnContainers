import React, { Component } from "react";
import { Switch, Route } from "react-router-dom";

import "./App.css";

// import { NotFound } from './components/NotFound'
// import { UserNotFound } from './components/UserNotFound'
import { NotFound } from "./components/not-found/NotFound";
import { PageGoTo } from "./pages/PageGoTo";

class App extends Component {
  render() {
    return (
      <Switch>
        <Route path="/user/:userId?/encrypt/:encrypt?" component={PageGoTo} />
        <Route path="/user/:userId?" component={PageGoTo} />
        <Route component={NotFound} />
      </Switch>
    );
  }
}

export default App;
