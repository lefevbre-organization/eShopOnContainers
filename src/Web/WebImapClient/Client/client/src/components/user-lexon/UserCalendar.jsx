import React, { Component, useReducer } from 'react';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import ACTIONS from '../../actions/lexon';
import CU_ACTIONS from '../../actions/user';
import { setFormValues } from '../../actions/login';
import { clearUserCredentials } from '../../actions/application';
import history from '../../routes/history';
import { PROVIDER } from '../../constants';
import { getUser } from '../../services/accounts';
import { removeState } from '../../services/state';
import * as base64 from 'base-64';
import {
  parseJwt,
  getUserId,
  getIdCasefile,
  getBbdd,
  getIdCompany,
  getMailContacts,
  getIdMail,
  getImapFolder,
  getTitle,
  getIdActuation,
  getIdEvent
} from '../../services/jwt';
import jwt from 'njwt';

class UserCalendar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      readyToRedirect: false,
      readyToRedirectToLogin: false,
      isNewAccount: false,
    };

    this.isUniqueAccountByProvider = this.isUniqueAccountByProvider.bind(this);
  }

  async componentDidMount() {
    //const base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
    var parametros = undefined;

    if (
      this.props.location.search.indexOf('account=') > -1 ||
      this.props.location.search.indexOf('prov=') > -1
    ) {
      //const account64 = this.props.location.search.split("account=")[1];
      parametros = new URLSearchParams(this.props.location.search);
      const acParam = parametros.get('account');
      if (acParam) {
        // Get user account
        try {
          const account = base64.decode(acParam);
          if (account) {
            this.props.setAccount(account);
          }
        } catch (e) {
          console.log(e);
        }
      }
    }

    const payload = this.props.match.params.token
      ? parseJwt(this.props.match.params.token)
      : undefined;
    if (payload) {
      const aux = { ...payload };
      delete aux.exp;
      window.currentUser = aux;
      this.props.setCurrentUser(aux);
    }

    //const user = (this.props.match.params.token ? `IM0${getUserId(payload)}` : this.props.match.params.idUser);
    var user = this.props.match.params.token
      ? getUserId(payload)
      : this.props.match.params.idUser;
    const casefile = this.props.match.params.token
      ? getIdCasefile(payload)
      : this.props.match.params.idCaseFile;
    const bbdd = this.props.match.params.token
      ? getBbdd(payload)
      : this.props.match.params.bbdd;
    const company = this.props.match.params.token
      ? getIdCompany(payload)
      : this.props.match.params.idCompany;
    //const mailContacts = (this.props.match.params.token ? getMailContacts(payload) : this.props.match.params.mailContacts );
    var idMessage = this.props.match.params.token
      ? getIdMail(payload)
      : this.props.match.params.idMessage;
    var idFolder = this.props.match.params.token
      ? getImapFolder(payload)
      : this.props.match.params.idFolder;
    const mailContacts = this.props.match.params.token
      ? getMailContacts(payload)
      : this.props.match.params.mailContacts;
    const idEvent = this.props.match.params.token
      ? getIdEvent(payload)
      : null
    const idActuation = this.props.match.params.token
      ? getIdActuation(payload)
      : null
    const title = this.props.match.params.token
      ? getTitle(payload)
      : null

    this.props.setIdEvent(idEvent);
    this.props.setIdActuation(idActuation);
    this.props.setTitle(title);

    const claims = this.props.match.params.token
      ? { idClienteNavision: getUserId(payload) }
      : {};
    const portalToken = jwt.create(claims, 'top-secret-phrase');
    //console.log('TOKEN: ' + portalToken);

    if (this.props.location.search.indexOf('prov=') > -1) {
      user = `${parametros.get('prov')}${user}`;
    }

    this.props.match.params.token ? console.log(`token:${this.props.match.params.token}`) : null;

    if (user !== this.props.lexon.user) {
      this.props.setFormValues({
        imap: '',
        imapUser: '',
        imapPass: '',
        smtp: '',
      });
      this.props.logout();

      this.props.setUser(user);
      return;
    }

    this.props.setUser(user);
/*    const caldavuser = user.substring(3);
    await createCalendarUser(caldavuser);*/

    // if (idMessage && base64regex.test(idMessage)) {
    //   idMessage = base64.decode(idMessage);
    // }
    // if (idFolder && base64regex.test(idFolder)) {
    //   idFolder = base64.decode(idFolder);
    // }
    if (idFolder === null || idFolder === undefined || idFolder === 'NULL') {
      idFolder = 'INBOX';
      }

    if (casefile) {
      this.props.setCaseFile({
        casefile: casefile,
        bbdd: bbdd,
        company: company,
      });
    } else if (bbdd) {
      this.props.setDataBase({
        bbdd: bbdd,
      });
    }

    if (idMessage) {
      this.props.setIdEmail({
        idEmail: idMessage,
        idFolder: idFolder,
        emailShown: false,
      });
      }

    if (mailContacts) {
      console.log('Contactos recibidos');
      //if (base64regex.test(mailContacts)) {
      //  this.props.setMailContacts(base64.decode(mailContacts));
      //} else {
        this.props.setMailContacts(mailContacts);
      //}
    }
    if (this.props.match.params.token) {
      this.props.setToken(portalToken.toString());
    }

    this.setState({ isNewAccount: user.slice(2, 3) === '1' ? true : false });

    // const isNewAccount = user.slice(2, 3) === "1" ? true : false;
    // if (!isNewAccount) {
    //   this.setState({
    //     readyToRedirect: true
    //   });
    // } else {
    //   this.setState({
    //     isNewAccount: true
    //   });
    // }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.lexon !== this.props.lexon) {
      if (this.props.lexon.isNewAccount) {
        removeState();
        this.setState({
          readyToRedirect: true,
        });
      } else {
        this.isUniqueAccountByProvider();
      }
    }
  }

  async isUniqueAccountByProvider() {
    const { lexon } = this.props;
    try {
      const result = getUser(lexon.userId);
      window.currentUser = result.data.tokenDecoded;
      this.props.setCurrentUser(result.data.tokenDecoded);

      if (result.errors.length === 0) {
        const accountsByProvider = result.data.accounts.filter(
          (account) => account.provider === PROVIDER
        );
        if (accountsByProvider.length > 1) {
          this.setState({
            readyToRedirectToLogin: true,
          });
        } else {
          this.setState({
            readyToRedirect: true,
          });
        }
      }
    } catch (err) {
      throw err;
    }
  }

  render() {
    const {
      readyToRedirect,
      readyToRedirectToLogin,
      isNewAccount,
    } = this.state;

    debugger
    if (readyToRedirect) {
      return <Redirect to='/calendar' />;
    }

    //if (isNewAccount || readyToRedirectToLogin) {
    //  //this.props.logout();
    //  return <Redirect to="/login" />;
    //}
      return <Redirect to='/calendar' />;
    //return null;
  }
}

