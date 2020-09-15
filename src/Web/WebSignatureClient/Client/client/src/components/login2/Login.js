import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect, withRouter } from 'react-router-dom';
import { translate } from 'react-i18next';


import validator from 'email-validator';
import LoginComponents from './LoginComponents';
import { getUser } from '../../services/services-lexon';
import { Header } from '../../components/header/Header';
import Footer from '../../components/footer/Footer';

import '../../styles/Login.css';

// import logoLexon from '../../../assets/images/LogoLexOn.jpg';
// import iconUser from '../../../assets/images/icon-user.png';
// import iconLock from '../../../assets/images/icon-lock.png';
import i18n from 'i18next';
import Cookies from 'js-cookie';
import { clearUserCredentials, setUserCredentials } from "../../actions/application";
import { setUser } from "../../actions/lefebvre";
import { getSignedToken } from "../../services/api-signaturit";

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      form: {
        login: '',
        password: '',
      },
      isPermission: false,
      errorsMessage: {
        email: '',
        login: '',
        password: '',
        auth: '',
      },
      isloading: false,
      keyCodeEnter: 13,
      shopTitle: this.props.t('login.shop'),
      notClient: this.props.t('login.notClient'),
      requestInfo: this.props.t('login.requestInfo'),
      needHelp: this.props.t('login.needHelp'),
      phoneNumber: this.props.t('login.phoneNumber'),
      client: this.props.t('login.client'),
      required: i18n.t('login.required'),
    };
    // this.handleChange= this.handleChange.bind(this);
    // this.validateForm= this.validateForm.bind(this);

  }

  handleChange = (e) => {
    this.setState({
      form: {
        ...this.state.form,
        [e.target.name]: e.target.value,
      },
      errorsMessage: {
        ...this.state.errorsMessage,
        [e.target.name]: '',
        email: '',
      },
    });
    if (this.state.form.login !== '' && this.state.form.password !== '') {
      this.setState({
        errorsMessage: {
          email: null,
          login: null,
          password: null,
        },
      });
    }
  };

  validateForm = () => {
    let bRes = true;
    let errors = { ...this.state.errorsMessage };

    if (this.state.form.login === '') {
      errors = {
        ...errors,
        login: this.state.required,
      };

      bRes = false;
    }

    if (bRes === true && !validator.validate(this.state.form.login)) {
      errors = {
        ...errors,
        email: i18n.t('login.email-error'),
      };

      bRes = false;
    }

    if (this.state.form.password === '') {
      errors = {
        ...errors,
        password: this.state.required,
      };

      bRes = false;
    }

    if (!bRes) {
      this.setState({ errorsMessage: errors });
      return false;
    }

    return true;
  };

  async getUser() {
    //const user = await getUser(this.state.form);
    // if (user.result.data._idEntrada) {
    //   this.setState(
    //     {
    //       errorsMessage: {
    //         auth: '',
    //       },
    //     },
    //     () => {
    //       this.gotoPortal(user.result.data._idEntrada);
    //     }
    //   );
    // } else {
    //   this.setState({
    //     errorsMessage: {
    //       auth: i18n.t('login.user-error'),
    //     },
    //   });
    // }
    getSignedToken(this.state.form.login, this.state.form.password)
    .then(info => {
      if (info.data.valid){
        this.setState({isloading: false});
        document.body.style.cursor='default'
        this.props.history.push(`/access/${info.data.token}`)
      }
      else {
        this.setState({isloading: false});
        document.body.style.cursor='default'
        this.setState({
            errorsMessage: {
              auth: i18n.t('login.user-error'),
            },
        });
      }
    })
    
  }

  gotoPortal = (userId) => {
    //userId = 'E1654569';
    this.props.setUser(`IM0${userId}`);
    const cookie = Cookies.set(`Lefebvre.Signaturit.${userId}`, "Logged by form", {
      expires: 1,
      domain: (window.REACT_APP_ENVIRONMENT==='LOCAL' ? 'localhost': 'lefebvre.es')
    });
    this.props.setUserCredentials(userId, userId, {authenticated: true, encrypted: cookie, salt: "1234", name: ""})
    //return <Redirect to="/" />
    this.props.history.push("/")
  };

  handleEventLogin = (e) => {
    if (this.validateForm()) {
      this.setState({isloading: true});
      document.body.style.cursor = 'wait';
      this.getUser();
    }
  };

  keyUpHandler = (event) => {
    if(event.keyCode === this.state.keyCodeEnter) {
      this.handleEventLogin();
    }
  }

  componentDidMount(){
    const { user } = this.state.form.login;
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
        //return <Redirect to="/" />
        this.props.history.push("/")
    }
    if (this.props.application.user.credentials) {
        //return <Redirect to="/" />;
        this.props.history.push("/")
    }
  }

  render() {
    

    return (
      <div className='wrapper'>
        <Header showUser={false}></Header>
        <LoginComponents
          // iconUser={iconUser}
          // iconLock={iconLock}
          // logoLexon={logoLexon}
          handleChange={this.handleChange}
          errorsMessage={this.state.errorsMessage}
          handleEventLogin={this.handleEventLogin}
          keyUpHandler={this.keyUpHandler}
          notClient={this.state.notClient}
          requestInfo={this.state.requestInfo}
          needHelp={this.state.needHelp}
          phoneNumber={this.state.phoneNumber}
          client={this.state.client}
          isloading={this.state.isloading}
        />
        <Footer></Footer>
        
      </div>
    );
  }
}

const mapStateToProps = state => ({
  application: state.application,
  formValues: state.login.formValues,
  lefebvre: state.lefebvre
});

const mapDispatchToProps = dispatch => ({
  dispatchLogin: credentials => login(dispatch, credentials),
  setUserCredentials: (userId, hash, credentials) => dispatch(setUserCredentials(userId, hash, credentials)),
  setUser: user => dispatch(setUser(user)),

});

export default connect(mapStateToProps, mapDispatchToProps)(translate()(withRouter(Login)));