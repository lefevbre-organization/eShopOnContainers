import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import { connect } from "react-redux";
import { UserAgentApplication } from "msal";

import ACTIONS from "../../actions/lexon";
import { signOut } from "../../api_graph/authentication";
import configAuth from "../../Config";

class UserLexon extends Component {
  constructor(props) {
    super(props);

    this.state = {
      readyToRedirect: false
    };
  }

  componentDidMount() {
    const user = this.props.match.params.id;
    this.props.setUser(user);

    const isNewAccount = user.slice(2, 3) === "1" ? true : false;
    this.checkIsAuthenticated();
    if (isNewAccount) {
      this.setState({
        readyToRedirect: true
      });

      if (this.checkIsAuthenticated()) {
        this.onSignout();
      }
    } else {
      this.setState({
        readyToRedirect: true
      });
    }
  }

  checkIsAuthenticated() {
    var userAgentApplication = new UserAgentApplication(
      configAuth.appId,
      null,
      null
    );

    var user = userAgentApplication.getUser();
    return user === null ? false : true;
  }

  onSignout() {
    const user = this.props.match.params.id;
    const urlRedirect = `${window.URL_MF_OUTLOOK}/user/${user}`;
    signOut(urlRedirect);
  }

  render() {
    const { readyToRedirect } = this.state;
    if (readyToRedirect) {
      return <Redirect to='/' />;
    }

    return null;
  }
}

const mapStateToProps = state => ({
  lexon: state.lexon
});

const mapDispatchToProps = dispatch => ({
  setUser: user => dispatch(ACTIONS.setUser(user))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UserLexon);
