export const ActionTypes = {
  LEXON_USER: "LEXON_USER",
  LEXON_CASEFILE: "LEXON_CASEFILE",
  LEXON_ACCOUNT: "LEXON_ACCOUNT"
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

export default {
  setUser,
  setCaseFile,
  setAccount
};