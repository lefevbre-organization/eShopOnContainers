import config from "./Config";
import React, { Component } from "react";
import { getUserDetails } from "./GraphService";
import { connect } from "react-redux";
import Main from "./components/main/Main";
import Login from "./components/login/Login";
import Authenticating from "./components/authenticating/Authenticating";
import "react-perfect-scrollbar/dist/css/styles.css";
import { mountScripts } from "./api_graph/scripts";
import {
  SIGNED_OUT,
  AUTH_SUCCESS,
  AUTH_FAIL,
  AUTH_IN_PROGRESS
} from "./constants";
import { getStateStorage } from "./localstorage";
import { getUserApplication } from './api_graph';
import ACTIONS from "./actions/lexon";

class AppContainerGraph extends Component {
  constructor(props) {
    super(props);

    this.userAgentApplication = getUserApplication();
    var user = this.userAgentApplication.getAccount();

    this.state = {
      signInStatus: SIGNED_OUT,
      isAuthenticated: user !== null,
      user: {},
      error: null,
      readyToRedirect: false
    };

    this.init = this.init.bind(this);
    this.initClient = this.initClient.bind(this);
  }

  componentDidMount() {
    const user = this.props.match.params.idUser;
    const stateStorageLexon = getStateStorage();
    if (!user && stateStorageLexon) {
      const userLexon = stateStorageLexon.lexon;
      if (userLexon && userLexon.user) {
        this.props.setUser(userLexon.user);
        this.props.setCaseFile({
          casefile: userLexon.idCaseFile,
          bbdd: userLexon.bbdd,
          company: userLexon.idCompany
        });
      }
    }

    const { isNewAccount } = this.props.lexon;
    if (!isNewAccount) {
      mountScripts().then(this.init);
    }
  }

  init() {
    this.initClient();
  }

  initClient() {
    this.getUserProfile()
      //.then(this.onSignInSuccess)
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

  onSignInSuccess() {
    this.setState({
      signInStatus: AUTH_SUCCESS,
      readyToRedirect: true
    });
  }

  renderView() {
    const { signInStatus, readyToRedirect } = this.state;

    if (signInStatus === AUTH_SUCCESS && readyToRedirect) {
      return <Main User={this.state.user} />;
    } else if (signInStatus === AUTH_IN_PROGRESS) {
      return <Authenticating />;
    } else {
      return (
        <Login
          isAuthenticated={this.state.isAuthenticated}
          user={this.state.user}
          authButtonMethod={this.login.bind(this)}
          logout={this.logout.bind(this)}
          lexon={this.props.lexon}
        />
      );
    }
  }

  render() {
    return <React.Fragment>{this.renderView()}</React.Fragment>;
  }

  setErrorMessage(message, debug) {
    this.setState({
      error: { message: message, debug: debug }
    });
  }

  async login() {
    try {
      await this.userAgentApplication.loginRedirect(
        {
          scopes: config.scopes,
          prompt: "select_account"
      });
      await this.getUserProfile();
    }
    catch(err) {
      var error = {};

      if (typeof(err) === 'string') {
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

  logout() {
    this.userAgentApplication.logout();
  }

  async getUserProfile() {
    try {
      // Get the access token silentlyx
      // If the cache contains a non-expired token, this function
      // will just return the cached token. Otherwise, it will
      // make a request to the Azure OAuth endpoint to get a token

      var accessToken = await this.userAgentApplication.acquireTokenSilent({
        scopes: config.scopes
      });

      if (accessToken) {
        // Get the user's profile from Graph
        var user = await getUserDetails(accessToken);
        this.setState({
          isAuthenticated: true,
          user: {
            displayName: user.displayName,
            email: user.mail || user.userPrincipalName
          },
          error: null
        });
        this.onSignInSuccess();
      }
      return true;

    }
    catch(err) {
      console.log(err)
      var error = {};
      if (typeof(err) === 'string') {
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

const mapStateToProps = state => ({
  lexon: state.lexon
});

const mapDispatchToProps = dispatch => ({
  setUser: user => dispatch(ACTIONS.setUser(user)),
  setCaseFile: casefile => dispatch(ACTIONS.setCaseFile(casefile))
});

export default connect(mapStateToProps, mapDispatchToProps)(AppContainerGraph);
