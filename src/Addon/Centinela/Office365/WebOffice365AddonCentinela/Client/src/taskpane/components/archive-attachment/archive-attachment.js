import React, { Component } from 'react';
import CryptoJS from 'crypto-js';
import { 
  base64Decode,
  base64url,
  downloadFile
} from '../../services/services';
import Header from '../header/header';
import Spinner from '../spinner/spinner';
import { PAGE_LOGIN } from "../../constants";
import i18n from 'i18next';
import '../archive-attachment/archive-attachment.css';

class ArchiveAttachment extends Component {
    _isMounted = false;
    constructor(props, context) {
        super(props, context);
        this.state = {
         user: null,
         isLoading: false
        };
    }

    componentDidMount() {
      if (OfficeHelpers.Authenticator.isAuthDialog()) {
          return;
      }
      const user = base64Decode();
      this.setState({ user: user });
      this.getAddonData();
    }


    componentDidUpdate(prevProps, prevState) {
        if(prevProps.isOfficeInitialized !== this.props.isOfficeInitialized) {
          const conversationId = Office.context.mailbox.initialData.conversationId;
          this.getAddonData();
        }
    }
  
    componentWillUnmount() {
     this._isMounted = false;
    }
  
    logout = async () => { 
      localStorage.removeItem('auth-centinela');
      this.props.changePage(PAGE_LOGIN);
    }

    getProviderCentinelaArchiveAttachment(jwt) {
        let authenticator = new OfficeHelpers.Authenticator();
        authenticator.endpoints.add("centinelaArchiveAttachment", { 
          provider: 'centinelaArchiveAttachment',
          clientId: 'a8c9f1a1-3472-4a83-8725-4dfa74bac24d',
          baseUrl: `${window.URL_ADDON_CENTINELA}`,
          redirectUrl: `${window.URL_ADDON_CENTINELA_BASE}/taskpane.html`,
          authorizeUrl: '/centinela',
          scope: 'openid profile onelist offline_access',
          responseType: 'access_token',
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
        this.getProviderCentinelaArchiveAttachment(jwt);
    }

    getAddonData = async () =>   {
        const user = base64Decode();
        const addonData = {
          provider: 'OU',
          idUser: user.idUserApp,
          idClienteNav: user.idClienteNavision,
          userName: user.name,
          email: user.login,
          addonType: "MessageCompose"
        }
    
        this.getAddonDataToken(addonData)   
    }

    getDocument = async (file, idUser) => {
      const res = await downloadFile(file.documentId, idUser);
      console.log(res);
      if(res.status == 200) {
       Office.context.mailbox.item.addFileAttachmentFromBase64Async(res.data,
        file.name);
      }
    }

    addAttach = () => {
     this.getAddonData();
     const { user } = this.state;
     this.setState({ isLoading: true });

     let authenticator = new OfficeHelpers.Authenticator();
      authenticator.authenticate('centinelaArchiveAttachment', true)
     .then(data => { 
      const files = JSON.parse(data.files);
      files.forEach(file => {
        this.getDocument(file, user.idClienteNavision);
      });
      this.setState({ isLoading: false });
     })
     .catch(error => {
      this.setState({ isLoading: false });
      console.log(error);
     });
   
    }
     
    render() {
       const { user, isLoading } = this.state;
        return (
         <div className="">  
         { isLoading ? <Spinner /> :
          <>
            <Header logout={this.logout} user={user} />
            <img src="assets/archive_attachment.png"
             alt={"Documentos"} className="img-archive-attachment" />
             <div className="content-document">
              <strong>{i18n.t('document-attached.description')}</strong>
              <p className="document-add-more-container add-more" 
              onClick={this.addAttach}>
               <span className="lf-icon-add"></span>
               <strong>{i18n.t('document-attached.select-file')}</strong>
              </p>
             </div> 
             </> }
         </div>
        );
    }
}

export default ArchiveAttachment