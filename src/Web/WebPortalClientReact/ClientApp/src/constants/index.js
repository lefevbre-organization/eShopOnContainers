const dev = {
  login: {
    URL_ENCRYPTED_USER:
      "https://online.elderecho.com/ws/encriptarEntrada.do?nEntrada=",
    URL_DECRYPTED_USER:
      "https://online.elderecho.com/ws/desencriptarEntrada.do?entradaEncriptada=",
    USER: "ws",
    PWD: "22lcqsp11lsw"
  }
};

const prod = {
  login: {
    URL_ENCRYPTED_USER:
      "https://online.elderecho.com/ws/encriptarEntrada.do?nEntrada=",
    URL_DECRYPTED_USER:
      "https://online.elderecho.com/ws/desencriptarEntrada.do?entradaEncriptada=",
    USER: "ws",
    PWD: "22lcqsp11lsw"
  }
};

export const config = process.env.NODE_ENV === "development" ? dev : prod;

export const PARAMS_ACCOUNTS = "api/v1/accounts/emailuseraccount/getbyuser";
export const PARAMS_DELETACCOUNTBYUSERANDEMAIL = "api/v1/accounts/emailuseraccount/deleteaccountbyuserandemail";
export const INBOX_GOOGLE = "GOOGLE";
export const INBOX_OUTLOOK = "OUTLOOK";
export const INBOX_IMAP = "IMAP";
export const PROXY_CORS = "https://cors-anywhere.herokuapp.com/";