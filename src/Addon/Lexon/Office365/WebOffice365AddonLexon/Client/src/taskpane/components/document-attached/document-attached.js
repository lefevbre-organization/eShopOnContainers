import React, { Component } from 'react';
import CryptoJS from 'crypto-js';
import { 
  base64Decode,
  base64url,
  downloadFile
} from '../../services/services';
import Header from '../header/header';
import Spinner from '../spinner/spinner';
import { PAGE_LOGIN, PAGE_SELECT_COMPANY } from "../../constants";
import i18n from 'i18next';
import '../document-attached/document-attached.css';

class DocumentAttached extends Component {
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
          if(conversationId) {
            return this.changeCompany();
          }
          this.getAddonData();
        }
    }
  
    componentWillUnmount() {
     this._isMounted = false;
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

    getProviderClasification(jwt) {
        let authenticator = new OfficeHelpers.Authenticator();
        authenticator.endpoints.add("attached", { 
          provider: 'attached',
          clientId: 'a8c9f1a1-3472-4a83-8725-4dfa74bac24d',
          baseUrl: `${window.URL_ADDON_LEXON}`,
          redirectUrl: `${window.URL_ADDON_LEXON_BASE}/taskpane.html`,
          authorizeUrl: '/lexon',
          scope: 'openid profile onelist offline_access',
          responseType: 'access_token',
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
        this.getProviderClasification(jwt);
    }

    getAddonData = async () =>   {
        const { selectCompany } = this.props
        const user = base64Decode();
        const addonData = {
          idCompany: selectCompany.idCompany,
          bbdd: selectCompany.bbdd,
          name: selectCompany.name,
          provider: 'OU',
          idUser: user.idUserApp,
          idClienteNav: user.idClienteNavision,
          userName: user.name,
          email: user.login,
          addonType: "MessageCompose"
        }
    
        this.getAddonDataToken(addonData)   
    }

    getDocument = async (file, bbdd, idUser) => {
      const res = await downloadFile(file.idRelated, bbdd, idUser);
      if(res.status == 200) {
       Office.context.mailbox.item.addFileAttachmentFromBase64Async(res.data,
        file.code);
      }
    }

    addAttach = () => {
     this.getAddonData();
     const { selectCompany } = this.props;
     const { user } = this.state;
     let authenticator = new OfficeHelpers.Authenticator();
     this.setState({ isLoading: true });
      authenticator.authenticate('attached', true)
     .then(data => { 
      const files = JSON.parse(data.files);
      files.forEach(file => {
        this.getDocument(file, selectCompany.bbdd, user.idUser);
      });
      this.setState({ isLoading: false });
     })
     .catch(error => {
      this.setState({ isLoading: false });
      console.log(error);
     });
   
    }
     
    render() {
       const { selectCompany } = this.props;
       const { user, isLoading } = this.state;
        return (
         <div className="">  
         { isLoading ? <Spinner /> :
          <>
            <Header logout={this.logout} user={user} />
            <p className="company-id">
             Empresa identificada:
             <br/>
            <strong>{selectCompany.name}</strong>
             <a href="#/" title="Cambiar de empresa" onClick={this.changeCompany}>
              <span className="lf-icon-arrow-exchange"></span>
             </a>
            </p>
            <img src={"https://www.dropbox.com/s/6juvusc22u8a6d0/Screenshot%202020-06-30%2008.58.30.png?raw=1"} 
             alt={"Documentos"} />
             <div className="content-document">
              <strong>{i18n.t('document-attached.description')}</strong>
              <p className="document-add-more-container add-more" onClick={this.addAttach}>
               <span className="lf-icon-add"></span>
               <strong>{i18n.t('document-attached.select-file')}</strong>
              </p>
             </div> 
             </> }
         </div>
        );
    }
}

export default DocumentAttached