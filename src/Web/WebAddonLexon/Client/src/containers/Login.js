import React, { Component } from 'react';
import queryString from 'query-string';
import LoginHeader from '../components/LoginHeader';
import LoginFooter from '../components/LoginFooter';
import LoginComponents from '../components/LoginComponents';
import { signIn } from '../api/authentication';

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
      shopTitle: 'TIENDA',
      notClient: 'No soy cliente.',
      requestInfo: 'Solicitar información',
      needHelp: '¿Necesitas ayuda?',
      phoneNumber: '91 210 80 00 - 902 44 33 55 |',
      client: 'clientes@lefebvre.es'
    } 
  }
  
     componentDidMount() {
     }

     onSignIn() {
      signIn().then(this.onSignInSuccess);
    }
  
    onSignInSuccess(googleUser) {
        console.log(googleUser);
      const values = queryString.parse(window.location.search);
      if (values && values.bbdd) {
          const addonData = JSON.parse(values.bbdd)
          this.setState({
              signInStatus: AUTH_SUCCESS,
              googleUser: googleUser,
              openEmail: addonData.messageId
            });
          
      }  
  //    this.props.setAccount(googleUser.getBasicProfile().getEmail());
    }

     handleChange = e => {
      this.setState({
        form: {
          ...this.state.form,
          [e.target.name]: e.target.value,
        },
      });
    };

     handleEvent = (e) => {
      //  this.onSignIn();
      const values = queryString.parse(this.props.location.search);
      window.location.replace(values.redirect_uri + '?success=1&response_type=' + 
      values.response_type + '&state=' + values.state + '&login=' 
      + this.state.form.login + '&password=' + this.state.form.password)
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
             handleEvent={this.handleEvent}
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
 const mapStateToProps=(state)=>{
  return state
 };

export default Login
// export default connect (mapStateToProps, actionCreators) (Login);