import { INBOX_GOOGLE, INBOX_OUTLOOK, INBOX_IMAP, IN_GOOGLE, IN_OUTLOOK, IN_IMAP } from "../constants";
import * as base64 from 'base-64';

export const parseJwt = token => {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    //verifyTokenSignature --> to be implemented
    console.log(JSON.parse(jsonPayload));
    return JSON.parse(jsonPayload);
}

export const getUserId = payload => {
    return (payload.hasOwnProperty('idClienteNavision') ? payload.idClienteNavision : (payload.hasOwnProperty('idLexonUser')) ? payload.idLexonUser : (payload.hasOwnProperty('nameUser')) ? payload.nameUser : (payload.hasOwnProperty('userId')) ? payload.userId : null);
}

export const getIdCasefile = payload => {
    return ((payload.hasOwnProperty('idEntityType') && payload.hasOwnProperty('idEntity')) ? ((payload.idEntityType == 1) ? payload.idEntity : null) : null);
}

export const getBbdd = payload => {
    return (payload.hasOwnProperty('bbdd') ? payload.bbdd : null);
}

export const getIdCompany = payload => {
    return (payload.hasOwnProperty('company') ? payload.company : null);
}

export const getIdLexon = payload => {
    return (payload.hasOwnProperty('idLexon') ? payload.idLexon : null);
}

export const getIdMail = payload => {
    return (payload.hasOwnProperty('idMail') ? payload.idMail : null);
}

export const getImapFolder = payload => {
    if (payload && payload.folder) {
        if (payload.folder.indexOf("::") !== -1) {
            return payload.folder.split("::")[1].toUpperCase();
        } else {
            return payload.folder.toUpperCase();
        }
    } else {
        return null;
    }
}

export const getIdEntityType = payload => {
    return (payload.hasOwnProperty('idEntityType') ? payload.idEntityType : null);
}

export const getIdEntity = payload => {
    return (payload.hasOwnProperty('idEntity') ? payload.idEntity : null);
}

export const getMailContacts = payload => {
    return (payload.hasOwnProperty('mailContacts') ? payload.mailContacts.toString() : null)
}

export const getUrlType = payload => {
    if (payload.hasOwnProperty('idMail') && getIdCasefile(payload) == null) {
        return "mailOnly";
    }
    else if (payload.hasOwnProperty('idMail') && getIdEntityType(payload) == 1) {
        return "mailWithCaseFile"
    }
    else if (getIdEntityType(payload) !== null && getIdEntityType(payload) > 1 && getIdEntityType(payload) < 13) {
        return "composeWithContacts"
    }
    else if (getIdCasefile(payload) != null) {
        return "composeWithCaseFile";
    }
    else if (payload.hasOwnProperty('bbdd')) {
        return "dbOnly";
    }
    else {
        return "default";
    }
}

export const buildClientUrl = (provider, user, payload) => {
    var url = "";
    var urlType = getUrlType(payload);
    switch (urlType) {
        case "default":
            url = `/user/${user}`;
            break;
        case "mailOnly":
            if (provider === INBOX_IMAP || provider === IN_IMAP) {
                const folder = getImapFolder(payload);
                url = `/user/${user}/folder/${base64.encode(folder)}/message/${base64.encode(payload.idMail)}/bbdd/${payload.bbdd}`;
            }
            else {
                url = `/user/${user}/message/${base64.encode(payload.idMail)}/bbdd/${payload.bbdd}`;
            }
            break;
        case "mailWithCaseFile":
            if (provider === INBOX_IMAP || provider === IN_IMAP) {
                const folder = getImapFolder(payload);
                url = `/user/${user}/folder/${base64.encode(folder)}/message/${base64.encode(payload.idMail)}/casefile/${payload.idEntity}/bbdd/${payload.bbdd}`;
            } else {
                url = `/user/${user}/editMail/${base64.encode(payload.idMail)}/casefile/${payload.idEntity}/bbdd/${payload.bbdd}`;
            }
            break;
        case "composeWithCaseFile":
            url = `/user/${user}/casefile/${payload.idEntity}/bbdd/${payload.bbdd}`;
            break;
        case "composeWithContacts":
            const mailContacts = getMailContacts(payload);
            url = `/user/${user}/contacts/${base64.encode(mailContacts)}/bbdd/${payload.bbdd}`;
            break;
        case "dbOnly":
            url = `/user/${user}/bbdd/${payload.bbdd}`;
            break;
        /*
        case "mail":
          //url = `$provider$/user/$providerShort$${user}/idMail/${this.state.payload.idMail}/bbdd/${this.state.payload.bbdd}/company/${this.state.payload.idCompany}/entity/${this.state.payload.idEntity}/entityType/${this.state.payload.idEntityType}`;
          url = `/user/${user}/editMail/${payload.idMail}`;
          break;*/
        default:
            url = `/user/${user}`;
            break;
    }
    switch (provider) {
        case INBOX_GOOGLE:
        case IN_GOOGLE:
            url = `${window.URL_INBOX_GOOGLE}${url}`
            break;
        case INBOX_OUTLOOK:
        case IN_OUTLOOK:
            url = `${window.URL_INBOX_OUTLOOK}${url}`
            break;
        case INBOX_IMAP:
        case IN_IMAP:
            url = `${window.URL_INBOX_IMAP}${url}`
            break;
        default:
            url = `${window.URL_INBOX_IMAP}${url}`
            break;
    }
    return url;
}



export const buildClientUrlToken = (provider, token, account, userId) => {
    var url = `/access/${token}/`;

    switch (provider) {
        case INBOX_GOOGLE:
        case IN_GOOGLE:
            url = `${window.URL_INBOX_GOOGLE}${url}`
            break;
        case INBOX_OUTLOOK:
        case IN_OUTLOOK:
            url = `${window.URL_INBOX_OUTLOOK}${url}`
            break;
        case INBOX_IMAP:
        case IN_IMAP:
            url = `${window.URL_INBOX_IMAP}${url}`
            break;
        default:
            url = `${window.URL_INBOX_IMAP}${url}`
            break;
    }
    return url;
}