import React, { Component } from "react";
import i18n from "i18next";
import { parseJwt, buildClientUrl, buildClientUrlToken } from "../utils/jwt";
import * as base64 from 'base-64';
import { INBOX_GOOGLE, INBOX_OUTLOOK, INBOX_IMAP } from "../constants";

class ProviderInbox extends Component {
    constructor(props) {
        super(props);

        this._handleOnClick = this._handleOnClick.bind(this);
    }

    _handleOnClick(provider, email) {
        const { toggleConfirmRemoveAccount } = this.props;

        toggleConfirmRemoveAccount(false, email, provider);
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
        const { email, token } = this.props;
        const payload = (token) ? parseJwt(token) : "";

        if (email != null && email !== undefined) {
            return (
                <React.Fragment>
                    <a
                        href="#/"
                        className="trash"
                        onClick={() => this._handleOnClick(provider, email)}
                    >
                        <span className="icon lf-icon-trash"></span>
                    </a>
                </React.Fragment>
            );
        } else {
            return null;
        }
    }

    render() {
        const { provider, email, token, service, embeded } = this.props;
        const user = this.getUser();
        const payload = (token) ? parseJwt(token) : "";

        let title;
        let linkHref;

        linkHref = (token) ? buildClientUrlToken(provider, token, service) : buildClientUrl(provider, user, payload);
        
        switch (provider) {
            case INBOX_GOOGLE:
                email != null && email !== undefined
                    ? (title = email)
                    : (title = "Google");

                if (token) {
                    linkHref += `?prov=${user.slice(0, 3)}`
                }
                linkHref = embeded ? `${linkHref}&layout=iframe` : linkHref;

                return (
                    <React.Fragment>
                        <a href={linkHref} className="d-flex align-items-center">
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

                if (token) {
                    linkHref += `?prov=${user.slice(0, 3)}`
                }
                linkHref = embeded ? `${linkHref}&layout=iframe` : linkHref;

                return (
                    <React.Fragment>
                        <a href={linkHref} className="d-flex align-items-center">
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

                if (email) {
                    const account64 = base64.encode(email);
                    (token) ? linkHref += `?account=${account64}&prov=${user.slice(0, 3)}` : linkHref += `?account=${account64}`;
                    linkHref = embeded ? `${linkHref}&layout=iframe` : linkHref;
                } else {
                    if (token) {
                        linkHref += `?prov=${user.slice(0, 3)}`;
                    }
                    linkHref = embeded ? `${linkHref}&layout=iframe` : linkHref;
                }

                return (
                    <React.Fragment>
                        <a href={linkHref} className="d-flex align-items-center">
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
