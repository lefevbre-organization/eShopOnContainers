import React, { Component } from 'react';
import Main from './components/main/Main';
import Login from './components/login/Login';
import Authenticating from './components/authenticating/Authenticating';
import { connect } from 'react-redux';
import 'react-perfect-scrollbar/dist/css/styles.css';
import { signIn, checkSignInStatus } from './api/authentication';
import { mountScripts } from './api/scripts';
import {
  SIGNED_OUT,
  AUTH_SUCCESS,
  AUTH_FAIL,
  AUTH_IN_PROGRESS
} from './constants';
import { getStateStorage } from './localstorage';
import ACTIONS from './actions/lexon';

class AppContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      signInStatus: SIGNED_OUT,
      googleUser: undefined,
      openEmail: undefined
    };

    this.init = this.init.bind(this);
    this.initClient = this.initClient.bind(this);
    this.onSignout = this.onSignout.bind(this);
    this.onSignoutDisconnect = this.onSignoutDisconnect.bind(this);
    this.onSignInSuccess = this.onSignInSuccess.bind(this);
    this.onSignIn = this.onSignIn.bind(this);
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

    if (this.props.match.params.idMail) {
      this.setState({ openEmail: this.props.match.params.idMail });
    } else {
      this.props.location.pathname = '/inbox';
    }
  }

  init() {
    window.gapi.load('client:auth2', this.initClient);
  }

  initClient() {
    checkSignInStatus()
      .then(this.onSignInSuccess)
      .catch(_ => {
        this.setState({
          signInStatus: AUTH_FAIL
        });
      });
  }

  onSignout() {
    this.props.signOut();
  }

  onSignoutDisconnect() {
    this.props.signOutDisconnect();
  }

  onSignIn() {
    signIn().then(this.onSignInSuccess);
  }

  onSignInSuccess(googleUser) {
    this.setState({
      signInStatus: AUTH_SUCCESS,
      googleUser: googleUser,
      openEmail: this.props.match.params.idMail
    });

    this.props.setAccount(googleUser.Rt.Au);
  }

  renderView() {
    const { signInStatus, openEmail } = this.state;

    if (signInStatus === AUTH_SUCCESS) {
      return <Main googleUser={this.state.googleUser} idEmail={openEmail} />;
    } else if (signInStatus === AUTH_IN_PROGRESS) {
      return <Authenticating />;
    } else {
      return <Login lexon={this.props.lexon} onSignIn={this.onSignIn} />;
    }
  }

  render() {
    return <React.Fragment>{this.renderView()}</React.Fragment>;
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

export default connect(mapStateToProps, mapDispatchToProps)(AppContainer);
