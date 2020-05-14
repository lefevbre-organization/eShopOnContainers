import React, { Component } from 'react';
import queryString from 'query-string';
import validator from 'email-validator';
import LoginHeader from '../components/LoginHeader';
import LoginFooter from '../components/LoginFooter';
import LoginComponents from '../components/LoginComponents';

import '../assets/styles/components/Login.css';
import logoHeader from '../assets/img/LogoLefebvre.png';
import shopHeader from '../assets/img/icon-shop.png';
import logoLexon from '../assets/img/LogoLexOn.jpg';
import logoFooter from '../assets/img/lefebvre-ij-bl-160x57.png';
import iconFacebook from '../assets/img/icon-facebook-round.png'; 
import iconLinkedin from '../assets/img/icon-linkedin-round.png';
import iconTwitter from '../assets/img/icon-twitter-round.png'
import iconYoutube from '../assets/img/icon-youtube-round.png'
import iconUser from '../assets/img/icon-user.png'
import iconLock from '../assets/img/icon-lock.png'

class Login extends Component {

  constructor(props) {
    super(props);
    this.state = {
      form: {
        login: '',
        password: ''
      },
      isPermission: false,
      errorsMessage: {
        email: '',
        login: '',
        password: ''
      },

      shopTitle: 'TIENDA',
      notClient: 'No soy cliente.',
      requestInfo: 'Solicitar información',
      needHelp: '¿Necesitas ayuda?',
      phoneNumber: '91 210 80 00 - 902 44 33 55 |',
      client: 'clientes@lefebvre.es'
    } 
  }

  handleChange = (e) => {
   this.setState({
     form: {
       ...this.state.form,
       [e.target.name]: e.target.value,
     },
   });
   if(this.state.form.login != '' && this.state.form.password != '' ) {
    this.setState({
      errorsMessage: {
        email: null,
        login: null,
        password: null
      },
    });
   }
  };

  validateForm = () => {
    if(this.state.form.login == '') {
      this.setState({ 
        errorsMessage: {
          login: 'Este campo es obligatorio'
        }
       });
       return false;
    }

    if(!validator.validate(this.state.form.login)) {
      this.setState({
        errorsMessage: {
          email: 'Correo no valido'
        }
      });
      return false;
    }

    if(this.state.form.password == '') {
      this.setState({ 
        errorsMessage: {
          password: 'Este campo es obligatorio'
        }
       });
       return false;
    }
   
    return true;
  }

  goBackAddon = () => {
    const values = queryString.parse(this.props.location.search);
    window.location.replace(values.redirect_uri + '?success=1&response_type=' + 
    values.response_type + '&state=' + values.state + '&login=' 
    + this.state.form.login + '&password=' + this.state.form.password);
  }

  handleEventAddon = (e) => {
    if (this.validateForm()) {
       this.goBackAddon();
    };
  }

  render() {
    return (
      <div className="wrapper">
        <LoginHeader 
        logoHeader={logoHeader} 
        shopHeader={shopHeader} 
        shopTitle={this.state.shopTitle}
        />
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
    
        <LoginFooter 
         logoFooter={logoFooter} 
         iconFacebook={iconFacebook}
         iconLinkedin={iconLinkedin}
         iconTwitter={iconTwitter}
         iconYoutube={iconYoutube}
        />
      </div>
         
         
    );
  }
}

export default Login
