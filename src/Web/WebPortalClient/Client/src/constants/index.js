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

export const PARAMS_ACCOUNTS = "api/v2/accounts/usermail";
export const PARAMS_DELETACCOUNTBYUSERANDEMAIL = "api/v1/accounts/emailuseraccount/deleteaccountbyuserandemail";
export const INBOX_GOOGLE = "GOOGLE";
export const INBOX_OUTLOOK = "OUTLOOK";
export const INBOX_IMAP = "IMAP";
export const IN_GOOGLE = "GO";
export const IN_OUTLOOK = "OU";
export const IN_IMAP = "IM";
export const PROXY_CORS = "https://cors-anywhere.herokuapp.com/";