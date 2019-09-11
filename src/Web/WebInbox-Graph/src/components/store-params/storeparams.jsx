import React, { Component } from "react";
import { Route, Redirect, withRouter, Switch  } from "react-router-dom";
import { bindActionCreators, compose } from "redux";
import { connect } from "react-redux";
import { signOut } from "../../api_graph/authentication";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import AppContainer from "../../AppContainer-graph";
import { storeUser } from "../../actions/settings.actions";
import {UserNotFound} from '../../components/user-not-found/UserNotFound';
import { PROVIDER, config as constants } from "../../constants";

class StoreParams extends Component {

  constructor(props) {
    super(props);

    this.state = {
      user: this.props.match.params.id,
      userId: '',
      provider: '',
      newAccount: false
    };
  }

  componentDidMount() {
    const user = this.props.match.params.id;
    if (user !== undefined && user !== '') {
      const provider = user.slice(0, 3);
      if (provider === 'GOO' ||
          provider === 'OUT' ||
          provider === 'IMA') {
            this.props.storeUser(user);
            this.canSignout(user);
        }
    }
  }

  canSignout(user) {
    const userId = user.slice(4);
    const provider = user.slice(0, 3);    
    const newAccount = (user.slice(3, 4) === '0') ? false : true;

    this.setState({ 
      userId: userId,
      provider: provider,
      newAccount: newAccount
    });

    if (userId !== '') {
        const url = `${constants.url.URL_GET_ACCOUNTS_BY_USER}/${userId}`;
        fetch(url, {
            method:'GET',
        })
        .then(r => r.json())
        .then(accounts => {
          const exists = accounts.some(account => (account.provider === PROVIDER));
          if (newAccount && provider === 'OUT' && exists) {
            signOut();

            const url = `${constants.url.URL_DELETE_ACCOUNT_BY_PROVIDER}`;
            fetch(url, {
                method:'POST',
                body: JSON.stringify({
                    user: userId,
                    provider: PROVIDER,
                }),
                headers: { 'Content-type': 'application/json' }
            })
            .then(r => r.json())
            .then(result => {
                console.log(result);
            });                                
          }
      });
    }
  } 

  renderSpinner() {
    return (
      <React.Fragment>
        <div className="d-flex h-100 align-items-center justify-content-center">
          <FontAwesomeIcon icon={faSpinner} spin size="3x" />
        </div>
      </React.Fragment>
    )
  }

  render() {
    if (this.state.user != null && this.state.user !== undefined && this.state.user !== '') {
      if (this.state.userId !== '')
      {
        return (
          <React.Fragment>
            <Redirect to="/" />
            <Switch>
              <Route component={AppContainer} />
              {/* <Route render={(props) => <AppContainer {...props} userId={this.state.userId} provider={this.state.provider} newAccount={this.state.newAccount}/>} /> */}
            </Switch>
          </React.Fragment>
        );
      } else {
        // return <UserNotFound />;
      }    
    } else {
      return (
        <React.Fragment>
          <Redirect to="/" />
          <Switch>
            <Route component={AppContainer} />
          </Switch>
        </React.Fragment>
      );
    }
  }   
}

const mapStateToProps = (state) => {
  return {
      userId: state.storeUser.userId,
      provider: state.storeUser.provider,
      newAccount: state.storeUser.newAccount
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
)(StoreParams);
