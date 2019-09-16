import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import { connect } from "react-redux";

import ACTIONS from "../../actions/lexon";
import { clearUserCredentials } from "../../actions/application";
import history from "../../routes/history";

class UserLexon extends Component {
  constructor(props) {
    super(props);

    this.state = {
      readyToRedirect: false,
      isNewAccount: false
    };
  }

  componentDidMount() {
    const user = this.props.match.params.id;
    this.props.setUser(user);

    const isNewAccount = user.slice(2, 3) === "1" ? true : false;
    if (!isNewAccount) {
      this.setState({
        readyToRedirect: true
      });
    } else {
      this.setState({
        isNewAccount: true
      });
    }
  }

  render() {
    const { readyToRedirect, isNewAccount } = this.state;
    if (readyToRedirect) {
      return <Redirect to="/" />;
    }

    if (isNewAccount) {
      this.props.logout();
      return <Redirect to="/login" />;
    }

    return null;
  }
}

const mapStateToProps = state => ({
  lexon: state.lexon
});

const mapDispatchToProps = dispatch => ({
  setUser: user => dispatch(ACTIONS.setUser(user)),
  logout: () => {
    dispatch(clearUserCredentials());
    history.push("/login");
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UserLexon);
