import { ActionTypes } from "./action-types";

export const setUser = user => ({
  type: ActionTypes.LEXON_USER,
  payload: user
});

export const setCaseFile = casefile => ({
  type: ActionTypes.LEXON_CASEFILE,
  payload: casefile
});

export const setDataBase = database => ({
  type: ActionTypes.LEXON_DATABASE,
  payload: database
});


export default {
  setUser,
  setCaseFile,
  setDataBase
};
