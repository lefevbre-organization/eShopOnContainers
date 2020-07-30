import React, { Component } from 'react';
import CryptoJS from 'crypto-js';
import { 
  base64Decode, 
  getClassifications,
  base64url,
  removeClassification,
  getRawAddon,
  saveMessageRaw,
  removeRawAddon
} from '../../services/services';
import Header from '../header/header';
import ListClassifications from '../list-classifications/list-classifications'
import Spinner from '../spinner/spinner';
import { PAGE_LOGIN, PAGE_SELECT_COMPANY } from "../../constants";

import '../message-classifications/message-classifications.css';
// const OfficeHelpers = require("@microsoft/office-js-helpers");

class MessageClassifications extends Component {
    _isMounted = false;
    constructor(props, context) {
        super(props, context);
        this.state = {
         addonData: null,
         addonDataToken: null,
         classifications: null,
         messageRaw: null,
         user: null,
         isOfficeInitialized: false,
         isLoading: false
        };
      }

    componentDidMount() {
      if (OfficeHelpers.Authenticator.isAuthDialog()) {
        return;
      }
      this._isMounted = true;
      this.getClassifications();
      this.getMessageRaw();
      this.getAddonData();
    }

    componentDidUpdate(prevProps, prevState) {
      if(prevProps.isOfficeInitialized !== this.props.isOfficeInitialized) {
        const conversationId = Office.context.mailbox.initialData.conversationId;
        if(conversationId == null) {
          return this.changeCompany();
        }
        this.getClassifications();
        Office.context.mailbox.item.getAllInternetHeadersAsync(
          (asyncResult) => {
            this.setState({messageRaw: asyncResult.value });
          }
        );
        this.getAddonData();
      }
    }
    
    componentWillUnmount() {
      this._isMounted = false;
    }

    getClassifications = async () => {
      const { selectCompany, isOfficeInitialized } = this.props;
      const user = base64Decode();
      this.setState({ user: user })
      let messageId = Office.context.mailbox.item.internetMessageId;
      getClassifications(
        user.idUserApp, 
        selectCompany.bbdd, 
        messageId
      )
        .then((result) => {
          this.setState({
            classifications: result.classifications
          });
        })
        .catch((error) => {
          console.log('error ->', error);
        });
    }

    getMessageRaw = () => {
      const { isOfficeInitialized } = this.props;
      if(isOfficeInitialized) {
        Office.context.mailbox.item.getAllInternetHeadersAsync(
          (asyncResult) => {
            this.setState({messageRaw: asyncResult.value });
          }
        );
      }
     
    }

    getProviderLexon(jwt) {
      let authenticator = new OfficeHelpers.Authenticator();
      authenticator.endpoints.add("lexon", { 
        provider: 'lexon',
        clientId: 'a8c9f1a1-3472-4a83-8725-4dfa74bac24d',
        baseUrl: `${window.URL_ADDON_LEXON}`,
        redirectUrl: `${window.URL_ADDON_LEXON_BASE}/taskpane.html`,
        authorizeUrl: '/lexon',
        scope: 'openid profile onelist offline_access',
        responseType: 'code',
        state: true,
        extraQueryParameters: {
          bbdd: JSON.stringify(jwt)
        }
      });
    }

    getAddonDataToken(addonData){

      const header = {
        "alg": "HS256",
        "typ": "JWT"
      };
     
      const stringifiedHeader = CryptoJS.enc.Utf8.parse(JSON.stringify(header));
      const encodedHeader = base64url(stringifiedHeader);

      const stringifiedData = CryptoJS.enc.Utf8.parse(JSON.stringify(addonData));
      const encodedData = base64url(stringifiedData);

      const token = encodedHeader + "." + encodedData;

      const secret = "AddonLexonClient";

      let signature = CryptoJS.HmacSHA256(token, secret);
      signature = base64url(signature);

      const jwt =  token + "." + signature;
  
      this.setState({addonDataToken: jwt});
      this.getProviderLexon(jwt);
    }

