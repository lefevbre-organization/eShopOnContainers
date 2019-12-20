import config from '../Config';
import { UserAgentApplication } from 'msal';


export const signOut = (url) => {    
    const params = {
        auth: {
            clientID: config.appId,
            redirectUri: url,
            //postLogoutRedirectUri: "your_app_logout_redirect_uri"
        }
    }
    
    const userAgentApplication = new UserAgentApplication(params);
    userAgentApplication.logout();
    

    // var userAgentApplication = new UserAgentApplication(config.appId, null, null, {
    //     postLogoutRedirectUri: url
    // });

    // userAgentApplication.logout();
    return true
}

