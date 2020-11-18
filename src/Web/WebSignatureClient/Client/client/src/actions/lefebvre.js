import { ActionTypes } from './action-types';

export const setUser = user => ({
    type: ActionTypes.LEFEBVRE_USER,
    payload: user
});

export const setAccount = account => ({
    type: ActionTypes.LEFEBVRE_ACCOUNT,
    payload: account
});

// export const setCaseFile = casefile => ({
//     type: ActionTypes.LEFEBVRE_CASEFILE,
//     payload: casefile
// });

export const setDataBase = database => ({
    type: ActionTypes.LEFEBVRE_DATABASE,
    payload: database
});

// export const setIdEmail = emailInfo => ({
//     type: ActionTypes.LEFEBVRE_EMAIL,
//     payload: emailInfo
// });

// export const setEmailShown = flag => ({
//     type: ActionTypes.LEFEBVRE_EMAIL_SET_SHOWN,
//     payload: flag
// });

// export const resetIdEmail = emailInfo => ({
//     type: ActionTypes.LEFEBVRE_RESET_EMAIL,
//     payload: emailInfo
// });

export const setMailContacts = mailContacts => ({
    type: ActionTypes.LEFEBVRE_MAILCONTACTS,
    payload: mailContacts
});

export const setGUID = guid => ({
    type: ActionTypes.LEFEBVRE_ACCOUNT_GUID,
    payload: guid
});

export const setSign = sign => ({
    type: ActionTypes.LEFEBVRE_ACCOUNT_SIGN,
    payload: sign
});

// export const setIdMail = idMail => ({
//     type: ActionTypes.LEFEBVRE_IDMAIL,
//     payload: idMail
// })

export const setToken = token => ({
    type: ActionTypes.LEFEBVRE_TOKEN,
    payload: token
})

export const setUserName = token => ({
    type: ActionTypes.LEFEBVRE_USER_NAME,
    payload: token
})

export const setAvailableSignatures = num => ({
    type: ActionTypes.LEFEBVRE_USER_AVAILABLE_SIGNATURES,
    payload: num
})

export const setAvailableEmails = num => ({
    type: ActionTypes.LEFEBVRE_USER_AVAILABLE_EMAILS,
    payload: num
})

export const setNumAvailableSignatures = num => ({
    type: ActionTypes.LEFEBVRE_USER_NUM_AVAILABLE_SIGNATURES,
    payload: num
})

export const setNumAvailableEmails = num => ({
    type: ActionTypes.LEFEBVRE_USER_NUM_AVAILABLE_EMAILS,
    payload: num
})

export const setUserBrandings = (service, brandings) => ({
    type: ActionTypes.LEFEBVRE_USER_BRANDINGS,
    payload: {service, brandings}
})

export const setUserApp = app => ({
    type: ActionTypes.LEFEBVRE_USER_APP,
    payload: app
})

export const setIdEntityType = idEntityType => ({
    type: ActionTypes.LEFEBVRE_ENTITY_TYPE,
    payload: idEntityType
})

export const setIdEntity = idEntity => ({
    type: ActionTypes.LEFEBVRE_ENTITY,
    payload: idEntity
})

export const setIdUserApp = idUserApp => ({
    type: ActionTypes.LEFEBVRE_ID_USER_APP,
    payload: idUserApp
})

export const setIdDocuments = idDocuments => ({
    type: ActionTypes.LEFEBVRE_ID_DOCUMENT,
    payload: idDocuments
})

export const setAdminContacts = email => ({
    type: ActionTypes.LEFEBVRE_ADMINCONTACTS,
    payload: email
})

export const setRoles = roles => ({
    type: ActionTypes.LEFEBVRE_ROLES, 
    payload: roles
})

export const setTargetService = service => ({
    type: ActionTypes.LEFEBVRE_TARGETSERVICE,
    payload: service
})


export default {
    setUser,
    setDataBase,
    // setIdEmail,
    // setEmailShown,
    setAccount,
    // setCaseFile,
    // resetIdEmail,
    setMailContacts,
    setGUID,
    setSign,
    // setIdMail,
    setToken,
    setUserName,
    setAvailableSignatures,
    setAvailableEmails,
    setNumAvailableSignatures,
    setNumAvailableEmails,
    setUserBrandings,
    setUserApp,
    setIdEntityType,
    setIdEntity,
    setIdUserApp,
    setIdDocuments,
    setAdminContacts,
    setRoles,
    setTargetService
};
