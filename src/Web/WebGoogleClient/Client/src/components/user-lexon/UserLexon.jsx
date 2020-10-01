import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import ACTIONS from '../../actions/lexon';
import CU_ACTIONS from '../../actions/user';
import { mountScripts } from '../../api/scripts';
import {
  checkSignInStatus,
  signOut,
  signOutDisconnect,
} from '../../api/authentication';
import { getUser } from '../../api/accounts';
import { PROVIDER } from '../../constants';
import * as base64 from 'base-64';
import {
  parseJwt,
  getUserId,
  getIdCasefile,
  getBbdd,
  getIdCompany,
  getMailContacts,
  getIdMail,
} from '../../utils/jwt';
import jwt from 'njwt';
import Spinner from '../../components/spinner/spinner';

class UserLexon extends Component {
  constructor(props) {
    super(props);

    this.state = {
      readyToRedirect: false,
      redirectToEmail: this.props.match.params.idMail,
      loading: true,
    };

    this.init = this.init.bind(this);
    this.initClient = this.initClient.bind(this);
    this.isUniqueAccountByProvider = this.isUniqueAccountByProvider.bind(this);
  }

  componentDidMount() {
    var parametros = undefined;
    const payload = this.props.match.params.token
      ? parseJwt(this.props.match.params.token)
      : undefined;
    if (payload) {
      const aux = { ...payload };
      delete aux.exp;

      window.currentUser = aux;
      this.props.setCurrentUser(aux);
    }

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
    const mailContacts = this.props.match.params.token
      ? getMailContacts(payload)
      : this.props.match.params.mailContacts;
    const idMail = this.props.match.params.token
      ? getIdMail(payload)
      : this.props.match.params.idMail;

    const claims = this.props.match.params.token
      ? { idClienteNavision: getUserId(payload) }
      : user;
    const portalToken = jwt.create(claims, 'top-secret-phrase');
    console.log('TOKEN: ' + portalToken);

    if (this.props.location.search.indexOf('prov=') > -1) {
      parametros = new URLSearchParams(this.props.location.search);
      if (parametros.get('prov')) {
        user = `${parametros.get('prov')}${user}`;
      }
    }
    this.props.setUser(user);

    this.props.setCaseFile({
      casefile: casefile,
      bbdd: bbdd,
      company: company,
    });

    if (mailContacts) {
      console.log('Contactos recibidos');
      const base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
      if (base64regex.test(mailContacts)) {
        this.props.setMailContacts(base64.decode(mailContacts));
      } else {
        this.props.setMailContacts(mailContacts);
      }
    }

    if (idMail) {
      this.props.setIdMail(idMail);
    }

    if (this.props.match.params.token) {
      this.props.setToken(portalToken.toString());
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.lexon !== this.props.lexon) {
      if (this.props.lexon.isNewAccount) {
        mountScripts().then(this.init);
      } else {
        this.isUniqueAccountByProvider();
      }
    }
  }

  isUniqueAccountByProvider = async () => {
    const { lexon } = this.props;

    try {
      const result = await getUser(lexon.userId);
      window.currentUser = result.data.tokenDecoded;
      this.props.setCurrentUser(result.data.tokenDecoded);

      if (result.errors.length === 0) {
        const accountsByProvider = result.data.accounts.filter(
          (account) => account.provider.toUpperCase() === PROVIDER
        );
        if (accountsByProvider.length > 1) {
          mountScripts().then(this.init);
        } else {
          this.setState({
            readyToRedirect: true,
            loading: false,
          });
        }
      }
    } catch (err) {
      throw err;
    }
  };

  init() {
    window.gapi.load('client:auth2', this.initClient);
  }

  initClient() {
    checkSignInStatus()
      .then((_) => {
        //this.onSignout();
        this.setState({
          readyToRedirect: true,
          loading: false,
        });
      })
      .catch((error) => {
        if (error === undefined) {
          this.setState({
            readyToRedirect: true,
            loading: false,
          });
        }
      });
  }

  onSignout() {
    signOut();
  }

  onSignoutDisconnect() {
    signOutDisconnect();
  }

  render() {
    const { loading, readyToRedirect, redirectToEmail } = this.state;
    if (loading) {
      return <Spinner />;
    }
    if (readyToRedirect) {
      // if (redirectToEmail === undefined){
      //   return <Redirect to="/" />;
      // }else{
      //   return <Redirect to={`/message/${this.props.match.params.idMail}`}/>;
      // }
      if (
        this.props.lexon.idMail === undefined ||
        this.props.lexon.idMail === null
      ) {
        return <Redirect to='/' />;
      } else {
        return <Redirect to={`/message/${this.props.lexon.idMail}`} />;
      }
    }

    return null;
  }
}

const mapStateToProps = (state) => ({
  lexon: state.lexon,
});

const mapDispatchToProps = (dispatch) => ({
  setUser: (user) => dispatch(ACTIONS.setUser(user)),
  setCaseFile: (casefile) => dispatch(ACTIONS.setCaseFile(casefile)),
  setMailContacts: (mailContacts) =>
    dispatch(ACTIONS.setMailContacts(mailContacts)),
  setIdMail: (idMail) => dispatch(ACTIONS.setIdMail(idMail)),
  setToken: (token) => dispatch(ACTIONS.setToken(token)),
  setCurrentUser: (payload) => dispatch(CU_ACTIONS.setCurrentUser(payload)),
});

export default connect(mapStateToProps, mapDispatchToProps)(UserLexon);
