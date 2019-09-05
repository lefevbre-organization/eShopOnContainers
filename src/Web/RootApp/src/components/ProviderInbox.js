import React, { Component } from "react";
import i18n from "i18next";

import { config, INBOX_GOOGLE, INBOX_OUTLOOK, INBOX_IMAP } from "../constants";

class ProviderInbox extends Component {

  getUser() {
    const { userId, provider, email } = this.props;
    switch (provider) {
      case INBOX_GOOGLE:
        if (email !== undefined && email !== '') {
          return `GO0${userId}`;
        }
        return `GO1${userId}`;
      case INBOX_OUTLOOK:
          if (email !== undefined && email !== '') {
            return `OU0${userId}`;
          }
          return `OU1${userId}`;  
      case INBOX_IMAP:
          if (email !== undefined && email !== '') {
            return `IM0${userId}`;
          }
          return `IM1${userId}`;  
      
      default:
        return null;
    }
  }

  render() {
    const { provider, email } = this.props;
    let user = this.getUser();

    let title;
    switch (provider) {
      case INBOX_GOOGLE:
        email != null && email !== undefined
          ? (title = email)
          : (title = "Google");

        return (
          <a
            href={config.url.URL_INBOX_GOOGLE + "/user/" + user}
            className="d-flex align-items-center"
          >
            <span>
              <img src="/assets/imgs/logoGoogle.png" alt={provider} />
            </span>
            <span>{title}</span>
          </a>
        );
      case INBOX_OUTLOOK:
        email != null && email !== undefined
          ? (title = email)
          : (title = "Microsoft  (Exchange, Outlook, Office 365)");

        return (
          <a
            href={config.url.URL_INBOX_OUTLOOK + "/user/" + user}
            className="d-flex align-items-center"
          >
            <span>
              <img src="/assets/imgs/logoMicrosoft.png" alt={provider} />
            </span>
            <span>{title}</span>
          </a>
        );
      case INBOX_IMAP:
        email != null && email !== undefined
          ? (title = email)
          : (title = i18n.t("page-goto.other-server-mail"));

        return (
          <a
            href={config.url.URL_INBOX_IMAP + "/user/" + user}
            className="d-flex align-items-center"
          >
            <span className="lf-icon-mail"></span>
            <span>{title}</span>
          </a>
        );

      default:
        return null;
    }
  }
}

export default ProviderInbox;
