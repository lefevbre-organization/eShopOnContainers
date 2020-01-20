import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import { connect } from "react-redux";
import { UserAgentApplication } from "msal";
import ACTIONS from "../../actions/lexon";
import { signOut } from "../../api_graph/authentication";
import configAuth from "../../Config";
import { PROVIDER } from "../../constants";

class UserLexon extends Component {
  constructor(props) {
    super(props);

    this.state = {
      readyToRedirect: false
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

    // const isNewAccount = user.slice(2, 3) === "1" ? true : false;
    // this.checkIsAuthenticated();
    // if (isNewAccount) {
    //   this.setState({
    //     readyToRedirect: true
    //   });

    //   if (this.checkIsAuthenticated()) {
    //     this.onSignout();
    //   }
    // } else {
    //   this.setState({
    //     readyToRedirect: true
    //   });
    // }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.lexon !== this.props.lexon) {
      if (this.props.lexon.isNewAccount) {
        this.setState({
          readyToRedirect: true
        });

        if (this.checkIsAuthenticated()) {
          this.onSignout();
        }
      } else {
        this.isUniqueAccountByProvider();
      }
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

  isUniqueAccountByProvider = async () => {
    const { lexon } = this.props;
    const url = `${window.URL_GET_ACCOUNTS}/${lexon.userId}`;

    const response = await fetch(url, { method: "GET" });
    const result = await response.json();

    if (result.errors.length === 0) {
      const accountsByProvider = result.data.accounts.filter(
        account => account.provider === PROVIDER
      );
      if (accountsByProvider.length > 1) {
        if (this.checkIsAuthenticated()) {
         // this.onSignout();
        }
      }
      this.setState({
        readyToRedirect: true
      });
    }
  };

  onSignout() {
    const user = this.props.match.params.idUser;
    const urlRedirect = `${window.URL_MF_OUTLOOK}/${user}`;
    signOut(urlRedirect);
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

export default connect(mapStateToProps, mapDispatchToProps)(UserLexon);
