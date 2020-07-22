import React, { Component } from "react";
import { Router, Route, Switch } from "react-router-dom";
import history from "./history";
import PrivateRoute from "./private-route";
import App from "../components/app";
import UserLefebvre from "../components/user-lefebvre/UserLefebvre";
import Login from "../components/login2/Login";
import Settings from "../components/settings/settings";
import "../styles/main.scss";
import { Unauthorized } from "../components/unauthorized/unauthorized";
import { Expired } from "../components/expired/expired";

class Routes extends Component {
    componentDidMount() {
        console.log("")
    }

    render() {
        return (
            <Router basename="/" history={history}>
                <Switch>
                    <Route exact path="/access/:token" component={UserLefebvre} />
                    <Route exact path="/user/:idUser/folder/:idFolder/message/:idMessage/casefile/:idCaseFile/bbdd/:bbdd" component={UserLefebvre} />
                    <Route exact path="/user/:idUser/folder/:idFolder/message/:idMessage/bbdd/:bbdd" component={UserLefebvre} />
                    <Route exact path="/user/:idUser/casefile/:idCaseFile/bbdd/:bbdd" component={UserLefebvre} />
                    <Route exact path="/user/:idUser/contacts/:mailContacts/bbdd/:bbdd" component={UserLefebvre} />
                    <Route exact path="/user/:idUser/bbdd/:bbdd" component={UserLefebvre} />
                    <Route exact path="/user/:idUser" component={UserLefebvre} />
                    {/* <Route exact path="/login" render={() => <Login />} /> */}
                    <Route exact path="/login" component={Login} />
                    <Route exact path="/unauthorized" component={Unauthorized} />
                    <Route exact path="/expired" component={Expired} />

                    <PrivateRoute exact path="/" component={App} />
                    <PrivateRoute exact path="/settings" component={Settings} />
                </Switch>
            </Router>
        );
    }
}

export default Routes;