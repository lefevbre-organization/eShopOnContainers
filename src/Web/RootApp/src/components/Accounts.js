import React, { Component } from "react";
import ProviderInbox from "./ProviderInbox";
import i18n from "i18next";

class Accounts extends Component {
  renderWithOutAccounts() {
    if (this.props.accounts == null || this.props.accounts.length === 0) {
      return <span>{i18n.t("accounts.nothing-user-email-added")}</span>;
    }
  }

  render() {
    const { userId, accounts } = this.props;

    if (!Array.isArray(accounts) || accounts.length === 0) {
      return null;
    }

    return (
      <div className="row content bg-grey">
        <div className="col-12 mt-2">
          <span className="asociadas"> {i18n.t("page-goto.my-accounts")}</span>
        </div>
        <div className="col-12 p-0">
          <ul>
            {accounts.map(el => {
              return (
                <li key={el.provider}>
                  <ProviderInbox
                    userId={userId}
                    provider={el.provider}
                    email={el.email}
                    removeAccount={this.props.removeAccount}
                  />
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    );
  }
}

export default Accounts;
