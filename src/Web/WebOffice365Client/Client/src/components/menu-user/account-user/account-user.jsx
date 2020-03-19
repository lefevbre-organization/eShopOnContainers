import React, { Component } from "react";
import "./account-user.css";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { signOut } from "../../../api_graph/authentication";
import * as base64 from 'base-64';

class AccountUser extends Component {
    constructor(props) {
        super(props);

        this._handleOnClick = this._handleOnClick.bind(this);
    }

    _handleOnClick(provider, email) {
        const { userId, token } = this.props.lexon;
        let baseUrl;
        let url;

        switch (provider) {
            case "GOOGLE":
                baseUrl = window.URL_MF_GOOGLE.replace("/user", "");
                (token) ? window.open(`${baseUrl}/access/${token}/?prov=GO0`) : window.open(`${window.URL_MF_GOOGLE}/GO0${userId}`, "_self");
                break;
            case "OUTLOOK":
                baseUrl = window.URL_MF_OUTLOOK.replace("/user", "");
                //signOut(`${window.URL_MF_OUTLOOK}/OU0${userId}`);
                signOut((token) ? `${baseUrl}/access/${token}/?prov=OU0` : `${window.URL_MF_OUTLOOK}/OU0${userId}`);
                //(token) ? window.open(`${baseUrl}/access/${token}/?prov=OU0`) : window.open(`${window.URL_MF_OUTLOOK}/OU0${userId}`);
                // window.open(`${window.URL_MF_OUTLOOK}/OU0${userId}`, "_self");
                break;
            default:
                baseUrl = window.URL_MF_IMAP.replace("/user", "");
                (token) ? window.open(`${baseUrl}/access/${token}/?account=${base64.encode(email)}&prov=IM0`, "_self") : window.open(`${window.URL_MF_IMAP}/IM0${userId}/?account=${base64.encode(email)}`, "_self");
                break;
        }
    }

    getImage(provider) {
        switch (provider) {
            case "GOOGLE":
                return "/assets/img/logoGoogle.png";
            case "OUTLOOK":
                return "/assets/img/logoMicrosoft.png";

            default:
                return "/assets/img/logoImap.png";
        }
    }

    render() {
        const { account } = this.props;

        return (
            <li>
                <a
                    href="#/"
                    className="d-flex align-items-center account-text"
                    onClick={() => this._handleOnClick(account.provider, account.email)}
                >
                    <span>
                        <img src={this.getImage(account.provider)} alt={account.provider} />
                    </span>
                    <span>{account.email}</span>
                    <span className="lf-icon-arrow-exchange"></span>
                </a>
            </li>
        );
    }
}

AccountUser.propTypes = {
    account: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
    lexon: state.lexon
});

export default connect(mapStateToProps)(AccountUser);