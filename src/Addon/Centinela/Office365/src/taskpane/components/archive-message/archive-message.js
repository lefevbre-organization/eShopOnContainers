import React, { Component } from 'react';
import CryptoJS from 'crypto-js';
import i18n from 'i18next';
import Header from '../header/header';
import { 
  base64Decode,
  base64url,
  getRawAddon,
  saveMessageRaw,
  removeRawAddon
} from '../../services/services';
import { 
  PAGE_LOGIN
} from "../../constants";
import archiveMessageImg from "../../../../public/assets/archive-message.png"
import '../archive-message/archive-message.css';

class ArchiveMessage extends Component {
    _isMounted = false;
    constructor(props, context) {
        super(props, context);
        this.state = {
          user: null,
          addonData: null,
          addonDataToken: null,
          messageRaw: null
      };
   }

    componentDidMount() {
      if (OfficeHelpers.Authenticator.isAuthDialog()) {
        return;
      }
      this._isMounted = true;
      const user = base64Decode();
      this.setState({ user: user });
      this.getMessageRaw();
      this.getAddonData();
    }

    componentDidUpdate(prevProps, prevState) {
      if(prevProps.isOfficeInitialized !== this.props.isOfficeInitialized) {
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

    getProviderCentienla(jwt) {
      let authenticator = new OfficeHelpers.Authenticator();
      authenticator.endpoints.add("centinela", { 
        provider: 'centinela',
        clientId: 'a8c9f1a1-3472-4a83-8725-4dfa74bac24d',
        baseUrl: `${window.URL_ADDON_CENTINELA}`,
        redirectUrl: `${window.URL_ADDON_CENTINELA_BASE}/taskpane.html`,
        authorizeUrl: '/centinela',
        scope: 'openid profile onelist offline_access',
        responseType: 'code',
        state: true,
        extraQueryParameters: {
          addonData: JSON.stringify(jwt)
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

      const secret = "AddonCentinelaClient";

      let signature = CryptoJS.HmacSHA256(token, secret);
      signature = base64url(signature);

      const jwt =  token + "." + signature;
      
      this.setState({addonDataToken: jwt});
      this.getProviderCentienla(jwt);
    }

    getAddonData = async () =>   {
      const mailbox = Office.context.mailbox;
      const user = base64Decode();
      const addonData = {
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

    logout = async () => { 
      localStorage.removeItem('auth-centinela');
      this.props.changePage(PAGE_LOGIN);
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
      let authenticator = new OfficeHelpers.Authenticator();
      authenticator.authenticate('centinela', true)
     .then(token => { 
     })
     .catch(error => {
      removeRawAddon(addonData);
     });
    }

  
    render() {
     const { 
       user
     } = this.state
      return (
        <div className="">  
            <Header logout={this.logout} user={user} />
            <div className="archive-message-img">
                <img src={archiveMessageImg} alt="Archivar mensajes" />
           </div>
           <p className="add-more-container">
              <a className="add-more" onClick={this.newConection}> 
                <span className="lf-icon-add-round"></span>
                <strong>{i18n.t('archive-message.button-title')}</strong>
              </a>
           </p>
        </div>
      );
    }
}

export default ArchiveMessage;