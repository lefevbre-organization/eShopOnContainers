import React, { Component } from "react";
import {Redirect} from "react-router-dom";
import { connect } from "react-redux";

import ACTIONS from "../../actions/lexon";

class UserLexon extends Component {
  constructor(props) {
    super(props);

    this.state = {
      readyToRedirect: false
    };
  }

  componentDidMount() {
    this.setState({
      readyToRedirect: true
    });

    const userId = this.props.match.params.id;
    this.props.setUser(userId);
  }

  render() {
    if (this.state.readyToRedirect) {
      return <Redirect to="/" />;
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

export default connect(mapStateToProps, mapDispatchToProps)(UserLexon);
