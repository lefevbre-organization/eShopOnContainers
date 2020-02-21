import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import { connect } from "react-redux";
import ACTIONS from "../../actions/lexon";
import { mountScripts } from "../../api/scripts";
import { checkSignInStatus, signOut, signOutDisconnect } from "../../api/authentication";
import { getUser } from "../../api/accounts";
import { PROVIDER } from "../../constants";

class UserLexon extends Component {
  constructor(props) {
    super(props);

    this.state = {
      readyToRedirect: false,
      redirectToEmail: this.props.match.params.idMail,
    };

    this.init = this.init.bind(this);
    this.initClient = this.initClient.bind(this);
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
  }

  componentDidUpdate(prevProps) {
    if (prevProps.lexon !== this.props.lexon) {
      if (this.props.lexon.isNewAccount) {
        mountScripts().then(this.init);
      } else {
        this.isUniqueAccountByProvider();
      }
    }
  }

  isUniqueAccountByProvider = async () => {
    const { lexon } = this.props;

    try {
      const result = await getUser(lexon.userId);

      if (result.errors.length === 0) {
        const accountsByProvider = result.data.accounts.filter(
          account => account.provider.toUpperCase() === PROVIDER
        );
        if (accountsByProvider.length > 1) {
          mountScripts().then(this.init);
        } else {
          this.setState({
            readyToRedirect: true
          });
        }
      }
    } catch(err) {
      throw err;
    }
  };

  init() {
    window.gapi.load("client:auth2", this.initClient);
  }

  initClient() {
    checkSignInStatus()
      .then(_ => {
          //this.onSignout();
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

  onSignoutDisconnect() {
        signOutDisconnect();
  }

  render() {
    const { readyToRedirect, redirectToEmail } = this.state;
    if (readyToRedirect) {
      if (redirectToEmail === undefined){
        return <Redirect to="/" />;
      }else{
        return <Redirect to={`/viewMail/${this.props.match.params.idMail}`}/>;      
      }
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
});

export default connect(mapStateToProps, mapDispatchToProps)(UserLexon);
