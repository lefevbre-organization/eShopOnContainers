import config from '../Config';
import { UserAgentApplication } from 'msal';


export const signOut = (url) => {    
    //var userAgentApplication = new UserAgentApplication(config.appId, null, null);
    var userAgentApplication = new UserAgentApplication(config.appId, null, null, {
        postLogoutRedirectUri: url
    });

    userAgentApplication.logout();
    return true
}

