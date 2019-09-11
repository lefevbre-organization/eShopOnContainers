import React, { Component } from "react";
import i18n from "i18next";

import ProviderInbox from "./ProviderInbox";
import Accounts from "./Accounts";

import { INBOX_GOOGLE, INBOX_OUTLOOK, INBOX_IMAP } from "../constants";

class GoTo extends Component {

  renderAddAccount(provider) {
    const { userId, accounts } = this.props;

    if (!accounts.some(account => account.provider === provider)) {
      return (
        <li>
          <ProviderInbox userId={userId} provider={provider} />
        </li>
      );
    } else {
      return null;
    }
  }

  render() {
    const { userId } = this.props;
    return (
      <aside className="row mt-5 mb-5">
        <div className="container">
          <div className="row">
            <div className="col d-flex justify-content-center">
              <div className="col form-box p-md-5 p-3">
                <div className="row logo text-center">
                  <div className="col">
                    <span className="naming">{i18n.t("page-goto.mail")}</span>
                    <span className="mb-5">
                      {i18n.t("page-goto.my-accounts")}
                    </span>
                  </div>
                </div>
                <div className="row">
                  <div className="col">
                    <Accounts userId={userId} accounts={this.props.accounts} />
                  </div>
                </div>
                <br></br>
                <br></br>
                <br></br>
                <div className="row logo text-center">
                  <div className="col">
                    <span className="mb-5">
                      {i18n.t("page-goto.add-account-mail")}
                    </span>
                  </div>
                </div>
                <div className="row">
                  <div className="col">
                    <ul>
                      <li><ProviderInbox userId={userId} provider={INBOX_GOOGLE} /></li>
                      <li><ProviderInbox userId={userId} provider={INBOX_OUTLOOK} /></li>
                      <li><ProviderInbox userId={userId} provider={INBOX_IMAP} /></li>
                      {/* {this.renderAddAccount(INBOX_GOOGLE)}
                      {this.renderAddAccount(INBOX_OUTLOOK)}
                      {this.renderAddAccount(INBOX_IMAP)} */}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    );
  }

}

export default GoTo;
