import React, { Component, Fragment } from 'react';
import styles from './menu-user.scss';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import 'react-perfect-scrollbar/dist/css/styles.css';
import i18n from 'i18next';
import SignatureNumbers from './signature-numbers';
import { removeState } from '../../services/state';
import { clearUserCredentials } from '../../actions/application';
import { resetDefaultAccount, addOrUpdateAccount } from '../../services/accounts';
import { setSign, setAvailableSignatures, setNumAvailableSignatures, setNumAvailableEmails } from '../../actions/lefebvre';
import Cookies from 'js-cookie';
import { getAvailableSignatures, getNumAvailableSignatures } from '../../services/api-signaturit';

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
            getNumAvailableSignatures(lefebvre.idUserApp)
            .then( res => this.props.setNumAvailableSignatures(parseInt(res.data)))
            .catch(err => {
                console.log(err);
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
            
            getNumAvailableSignatures(lefebvre.idUserApp)
            .then( res => this.props.setNumAvailableSignatures(parseInt(res.data)))
            .catch(err => {
                console.log(err);
                if (err.message === "Failed to fetch"){
                  //Mostrar aviso no se han podido recuperar firmas
                }
            });
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
        const { lefebvre, application } = this.props;
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
        const nameCut = lefebvre.userName.split(' ');
        const nameInitial = `${nameCut[0].slice(0, 1)} ${nameCut[1].slice(0, 1)}`

        return (
            <Fragment>
                <div
                    className={styles['menu-user']}
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
                        <span className={`${styles['dropdown-menu']} dropdown-menu-arrow`}></span>
                        <div
                            className={
                                showSign ? `${styles[' show-sign']} ${styles['menu-container']}` : styles['menu-container']
                            }
                            ref={ref => (this.wrapperRef = ref)}>
                            <div className={styles['content']}>
                                <div className={styles['header']} style={{ marginTop: 20 }}>
                                    <span className='lf-icon-close' onClick={this.toggle}></span>
                                    <div className={styles['menu-title']}>
                                        <span>
                                            {showSign === false
                                                ? i18n.t('menu-user.user')
                                                : 'Firma de documentos'}
                                        </span>
                                    </div>
                                </div>

                                <div className={`${styles['user-image-and-name']} user-image-and-name`}>
                                    {showSign === false && (
                                        <Fragment>
                                            <div className='user-image text-center'>
                                              <div className={styles['user-circle']}>
                                                <span className={styles['user-nameInitial']}>{nameInitial.toUpperCase()}</span>
                                              </div>
                                                {/* <a href='#/'>
                                                    <img src='/assets/images/notification-icon.png' alt='icon' />                                                    
                                                </a> */}
                                            </div>
                                            {/* <span className='user-name text-center'>{`Firmas disponibles: ${lefebvre.availableSignatures}`}</span> */}
                                            <span className='user-name text-center'>{`${lefebvre.userName}`}</span>
                                            <span className='company-name text-center'>
                                                Lefebvre-El Derecho, S.A.
                                            </span>
                                            {  lefebvre.roles && lefebvre.roles.includes('Firma Digital') ? 
                                            <SignatureNumbers 
                                             title={i18n.t('menu-user.signatures-summary')}
                                             icon="lf-icon-signature"
                                             available={i18n.t('menu-user.available')}
                                             consumed={i18n.t('menu-user.consumed')}
                                             availablenumber={lefebvre.numAvailableSignatures}
                                             signatureConsumed={application.signatures.length + application.emails.length} /> 
                                             : null }
                                            {/* { lefebvre.roles && lefebvre.roles.includes('Email Certificado') ? 
                                            <SignatureNumbers 
                                             title={i18n.t('menu-user.email-summary')}
                                             type="email"
                                             available={i18n.t('menu-user.available')}
                                             consumed={i18n.t('menu-user.consumed')}
                                             availablenumber={lefebvre.numAvailableEmails}
                                             signatureConsumed={application.emails.length} />
                                             : null } */}
                                            <div className='text-center'>
                                                <button
                                                    type='button'
                                                    className={`${styles['btn-custom']} btn-primary col-6 btn mt-3 mb-3`}
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
            </Fragment>
        );
    }
}

MenuUser.propTypes = {
    fullName: PropTypes.string.isRequired
};

const mapStateToProps = state => ({
    lefebvre: state.lefebvre,
    login: state.login,
    application: state.application
});

const mapDispatchToProps = dispatch => ({
    logout: () => {
        dispatch(clearUserCredentials());
        //history.push("/login");
    },
    setSign: sign => {
        dispatch(setSign(sign));
    },
    setAvailableSignatures: num => dispatch(setAvailableSignatures(num)),
    setNumAvailableSignatures: num => dispatch(setNumAvailableSignatures(num))
});

export default connect(mapStateToProps, mapDispatchToProps)(MenuUser);