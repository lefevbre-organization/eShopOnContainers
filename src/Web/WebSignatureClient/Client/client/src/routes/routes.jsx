import React, { Component } from "react";
import { Router, Route, Switch } from "react-router-dom";
import history from "./history";
import PrivateRoute from "./private-route";
import App from "../components/app";
import UserLefebvre from "../components/user-lefebvre/UserLefebvre";
import Login from "../components/login2/Login";
import Settings from "../components/settings/settings";
import "../styles/main.scss";
import Unauthorized from "../components/unauthorized/Unauthorized";
import Expired from "../components/expired/Expired";
import Completed from "../components/completed/Completed";

class Routes extends Component {
    componentDidMount() {
        console.log("")
    }

    render() {
        return (
            <Router basename="/" history={history}>
                <Switch>
                    <Route exact path="/access/:token" component={UserLefebvre} />
                    {/* <Route exact path="/login" render={() => <Login />} /> */}
                    <Route exact path="/login" component={Login} />
                    <Route exact path="/unauthorized" component={Unauthorized} />
                    <Route exact path="/expired" component={Expired} />
                    <Route exact path="/completed" component={Completed} />

                    <PrivateRoute exact path="/" component={App} />
                    <PrivateRoute exact path="/settings" component={Settings} />
                </Switch>
            </Router>
        );
    }
}

export default Routes;