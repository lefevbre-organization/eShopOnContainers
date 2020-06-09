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

      shopTitle: 'TIENDA',
      notClient: 'No soy cliente.',
      requestInfo: 'Solicitar información',
      needHelp: '¿Necesitas ayuda?',
      phoneNumber: '91 210 80 00 - 902 44 33 55 |',
      client: 'clientes@lefebvre.es',
      required: 'Este campo es obligatorio.',
    };
  }

  handleChange = (e) => {
    this.setState({
      form: {
        ...this.state.form,
        [e.target.name]: e.target.value,
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
    if (this.state.form.login === '') {
      this.setState({
        errorsMessage: {
          login: this.state.required,
        },
      });
      return false;
    }

    if (!validator.validate(this.state.form.login)) {
      this.setState({
        errorsMessage: {
          email: 'El campo debe tener formato de email.',
        },
      });
      return false;
    }

    if (this.state.form.password === '') {
      this.setState({
        errorsMessage: {
          password: this.state.required,
        },
      });
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
          auth: 'Usuario o Contraseña inválidos.',
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
