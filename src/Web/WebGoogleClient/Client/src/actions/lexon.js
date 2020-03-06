export const ActionTypes = {
  LEXON_USER: "LEXON_USER",
  LEXON_CASEFILE: "LEXON_CASEFILE",
  LEXON_ACCOUNT: "LEXON_ACCOUNT",
  LEXON_MAILCONTACTS: "LEXON_MAILCONTACTS"
};

export const setUser = user => ({
  type: ActionTypes.LEXON_USER, 
  payload: user
});

export const setCaseFile = casefile => ({
  type: ActionTypes.LEXON_CASEFILE, 
  payload: casefile
});

export const setAccount = account => ({
  type: ActionTypes.LEXON_ACCOUNT,
  payload: account
})

export const setMailContacts = mailContacts => ({
  type: ActionTypes.LEXON_MAILCONTACTS,
  payload: mailContacts
})

export default {
  setUser,
  setCaseFile,
  setAccount,
  setMailContacts
};