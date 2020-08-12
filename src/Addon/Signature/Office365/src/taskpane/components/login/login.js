import React, { Component } from "react";
import { PrimaryButton } from "office-ui-fabric-react";
import i18n from 'i18next';
import LoginHeader from "../header/login-header";
import Progress from "../Progress";
import Spinner from '../spinner/spinner';

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
    authenticator.endpoints.add("auth-signature", { 
      provider: 'auth-signature',
      clientId: 'a8c9f1a1-3472-4a83-8725-4dfa74bac24d',
      baseUrl: `${window.URL_ADDON_SIGNATURE}`,
      tokenUrl: `${window.URL_GET_TOKEN}/utils/UserUtils/token`,
      redirectUrl: `${window.URL_ADDON_SIGNATURE_BASE}/taskpane.html`,
      authorizeUrl: '/oauth_signature',
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
     authenticator.authenticate('auth-signature', true)
     .then(token => { 
       localStorage.setItem('auth-signature', JSON.stringify(token));
       if(this._isMounted){
        // this.props.changePage();
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
        <Progress title={title} logo="assets/logo-filled.png"  />
      );
    }

    return (
      <div className="ms-welcome">
        <div className="text-center">
          <PrimaryButton
            className="popupButton 
            btn-login ms-Button ms-Button--primary 
            ms-Button-label btn-label"
            onClick={this.click}
          >
            {i18n.t('login.button-title')}
          </PrimaryButton>
          </div> 
      </div>
    );
  }
}

export default Login;