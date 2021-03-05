export const ActionTypes = {
  LEXON_USER: 'LEXON_USER',
  LEXON_CASEFILE: 'LEXON_CASEFILE',
  LEXON_ACCOUNT: 'LEXON_ACCOUNT',
  LEXON_BBDD: 'LEXON_BBDD',
  LEXON_MAILCONTACTS: 'LEXON_MAILCONTACTS',
  LEXON_ACCOUNT_GUID: 'LEXON_ACCOUNT_GUID',
  LEXON_ACCOUNT_SIGN: 'LEXON_ACCOUNT_SIGN',
  LEXON_IDMAIL: 'LEXON_IDMAIL',
  LEXON_TOKEN: 'LEXON_TOKEN',
  LEXON_IDACTUATION: 'LEXON_IDACTUATION',
  LEXON_IDEVENT: 'LEXON_IDEVENT',
  LEXON_TITLE: 'LEXON_TITLE',
  LEXON_RESET_IDACTUATION: 'LEXON_RESET_IDACTUATION',
  LEXON_RESET_IDEVENT: 'LEXON_RESET_IDEVENT'
};

export const setUser = (user) => ({
  type: ActionTypes.LEXON_USER,
  payload: user,
});

export const setCaseFile = (casefile) => ({
  type: ActionTypes.LEXON_CASEFILE,
  payload: casefile,
});

export const setAccount = (account) => ({
  type: ActionTypes.LEXON_ACCOUNT,
  payload: account,
});

export const setBBDD = (account) => ({
  type: ActionTypes.LEXON_BBDD,
  payload: account,
});

export const setGUID = (guid) => ({
  type: ActionTypes.LEXON_ACCOUNT_GUID,
  payload: guid,
});

export const setMailContacts = (mailContacts) => ({
  type: ActionTypes.LEXON_MAILCONTACTS,
  payload: mailContacts,
});

export const setSign = (sign) => ({
  type: ActionTypes.LEXON_ACCOUNT_SIGN,
  payload: sign,
});

export const setIdMail = (idMail) => ({
  type: ActionTypes.LEXON_IDMAIL,
  payload: idMail,
});

export const setToken = (token) => ({
  type: ActionTypes.LEXON_TOKEN,
  payload: token,
});

export const setIdActuation = (idActuation) => ({
  type: ActionTypes.LEXON_IDACTUATION,
  payload: idActuation,
})

export const setIdEvent = (idEvent) => ({
  type: ActionTypes.LEXON_IDEVENT,
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
  setCaseFile,
  setAccount,
  setMailContacts,
  setGUID,
  setSign,
  setIdMail,
  setToken,
  setBBDD,
  setIdActuation,
  setIdEvent,
  setTitle,
  resetIdActuation,
  resetIdEvent
};
