import { ActionTypes } from "./action-types";

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

export const setIdEmail = emailInfo=> ({
  type: ActionTypes.LEXON_EMAIL,
  payload: emailInfo
});

export const setEmailShown = (flag) => ({
  type: ActionTypes.LEXON_EMAIL_SET_SHOWN,
  payload: flag
})

export const resetIdEmail = (emailInfo) => ({
  type: ActionTypes.LEXON_RESET_EMAIL,
  payload: emailInfo
})

export default {
  setUser,
  setDataBase,
  setIdEmail,
  setEmailShown,
  setAccount,
  setCaseFile,
  resetIdEmail
};
