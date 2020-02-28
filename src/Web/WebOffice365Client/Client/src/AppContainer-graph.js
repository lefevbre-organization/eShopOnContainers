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
import { getUserApplication, getMessageByInternetMessageId } from './api_graph';
import ACTIONS from "./actions/lexon";
import * as base64 from 'base-64';

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
      readyToRedirect: false,
      openEmail: undefined
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
    const base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;

    var idMail = this.props.match.params.idMail
    //var idMail64 = this.props.match.params.idMail;

    if (idMail){
      if (base64regex.test(idMail)){
        idMail = base64.decode(idMail);
      }
        if (idMail.indexOf('@') !== -1 && idMail.indexOf('<') !== -1 && idMail.indexOf('>') !== -1){
          getMessageByInternetMessageId(idMail)
          .then(res => {
            console.log(res);
            const detail = {
              id: idMail,
              subject: res.subject,
              sentDateTime: res.sentDateTime,
              chkselected: true,
              provider: "OUTLOOK",
              account: this.props.lexon.account,
              folder: ""
            };
            window.dispatchEvent(new CustomEvent("Checkclick",  {
              detail
            }));            

            idMail = res.id;
            
            this.setState({
              signInStatus: AUTH_SUCCESS,
              readyToRedirect: true,
              openEmail: res.id
            });
          })
          .catch(err => {
            console.log(err);
          })
      } else {
        this.setState({
          signInStatus: AUTH_SUCCESS,
          readyToRedirect: true,
          openEmail: idMail
        });       
      }
    }
    else {
      this.setState({
        signInStatus: AUTH_SUCCESS,
        readyToRedirect: true,
        openEmail: idMail
      });  
    }    
  }

  renderView() {
    const { signInStatus, openEmail, readyToRedirect } = this.state;

    if (signInStatus === AUTH_SUCCESS && readyToRedirect) {
      return <Main User={this.state.user} idEmail={openEmail} notFoundModal={0} />;
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
        this.props.setAccount(accessToken.account.userName);
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
  setCaseFile: casefile => dispatch(ACTIONS.setCaseFile(casefile)),
  setAccount: account => dispatch(ACTIONS.setAccount(account))
});

export default connect(mapStateToProps, mapDispatchToProps)(AppContainerGraph);
