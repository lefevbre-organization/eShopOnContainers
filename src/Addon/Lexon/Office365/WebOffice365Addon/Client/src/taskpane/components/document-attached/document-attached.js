import React, { Component } from 'react';
import { 
  base64Decode
} from '../../services/services';
import Header from '../header/header';
import { PAGE_LOGIN, PAGE_SELECT_COMPANY } from "../../constants";
import i18n from 'i18next';
import '../document-attached/document-attached.css';

class DocumentAttached extends Component {
    _isMounted = false;
    constructor(props, context) {
        super(props, context);
        this.state = {
         user: null
        };
    }

    componentDidMount() {
      const user = base64Decode();
      this.setState({ user: user });

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
  
     
      render() {
       const { selectCompany, isOfficeInitialized } = this.props;
       const { user } = this.state;
       let conversationId = '';
       if(isOfficeInitialized) {
        conversationId = Office.context.mailbox.initialData.conversationId
       }
       if(conversationId) {
         this.changeCompany();
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
            <img src={"https://www.dropbox.com/s/6juvusc22u8a6d0/Screenshot%202020-06-30%2008.58.30.png?raw=1"} 
             alt={"Documentos"} />
             <div className="content-document">
              <strong>{i18n.t('document-attached.description')}</strong>
              <p className="document-add-more-container add-more">
               <span className="lf-icon-add"></span>
               <strong>Selecciona los archivos en LEX-ON</strong>
              </p>
             </div>
         </div>
        );
      }
}

export default DocumentAttached