const dev = {
  url: {
    URL_INBOX_GOOGLE: "http://localhost:3001",
    URL_INBOX_OUTLOOK: "http://localhost:3002",
    URL_INBOX_IMAP: "http://localhost:3003",
    // API_ACCOUNTS: 'https://lefebvre-multichannel-apinode.azurewebsites.net/api/accounts'
    // API_ACCOUNTS: 'http://localhost:3500/api/accounts'
    API_ACCOUNTS: "http://localhost:60980"
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
    ACCOUNTS: "/api/v1/accounts/EmailUserAccount/getbyuser/"
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
      "https://lefebvre-multichannel-inbox-google.azurewebsites.net",
    URL_INBOX_OUTLOOK:
      "https://lefebvre-multichannel-inbox-graph.azurewebsites.net",
    URL_INBOX_IMAP: "http://lefebvre.eastus.cloudapp.azure.com",
    API_ACCOUNTS: "https://lefebvre-multichannel-apinode.azurewebsites.net"
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
    ACCOUNTS: "/api/v1/accounts/EmailUserAccount/getbyuser/"
  }
};

export const config = process.env.NODE_ENV === "development" ? dev : prod;

export const INBOX_GOOGLE = "GOOGLE";
export const INBOX_OUTLOOK = "OUTLOOK";
export const INBOX_IMAP = "IMAP";
export const PROXY_CORS = "https://cors-anywhere.herokuapp.com/";
