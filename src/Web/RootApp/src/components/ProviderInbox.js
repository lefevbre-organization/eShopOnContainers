import React, { Component } from 'react';
import i18n from "i18next";

import { 
    config,
    INBOX_GOOGLE, 
    INBOX_OUTLOOK, 
    INBOX_IMAP
} from "../constants";

class ProviderInbox extends Component {
    
    render() {
        const  { userId, provider, email } = this.props;
        console.log('ProviderInbox [props] ->', this.props);
        let user = '';
        if (userId != null) {
            user = userId;
        }

        let title;
        switch (provider) {
            case INBOX_GOOGLE:                
                (email != null && email !== undefined) ?
                    title = email :
                    title = 'Google';
                
                return (
                    <a href={config.url.URL_INBOX_GOOGLE + '/' + user} className='d-flex align-items-center'  >
                        <span>
                            <img src="/assets/imgs/logoGoogle.png" alt={provider} />
                        </span>
                        <span>
                            { title }
                        </span>
                    </a>
                );
            case INBOX_OUTLOOK:
                (email != null && email !== undefined) ?
                    title = email :
                    title = 'Microsoft  (Exchange, Outlook, Office 365)';

                return (
                    <a href={config.url.URL_INBOX_OUTLOOK + '/' + user} className="d-flex align-items-center"  >
                        <span>
                            <img src="/assets/imgs/logoMicrosoft.png" alt={provider} />
                        </span>
                        <span>
                            { title }
                        </span>
                    </a>
                );
            case INBOX_IMAP:
                (email != null && email !== undefined) ?
                    title = email :
                    title = i18n.t('page-goto.other-server-mail');

                return (
                    <a href={config.url.URL_INBOX_IMAP + '/' + user} className="d-flex align-items-center" >
                        <span className="lf-icon-mail"></span>
                        <span>
                            { title }
                        </span>
                    </a>
                );

            default:
                return null;
        }
    }
}
  
export default ProviderInbox;