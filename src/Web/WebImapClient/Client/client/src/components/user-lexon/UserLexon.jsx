import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import { connect } from "react-redux";
import ACTIONS from "../../actions/lexon";
import { clearUserCredentials } from "../../actions/application";
import history from "../../routes/history";
import { PROVIDER } from "../../constants";
import { removeState } from "../../services/state";

class UserLexon extends Component {
  constructor(props) {
    super(props);

    this.state = {
      readyToRedirect: false,
      readyToRedirectToLogin: false,
      isNewAccount: false
    };

    this.isUniqueAccountByProvider = this.isUniqueAccountByProvider.bind(this);
  }

  componentDidMount() {
    const user = this.props.match.params.idUser;
    this.props.setUser(user);

    const casefile = this.props.match.params.idCaseFile;
    const bbdd = this.props.match.params.bbdd;
    const company = this.props.match.params.idCompany;
    this.props.setCaseFile({
      casefile: casefile,
      bbdd: bbdd,
      company: company
    });

    this.setState({ isNewAccount: user.slice(2, 3) === "1" ? true : false });

    // const isNewAccount = user.slice(2, 3) === "1" ? true : false;
    // if (!isNewAccount) {
    //   this.setState({
    //     readyToRedirect: true
    //   });
    // } else {
    //   this.setState({
    //     isNewAccount: true
    //   });
    // }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.lexon !== this.props.lexon) {
      if (this.props.lexon.isNewAccount) {
        removeState();
        this.setState({
          readyToRedirect: true
        });
      } else {
        this.isUniqueAccountByProvider();
      }
    }
  }

  async isUniqueAccountByProvider() {
    const { lexon } = this.props;
    const url = `${window.URL_GET_ACCOUNTS}/${lexon.userId}`;

    const response = await fetch(url, { method: "GET" });
    const result = await response.json();

    if (result.errors.length === 0) {
      const accountsByProvider = result.data.accounts.filter(
        account => account.provider === PROVIDER
      );
      if (accountsByProvider.length > 1) {
        this.setState({
          readyToRedirectToLogin: true
        });
      } else {
        this.setState({
          readyToRedirect: true
        });
      }
    }
  }

  render() {
    const {
      readyToRedirect,
      readyToRedirectToLogin,
      isNewAccount
    } = this.state;
    if (readyToRedirect) {
      return <Redirect to="/" />;
    }

    if (isNewAccount || readyToRedirectToLogin) {
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
  setCaseFile: casefile => dispatch(ACTIONS.setCaseFile(casefile)),
  logout: () => {
    dispatch(clearUserCredentials());
    history.push("/login");
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(UserLexon);
