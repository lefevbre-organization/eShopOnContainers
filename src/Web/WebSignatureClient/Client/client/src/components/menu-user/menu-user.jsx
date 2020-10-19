import React, { Component, Fragment } from 'react';
import './menu-user.css';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import 'react-perfect-scrollbar/dist/css/styles.css';
import i18n from 'i18next';
import SignatureNumbers from './signature-numbers';
import { removeState } from '../../services/state';
import { clearUserCredentials } from '../../actions/application';
import { resetDefaultAccount, addOrUpdateAccount } from '../../services/accounts';
import { setSign, setAvailableSignatures } from '../../actions/lefebvre';
import Cookies from 'js-cookie';
import { getAvailableSignatures } from '../../services/api-signaturit';

class MenuUser extends Component {
    constructor(props) {
        super(props);

        this.state = {
            dropdownOpen: false,
            accounts: [],
            disconnect: true,
            showSign: false,
            sign: ''
        };

        this.wrapperRef = null;
        this.buttonRef = null;

        this.toggle = this.toggle.bind(this);
        this._handleOnClick = this._handleOnClick.bind(this);
        this.onSignClick = this.onSignClick.bind(this);
        this.onBack = this.onBack.bind(this);
        this.handleClickOutside = this.handleClickOutside.bind(this);
        this.onSaveSign = this.onSaveSign.bind(this);
        this.onSignChange = this.onSignChange.bind(this);
    }

