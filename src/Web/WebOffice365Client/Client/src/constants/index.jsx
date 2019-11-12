export const SIGNED_OUT = "SIGNED_OUT";
export const SIGNED_IN = "SIGNED_IN";
export const AUTH_IN_PROGRESS = "AUTH_IN_PROGRESS";
export const AUTH_SUCCESS = "AUTH_SUCCESS";
export const AUTH_FAIL = "AUTH_FAIL";
export const AUTH_SIGNED_OUT = "AUTH_SIGNED_OUT";
export const PROVIDER = "OUTLOOK";

// const dev = {
//   url: {
//     URL_UPDATE_DEFAULTACCOUNT:
//       "http://localhost:60980/api/v1/accounts/emailuseraccount/updatedefaultaccount",
//     URL_RESET_DEFAULTACCOUNT:
//       "http://localhost:60980/api/v1/accounts/emailuseraccount/resetdefaultaccountbyuser",
//     URL_DELETE_ACCOUNT:
//       "http://localhost:60980/api/v1/accounts/emailuseraccount/deleteaccountbyuserandprovider",
//     URL_SELECT_ACCOUNT: "http://localhost:3010",
//     URL_GET_ACCOUNTS:
//       "http://localhost:60980/api/v1/accounts/emailuseraccount/getbyuser",
//     URL_MF_GOOGLE: "http://localhost:3001/user",
//     URL_MF_OUTLOOK: "http://localhost:3002/user",
//     URL_MF_IMAP: "http://localhost:9000/user",
//     URL_MF_LEXON: "http://localhost:3004/static/js/main.js"
//   }
// };

const dev = {
  url: {
    URL_UPDATE_DEFAULTACCOUNT:
      "https://lefebvre.westeurope.cloudapp.azure.com:8083/api/v1/accounts/emailuseraccount/updatedefaultaccount",
    URL_RESET_DEFAULTACCOUNT:
      "https://lefebvre.westeurope.cloudapp.azure.com:8083/api/v1/accounts/emailuseraccount/resetdefaultaccountbyuser",
    URL_DELETE_ACCOUNT:
      "https://lefebvre.westeurope.cloudapp.azure.com:8083/api/v1/accounts/emailuseraccount/deleteaccountbyuserandprovider",
    URL_SELECT_ACCOUNT: "http://localhost:3010",
    URL_GET_ACCOUNTS:
      "https://lefebvre.westeurope.cloudapp.azure.com:8083/api/v1/accounts/emailuseraccount/getbyuser",
    URL_MF_GOOGLE: "http://localhost:3001/user",
    URL_MF_OUTLOOK: "http://localhost:3002/user",
    URL_MF_IMAP: "http://localhost:9000/user",
    URL_MF_LEXON: "http://localhost:3004/static/js/main.js"
  }
};

const prod = {
  url: {
    URL_UPDATE_DEFAULTACCOUNT:
      "http://loclahost:8083/api/v1/accounts/emailuseraccount/updatedefaultaccount",
    URL_RESET_DEFAULTACCOUNT:
      "http://loclahost:8083/api/v1/accounts/emailuseraccount/resetdefaultaccountbyuser",
    URL_DELETE_ACCOUNT:
      "http://loclahost:8083/api/v1/accounts/emailuseraccount/deleteaccountbyuserandprovider",
    URL_SELECT_ACCOUNT: "http://loclahost:8087",
    URL_GET_ACCOUNTS:
      "http://loclahost:8083/api/v1/accounts/emailuseraccount/getbyuser",
    URL_MF_GOOGLE: "http://loclahost:8088/user",
    URL_MF_OUTLOOK: "http://loclahost:8089/user",
    URL_MF_IMAP: "http://loclahost:9000/user",
    URL_MF_LEXON:
      "http://loclahost:8090/static/js/main.js"
  }
};

export const config = process.env.NODE_ENV === "development" ? dev : prod;

export const MAX_RESULTS = 20;
export const RESULT_OK = 1;
