import React, { Component } from "react";
import { PrimaryButton } from "office-ui-fabric-react";
import i18n from 'i18next';
import LoginHeader from "../header/login-header";
import Progress from "../Progress";
import Spinner from '../spinner/spinner';
import { PAGE_ARCHIVE_MESSAGE } from "../../constants";

class Login extends Component {
  _isMounted = false;
  constructor(props, context) {
    super(props, context);
    this.state = {
      isLoading: false,
    };
  }

  componentDidMount() {
    this._isMounted = true;
    if (OfficeHelpers.Authenticator.isAuthDialog()) {
      return;
    }
    var authenticator = new OfficeHelpers.Authenticator();
    authenticator.endpoints.add("auth-centinela", { 
      provider: 'auth-centinela',
      clientId: 'a8c9f1a1-3472-4a83-8725-4dfa74bac24d',
      baseUrl: `${window.URL_ADDON_CENTINELA}`,
      tokenUrl: `${window.API_GATEWAY}/utils/UserUtils/token`,
      redirectUrl: `${window.URL_ADDON_CENTINELA_BASE}/taskpane.html`,
      authorizeUrl: '/oauth_centinela',
      scope: 'openid profile onelist offline_access',
      responseType: 'code',
      state: true
   });
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  click = async () => {
    var authenticator = new OfficeHelpers.Authenticator();
    this.setState({ isLoading: true });
     authenticator.authenticate('auth-centinela', true)
     .then(token => { 
       localStorage.setItem('auth-centinela', JSON.stringify(token));
       if(this._isMounted){
        this.props.changePage(PAGE_ARCHIVE_MESSAGE);
       }
     })
     .catch(error => {
      console.log(error)
      this.setState({ isLoading: false });
     });
  };

  render() {
    const { title, isOfficeInitialized } = this.props;
    const { isLoading } = this.state;
     
    
    if (!isOfficeInitialized) {
      return (
        <Progress title={title} logo="assets/lefebvre-centinela.png"  />
      );
    }

    return (
      <div className="ms-welcome">
       {!isLoading ? <LoginHeader logo="assets/lefebvre-centinela.png" title={'Logo'} /> 
       : null}
        {isLoading ? <Spinner /> :
        <div className="text-center">
         <img align="center" src="assets/iconos-circulo-centinela.png" className="logo-2-space" 
         alt="Centinela" title="Centinela" />
          <PrimaryButton
            className="popupButton 
            btn-login ms-Button ms-Button--primary 
            ms-Button-label btn-label"
            onClick={this.click}
          >
            {i18n.t('login.button-title')}
          </PrimaryButton>
          <p align="center" className="reserved">©2020 Lefebvre. Todos los derechos reservados.</p>
          </div> }
      </div>
    );
  }
}

export default Login;