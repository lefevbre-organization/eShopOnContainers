import React, { Component } from 'react';
import queryString from 'query-string';
import validator from 'email-validator';
import LoginHeader from '../components/LoginHeader';
import LoginFooter from '../components/LoginFooter';
import LoginComponents from '../components/LoginComponents';
import { getUser, base64Decode } from "../services/services-lexon";

import '../assets/styles/components/Login.css';
import logoHeader from '../assets/img/LogoLefebvre.png';
import shopHeader from '../assets/img/icon-shop.png';
import logoLexon from '../assets/img/logo-lexon.png';
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
        password: '',
        auth: ''
      },
      keyCodeEnter: 13,
      shopTitle: 'TIENDA',
      notClient: 'No soy cliente.',
      requestInfo: 'Solicitar información',
      needHelp: '¿Necesitas ayuda?',
      phoneNumber: '91 210 80 00 - 902 44 33 55 |',
      client: 'clientes@lefebvre.es',
      required: 'Este campo es obligatorio.'
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
          login: this.state.required
        }
       });
       return false;
    }

    if(!validator.validate(this.state.form.login)) {
      this.setState({
        errorsMessage: {
          email: 'El campo debe tener formato de email.'
        }
      });
      return false;
    }

    if(this.state.form.password == '') {
      this.setState({ 
        errorsMessage: {
          password: this.state.required
        }
       });
       return false;
    }
   
    return true;
  }

  validateUser = (userBase64Decode) => {
    let role = userBase64Decode.roles.some(role => {
      return (role === "Lex-On");    
     });
     if(role) {
      window.$('body').removeClass('waiting');
       this.setState({
       errorsMessage: {
         auth: ''
       }
      });
     this.goBackAddon(); 
     } else {
      window.$('body').removeClass('waiting');
       this.setState({
         errorsMessage: {
          auth: 'El usuario no tiene acceso a Lex-On.'
         }
       });
     }
  }

  async getUser() {
    
   const user = await getUser(
     this.state.form
   );
    if(user.result.data.token) {
     const userBase64Decode = base64Decode(user);
     this.setState({
      errorsMessage: {
        auth: ''
      }
    });
     this.validateUser(userBase64Decode);
    } else {
      window.$('body').removeClass('waiting');
      this.setState({
        errorsMessage: {
          auth: 'Usuario o Contraseña inválidos.'
        }
      });
    }
  }

  goBackAddon = () => {
    const values = queryString.parse(this.props.location.search);
    window.location.replace(values.redirect_uri + '?success=1&response_type=' + 
    values.response_type + '&state=' + values.state + '&login=' 
    + this.state.form.login + '&password=' + this.state.form.password);
  }

  handleEventAddon = (e) => {
    if (this.validateForm()) {
      window.$('body').addClass('waiting');
       this.getUser();
    };
  }

  keyUpHandler = (event) => {
    if(event.keyCode === this.state.keyCodeEnter) {
      this.handleEventAddon();
    }
  }

  goToSocial = (value) => {
   switch (value) {
     case 'f':
       return window.open("https://www.facebook.com/Lefebvre.ES");
     case 'l':
       return window.open("https://www.linkedin.com/company/lefebvre_es/");
      case 'y':
       return window.open("https://www.youtube.com/c/lefebvre_es");
      case 't':
       return window.open("https://twitter.com/Lefebvre_ES");
     default:
       break;
   }
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
         logo={logoLexon}
         handleChange={this.handleChange}
         errorsMessage={this.state.errorsMessage}
         handleEventAddon={this.handleEventAddon}
         keyUpHandler={this.keyUpHandler}
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
         goToSocial={this.goToSocial}
        />
      </div>
         
         
    );
  }
}

export default Login
