import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Redirect, withRouter} from 'react-router-dom';
import {translate} from 'react-i18next';
import {
  DEFAULT_IMAP_PORT,
  DEFAULT_IMAP_SSL,
  DEFAULT_SMTP_PORT,
  DEFAULT_SMTP_SSL,
  login
} from '../../services/application';
import Button from '../buttons/button';
import LoginSnackbar from './login-snackbar';
import Switch from '../form/switch/switch';
import TextField from '../form/text-field/text-field';
import Spinner from '../spinner/spinner';
import UserLexon from "../user-lexon/UserLexon";
import mainCss from '../../styles/main.scss';
import {validateEmail} from '../../services/validation';
import styles from './login.scss';
import { PROVIDER } from '../../constants';
import { resetDefaultAccount } from '../../services/accounts';

/**
 * Returns a Login component valid state from the current URL params
 *
 * @param {URLSearchParams} params
 * @returns {{values: {serverHost: string, serverPort: number, user: string, password: string, imapSsl: boolean, smtpHost: string, smtpPort: number, smtpSsl: boolean}, advanced: boolean}}
 */
const stateFromParams = params => ({
  values: {
    serverHost: params.has('serverHost') ? params.get('serverHost') : '',
    serverPort: params.has('serverPort') ? params.get('serverPort').replace(/[^0-9]*/g, '') : DEFAULT_IMAP_PORT,
    user: params.has('user') ? params.get('user') : '',
    password: '',
    imapSsl: params.has('imapSsl') ? params.get('imapSsl') === 'true' : DEFAULT_IMAP_SSL,
    smtpHost: params.has('smtpHost') ? params.get('smtpHost') : '',
    smtpPort: params.has('smtpPort') ? params.get('smtpPort').replace(/[^0-9]*/g, '') : DEFAULT_SMTP_PORT,
    smtpSsl: params.has('smtpSsl') ? params.get('smtpSsl') === 'true' : DEFAULT_SMTP_SSL
  },
  advanced: false
});

const stateFromFormValues = formValues => ({
  values: {...formValues, password: ''}, advanced: false
});

