import React, { Component } from "react";
import "./PageGoTo.css";
import GoTo from "../components/GoTo";
import Footer from "../components/footer/Footer";
import ConfirmRemoveAccount from "../components/confirm-remove-account/ConfirmRemoveAccount";
import { UserNotFound } from "../components/user-not-found/UserNotFound";
import Spinner from "../components/spinner/spinner";
import ReactNotification, { store } from 'react-notifications-component';
import 'react-notifications-component/dist/theme.css';

import {
  getAccounts,
  deleteAccountByUserAndEmail
} from "../services/user-accounts";

import { config, INBOX_GOOGLE, INBOX_OUTLOOK, INBOX_IMAP } from "../constants";
import { Alert } from "react-bootstrap";

export class PageGoTo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      accounts: [],
      userId: null,
      redirect: false,
      showConfirmRemoveAccount: false,
      emailRemoved: null
    };
    this.toggleConfirmRemoveAccount = this.toggleConfirmRemoveAccount.bind(
      this
    );
  }

  componentDidMount() {
    this.getAccounts();
  }

  parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    //verifyTokenSignature --> to be implemented
    console.log(JSON.parse(jsonPayload));
    return JSON.parse(jsonPayload);
  }

  getUserIdJwt(token){
    return(token.hasOwnProperty('idClienteNavision') ? token.idClienteNavision : (token.hasOwnProperty('idLexonUser')) ? token.idLexonUser : (token.hasOwnProperty('nameUser')) ? token.nameUser : "");
  }

  tokenExpired(token){
    return (token.exp < Math.floor(Date.now() / 1000)) ? true : false;
  }

  async getAccounts() {
    var userId = this.props.match.params.userId;
    const encrypt = this.props.match.params.encrypt;
    
    if (!(/^E[0-9]*/g.test(userId)))
    {
      const token = this.parseJwt(this.props.match.params.userId);
      if (this.tokenExpired(token))
      {
        console.log("TOKEN EXPIRADO -> SE RENUEVA TOKEN AUTOMÁTICAMENTE");
      }
      userId = this.getUserIdJwt(token);
    }
    
    getAccounts(userId, encrypt)
      .then(data => {
        this.setState({ loading: false });

        if (data.user === undefined || data.user === null) {
          this.setState({ redirect: true });
        } else {
          this.setState({ userId: data.user.ID_ENTRADA });
          this.setState({ accounts: data.accounts });
          this.setState({ redirect: false });

          if (data.accounts.length !== 0) {
            const account = data.accounts[0];
            /*
            if (account.defaultAccount) {
              switch (account.provider) {
                case INBOX_GOOGLE:
                  window.open(
                    `${window.URL_INBOX_GOOGLE}/user/GO0${this.state.userId}`,
                    "_self"
                  );
                  break;
                case INBOX_OUTLOOK:
                  window.open(
                    `${window.URL_INBOX_OUTLOOK}/user/OU0${this.state.userId}`,
                    "_self"
                  );
                  break;
                case INBOX_IMAP:
                  window.open(
                    `${window.URL_INBOX_IMAP}/user/IM0${this.state.userId}`,
                    "_self"
                  );
                  break;

                default:
                  console.log("Valor no válido");
                  break;
              }
            }*/
          }
        }
      })
      .catch(error => {
        console.log(error);
        store.addNotification({
          message: error,
          type: "danger",
          container: "bottom-center",
          animationIn: ["animated", "fadeIn"],
          animationOut: ["animated", "fadeOut"],
          dismiss: {
            duration: 5000,
            showIcon: true
          },
          width: 600
        });
      });
  }

  removeAccount = email => {
    const userId = this.props.match.params.userId;
    const encrypt = this.props.match.params.encrypt;

    deleteAccountByUserAndEmail(encrypt, userId, email)
      .then(result => {
        if (result.data > 0) {
          this.getAccounts();
        } else {
          const error = `Ha ocurrido un error cuando se borraba: userId -> ${userId}, email -> ${email}`;
          store.addNotification({
            message: error,
            type: "warning",
            container: "bottom-center",
            animationIn: ["animated", "fadeIn"],
            animationOut: ["animated", "fadeOut"],
            dismiss: {
              duration: 5000,
              showIcon: true
            },
            width: 600
          });
          
          console.log(error);
        }
      })
      .catch(error => {
        store.addNotification({
          message: error,
          type: "danger",
          container: "bottom-center",
          animationIn: ["animated", "fadeIn"],
          animationOut: ["animated", "fadeOut"],
          dismiss: {
            duration: 5000,
            showIcon: true
          },
          width: 600
        });

        console.log("error =>", error);
      });
  };

  toggleConfirmRemoveAccount(remove, email) {
    this.setState(state => ({
      showConfirmRemoveAccount: !state.showConfirmRemoveAccount,
      emailRemoved: email
    }));

    if (remove === true && email !== undefined) {
      this.removeAccount(email);
    }
  }

  renderSpinner() {
    const { loading } = this.state;

    if (loading) {
      return <Spinner />;
    }
  }

  renderGoTo() {
    const { loading, userId, accounts } = this.state;

    if (!loading) {
      return (
        <GoTo
          userId={userId}
          accounts={accounts}
          removeAccount={this.removeAccount}
          toggleConfirmRemoveAccount={this.toggleConfirmRemoveAccount}
        />
      );
    }
  }

  renderFooter() {
    const { loading } = this.state;

    if (!loading) {
      return <Footer />;
    }
  }

  render() {
    const { redirect, showConfirmRemoveAccount, emailRemoved } = this.state;

    if (redirect) {
      return <UserNotFound />;
    }

    return (
      <React.Fragment>
        <ReactNotification />
        <ConfirmRemoveAccount
          initialModalState={showConfirmRemoveAccount}
          toggleConfirmRemoveAccount={this.toggleConfirmRemoveAccount}
          email={emailRemoved}
        />
        <div>
          {this.renderSpinner()}
          <div className="container-fluid d-flex h-100 flex-column" id="borrar">
            {this.renderGoTo()}
            {this.renderFooter()}
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default PageGoTo;