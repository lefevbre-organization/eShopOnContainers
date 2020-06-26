import React, { Component } from "react";
import { Button, ButtonType } from "office-ui-fabric-react";
import LoginHeader from "../header/login-header";
import Progress from "../Progress";
import Spinner from '../spinner/spinner';
import { PAGE_SELECT_COMPANY } from "../../constants";
/* global Button, Header, HeroList, HeroListItem, Progress */
// const OfficeHelpers = require("@microsoft/office-js-helpers");

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
        // authenticator.endpoints.registerAzureADAuth('a8c9f1a1-3472-4a83-8725-4dfa74bac24d');
        authenticator.endpoints.add("auth-lexon", { 
          provider: 'auth-lexon',
          clientId: 'a8c9f1a1-3472-4a83-8725-4dfa74bac24d',
          baseUrl: `${window.URL_ADDON_LEXON}`,
          tokenUrl: `${window.API_GATEWAY}/utils/Lexon/token/login?addTerminatorToToken=true`,
          redirectUrl: `${window.URL_ADDON_LEXON_BASE}/taskpane.html`,
          authorizeUrl: '/login',
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
     authenticator.authenticate('auth-lexon', true)
     .then(token => { 
       console.log(token);
       localStorage.setItem('auth-lexon', JSON.stringify(token));
       if(this._isMounted){
        this.props.changePage(PAGE_SELECT_COMPANY);
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
       {!isLoading ? <LoginHeader logo="assets/logo-filled.png" title={'logo'} /> 
       : null}
        {isLoading ? <Spinner /> :
        <div className="text-center">
         <img align="center" src="../../assets/logo-2.png" className="logo-2-space" 
         alt="lexon" title="lexon" />
          <Button
            className="popupButton 
            btn-login ms-Button ms-Button--primary 
            ms-Button-label btn-label"
            // buttonType={ButtonType.hero}
            // iconProps={{ iconName: "ChevronRight" }}
            onClick={this.click}
          >
            INICIAR SESIÓN
          </Button>
           
          <p align="center" className="reserved">©2020 Lefebvre. Todos los derechos reservados.</p>
          </div> }
      </div>
    );
  }
}

export default Login;