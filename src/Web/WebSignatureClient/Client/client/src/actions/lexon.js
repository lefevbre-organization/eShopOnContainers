import { ActionTypes } from './action-types';

export const setUser = user => ({
    type: ActionTypes.LEXON_USER,
    payload: user
});

export const setAccount = account => ({
    type: ActionTypes.LEXON_ACCOUNT,
    payload: account
});

export const setCaseFile = casefile => ({
    type: ActionTypes.LEXON_CASEFILE,
    payload: casefile
});

export const setDataBase = database => ({
    type: ActionTypes.LEXON_DATABASE,
    payload: database
});

export const setIdEmail = emailInfo => ({
    type: ActionTypes.LEXON_EMAIL,
    payload: emailInfo
});

export const setEmailShown = flag => ({
    type: ActionTypes.LEXON_EMAIL_SET_SHOWN,
    payload: flag
});

export const resetIdEmail = emailInfo => ({
    type: ActionTypes.LEXON_RESET_EMAIL,
    payload: emailInfo
});

export const setMailContacts = mailContacts => ({
    type: ActionTypes.LEXON_MAILCONTACTS,
    payload: mailContacts
});

export const setGUID = guid => ({
    type: ActionTypes.LEXON_ACCOUNT_GUID,
    payload: guid
});

export const setSign = sign => ({
    type: ActionTypes.LEXON_ACCOUNT_SIGN,
    payload: sign
});

export const setIdMail = idMail => ({
    type: ActionTypes.LEXON_IDMAIL,
    payload: idMail
})

export const setToken = token => ({
    type: ActionTypes.LEXON_TOKEN,
    payload: token
})

export const setUserName = token => ({
    type: ActionTypes.LEXON_USER_NAME,
    payload: token
})

export const setAvailableSignatures = num => ({
    type: ActionTypes.LEXON_USER_AVAILABLE_SIGNATURES,
    payload: num
})

export const setUserBrandings = brandings => ({
    type: ActionTypes.LEXON_USER_BRANDINGS,
    payload: brandings
})

export const setUserApp = app => ({
    type: ActionTypes.LEXON_USER_APP,
    payload: app
})

export default {
    setUser,
    setDataBase,
    setIdEmail,
    setEmailShown,
    setAccount,
    setCaseFile,
    resetIdEmail,
    setMailContacts,
    setGUID,
    setSign,
    setIdMail,
    setToken,
    setUserName,
    setAvailableSignatures,
    setUserBrandings,
    setUserApp
};
