import React, { Component } from "react";
import Spinner from "react-bootstrap/Spinner";
import "./PageGoTo.css";

import GoTo from "../components/GoTo";
import Footer from "../components/footer/Footer";
import { UserNotFound } from "../components/user-not-found/UserNotFound";

import { getAccounts } from "../services/user-accounts";

import { config, INBOX_GOOGLE, INBOX_OUTLOOK, INBOX_IMAP } from "../constants";

export class PageGoTo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      accounts: [],
      userId: null,
      redirect: false
    };
  }

  async componentDidMount() {
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
            if (account.defaultAccount)  {
                switch (account.provider) {
                    case INBOX_GOOGLE:
                            window.open(`${config.url.URL_INBOX_GOOGLE}/user/GO0${this.state.userId}`, '_self');
                            break;
                        case INBOX_OUTLOOK:
                            window.open(`${config.url.URL_INBOX_OUTLOOK}/user/OU0${this.state.userId}`, '_self');
                            break;
                        case INBOX_IMAP:
                            window.open(`${config.url.URL_INBOX_IMAP}/user/IM0${this.state.userId}`, '_self');
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

  renderSpinner() {
    const { loading } = this.state;

    if (loading) {
      return (
        <Spinner animation="border" role="status" className="center">
          <span className="sr-only">Loading...</span>
        </Spinner>
      );
    }
  }

  renderGoTo() {
    const { loading, userId, accounts } = this.state;

    if (!loading) {
      return <GoTo userId={userId} accounts={accounts} />;
    }
  }

  renderFooter() {
    const { loading } = this.state;

    if (!loading) {
      return <Footer />;
    }
  }

  render() {
    const { redirect } = this.state;

    if (redirect) {
      return <UserNotFound />;
    }

    return (
      <div>
        {this.renderSpinner()}
        <div className="container-fluid d-flex h-100 flex-column" id="borrar">
          {this.renderGoTo()}
          {this.renderFooter()}
        </div>
      </div>
    );
  }
}

export default PageGoTo;
