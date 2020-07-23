import React, { Component } from 'react';
import queryString from 'query-string';

class CentinelaContainer extends Component {
    constructor(props) {
        super(props);

        this.handleGetUserFromCentinelaConnector = this.handleGetUserFromCentinelaConnector.bind(
          this
        );

        this.handleGetAddonsInfoFromCentinelaConnector = this.handleGetAddonsInfoFromCentinelaConnector.bind(
          this
        );
    }

    componentDidMount() {
        window.addEventListener(
         'GetUserFromCentinelaConnector',
         this.handleGetUserFromCentinelaConnector
        );
        window.addEventListener(
          'GetAddonsInfoFromCentinelaConnector',
          this.handleGetAddonsInfoFromCentinelaConnector
        );
    }

    componentWillUnmount() {
        window.removeEventListener(
            'GetUserFromCentinelaConnector',
            this.handleGetUserFromCentinelaConnector
        );
        window.removeEventListener(
          'GetAddonsInfoFromCentinelaConnector',
          this.handleGetAddonsInfoFromCentinelaConnector
        );
    }
    
    handleGetUserFromCentinelaConnector() {
        console.log('Centinela GetUserFromCentinela received');
        const values = queryString.parse(window.location.search);  
        if (values && values.addonData 
          && Object.keys(values).length > 0) {
          const payload = values.addonData.split('.')[1];
          const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
           }).join(''));
          const addonData = JSON.parse(jsonPayload);
          this.sendMessageCentinelaPutUser(addonData.idClienteNav, addonData);
       }
    }
    
    sendMessageCentinelaPutUser(user, addonData) {
        window.dispatchEvent(
          new CustomEvent('PutUserFromCentinelaConnector', {
            detail: {
              user,
              selectedMessages: [{
                id: addonData.messageId,
                subject: addonData.subject,
                folder: addonData.folder,
                sentDateTime: addonData.sentDateTime,
                raw: addonData.raw
              }],
              provider: addonData.provider,
              account: addonData.account,
              addonType: addonData.addonType,
              messageById: addonData.messageById
            },
          })
        );
    }

    handleGetAddonsInfoFromCentinelaConnector() {
      window.dispatchEvent(
        new CustomEvent('PutAddonFromCentinelaConnector', {
          
        })
      );
    }
    
    render() {
        return (
            <div id="centinela-app" />
        )
    }
}

export default CentinelaContainer;