import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import { connect } from "react-redux";

import ACTIONS from "../../actions/lexon";
import { mountScripts } from "../../api/scripts";
import { checkSignInStatus, signOut } from "../../api/authentication";

class UserLexon extends Component {
  constructor(props) {
    super(props);

    this.state = {
      readyToRedirect: false
    };
  }

  componentDidMount() {
    const user = this.props.match.params.idUser;
    this.props.setUser(user);
    const casefile = this.props.match.params.idCaseFile;
    this.props.setCaseFile(casefile);    

    const isNewAccount = user.slice(2, 3) === "1" ? true : false;
    if (isNewAccount) {
      mountScripts().then(this.init);
    } else {
      this.setState({
        readyToRedirect: true
      });
    }
  }

  init() {
    window.gapi.load("client:auth2", this.initClient);
  }

  initClient() {
    checkSignInStatus()
      .then(_ => {
        this.onSignout();
        this.setState({
          readyToRedirect: true
        });
      })
      .catch(error => {
        if (error === undefined) {
          this.setState({
            readyToRedirect: true
          });
        }
      });
  }

  onSignout() {
    signOut();
  }

  render() {
    const { readyToRedirect } = this.state;
    if (readyToRedirect) {
      return <Redirect to="/" />;
    }

    return null;
  }
}

const mapStateToProps = state => ({
  lexon: state.lexon
});

const mapDispatchToProps = dispatch => ({
  setUser: user => dispatch(ACTIONS.setUser(user)),
  setCaseFile: casefile => dispatch(ACTIONS.setCaseFile(casefile))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UserLexon);
