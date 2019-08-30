import React, { Component } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { Route } from 'react-router-dom'

import AppContainer from "./AppContainer-graph";

import "./App.css";

class App extends Component {
  
  render() {
    return (
      <Router>
        {/* <AppContainer /> */}
        <Route path="/:id?" component={AppContainer} />
      </Router>
    );
  }

}

export default App;
