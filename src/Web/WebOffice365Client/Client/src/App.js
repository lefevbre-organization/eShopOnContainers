import React, { Component } from "react";
import { BrowserRouter as Router, Switch } from "react-router-dom";
import { Route } from "react-router-dom";
import AppContainer from "./AppContainer-graph";
import AppContainerCalendar from './AppContainerCalendar';
import UserLexon from './components/user-lexon/UserLexon';
import UserCalendar from './components/user-lexon/UserCalendar';
import "./App.css";
import './lefebvre-material.css';

class App extends Component {
    componentDidMount() {
        console.log("ENVIRONMENT ->", window.REACT_APP_ENVIRONMENT);
    }
    
    render() {
        return (
            <Router>
                <Switch>
                    <Route exact path="/access/:token" component={UserLexon} />
                    <Route exact path="/user/:idUser/message/:idMail/casefile/:idCaseFile/bbdd/:bbdd" component={UserLexon} />
                    <Route exact path="/user/:idUser/casefile/:idCaseFile/bbdd/:bbdd" component={UserLexon} />
                    <Route exact path="/user/:idUser/contacts/:mailContacts/bbdd/:bbdd" component={UserLexon} />
                    <Route exact path="/user/:idUser/message/:idMail/bbdd/:bbdd" component={UserLexon} />
                    <Route exact path="/user/:idUser/bbdd/:bbdd" component={UserLexon} />
                    <Route exact path="/message/:idMail" component={AppContainer} />
                    <Route exact path="/user/:idUser" component={UserLexon} />
                    <Route exact path='/calendar/user/:idUser' component={UserCalendar} />
                    <Route exact path='/calendar/access/:token' component={UserCalendar} />
                    <Route path='/calendar' component={AppContainerCalendar} />
                    <Route path="/" component={window != window.top ? AppContainerCalendar : AppContainer} />
                    {/* <AppContainer /> */}
                </Switch>
            </Router>
        );
    }
}

export default App;