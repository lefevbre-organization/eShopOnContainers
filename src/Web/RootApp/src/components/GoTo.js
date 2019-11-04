import React, { Component } from "react";
import i18n from "i18next";
import ProviderInbox from "./ProviderInbox";
import Accounts from "./Accounts";
import PerfectScrollbar from "react-perfect-scrollbar";
import "react-perfect-scrollbar/dist/css/styles.css";
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
              <div className="form-box p-0">
                <div className="px-md-5 pt-md-4 px-3 pt-3 pb-0 w-100">
                  <div className="row logo text-center">
                    <div className="col">
                      <span className="naming">{i18n.t("page-goto.mail")}</span>
                      <span className="mb-3">
                        {i18n.t("page-goto.add-account-mail")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="associated-accounts px-md-5 py-md-3 px-3 py-2 w-100">
                  <strong className="asociadas">
                    {i18n.t("page-goto.my-accounts")}
                  </strong>

                  <PerfectScrollbar>
                    <ul className="mb-0">
                      <Accounts
                        userId={userId}
                        accounts={this.props.accounts}
                        removeAccount={this.props.removeAccount}
                        toggleConfirmRemoveAccount={
                          this.props.toggleConfirmRemoveAccount
                        }
                      />
                    </ul>
                  </PerfectScrollbar>
                </div>

                <div className="px-md-5 pb-md-4 px-3 pb-3 pt-0 w-100">
                  <div className="row">
                    <div className="col">
                      <strong className="add-accounts">
                        {i18n.t("page-goto.add-account-mail")}
                      </strong>
                    </div>
                  </div>

                  <ul>
                    <li>
                      <ProviderInbox userId={userId} provider={INBOX_GOOGLE} />
                    </li>
                    <li>
                      <ProviderInbox userId={userId} provider={INBOX_OUTLOOK} />
                    </li>
                    <li>
                      <ProviderInbox userId={userId} provider={INBOX_IMAP} />
                    </li>
                  </ul>
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
