import config from './Config';
import { UserAgentApplication } from 'msal';
import React, { Component } from 'react';
import { getUserDetails } from './GraphService';
import 'bootstrap/dist/css/bootstrap.css';
import { withRouter } from "react-router-dom";

import { bindActionCreators, compose } from "redux";
import { connect } from "react-redux";

import Main from "./components/main/Main";
import Login from "./components/login/Login";
import Authenticating from "./components/authenticating/Authenticating";
import 'react-perfect-scrollbar/dist/css/styles.css';
import { mountScripts } from "./api_graph/scripts";

import {
    SIGNED_OUT,   
    AUTH_SUCCESS,
    AUTH_FAIL,
    AUTH_IN_PROGRESS,
    PROVIDER,
} from "./constants";

import { config as constants } from "./constants";

import { storeUser } from "./actions/settings.actions";

class AppContainerGraph extends Component {
    constructor(props) {
        super(props);

        this.userAgentApplication = new UserAgentApplication(config.appId, null, null);

        var user = this.userAgentApplication.getUser();

        this.state = {
            signInStatus: SIGNED_OUT,
            //msUser: undefined,
            isAuthenticated: (user !== null),
            user: {},
            error: null,
            updateDefaultAccount: false,
            fetchUpdateDefaultAccount: false,
            userIdisNull: false
        };

        this.init = this.init.bind(this);
        this.initClient = this.initClient.bind(this);
        //this.onSignout = this.onSignout.bind(this);
       // this.onSignInSuccess = this.onSignInSuccess.bind(this);
        //this.onSignIn = this.onSignIn.bind(this);
    }

    componentDidMount() {
        mountScripts().then(this.init);
    
        this.props.location.pathname = '/inbox';
    }

    init() {
        this.initClient();
    }

    initClient() {
        //checkSignInStatus()
        //    .then(this.onSignInSuccess)
        //    .catch(_ => {
        //        this.setState({
        //            signInStatus: AUTH_FAIL
        //        })
        //    });
        this.getUserProfile()
            .then(this.onSignInSuccess)
            .catch(_ => {
                this.setState({
                    signInStatus: AUTH_FAIL
                });
                this.getUserProfile();
            });
    }

    onSignout() {
        this.props.signOut();
    }

    onSignIn() {
        this.login().then(this.onSignInSuccess);
    }

    onSignInSuccess(msUser) {
        this.setState({
            signInStatus: AUTH_SUCCESS,
            msUser
        });

        if (!this.state.updateDefaultAccount) {            
            const userId = this.props.match.params.id;
            const email = this.state.user.email;
            if (userId != null && email != null) {
              const url = `${constants.url.URL_UPDATE_DEFAULTACCOUNT}/${userId}/${PROVIDER}/${email}`;
              fetch(url, {
                  method:'POST',
              })
              .then(r => r.json())
              .then(result => {
                  console.log(result);
                  this.setState({ updateDefaultAccount: true });
                  this.setState({ fetchUpdateDefaultAccount: true });
                  this.props.storeUser(userId);
              });
            }        
        }
        else {
          this.setState({ userIdisNull: true });
        }
    }

    renderView() {

        const { signInStatus } = this.state;

        if (signInStatus === AUTH_SUCCESS) { 
            console.log('AUTH_SUCCESS');
            return <Main User={this.state.user} />;           
        } else if (signInStatus === AUTH_IN_PROGRESS) {
            console.log('AUTH_IN_PROGRESS');
            return <Authenticating />;
        } else {
            console.log('IN ... else');
            return <Login isAuthenticated={this.state.isAuthenticated}
                user={this.state.user}
                authButtonMethod={this.login.bind(this)}
                logout={this.logout.bind(this)}
            />;
        }
    }

    render() {

        console.log('AppContainerGraph');

        if (!this.state.fetchUpdateDefaultAccount && this.state.userIdisNull) {
            return null;
        }
            
        return (
            <React.Fragment>
                {this.renderView()}       
            </React.Fragment>
    
            // <React.Fragment>
            //     {this.props.location.pathname === "/" ? (
            //         <Redirect to="/inbox" />
            //     ) : (
            //             this.renderView()
            //         )}
            // </React.Fragment>
        );
    }

    setErrorMessage(message, debug) {
        this.setState({
            error: { message: message, debug: debug }
        });
    }

    async login() {
        try {
            await this.userAgentApplication.loginPopup(config.scopes);
            await this.getUserProfile();
        }
        catch (err) {
            var errParts = err.split('|');
            this.setState({
                isAuthenticated: false,
                user: {},
                error: { message: errParts[1], debug: errParts[0] }
            });
        }
    }

    logout() {
        this.userAgentApplication.logout();
    }

    async getUserProfile() {
        try {
            // Get the access token silently
            // If the cache contains a non-expired token, this function
            // will just return the cached token. Otherwise, it will
            // make a request to the Azure OAuth endpoint to get a token

            var accessToken = await this.userAgentApplication.acquireTokenSilent(config.scopes);

            if (accessToken) {
                // Get the user's profile from Graph
                var user = await getUserDetails(accessToken);
                this.onSignInSuccess();
                this.setState({
                    isAuthenticated: true,
                    user: {
                        displayName: user.displayName,
                        email: user.mail || user.userPrincipalName

                    },
                    error: null
                });
            }
            return true
        }
        catch (err) {
            var error = {};
            if (typeof (err) === 'string') {
                var errParts = err.split('|');
                error = errParts.length > 1 ?
                    { message: errParts[1], debug: errParts[0] } :
                    { message: err };
            } else {
                error = {
                    message: err.message,
                    debug: JSON.stringify(err)
                };
            }

            this.setState({
                isAuthenticated: false,
                user: {},
                error: error
            });
        }
    }
}

const mapStateToProps = (state) => {
    return {
        userId: state.storeUser.userId
    }    
};  

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      storeUser
    },
    dispatch
);

export default compose(
    withRouter,
    connect(
        mapStateToProps,
        mapDispatchToProps
    )
)(AppContainerGraph);

//export default withRouter(AppContainerGraph);