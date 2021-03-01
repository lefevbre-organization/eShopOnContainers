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

export const setIdActuation = (idActuation) => ({
    type: ActionTypes.LEXON_IDACTUATION,
    payload: idActuation,
})

export const setIdEvent = (idEvent) => ({
    type: ActionTypes.LEXON_IDEVENT,
    payload: idEvent,
})

export const setNewIdActuation = (idActuation) => ({
    type: ActionTypes.LEXON_NEW_IDACTUATION,
    payload: idActuation,
})

export const setNewIdEvent = (idEvent) => ({
    type: ActionTypes.LEXON_NEW_IDEVENT,
    payload: idEvent,
})

export const setTitle = (title) => ({
    type: ActionTypes.LEXON_TITLE,
    payload: title,
})

export const resetIdActuation = () => ({
    type: ActionTypes.LEXON_RESET_IDACTUATION   
})

export const resetIdEvent = () => ({
    type: ActionTypes.LEXON_RESET_IDEVENT
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
    setTitle,
    setIdEvent,
    setIdActuation,
    resetIdActuation,
    resetIdEvent
};
