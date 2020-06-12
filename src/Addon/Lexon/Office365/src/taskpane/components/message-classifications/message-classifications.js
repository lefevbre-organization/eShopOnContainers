import React, { Component } from 'react';
import { ChoiceGroup, Button } from 'office-ui-fabric-react';
import Header from '../header/header';
import { PAGE_LOGIN, PAGE_SELECT_COMPANY } from "../../constants";
import CryptoJS from 'crypto-js';
import '../message-classifications/message-classifications.css';
const OfficeHelpers = require("@microsoft/office-js-helpers");

class MessageClassifications extends Component {
    _isMounted = false;
    constructor(props, context) {
        super(props, context);
        this.state = {
         addonData: null,
         addonDataToken: null
        };
      }

    componentDidMount() {
      this._isMounted = true;
      this.getAddonData();
    }

    base64url(source) {
      // Encode in classical base64
     let encodedSource = CryptoJS.enc.Base64.stringify(source);
    
      // Remove padding equal characters
      encodedSource = encodedSource.replace(/=+$/, '');
    
      // Replace characters according to base64url specifications
      encodedSource = encodedSource.replace(/\+/g, '-');
      encodedSource = encodedSource.replace(/\//g, '_');
    
      return encodedSource;
    }

    getAddonDataToken(addonData){
      const header = {
        "alg": "HS256",
        "typ": "JWT"
      };
     
      const stringifiedHeader = CryptoJS.enc.Utf8.parse(JSON.stringify(header));
      const encodedHeader = this.base64url(stringifiedHeader);

      const stringifiedData = CryptoJS.enc.Utf8.parse(JSON.stringify(addonData));
      const encodedData = this.base64url(stringifiedData);

      const token = encodedHeader + "." + encodedData;

      const secret = "AddonLexonClient";

      let signature = CryptoJS.HmacSHA256(token, secret);
      signature = this.base64url(signature);

      const jwt =  token + "." + signature;
      this.setState({addonDataToken: jwt});
    }

    getAddonData() {
      const { selectCompany } = this.props
      const mailbox = Office.context.mailbox;
      const user = JSON.parse(localStorage.getItem('auth-lexon')); 
   
      Office.context.mailbox.item.getAllInternetHeadersAsync(
        function(asyncResult) {
            asyncResult.value
        }
      );
      
      const addonData = {
        idCompany: selectCompany.idCompany,
        bbdd: selectCompany.bbdd,
        name: selectCompany.name,
        account: mailbox.userProfile.emailAddress,
        provider: 'OU',
        messageId: mailbox.item.internetMessageId,
        messageById: mailbox.item.conversationId,
        subject: mailbox.item.subject,
        folder: mailbox.item.itemType,
        sentDateTime: mailbox.item.dateTimeCreated,
        idUser: "449",
        idClienteNav: user.data._idClienteNav,
        userName: user.data._nombre,
        email: user.data._login
      }

      this.setState({addonData: addonData});
      this.getAddonDataToken(addonData)
    }
  
      
    componentWillUnmount() {
      this._isMounted = false;
    }

    logout = async () => { 
      localStorage.removeItem('auth-lexon');
      this.props.changePage(PAGE_LOGIN);
    }

    changeCompany = () => {
      this.props.changePage(PAGE_SELECT_COMPANY);
    }

    newConection = () => {
      const { addonDataToken } = this.state;
      let authenticator = new OfficeHelpers.Authenticator();
      // authenticator.endpoints.registerAzureADAuth('a8c9f1a1-3472-4a83-8725-4dfa74bac24d');
      // tokenUrl: 'https://lexbox-test-apigwlex.lefebvre.es/api/v1/utils/UserUtils/user/login',
      authenticator.endpoints.add("lexon", { 
        provider: 'lexon',
        clientId: 'a8c9f1a1-3472-4a83-8725-4dfa74bac24d',
        baseUrl: 'https://localhost:3000',
        redirectUrl: 'https://localhost:3020/taskpane.html',
        authorizeUrl: '/lexon',
        scope: 'openid profile onelist offline_access',
        responseType: 'code',
        state: true,
        extraQueryParameters: {
          bbdd: JSON.stringify(addonDataToken)
        }
      });
      authenticator.authenticate('lexon', true)
     .then(token => { 
     })
     .catch(error => {
      console.log(error)
     });
      console.log(addonDataToken);
    }

    render() {
     const { selectCompany } = this.props
      return (
        <div className="">  
         <Header logout={this.logout} />
         <p className="company-id">
          Empresa identificada:
          <br/>
         <strong>{selectCompany.name}</strong>
          <a href="#/" title="Cambiar de empresa" onClick={this.changeCompany}>
           <span className="lf-icon-arrow-exchange"></span>
          </a>
         </p>
         <img src={"https://www.dropbox.com/s/tt80ho1st9ei233/Screen%20Shot%202020-03-24%20at%202.18.20%20PM.png?raw=1"} 
         alt={"Clasificar mensajes"} />
         <p className="add-more-container">
         <a href="#/" className="add-more" onClick={this.newConection}>
           <span className="lf-icon-add-round"></span>
           <strong>Nueva clasificación</strong>
          </a>
         </p>
        <img src={"https://www.dropbox.com/s/z1pntri2wwo57fu/Screen%20Shot%202020-03-26%20at%207.02.50%20PM.png?raw=1"} 
         alt={"Clasificaciones"} />
        </div>
      );
    }
}

export default MessageClassifications;