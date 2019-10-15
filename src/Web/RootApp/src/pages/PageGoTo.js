import React, { Component } from "react";
// import Spinner from "react-bootstrap/Spinner";
import "./PageGoTo.css";

import GoTo from "../components/GoTo";
import Footer from "../components/footer/Footer";
import ConfirmRemoveAccount from "../components/confirm-remove-account/ConfirmRemoveAccount";
import { UserNotFound } from "../components/user-not-found/UserNotFound";
import Spinner from "../components/spinner/spinner";

import {
  getAccounts,
  deleteAccountByUserAndEmail
} from "../services/user-accounts";

import { config, INBOX_GOOGLE, INBOX_OUTLOOK, INBOX_IMAP } from "../constants";

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

  async getAccounts() {
    const userId = this.props.match.params.userId;
    const encrypt = this.props.match.params.encrypt;

    getAccounts(userId, encrypt)
      .then(data => {
        this.setState({ loading: false });

        if (data.user === undefined || data.user === null) {
          this.setState({ redirect: true });
        } else {
          console.log("data ->", data);
          this.setState({ userId: data.user.ID_ENTRADA });
          this.setState({ accounts: data.accounts });
          this.setState({ redirect: false });

          if (data.accounts.length !== 0) {
            const account = data.accounts[0];
            if (account.defaultAccount) {
              switch (account.provider) {
                case INBOX_GOOGLE:
                  window.open(
                    `${config.url.URL_INBOX_GOOGLE}/user/GO0${this.state.userId}`,
                    "_self"
                  );
                  break;
                case INBOX_OUTLOOK:
                  window.open(
                    `${config.url.URL_INBOX_OUTLOOK}/user/OU0${this.state.userId}`,
                    "_self"
                  );
                  break;
                case INBOX_IMAP:
                  window.open(
                    `${config.url.URL_INBOX_IMAP}/user/IM0${this.state.userId}`,
                    "_self"
                  );
                  break;

                default:
                  console.log("Valor no válido");
                  break;
              }
            }
          }
        }
      })
      .catch(error => {
        console.log(error);
      });
  }

  removeAccount = email => {
    const userId = this.props.match.params.userId;
    const encrypt = this.props.match.params.encrypt;

    deleteAccountByUserAndEmail(encrypt, userId, email)
      .then(result => {
        if (result === "OK") {
          this.getAccounts();
        } else {
          const error = `Ha ocurrido un error cuando se borraba: userId -> ${userId}, provider -> ${email}`;
          console.log(error);
        }
      })
      .catch(error => {
        console.log("error =>", error);
      });
  };

  toggleConfirmRemoveAccount(remove, email) {
    this.setState(state => ({
      showConfirmRemoveAccount: !state.showConfirmRemoveAccount,
      emailRemoved: email
    }));

    // console.log(`remove -> ${remove}, email -> ${email}`);

    if (remove === true && email !== undefined) {
      this.removeAccount(email);
    }
  }

  renderSpinner() {
    const { loading } = this.state;

    if (loading) {
      return <Spinner />;
      // <Spinner animation="border" role="status" className="center">
      //   <span className="sr-only">Loading...</span>
      // </Spinner>
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
