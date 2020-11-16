import React, { Component, Fragment } from "react";
import ProviderInbox from "./ProviderInbox";

class Accounts extends Component {
  render() {
    const { userId, accounts, token, service } = this.props;

    if (!Array.isArray(accounts) || accounts.length === 0) {
      return null;
    }

    return (
      <Fragment>
        {accounts.map((el, index) => {
          return (
            <li key={ index + '_' + el.email}>
              <ProviderInbox
                userId={userId}
                provider={el.provider}
                email={el.email}
                removeAccount={this.props.removeAccount}
                toggleConfirmRemoveAccount={
                  this.props.toggleConfirmRemoveAccount
                }
                token={token}
                service={service}
              />
            </li>
          );
        })}
      </Fragment>
    );
  }
}

export default Accounts;
