export const ActionTypes = {
  LEXON_USER: 'LEXON_USER',
  LEXON_CASEFILE: 'LEXON_CASEFILE',
  LEXON_ACCOUNT: 'LEXON_ACCOUNT',
  LEXON_MAILCONTACTS: 'LEXON_MAILCONTACTS',
  LEXON_ACCOUNT_GUID: 'LEXON_ACCOUNT_GUID',
  LEXON_ACCOUNT_SIGN: 'LEXON_ACCOUNT_SIGN'
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
});

export const setGUID = guid => ({
  type: ActionTypes.LEXON_ACCOUNT_GUID,
  payload: guid
});

export const setMailContacts = mailContacts => ({
  type: ActionTypes.LEXON_MAILCONTACTS,
  payload: mailContacts
});

export const setSign = sign => ({
  type: ActionTypes.LEXON_ACCOUNT_SIGN,
  payload: sign
});

export default {
  setUser,
  setCaseFile,
  setAccount,
  setMailContacts,
  setGUID,
  setSign
};
