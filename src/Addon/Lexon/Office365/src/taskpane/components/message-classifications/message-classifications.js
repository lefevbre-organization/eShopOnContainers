import React, { Component } from 'react';
import { ChoiceGroup, Button } from 'office-ui-fabric-react';
import Header from '../header/header';
import { PAGE_LOGIN, PAGE_SELECT_COMPANY } from "../../constants";
import '../message-classifications/message-classifications.css';

class MessageClassifications extends Component {
    _isMounted = false;
    constructor(props, context) {
        super(props, context);
        this.state = {
         
        };
      }

    componentDidMount() {
      this._isMounted = true;
      this.getAddonData();
    }

    getAddonData() {
      const { selectCompany } = this.props
     console.log(selectCompany);
      console.log(Office.context.mailbox.item.internetMessageId);
      console.log(Office.context.mailbox.item.subject);
      console.log(Office.context.mailbox.userProfile.emailAddress);
      console.log(Office.context.mailbox.item.dateTimeCreated);
      var mailbox = Office.context.mailbox;
    var request = getHeadersRequest(mailbox.item.itemId);
    var envelope = getSoapEnvelope(request);
    mailbox.makeEwsRequestAsync(envelope, function (asyncResult) {
        callbackEws(asyncResult, headersLoadedCallback);
    });

      // let addonData = {
      //   idCompany: selectCompany.idCompany,
      //   bbdd: selectCompany.bbdd,
      //   name: selectCompany.name,
      //   account: Office.context.mailbox.userProfile.emailAddress,
      //   provider: 'OU',
      //   messageId: Office.context.mailbox.item.internetMessageId,
      //   messageById: Office.context.mailbox.item.conversationId,
      //   subject: Office.context.mailbox.item.subject,
      //   folder: Office.context.mailbox.item.itemType,
      //   sentDateTime: Office.context.mailbox.item.dateTimeCreated,
      //   idUser: "449",
      //   idClienteNav: user.data._idClienteNav,
      //   userName: user.data._nombre,
      //   email: user.data._login
      // };
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
         <a href="#/" className="add-more" >
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