const stateFromAccount = account => ({
  values: {
    serverHost: account.imap || '',
    serverPort: account.imapPort || DEFAULT_IMAP_PORT,
    user: account.imapUser || '',
    password: account.imapPass|| '',
    imapSsl: account.imapSsl || DEFAULT_IMAP_SSL,
    smtpHost: account.smtp || '',
    smtpPort: account.smtpPort || DEFAULT_SMTP_PORT,
    smtpSsl: account.smtpSsl || DEFAULT_SMTP_SSL
  },
  advanced: false
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
    const { account, userId } = this.props.lexon;

    const url = `${window.API_ACC_GATEWAY}/api/v2/accounts/usermail/${userId}/account/imap/${account}`;

    const response = await fetch(url, {
      method: "GET"
    });
    const data = await response.json();

    if(data && data.data) {
      const newValues = stateFromAccount(data.data.configAccount)
      this.setState({values: newValues.values}, ()=>{
        this.props.dispatchLogin(this.state.values);
      })
    }
  }

    goBack() { 
        if (typeof this.props.lexon !== 'undefined') {
            const { userId } = this.props.lexon;
            if (userId !== null) {
                resetDefaultAccount(userId)
                    .then(result => {
                        const urlRedirect = `${window.URL_SELECT_ACCOUNT}/user/${userId}/encrypt/0`;
                        window.open(urlRedirect, "_self");
                    })
                    .catch(error => {
                        console.log("error =>", error);
                    });
            }
        }
  }

  render() {
    const t = this.props.t;
    const {serverHost, serverPort, user, password, imapSsl, smtpHost, smtpPort, smtpSsl} = this.state.values;
    const {advanced} = this.state;
    if (this.props.application.user.credentials) {
      return <Redirect to="/"/>;
    }
    return (
      <div className={styles['login--background']}>
        <div className={styles['login--container']}>
          <Spinner
            visible={this.props.application.activeRequests > 0}
            className={styles.spinner} pathClassName={styles.spinnerPath}/>
          <div className={`${mainCss['mdc-card']} ${styles.card}`}>
            <header>
              <div className={styles.title}>{this.props.application.title}</div>
              <div className={styles.subtitle}>{t('login.Login')}</div>
            </header>
            <form onSubmit={this.login}>
              <div className={styles.server}>
                <TextField id='serverHost' fieldClass={`${styles.formField} ${styles.serverHost}`}
                  value={serverHost} onChange={this.onFieldChange}
                  focused={this.isFocused('serverHost')} required={true} autoComplete='on' label={t('login.Host')}/>
                <TextField key='serverPort' id='serverPort' fieldClass={`${styles.formField} ${styles.serverPort}`}
                  type='number' min='0'
                  value={serverPort} onChange={this.onFieldChange}
                  focused={this.isFocused('serverPort')} required={true} autoComplete='on' label={t('login.Port')}/>
              </div>
              <TextField id='user' fieldClass={`${styles.formField} ${styles.fullWidth}`}
                value={user} onChange={this.onFieldChange}
                focused={this.isFocused('user')} required={true} autoComplete='on' label={t('login.User')}/>
              <TextField id='password' type={'password'} fieldClass={`${styles.formField} ${styles.fullWidth}`}
                value={password} onChange={this.onFieldChange}
                focused={this.isFocused('password')} required={true} label={t('login.Password')}/>
              <div className={styles.advancedButtonExpand}>
                  <Button className={styles.advancedButton} label={t('login.Advanced')}
                    icon={advanced ? 'unfold_less' : 'unfold_more'}
                    onClick={e => this.toggleAdvanced(e)}
                                />
              </div>
              {advanced &&
                <div className={styles.advancedContainer}>
                  <Switch id='imapSsl' checked={imapSsl} label={t('login.ImapSSL')}
                    onToggle={() => this.onToggle('imapSsl')}/>
                  <h3 className={styles.section}>{t('login.SMTP')}</h3>
                  <div className={styles.server}>
                    <TextField id='smtpHost' fieldClass={`${styles.formField} ${styles.fullWidth} ${styles.serverHost}`}
                      value={smtpHost} onChange={this.onFieldChange}
                      focused={this.isFocused('smtpHost')} label={t('login.Host')}/>
                    <TextField id='smtpPort' fieldClass={`${styles.formField} ${styles.fullWidth} ${styles.serverPort}`}
                      type='number' min='0' required={true}
                      value={smtpPort} onChange={this.onFieldChange}
                      focused={this.isFocused('smtpPort')} label={t('login.Port')}/>
                  </div>
                  <Switch id='smtpSsl' checked={smtpSsl} label={t('login.SmtpSSL')}
                    onToggle={() => this.onToggle('smtpSsl')}/>
                </div>
              }
              <Button type={'submit'}
                className={`${styles.loginButton} ${mainCss['mdc-button--unelevated']} ${styles.fullWidth}`}
                label={t('login.actions.Login')} />
                <Button
                onClick={() => {this.goBack();}}                        
                className={`${styles.CancelButton} ${mainCss['mdc-button--unelevated']} ${styles.fullWidth}`}
                label={t('login.actions.Cancel')} />
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

  onToggle(id) {
    this.setState(prevState => {
      const newState = {...prevState};
      newState.values = {...prevState.values};
      newState.values[id] = !newState.values[id];
      return newState;
    });
  }

  onFieldChange(event) {
    const target = event.target;
    this.setState(prevState => {
      const newState = {...prevState};
      newState.focusedComponentId = target.id;
      newState.values = {...prevState.values};
      newState.values[target.id] = target.value;
      return newState;
    });
  }

  toggleAdvanced(event) {
    event.preventDefault();
    event.target.blur();
    this.setState({advanced: !this.state.advanced});
  }

  validateEmail(event) {
    const target = event.target;

    var element = document.getElementById("user");      
    const error = validateEmail(this.state.values.user);
    debugger
    if (error) {
      element.setCustomValidity(error);
      setTimeout(() => element.reportValidity());
      return false;
    }
    return true;
  }

  login(event) {
    event.preventDefault();

    if(this.validateEmail(event) === true) {
      this.saveLoginConfig();
      this.props.dispatchLogin(this.state.values);
    }
  }   

    async saveLoginConfig() {
      const { userId = '', account = '' } = this.props.lexon; 
      const url = `${window.API_ACC_GATEWAY}/api/v2/accounts/usermail/${userId}/account/${PROVIDER}/${account}/config/addorupdate`;
      await fetch(url, {
        method: 'POST',
        headers: {
          "content-Type":"application/json"
        },
        body: JSON.stringify({
          imap: this.state.values.serverHost,
          imapPort: this.state.values.serverPort,
          imapUser: this.state.values.user,
          imapPass: this.state.values.password,
          imapSsl: this.state.values.imapSsl,
          smtp: this.state.values.smtpHost,
          smtpPort: this.state.values.smtpPort,
          smtpSsl: this.state.values.smtpSsl
        })
      });
    }
}

//export function logout() {
//    const t = this.props.t;
//    this.props.application.user.credentials = null;
//}

const mapStateToProps = state => ({
  application: state.application,
  formValues: state.login.formValues,
  lexon: state.lexon
});

const mapDispatchToProps = dispatch => ({
  dispatchLogin: credentials => login(dispatch, credentials)
});

export default connect(mapStateToProps, mapDispatchToProps)(translate()(withRouter(Login)));
