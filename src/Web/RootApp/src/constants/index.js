const dev = {
  url: {
    URL_INBOX_GOOGLE: "http://localhost:3001",
    URL_INBOX_OUTLOOK: "http://localhost:3002",
    URL_INBOX_IMAP: "http://localhost:9000",
    //API_ACCOUNTS: "http://localhost:60980"
    API_ACCOUNTS: "https://lefebvre.westeurope.cloudapp.azure.com:8083"
  },
  login: {
    URL_ENCRYPTED_USER:
      "https://online.elderecho.com/ws/encriptarEntrada.do?nEntrada=",
    URL_DECRYPTED_USER:
      "https://online.elderecho.com/ws/desencriptarEntrada.do?entradaEncriptada=",
    USER: "ws",
    PWD: "22lcqsp11lsw"
  },
  api: {
    ACCOUNTS: "api/v1/accounts/emailuseraccount/getbyuser",
    DELETACCOUNTBYUSERANDPROVIDER: 'api/v1/accounts/emailuseraccount/deleteaccountbyuserandprovider',
    DELETACCOUNTBYUSERANDEMAIL: 'api/v1/accounts/emailuseraccount/deleteaccountbyuserandemail'
  }
  // login: {
  //     URL_ENCRYPTED_USER: 'http://herculesppd.lefebvre.es/webclient46/ws/encriptarEntrada.do?nEntrada=',
  //     URL_DECRYPTED_USER: 'http://herculesppd.lefebvre.es/webclient46/ws/desencriptarEntrada.do?entradaEncriptada=',
  //     USER: 'ws',
  //     PWD: '22lcqsp11lsw'
  // }
};

const prod = {
  url: {
    URL_INBOX_GOOGLE:
      "https://lefebvre.westeurope.cloudapp.azure.com:8088",
    URL_INBOX_OUTLOOK:
      "https://lefebvre.westeurope.cloudapp.azure.com:8089",
    URL_INBOX_IMAP: "http://lefebvre.westeurope.cloudapp.azure.com",
    API_ACCOUNTS: "https://lefebvre.westeurope.cloudapp.azure.com:8083"
  },
  login: {
    URL_ENCRYPTED_USER:
      "https://online.elderecho.com/ws/encriptarEntrada.do?nEntrada=",
    URL_DECRYPTED_USER:
      "https://online.elderecho.com/ws/desencriptarEntrada.do?entradaEncriptada=",
    USER: "ws",
    PWD: "22lcqsp11lsw"
  },
  api: {
    ACCOUNTS: "api/v1/accounts/emailuseraccount/getbyuser",
    DELETACCOUNTBYUSERANDPROVIDER: 'api/v1/accounts/emailuseraccount/deleteaccountbyuserandprovider',
    DELETACCOUNTBYUSERANDEMAIL: 'api/v1/accounts/emailuseraccount/deleteaccountbyuserandemail'
  }
};

export const config = process.env.NODE_ENV === "development" ? dev : prod;

export const INBOX_GOOGLE = "GOOGLE";
export const INBOX_OUTLOOK = "OUTLOOK";
export const INBOX_IMAP = "IMAP";
export const PROXY_CORS = "https://cors-anywhere.herokuapp.com/";
export const RESULT_OK = 1;