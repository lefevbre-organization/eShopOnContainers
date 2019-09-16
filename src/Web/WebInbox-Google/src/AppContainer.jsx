import React, { Component } from "react";
import Main from "./components/main/Main";
import Login from "./components/login/Login";
import Authenticating from "./components/authenticating/Authenticating";
import { connect } from "react-redux";
import "react-perfect-scrollbar/dist/css/styles.css";
import { signIn, checkSignInStatus } from "./api/authentication";
import { mountScripts } from "./api/scripts";
import {
  SIGNED_OUT,
  AUTH_SUCCESS,
  AUTH_FAIL,
  AUTH_IN_PROGRESS
} from "./constants";

class AppContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      signInStatus: SIGNED_OUT,
      googleUser: undefined
    };

    this.init = this.init.bind(this);
    this.initClient = this.initClient.bind(this);
    this.onSignout = this.onSignout.bind(this);
    this.onSignInSuccess = this.onSignInSuccess.bind(this);
    this.onSignIn = this.onSignIn.bind(this);
  }

  componentDidMount() {
    const { isNewAccount } = this.props.lexon;
    if (!isNewAccount) {
      mountScripts().then(this.init);
    }

    this.props.location.pathname = "/inbox";
  }

  init() {
    window.gapi.load("client:auth2", this.initClient);
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

  onSignIn() {
    signIn().then(this.onSignInSuccess);
  }

  onSignInSuccess(googleUser) {
    this.setState({
      signInStatus: AUTH_SUCCESS,
      googleUser
    });
  }

  renderView() {
    const { signInStatus } = this.state;

    if (signInStatus === AUTH_SUCCESS) {
      return <Main googleUser={this.state.googleUser} />;
    } else if (signInStatus === AUTH_IN_PROGRESS) {
      return <Authenticating />;
    } else {
      return <Login onSignIn={this.onSignIn} />;
    }
  }

  render() {
    return <React.Fragment>{this.renderView()}</React.Fragment>;
  }
}

const mapStateToProps = state => ({
  lexon: state.lexon
});

export default connect(mapStateToProps)(AppContainer);

// export default withRouter(AppContainer);
