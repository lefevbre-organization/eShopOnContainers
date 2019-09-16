import React, { Component } from "react";
import i18n from "i18next";

import { config, INBOX_GOOGLE, INBOX_OUTLOOK, INBOX_IMAP } from "../constants";
import { deleteAccountByUserAndProvider } from "../services/user-accounts";

class ProviderInbox extends Component {
  constructor(props) {
    super(props);

    this._handleOnClick = this._handleOnClick.bind(this);
  }

  _handleOnClick(provider) {
    const { removeAccount } = this.props;

    removeAccount(provider);
    
    // const url = `${config.api.DELETACCOUNTBYUSERANDPROVIDER}/${userId}/${provider}`;
    // fetch(url, {
    //   method: "GET"
    // })
    //   .then(data => {
    //     // this.props.getAccounts();
    //   })
    //   .then(data1 => {
    //     alert("Cuenta Borrada");
    //   })
    //   .catch(error => {
    //     console.log("error ->", error);
    //   });
  }

  getUser() {
    const { userId, provider, email } = this.props;
    switch (provider) {
      case INBOX_GOOGLE:
        if (email !== undefined && email !== "") {
          return `GO0${userId}`;
        }
        return `GO1${userId}`;
      case INBOX_OUTLOOK:
        if (email !== undefined && email !== "") {
          return `OU0${userId}`;
        }
        return `OU1${userId}`;
      case INBOX_IMAP:
        if (email !== undefined && email !== "") {
          return `IM0${userId}`;
        }
        return `IM1${userId}`;

      default:
        return null;
    }
  }

  getTrash(provider) {    
    const { email } = this.props;
    if (email != null && email !== undefined) {
      return (
        <React.Fragment>
          <a href="#" className="trash" onClick={() => this._handleOnClick(provider)}>
            <span className="icon lf-icon-trash"></span>
          </a>
        </React.Fragment>
      );
    } else {
      return null;
    }
  }

  render() {
    const { provider, email } = this.props;
    const user = this.getUser();

    let title;
    switch (provider) {
      case INBOX_GOOGLE:
        email != null && email !== undefined
          ? (title = email)
          : (title = "Google");

        return (
          <React.Fragment>
            <a
              href={config.url.URL_INBOX_GOOGLE + "/user/" + user}
              className="d-flex align-items-center"
            >
              <span>
                <img src="/assets/imgs/logoGoogle.png" alt={provider} />
              </span>
              <span>{title}</span>
            </a>
            {this.getTrash(INBOX_GOOGLE)}
          </React.Fragment>
        );
      case INBOX_OUTLOOK:
        email != null && email !== undefined
          ? (title = email)
          : (title = "Microsoft  (Exchange, Outlook, Office 365)");

        return (
          <React.Fragment>
            <a
              href={config.url.URL_INBOX_OUTLOOK + "/user/" + user}
              className="d-flex align-items-center"
            >
              <span>
                <img src="/assets/imgs/logoMicrosoft.png" alt={provider} />
              </span>
              <span>{title}</span>
            </a>
            {this.getTrash(INBOX_OUTLOOK)}
          </React.Fragment>
        );
      case INBOX_IMAP:
        email != null && email !== undefined
          ? (title = email)
          : (title = i18n.t("page-goto.other-server-mail"));

        return (
          <React.Fragment>
            <a
              href={config.url.URL_INBOX_IMAP + "/user/" + user}
              className="d-flex align-items-center"
            >
              <span className="lf-icon-mail"></span>
              <span>{title}</span>
            </a>
            {this.getTrash(INBOX_IMAP)}
          </React.Fragment>
        );

      default:
        return null;
    }
  }
}

export default ProviderInbox;