const mapStateToProps = (state) => ({
  lexon: state.lexon,
});

const mapDispatchToProps = (dispatch) => ({
  setUser: (user) => dispatch(ACTIONS.setUser(user)),
  setAccount: (account) => dispatch(ACTIONS.setAccount(account)),
  setCaseFile: (casefile) => dispatch(ACTIONS.setCaseFile(casefile)),
  setDataBase: (dataBase) => dispatch(ACTIONS.setDataBase(dataBase)),
  setIdEmail: (emailInfo) => dispatch(ACTIONS.setIdEmail(emailInfo)),
  setFormValues: (formValues) => dispatch(setFormValues(formValues)),
  setMailContacts: (mailContacts) =>
    dispatch(ACTIONS.setMailContacts(mailContacts)),
  logout: () => {
    dispatch(clearUserCredentials());
    history.push('/login');
  },
  setToken: (token) => dispatch(ACTIONS.setToken(token)),
  setCurrentUser: (payload) => dispatch(CU_ACTIONS.setCurrentUser(payload)),
  setIdEvent: (id) => dispatch(ACTIONS.setIdEvent(id)),
  setIdActuation: (id) => dispatch(ACTIONS.setIdActuation(id)),
  setTitle: (title) => dispatch(ACTIONS.setTitle(title))
});

export default connect(mapStateToProps, mapDispatchToProps)(UserCalendar);
