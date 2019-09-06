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
    const { userId } = this.props;
    return (
      <div>
        <div>{this.renderWithOutAccounts()}</div>
        <div>
          <ul>
            {this.props.accounts.map(el => {
              return (
                <li key={el.provider}>
                  <ProviderInbox
                    userId={userId}
                    provider={el.provider}
                    email={el.email}
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
