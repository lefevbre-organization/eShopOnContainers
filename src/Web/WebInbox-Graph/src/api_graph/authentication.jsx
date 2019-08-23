import config from '../Config';
import { UserAgentApplication } from 'msal';


export const signOut = () => {    
    var userAgentApplication = new UserAgentApplication(config.appId, null, null);
    userAgentApplication.logout();
    return true
}

