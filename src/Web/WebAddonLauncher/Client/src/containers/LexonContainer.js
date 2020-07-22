import React, { Component } from 'react';
import queryString from 'query-string';

class LexonContainer extends Component {
    constructor(props) {
      super(props);
      
      this.state = {
          addonData: null,
        };
  
        this.handleGetUserFromLexonConnector = this.handleGetUserFromLexonConnector.bind(
          this
        );
        this.handleGetAddonsInfoFromLexonConnector = this.handleGetAddonsInfoFromLexonConnector.bind(
          this
        );
    }

    componentDidMount() {
        window.addEventListener(
          'GetUserFromLexonConnector',
          this.handleGetUserFromLexonConnector
       );
       window.addEventListener(
        'GetAddonsInfoFromLexonConnector',
        this.handleGetAddonsInfoFromLexonConnector
      );
    
    }
    
    componentWillUnmount() {
        window.removeEventListener(
          'GetUserFromLexonConnector',
          this.handleGetUserFromLexonConnector
       );
        window.removeEventListener(
         'GetAddonsInfoFromLexonConnector',
         this.handleGetAddonsInfoFromLexonConnector
       );
    }
    
    sendMessagePutUser(user, addonData) {
        window.addonData = addonData;
        window.dispatchEvent(
          new CustomEvent('PutUserFromLexonConnector', {
            detail: {
              user,
              selectedMessages: [{
                id: addonData.messageId,
                subject: addonData.subject,
                folder: addonData.folder,
                sentDateTime: addonData.sentDateTime,
                raw: addonData.raw
              }],
              idCaseFile: undefined,
              bbdd: undefined,
              idCompany: undefined,
              provider: addonData.provider,
              account: addonData.account
            }
          })
        );
    }
    
    
    handleGetUserFromLexonConnector() {
        console.log('handleGetUserFromLexonConnector');
        const values = queryString.parse(window.location.search);    
        if (values && values.bbdd 
          && Object.keys(values).length > 0) {
          const payload = values.bbdd.split('.')[1];
          const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
           }).join(''));
          const addonData = JSON.parse(jsonPayload);
          this.setState({ addonData: addonData, bbdd: { idCompany: addonData.idCompany, bbdd: addonData.bbdd }})
          this.sendMessagePutUser(addonData.idClienteNav, addonData);
        }
    }
    
    handleGetAddonsInfoFromLexonConnector() {
        window.dispatchEvent(
          new CustomEvent('PutAddonFromLexonConnector', {
            
          })
        );
    }
    
    render() {
        return (
            <div id="lexon-app" />
        )
    }
}

export default LexonContainer;