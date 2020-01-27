import React, { Component } from "react";
import { BrowserRouter as Router, Switch } from "react-router-dom";
import { Route } from "react-router-dom";
import AppContainer from "./AppContainer-graph";
import UserLexon from "./components/user-lexon/UserLexon";
import "./App.css";

class App extends Component {
  componentDidMount() {
    console.log("ENVIRONMENT ->", window.REACT_APP_ENVIRONMENT);
  }

  render() {
    return (
      <Router>
        <Switch>
          <Route exact path="/viewMail/:idMail" component={AppContainer} />
          <Route exact path="/user/:idUser/casefile/:idCaseFile/bbdd/:bbdd/company/:idCompany" component={UserLexon} />
          <Route exact path="/user/:idUser/editMail/:idMail" component={UserLexon} />
          <Route exact path="/user/:idUser/editMail/:idMail/casefile/:idCaseFile/bbdd/:bbdd/company/:idCompany" component={UserLexon} />
          <Route exact path="/user/:idUser" component={UserLexon} />
          <Route path="/" component={AppContainer} />
          {/* <AppContainer /> */}
        </Switch>
      </Router>
    );
  }
}

export default App;
