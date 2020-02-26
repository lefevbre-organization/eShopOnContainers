import { getUserApplication } from '../api_graph';

export const signOut = (userId, redirect = false) => {   
    
    const userAgentApplication = getUserApplication(userId, true, redirect);
    userAgentApplication.logout();
    
    return true
}

