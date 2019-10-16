export const PROVIDER = "IMAP";

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
    URL_MF_IMAP: "http://localhost:9000/user",
    URL_MF_LEXON: "http://localhost:3004/static/js/main.js"
  }
};

const prod = {
  url: {
    URL_UPDATE_DEFAULTACCOUNT:
      "https://elefebvreoncontainers:8086/api/accounts/emailuseraccount/updatedefaultaccount",
    URL_RESET_DEFAULTACCOUNT:
      "https://elefebvreoncontainers:8086/api/accounts/emailuseraccount/resetdefaultaccountbyuser",
    URL_DELETE_ACCOUNT:
      "https://elefebvreoncontainers:8086/api/accounts/emailuseraccount/deleteaccountbyuserandprovider",
    URL_SELECT_ACCOUNT: "https://elefebvreoncontainers:8082",
    URL_GET_ACCOUNTS:
      "https://elefebvreoncontainers:8086/api/accounts/emailuseraccount",
    URL_MF_GOOGLE: "https://elefebvreoncontainers:8083/user",
    URL_MF_OUTLOOK:
      "https://lefebvre-multichannel-office365.azurewebsites.net/user",
    URL_MF_IMAP: "https://elefebvreoncontainers:8081/user",
    URL_MF_LEXON: "https://elefebvreoncontainers:8085/static/js/main.js"
  }
};

export const config = process.env.NODE_ENV === "development" ? dev : prod;

export const RESULT_OK = 1;
