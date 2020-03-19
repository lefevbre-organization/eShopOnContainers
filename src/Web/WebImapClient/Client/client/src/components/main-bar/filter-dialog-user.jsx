// import React from 'react';
import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
// import { translate } from "react-i18next";
// import { setMessageFilterKey } from "../../actions/application";
// import MessageFilters, { getFromKey } from "../../services/message-filters";
import styles from "./filter-dialog.scss";
import mainCss from "../../styles/main.scss";
import { removeState } from "../../services/state";
// import { logout } from '../login/login';
import "react-perfect-scrollbar/dist/css/styles.css";
import { PROVIDER } from "../../constants";
import { getUser, resetDefaultAccount } from "../../services/accounts";
import AccountUser from "../menu-user/account-user/account-user";
import jwt from "njwt";

class FilterDialogUser extends Component {
    constructor(props) {
        super(props);

        this.state = {
            accounts: []
        };

        this.routeChange = this.routeChange.bind(this);
    }

    componentDidMount() {
        const { lexon } = this.props;
        const _this = this;
        if (lexon.userId) {
            getUser(lexon.userId)
                .then(result => {
                    if (result.errors.length === 0) {
                        _this.setState({
                            accounts: result.data.accounts.filter(
                                account => account.provider !== PROVIDER
                            )
                        });
                    } else {
                        let errors;
                        result.errors.forEach(error => {
                            errors = `${error} `;
                        });
                        console.log("error ->", errors);
                    }
                })
                .catch(error => {
                    console.log("error ->", error);
                });
        }
    }

    routeChange() {
        const { userId, token } = this.props.lexon;
        if (userId !== null) {
            resetDefaultAccount(userId)
                .then(() => {
                    //const urlRedirect = `${window.URL_SELECT_ACCOUNT}/user/${userId}/encrypt/0`;
                    const urlRedirect = (token) ? `${window.URL_SELECT_ACCOUNT}/access/${token}/` : `${window.URL_SELECT_ACCOUNT}/user/${userId}/encrypt/0`;
                    window.open(urlRedirect, "_self");
                })
                .catch(error => {
                    console.log("error =>", error);
                });
        }
    }

    routeLogout() {
        //removeState();
        //window.location.reload();

        const { userId, token } = this.props.lexon;
        if (userId !== null) {
            resetDefaultAccount(userId)
                .then(result => {
                    console.log(result);
                    removeState();
                })
                .then(() => {
                    //const urlRedirect = `${window.URL_SELECT_ACCOUNT}/user/${userId}/encrypt/0`;
                    const urlRedirect = (token) ? `${window.URL_SELECT_ACCOUNT}/access/${token}/` : `${window.URL_SELECT_ACCOUNT}/user/${userId}/encrypt/0`;

                    window.open(urlRedirect, "_self");
                });
        } else {
            removeState();
            window.location.reload();
        }
    }

    renderSettings() {
        const { accounts } = this.state;
        const { userId } = this.props.lexon;
        const displaySettings = userId === null ? false : true;

        if (displaySettings) {
            return (
                <Fragment>
                    <li
                        key="1"
                        className={`${styles["filter-dialog__item"]} ${mainCss["mdc-list-item"]}`}
                        // onClick={() => this.routeChange(`settings`)}
                        onClick={() => this.routeChange()}
                    >
                        <i
                            className={`${styles.check} ${styles["check--active"]} material-icons`}
                        ></i>
                        Settings
          </li>

                    {accounts.map(account => {
                        return <AccountUser account={account} key={account.email} />;
                    })}
                </Fragment>
            );
        }
        return null;
    }

    render() {
        return (
            <div
                className={`${styles["filter-dialog"]} ${mainCss["mdc-menu"]} ${
                    mainCss["mdc-menu-surface"]
                    }
                  ${
                    this.props.visible ? mainCss["mdc-menu-surface--open"] : ""
                    }`}
                aria-hidden={!this.props.visible}
            >
                <ul className={`${mainCss["mdc-list"]} ${mainCss["mdc-list--dense"]}`}>
                    {this.renderSettings()}

                    <li
                        key="2"
                        className={`${styles["filter-dialog__item"]} ${mainCss["mdc-list-item"]}`}
                        onClick={() => this.routeLogout()}
                    >
                        <i
                            className={`${styles.check} ${styles["check--active"]} material-icons`}
                        >
                            exit_to_app
            </i>
                        Log out
          </li>
                </ul>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    lexon: state.lexon
});

export default connect(mapStateToProps)(FilterDialogUser);
