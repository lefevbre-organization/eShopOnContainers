import { getUserApplication } from '../api_graph';

export const signOut = (url) => {   
    
    const userAgentApplication = getUserApplication();
    userAgentApplication.logout();
    
    return true
}