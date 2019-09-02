const dev = {
    url: {
        URL_INBOX_GOOGLE: 'http://localhost:3001',
        URL_INBOX_OUTLOOK: 'http://localhost:3002',
        URL_INBOX_IMAP: 'http://localhost:3003',
        //API_ACCOUNTS: 'https://useraccounts.azurewebsites.net/api/accounts'
        API_ACCOUNTS: 'http://localhost:3500/api/accounts'
    },
    login: {
        URL_ENCRYPTED_USER: 'https://online.elderecho.com/ws/encriptarEntrada.do?nEntrada=',
        URL_DECRYPTED_USER: 'https://online.elderecho.com/ws/desencriptarEntrada.do?entradaEncriptada=',
        USER: 'ws',
        PWD: '22lcqsp11lsw'
    }    
    // login: {
    //     URL_ENCRYPTED_USER: 'http://herculesppd.lefebvre.es/webclient46/ws/encriptarEntrada.do?nEntrada=',
    //     URL_DECRYPTED_USER: 'http://herculesppd.lefebvre.es/webclient46/ws/desencriptarEntrada.do?entradaEncriptada=',
    //     USER: 'ws',
    //     PWD: '22lcqsp11lsw'
    // }
}

const prod = {
    url: {
        URL_INBOX_GOOGLE: 'https://lefebvre-multichannel-inbox-google.azurewebsites.net',
        URL_INBOX_OUTLOOK: 'https://lefebvre-multichannel-office365.azurewebsites.net',
        URL_INBOX_IMAP: 'http://lefebvre.westeurope.cloudapp.azure.com/login',
        API_ACCOUNTS: 'https://lefebvre-multichannel-apinode.azurewebsites.net/api/accounts'
    },
    login: {
        URL_ENCRYPTED_USER: 'https://online.elderecho.com/ws/encriptarEntrada.do?nEntrada=',
        URL_DECRYPTED_USER: 'https://online.elderecho.com/ws/desencriptarEntrada.do?entradaEncriptada=',
        USER: 'ws',
        PWD: '22lcqsp11lsw'
    }
}

export const config = process.env.NODE_ENV === 'development' ? dev : prod;

export const INBOX_GOOGLE = "GOOGLE";
export const INBOX_OUTLOOK = "OUTLOOK";
export const INBOX_IMAP = "IMAP";
export const PROXY_CORS = "https://cors-anywhere.herokuapp.com/";