import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import Main from "./components/main/Main";
import Login from "./components/login/Login";
import Authenticating from "./components/authenticating/Authenticating";
import 'react-perfect-scrollbar/dist/css/styles.css';

import { bindActionCreators, compose } from "redux";
import { connect } from "react-redux";

import { signIn, checkSignInStatus } from "./api/authentication";
import { mountScripts } from "./api/scripts";

import {
  SIGNED_OUT,
  AUTH_SUCCESS,
  AUTH_FAIL,
  AUTH_IN_PROGRESS,
  PROVIDER
} from "./constants";

import { config as constants } from "./constants";

import { storeUser } from "./actions/settings.actions";

export class AppContainer extends Component {

  constructor(props) {
    super(props);

    this.state = {
      signInStatus: SIGNED_OUT,
      googleUser: undefined,
      updateDefaultAccount: false,
      fetchUpdateDefaultAccount: false,
      userIdisNull: false
    }

    this.init = this.init.bind(this);
    this.initClient = this.initClient.bind(this);
    this.onSignout = this.onSignout.bind(this);
    this.onSignInSuccess = this.onSignInSuccess.bind(this);
    this.onSignIn = this.onSignIn.bind(this);
  }

  componentDidMount() {
    mountScripts().then(this.init);

    this.props.location.pathname = '/inbox';
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
      })
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

    if (!this.state.updateDefaultAccount) {
      const userId = this.props.match.params.id;
      const email = googleUser.w3.U3;
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
      return <Main googleUser={this.state.googleUser} />;
    } else if (signInStatus === AUTH_IN_PROGRESS) {
      return <Authenticating />;
    } else {
      return <Login onSignIn={this.onSignIn} />;
    }
  }

  render() {
    
    if (!this.state.fetchUpdateDefaultAccount && this.state.userIdisNull) {
      return null;
    }

    return (
      <React.Fragment>
        {this.renderView()}       
      </React.Fragment>

      // <React.Fragment>        
      //   {this.props.location.pathname === "/" ? (
      //     <Redirect to="/inbox" />
      //   ) : (
      //     this.renderView()
      //   )}
      // </React.Fragment>
    );
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
)(AppContainer);

//export default withRouter(AppContainer);
