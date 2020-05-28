import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect, withRouter } from 'react-router-dom';
import { translate } from 'react-i18next';
import { login } from '../../services/application';
import Button from '../buttons/button';
import LoginSnackbar from './login-snackbar';
import TextField from '../form/text-field/text-field';
import Spinner from '../spinner/spinner';
import UserLexon from "../user-lefebvre/UserLefebvre";
import mainCss from '../../styles/main.scss';
import { validateEmail } from '../../services/validation';
import styles from './login.scss';
import { PROVIDER } from '../../constants';
import { resetDefaultAccount } from '../../services/accounts';
import Cookies from 'js-cookie';
import { clearUserCredentials, setUserCredentials } from "../../actions/application";

const stateFromParams = params => ({
    values: {
        user: params.has('user') ? params.get('user') : '',
        password: ''
    }
});
const stateFromFormValues = formValues => ({
    values: { ...formValues, password: '' }
});

export class Login extends Component {
    constructor(props) {
        super(props);

        this.state = stateFromParams(new URLSearchParams(this.props.location.search));
        if (this.props.formValues && Object.keys(this.props.formValues).length > 0) {
            this.state = stateFromFormValues(this.props.formValues);
        }

        this.onFieldChange = this.onFieldChange.bind(this);
        this.login = this.login.bind(this);
    }

    async componentDidMount() {
        console.log("IN ... Login ->", window.URL_SERVER_API);
    }

    render() {
        const t = this.props.t;
        const { user, password } = this.state.values;
        const { lefebvre } = this.props;
        let cookie;
        if (user === undefined || user === null || user === ""){
            cookie = Cookies.get(`Lefebvre.Signaturit.${lefebvre.userId}`);
        } else {
            cookie = Cookies.get(`Lefebvre.Signaturit.${user}`)
        }
        console.log(cookie);
        if (cookie){
            this.props.setUserCredentials(lefebvre.user, lefebvre.user, {authenticated: true, encrypted: cookie, salt: "1234", name: ""})
            return <Redirect to="/" />
        }
        if (this.props.application.user.credentials) {
            return <Redirect to="/" />;
        }
        return (
            <div className={styles['login--background']}>
                <div className={styles['login--container']}>
                    <Spinner
                        visible={this.props.application.activeRequests > 0}
                        className={styles.spinner} pathClassName={styles.spinnerPath} />
                    <div className={`${mainCss['mdc-card']} ${styles.card}`}>
                        <header>
                            <div className={styles.title}>{this.props.application.title}</div>
                            <div className={styles.title}><img src = "/assets/images/notification-icon.png"></img></div>
                        </header>
                        <form onSubmit={this.login}>
                            <TextField id='user' fieldClass={`${styles.formField} ${styles.fullWidth}`}
                                value={user} onChange={this.onFieldChange}
                                focused={this.isFocused('user')} required={true} autoComplete='on' label={t('login.User')} />
                            <TextField id='password' type={'password'} fieldClass={`${styles.formField} ${styles.fullWidth}`}
                                value={password} onChange={this.onFieldChange}
                                focused={this.isFocused('password')} required={true} label={t('login.Password')} />
                            
                            <Button type={'submit'}
                                className={`${styles.loginButton} ${mainCss['mdc-button--unelevated']} ${styles.fullWidth}`}
                                label={t('login.actions.Login')} />
                        </form>
                    </div>
                    <LoginSnackbar />
                </div>
            </div>
        );
    }

    isFocused(componentId) {
        return componentId === this.state.focusedComponentId;
    }

    onFieldChange(event) {
        const target = event.target;
        this.setState(prevState => {
            const newState = { ...prevState };
            newState.focusedComponentId = target.id;
            newState.values = { ...prevState.values };
            newState.values[target.id] = target.value;
            return newState;
        });
    }

    validateEmail(event) {
        const target = event.target;

        var element = document.getElementById("user");
        const error = validateEmail(this.state.values.user);
        if (error) {
            element.setCustomValidity(error);
            setTimeout(() => element.reportValidity());
            return false;
        }
        return true;
    }

    login(event) {
        event.preventDefault();

        if (this.validateEmail(event) === true) {
            this.props.dispatchLogin(this.state.values);
        }
    }

    
}

//export function logout() {
//    const t = this.props.t;
//    this.props.application.user.credentials = null;
//}

const mapStateToProps = state => ({
    application: state.application,
    formValues: state.login.formValues,
    lefebvre: state.lefebvre
});

const mapDispatchToProps = dispatch => ({
    dispatchLogin: credentials => login(dispatch, credentials),
    setUserCredentials: (userId, hash, credentials) => dispatch(setUserCredentials(userId, hash, credentials)),
});

export default connect(mapStateToProps, mapDispatchToProps)(translate()(withRouter(Login)));
