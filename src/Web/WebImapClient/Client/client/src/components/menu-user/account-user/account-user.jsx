import React, { Component, Fragment } from 'react';
import './account-user.css';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { removeStateExLexon, removeState } from '../../../services/state';
import { clearUserCredentials } from '../../../actions/application';
import * as base64 from 'base-64';

class AccountUser extends Component {
    constructor(props) {
        super(props);

        this._handleOnClick = this._handleOnClick.bind(this);
    }

    _handleOnClick(provider, account) {
        const { userId, token } = this.props.lexon;
        let baseUrl;

        switch (provider) {
            case 'GOOGLE':
                removeState();
                this.props.logout();
                baseUrl = window.URL_MF_GOOGLE.replace('/user', '');
                (token) ? window.open(`${baseUrl}/access/${token}/?prov=GO0`, '_self') : window.open(`${window.URL_MF_GOOGLE}/GO0${userId}`, '_self');
                break;

            case 'OUTLOOK':
                removeState();
                this.props.logout();
                baseUrl = window.URL_MF_OUTLOOK.replace('/user', '');
                (token) ? window.open(`${baseUrl}/access/${token}/?prov=OU0`, '_self') : window.open(`${window.URL_MF_OUTLOOK}/OU0${userId}`, '_self');
                break;

            default:
                removeState();
                this.props.logout();
                baseUrl = window.URL_MF_IMAP.replace('/user', '');
                //const urlRedirect = `${window.URL_SELECT_ACCOUNT}/user/${userId}/encrypt/0&account=${base64.encode(account)}`;
                //window.open(urlRedirect, "_self");
                (token) ? window.open(`${baseUrl}/access/${token}/?account=${base64.encode(account)}&prov=IM0`, '_self') : window.open(`${window.URL_MF_IMAP}/IM0${userId}?account=${base64.encode(account)}`, '_self');

                //removeStateExLexon();
                //window.location.reload();           
                break;
        }
    }

    getImage(provider) {
        switch (provider) {
            case 'GOOGLE':
                return '/assets/images/logoGoogle.png';
            case 'OUTLOOK':
                return '/assets/images/logoMicrosoft.png';

            default:
                return '/assets/images/logoImap.png';
        }
    }

    render() {
        const { account } = this.props;

        return (
            <Fragment>
                <li>
                    <a
                        href='#/'
                        className='d-flex align-items-center account-text'
                        onClick={() =>
                            this._handleOnClick(account.provider, account.email)
                        }>
                        <span>
                            <img
                                src={this.getImage(account.provider)}
                                alt={account.provider}
                            />
                        </span>
                        <span>{account.email}</span>
                        <span className='lf-icon-arrow-exchange'></span>
                    </a>
                </li>
                <style jsx>{`
          .account-text span {
            color: #7c868c !important;
          }
        `}</style>
            </Fragment>
        );
    }
}

AccountUser.propTypes = {
    account: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
    lexon: state.lexon
});

const mapDispatchToProps = dispatch => ({
    logout: () => {
        dispatch(clearUserCredentials());
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(AccountUser);
