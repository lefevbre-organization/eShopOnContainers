import React, { Component } from 'react';
import queryString from 'query-string';
import validator from 'email-validator';
import LoginComponents from './LoginComponents';
import { getUser } from '../../services/services-lexon';
import { Header } from '../../components/header/Header';
import Footer from '../../components/footer/Footer';

import '../../assets/styles/components/Login.css';
import logoLexon from '../../assets/img/LogoLexOn.jpg';
import iconUser from '../../assets/img/icon-user.png';
import iconLock from '../../assets/img/icon-lock.png';
import i18n from '../../services/i18n';

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

      shopTitle: i18n.t('login.shop'),
      notClient: i18n.t('login.notClient'),
      requestInfo: i18n.t('login.requestInfo'),
      needHelp: i18n.t('login.needHelp'),
      phoneNumber: i18n.t('login.phoneNumber'),
      client: i18n.t('login.client'),
      required: i18n.t('login.required'),
    };
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
    const user = await getUser(this.state.form);
    if (user.result.data._idEntrada) {
      this.setState(
        {
          errorsMessage: {
            auth: '',
          },
        },
        () => {
          this.gotoPortal(user.result.data._idEntrada);
        }
      );
    } else {
      this.setState({
        errorsMessage: {
          auth: i18n.t('login.user-error'),
        },
      });
    }
  }

  gotoPortal = (userId) => {
    const urlPortal = `/user/${userId}/encrypt/0`;
    window.location.href = urlPortal;
  };

  handleEventAddon = (e) => {
    if (this.validateForm()) {
      this.getUser();
    }
  };

  render() {
    return (
      <div className='wrapper'>
        <Header showUser={false}></Header>
        <LoginComponents
          iconUser={iconUser}
          iconLock={iconLock}
          logoLexon={logoLexon}
          handleChange={this.handleChange}
          errorsMessage={this.state.errorsMessage}
          handleEventAddon={this.handleEventAddon}
          notClient={this.state.notClient}
          requestInfo={this.state.requestInfo}
          needHelp={this.state.needHelp}
          phoneNumber={this.state.phoneNumber}
          client={this.state.client}
        />
        <Footer></Footer>
      </div>
    );
  }
}

export default Login;
