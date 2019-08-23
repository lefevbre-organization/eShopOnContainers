export const SIGNED_OUT = 'SIGNED_OUT';
export const SIGNED_IN = 'SIGNED_IN';
export const AUTH_IN_PROGRESS = 'AUTH_IN_PROGRESS';
export const AUTH_SUCCESS = 'AUTH_SUCCESS';
export const AUTH_FAIL = 'AUTH_FAIL';
export const AUTH_SIGNED_OUT = 'AUTH_SIGNED_OUT';
export const PROVIDER = 'GOOGLE';

const dev = {
    url: {
        URL_UPDATE_DEFAULTACCOUNT: 'http://localhost:3500/api/accounts/defaultaccount',
        URL_RESET_DEFAULTACCOUNT: 'http://localhost:3500/api/accounts/resetdefaultaccount',
        URL_DELETE_ACCOUNT: 'http://localhost:3500/api/accounts/deleteaccount',
        URL_SELECT_ACCOUNT: 'http://localhost:3000'     
    }
}

const prod = {
    url: {
        URL_UPDATE_DEFAULTACCOUNT: 'https://useraccounts.azurewebsites.net/api/accounts/defaultaccount',
        URL_RESET_DEFAULTACCOUNT: 'https://useraccounts.azurewebsites.net/api/accounts/resetdefaultaccount',
        URL_DELETE_ACCOUNT: 'https://useraccounts.azurewebsites.net/api/accounts/deleteaccount',
        URL_SELECT_ACCOUNT: 'https://lefebvre-approot.azurewebsites.net'
    }
}

export const config = process.env.NODE_ENV === 'development' ? dev : prod;

export const MAX_RESULTS = 20;