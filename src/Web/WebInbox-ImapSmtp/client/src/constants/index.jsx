export const PROVIDER = "IMAP";

// const dev = {
//   url: {
//     URL_UPDATE_DEFAULTACCOUNT:
//       "https://localhost:60980/api/v1/accounts/emailuseraccount/updatedefaultaccount",
//     URL_RESET_DEFAULTACCOUNT:
//       "https://localhost:60980/api/v1/accounts/emailuseraccount/resetdefaultaccountbyuser",
//     URL_DELETE_ACCOUNT:
//       "https://localhost:60980/api/v1/accounts/emailuseraccount/deleteaccountbyuserandprovider",
//     URL_SELECT_ACCOUNT: "https://localhost:3010",
//     URL_GET_ACCOUNTS:
//       "https://localhost:60980/api/v1/accounts/emailuseraccount/getbyuser",
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
            "http://lefebvre.westeurope.cloudapp.azure.com:8083/api/v1/accounts/emailuseraccount/updatedefaultaccount",
        URL_RESET_DEFAULTACCOUNT:
            "http://lefebvre.westeurope.cloudapp.azure.com:8083/api/v1/accounts/emailuseraccount/resetdefaultaccountbyuser",
        URL_DELETE_ACCOUNT:
            "http://lefebvre.westeurope.cloudapp.azure.com:8083/api/v1/accounts/emailuseraccount/deleteaccountbyuserandprovider",
        URL_SELECT_ACCOUNT: "http://lefebvre.westeurope.cloudapp.azure.com:8087",
        URL_GET_ACCOUNTS:
            "http://lefebvre.westeurope.cloudapp.azure.com:8083/api/v1/accounts/emailuseraccount/getbyuser",
        URL_MF_GOOGLE: "https://lefebvre.westeurope.cloudapp.azure.com:8088/user",
        URL_MF_OUTLOOK:
            "https://lefebvre.westeurope.cloudapp.azure.com:8089/user",
        URL_MF_IMAP: "http://lefebvre.westeurope.cloudapp.azure.com/user",
        URL_MF_LEXON:
            "https://lefebvre.westeurope.cloudapp.azure.com:8090/static/js/main.js"
    }
};

export const config = process.env.NODE_ENV === "development" ? dev : prod;

export const RESULT_OK = 1;