    componentDidMount() {
        const { lefebvre } = this.props;
        if (lefebvre.userId) {
            getAvailableSignatures(lefebvre.idUserApp, 1)
            .then( res => this.props.setAvailableSignatures(res.data))
            .catch(err => {
                if (err.message === "Failed to fetch"){
                  //Mostrar aviso no se han podido recuperar firmas
                }
              });
        }

        document.addEventListener('mousedown', this.handleClickOutside);
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClickOutside);
    }

    handleClickOutside(event) {
        const { showSign } = this.state;
        const { onToggleDialog } = this.props;

        if (showSign === true) {
            event.stopPropagation();
            return;
        }
        if (
            this.wrapperRef &&
            this.buttonRef &&
            !this.wrapperRef.contains(event.target) &&
            !this.buttonRef.contains(event.target)
        ) {
            this.setState(
                {
                    dropdownOpen: false,
                    showSign: false
                },
                () => {
                    if (onToggleDialog) {
                        onToggleDialog(this.state.dropdownOpen);
                    }
                }
            );
        }
    }

    toggle() {
        const { onToggleDialog } = this.props;
        const { lefebvre } = this.props;
        if (lefebvre.userId) {
            getAvailableSignatures(lefebvre.idUserApp, 1)
            .then( res => this.props.setAvailableSignatures(res.data));
        }
        this.setState(
            {
                dropdownOpen: !this.state.dropdownOpen,
                showSign: false
            },
            () => {
                if (onToggleDialog) {
                    onToggleDialog(this.state.dropdownOpen);
                }
            }
        );
    }

    _handleOnClick() {
        const { userId, token } = this.props.lefebvre;
        if (userId !== null) {
            resetDefaultAccount(userId)
                .then(() => {
                    this.routeLogout();
                    //const urlRedirect = `${window.URL_SELECT_ACCOUNT}/user/${userId}/encrypt/0`;
                    const urlRedirect = (token) ? `${window.URL_SELECT_ACCOUNT}/access/${token}/` : `${window.URL_SELECT_ACCOUNT}/user/${userId}/encrypt/0`;
                    window.open(urlRedirect, '_self');
                })
                .catch(error => {
                    console.log('error =>', error);
                });
        }
    }

    onSignClick() {
        const { showSign } = this.state;
        this.setState({ showSign: !showSign });
    }

    onBack() {
        this.setState({
            showSign: false
        });
    }

    onSignChange(content) {
        this.setState({ sign: content });
    }

    async onSaveSign() {
        const fullName = this.props.login.formValues.user;

        const { lefebvre } = this.props;
        const { sign } = this.state;
        const newAccount = {
            provider: 'IMAP',
            email: fullName,
            guid: lefebvre.guid,
            sign
        };

        this.props.setSign(sign);
        await addOrUpdateAccount(lefebvre.userId, newAccount);
        this.onBack();
    }

    routeLogout() {
        const { userId, token } = this.props.lefebvre;
        Cookies.remove(`Lefebvre.Signaturit.${userId}`);
        removeState();
        this.props.logout();
        window.location.reload();
    }



    render() {
        const { dropdownOpen, accounts } = this.state;
        const { lefebvre } = this.props;
        const fullName = this.props.login.formValues.user;
        const { showSign, sign } = this.state;

        let acronym;
        if (fullName) {
            acronym = fullName
                .split(/\s/)
                .reduce((response, word) => (response += word.slice(0, 1)), '')
                .substring(0, 2);
        } else {
            acronym = '?';
        }

        return (
            <Fragment>
                <div
                    className='menu-user'
                    onClick={this.toggle}
                    ref={ref => (this.buttonRef = ref)}>
                    <img
                        className='mx-2 profile-pic'
                        src='assets/images/icon-user.png'
                        alt={fullName}
                    />
                </div>
                {dropdownOpen === true && (
                    <div>
                        <span className='dropdown-menu-arrow'></span>
                        <div
                            className={
                                showSign ? 'show-sign menu-container ' : 'menu-container '
                            }
                            ref={ref => (this.wrapperRef = ref)}>
                            <div className='content'>
                                <div className='header' style={{ marginTop: 20 }}>
                                    <span className='lf-icon-close' onClick={this.toggle}></span>
                                    <div className='menu-title'>
                                        <span>
                                            {showSign === false
                                                ? i18n.t('menu-user.user')
                                                : 'Firma de documentos'}
                                        </span>
                                    </div>
                                </div>

                                <div className='user-image-and-name'>
                                    {showSign === false && (
                                        <Fragment>
                                            <div className='user-image text-center'>
                                                <a href='#/'>
                                                    <img src='/assets/images/notification-icon.png' alt='icon' />                                                    
                                                </a>
                                            </div>
                                            {/* <span className='user-name text-center'>{`Firmas disponibles: ${lefebvre.availableSignatures}`}</span> */}
                                            <span className='user-name text-center'>{`${lefebvre.userName}`}</span>
                                            <span className='company-name text-center'>
                                                Lefebvre-El Derecho, S.A.
                                            </span>
                                            {  lefebvre.roles && lefebvre.roles.includes('Firma Digital') ? 
                                            <SignatureNumbers 
                                             title="RESUMEN FIRMAS"
                                             type="signature"
                                             available="Disponibles"
                                             consumed="Consumidas"
                                             availablenumber="36"
                                             signatureConsumed="106" /> 
                                             : null }
                                            { lefebvre.roles && lefebvre.roles.includes('Email Certificado') ? 
                                            <SignatureNumbers 
                                             title="RESUMEN EMAIL"
                                             type="email"
                                             available="Disponibles"
                                             consumed="Consumidas"
                                             availablenumber="36"
                                             signatureConsumed="106" />
                                             : null }
                                            <div className='text-center'>
                                                <button
                                                    type='button'
                                                    className='col-6 btn btn-primary mt-3 mb-3'
                                                    onClick={() => this.routeLogout()}>
                                                    {i18n.t('menu-user.close-session')}
                                                </button>
                                            </div>
                                            <span className='text-center' style={{color: 'white', fontSize: '5px'}}>{`${lefebvre.userId}`}</span>
                                        </Fragment>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <style jsx>{`
          header h1 {
            color: black;
          }
          .buttons-footer {
            position: absolute;
            bottom: 10px;
            right: 10px;
          }

          .buttons-footer button {
            margin-right: 15px;
          }

          .buttons-footer button:hover {
            margin-right: 15px;
          }

          .menu-user {
            cursor: pointer;
          }

          .add-more-accounts > span {
            color: #001978 !important;
          }

          .menu-container {
            box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2),
              0 6px 20px 0 rgba(0, 0, 0, 0.19);
            border: 1px solid #cdd1e0;
            border-radius: 0;
            color: #001978;
          }

          .show-sign.menu-container {
            width: 800px;
            height: 446px;
          }

          .dropdown-menu-arrow {
            /* display: inline; */
            top: 5px;
            right: 13px;
            position: absolute;
            left: auto;
            width: 24px;
            height: 24px;
          }

          .mu-subheader {
            font-family: MTTMilano, Lato, Arial, sans-serif;
            cursor: default;
            text-align: left !important;
            color: #333333 !important;
            font-size: 14px;
          }

          .dropdown-menu-arrow:before {
            bottom: -13px;
            right: -8px;
            border-bottom-color: rgba(0, 0, 0, 0.15);
          }

          .dropdown-menu-arrow:after {
            bottom: -13px;
            right: -8px;
            border-bottom-color: #fff;
          }

          .accounts-container {
            text-align: center;
          }

          .user-image-and-name {
            padding: 24px;
          }

          .lf-icon-add-round {
            color: #001978;
          }
          .content .header {
            background-color: white;
            text-align: right;
            border: none;
            display: block;
            padding-left: 24px;
            padding-right: 24px;
            font-size: 0.875rem;
            color: #6c757d;
            white-space: nowrap;
          }
          .content .header > span {
            color: #001978;
            font-size: 13px;
            cursor: pointer;
          }

          .user-image-and-name .scrollbar-container {
            width: 100%;
          }

          .menu-container {
            position: absolute;
            background-color: white;
            top: 40px;
            right: -30px;
            width: 385px;
            z-index: 110;
            cursor: default;
          }

          .menu-title {
            font-size: 18px;
            font-weight: 500;
            border-bottom: 1px solid;
            padding-bottom: 5px;
            text-align: left;
            color: #001978;
          }
          .menu-title .mb-5 {
            text-decoration: none;
            color: #001978 !important;
          }

          .add-sign {
            display: flex;
            align-items: center;
            font-size: 16px;
            font-family: MTTMilano-Bold, Lato, Arial, sans-serif;
            justify-content: center;
            color: #001978;
            cursor: pointer;
            margin-bottom: 10px;
          }
          .add-sign p {
            text-decoration: underline;
            padding: 0;
            margin: 0;
            margin-left: 5px;
          }
          .add-sign .lf-icon-feather {
            font-size: 20px;
            color: #001978;
          }

          .e-content.e-lib.e-keyboard {
            text-align: left;
          }

          .signature-summary {
            margin-bottom: 15px;
          }

          .container-summary {
            display: fex;
            margin-bottom: 10px
          }

          .signature-available {
            flex: 0 0 81%;
            border-bottom: 1px solid;
          }

          .signature-consumed {
            flex: 0 0 81%;
            border-bottom: 1px solid #96979C;
            color: #96979C
          }

          .box-number {
            width: 70px;
            height: 30px;
            text-align: center;
            padding-top: 4px;
            color: white;
          }

          .available-number { 
           background: #001978;
          }
          
          .consumed-number {
            background: #96979C;
          }

          .btn-primary {
            background-color: #001970; 
          }
          .btn-primary:hover {
            color: #fff; 
            padding: 0px;
          }
          .btn-primary:focus {
            color: #fff; 
          }
          
        `}</style>
            </Fragment>
        );
    }
}

MenuUser.propTypes = {
    fullName: PropTypes.string.isRequired
};

const mapStateToProps = state => ({
    lefebvre: state.lefebvre,
    login: state.login
});

const mapDispatchToProps = dispatch => ({
    logout: () => {
        dispatch(clearUserCredentials());
        //history.push("/login");
    },
    setSign: sign => {
        dispatch(setSign(sign));
    },
    setAvailableSignatures: num => dispatch(setAvailableSignatures(num))
});

export default connect(mapStateToProps, mapDispatchToProps)(MenuUser);