    getAddonData = async () =>   {
      const { selectCompany } = this.props
      const mailbox = Office.context.mailbox;
      const user = base64Decode();
      const addonData = {
        idCompany: selectCompany.idCompany,
        bbdd: selectCompany.bbdd,
        name: selectCompany.name,
        account: mailbox.userProfile.emailAddress,
        provider: 'OU',
        messageId: mailbox.item.internetMessageId,
        messageById: mailbox.item.internetMessageId,
        subject: mailbox.item.subject,
        folder: mailbox.item.itemType,
        sentDateTime: mailbox.item.dateTimeCreated,
        idUser: user.idUserApp,
        idClienteNav: user.idClienteNavision,
        userName: user.name,
        email: user.login,
        addonType: "MessageRead"
      }
       const msgRaw = await getRawAddon(
        addonData
      );
      if(msgRaw.result.data == null) {
        saveMessageRaw(addonData, this.state.messageRaw);
      }
    
      this.setState({addonData: addonData});
      this.getAddonDataToken(addonData)
     
    }

    changeCompany = () => {
      localStorage.removeItem('selectCompany');
      this.props.changePage(PAGE_SELECT_COMPANY);
    }

    logout = async () => { 
      localStorage.removeItem('auth-lexon');
      localStorage.removeItem('selectCompany');
      this.props.changePage(PAGE_LOGIN);
    }

    removeClassification = (classification, selectCompany) => {
      const user = base64Decode();
      const mailbox = Office.context.mailbox;
      this.setState({ isLoading: true });
      removeClassification(
        classification.idMail,
        classification.entityIdType,
        selectCompany.bbdd,
        user.idUserApp,
        mailbox.userProfile.emailAddress,
        classification.idRelated,
        selectCompany.idCompany
      )
       .then(response => {
          this.getClassifications();
          this.setState({ isLoading: false });
        })
        .catch(error => {
          console.log('error ->', error);
          this.setState({ isLoading: false });
        });
     
    }

    newConection = () => {
      const mailbox = Office.context.mailbox;
      const user = base64Decode();
      const addonData = {
        account: mailbox.userProfile.emailAddress,
        provider: 'OU',
        messageById: mailbox.item.internetMessageId,
        idClienteNav: user.idClienteNavision,
      }
      this.getAddonData();
      this.setState({ isLoading: true });
      let authenticator = new OfficeHelpers.Authenticator();
      authenticator.authenticate('lexon', true)
     .then(token => { 
      this.setState({ isLoading: false });
     })
     .catch(error => {
      this.getClassifications();
      removeRawAddon(addonData);
      this.setState({ isLoading: false });
     });
    }

    render() {
     const { selectCompany } = this.props;
     const { classifications, user, isLoading } = this.state;
     
     if(isLoading) {
       return (
        <Spinner />
       )
     }
      return (
       <div className="">  
          <Header logout={this.logout} user={user} />
          <p className="company-id">
           Empresa identificada:
           <br/>
          <strong>{selectCompany.name}</strong>
           <a href="#/" title="Cambiar de empresa" onClick={this.changeCompany}>
            <span className="lf-icon-arrow-exchange"></span>
           </a>
          </p>
          <img src={"https://www.dropbox.com/s/tt80ho1st9ei233/Screen%20Shot%202020-03-24%20at%202.18.20%20PM.png?raw=1"} 
          alt={"Clasificar mensajes"} width="310" />
          <p className="add-more-container">
          <a href="#/" className="add-more" onClick={this.newConection}>
            <span className="lf-icon-add-round"></span>
            <strong>Nueva clasificación</strong>
           </a>
          </p>
        {classifications != null ? <ListClassifications 
         classifications={classifications} 
         selectCompany={selectCompany}
         removeClassification={this.removeClassification}
        /> :  
         <img src={"https://www.dropbox.com/s/z1pntri2wwo57fu/Screen%20Shot%202020-03-26%20at%207.02.50%20PM.png?raw=1"} 
          alt={"Clasificaciones"} /> } 
       </div>
      );
    }
}

export default MessageClassifications;