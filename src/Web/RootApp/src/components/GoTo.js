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
              <div className="col form-box w-100">

                <div className="row logo text-center p-md-5 p-3">
                  <div className="col">
                    <span className="naming">{i18n.t("page-goto.mail")}</span>
                  </div>
                </div>

                <Accounts
                  userId={userId}
                  accounts={this.props.accounts}
                  removeAccount={this.props.removeAccount}
                  toggleConfirmRemoveAccount={
                    this.props.toggleConfirmRemoveAccount
                  }
                />

                <div className="row logo text-center p-md-5 p-3">
                  <div className="col">                
                    <span className="">
                      {i18n.t("page-goto.add-account-mail")}
                    </span>
                  </div>
                </div>

                <div className="row content px-md-5 px-3">
                  <div className="col">
                    <ul>
                      <li>
                        <ProviderInbox
                          userId={userId}
                          provider={INBOX_GOOGLE}
                        />
                      </li>
                      <li>
                        <ProviderInbox
                          userId={userId}
                          provider={INBOX_OUTLOOK}
                        />
                      </li>
                      <li>
                        <ProviderInbox userId={userId} provider={INBOX_IMAP} />
                      </li>
                    </ul>
                  </div>
                </div>

                {/* <Accounts
                  userId={userId}
                  accounts={this.props.accounts}
                  removeAccount={this.props.removeAccount}
                  toggleConfirmRemoveAccount={
                    this.props.toggleConfirmRemoveAccount
                  }
                /> */}
              </div>
            </div>
          </div>
        </div>
      </aside>
    );
  }
}

export default GoTo;
