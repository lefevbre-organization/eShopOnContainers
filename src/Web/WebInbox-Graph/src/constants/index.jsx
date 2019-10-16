export const SIGNED_OUT = "SIGNED_OUT";
export const SIGNED_IN = "SIGNED_IN";
export const AUTH_IN_PROGRESS = "AUTH_IN_PROGRESS";
export const AUTH_SUCCESS = "AUTH_SUCCESS";
export const AUTH_FAIL = "AUTH_FAIL";
export const AUTH_SIGNED_OUT = "AUTH_SIGNED_OUT";
export const PROVIDER = "OUTLOOK";

const dev = {
  url: {
    URL_UPDATE_DEFAULTACCOUNT:
      "http://localhost:60980/api/v1/accounts/emailuseraccount/updatedefaultaccount",
    URL_RESET_DEFAULTACCOUNT:
      "http://localhost:60980/api/v1/accounts/emailuseraccount/resetdefaultaccountbyuser",
    URL_DELETE_ACCOUNT:
      "http://localhost:60980/api/v1/accounts/emailuseraccount/deleteaccountbyuserandprovider",
    URL_SELECT_ACCOUNT: "http://localhost:3010",
    URL_GET_ACCOUNTS:
      "http://localhost:60980/api/v1/accounts/emailuseraccount/getbyuser",
    URL_MF_GOOGLE: "http://localhost:3001/user",
    URL_MF_OUTLOOK: "http://localhost:3002/user",
    URL_MF_IMAP: "http://localhost:9000/user"    
  }
};

const prod = {
  url: {
    URL_UPDATE_DEFAULTACCOUNT:
      "https://useraccounts.azurewebsites.net/api/accounts/emailuseraccount/updatedefaultaccount",
    URL_RESET_DEFAULTACCOUNT:
      "https://useraccounts.azurewebsites.net/api/accounts/emailuseraccount/resetdefaultaccountbyuser",
    URL_DELETE_ACCOUNT:
      "https://useraccounts.azurewebsites.net/api/accounts/emailuseraccount/deleteaccountbyuserandprovider",
    URL_SELECT_ACCOUNT: "https://lefebvre-approot.azurewebsites.net",
    URL_GET_ACCOUNTS:
      "https://useraccounts.azurewebsites.net/api/accounts/emailuseraccount",
    URL_MF_GOOGLE: "http://localhost:3001/user",
    URL_MF_OUTLOOK: "http://localhost:3002/user",
    URL_MF_IMAP: "http://localhost:9000/user"
  }
};

export const config = process.env.NODE_ENV === "development" ? dev : prod;

export const MAX_RESULTS = 20;
export const RESULT_OK = 1;
