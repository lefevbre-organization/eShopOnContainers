export const ActionTypes = {
  LEXON_USER: "LEXON_USER",
  LEXON_CASEFILE: "LEXON_CASEFILE"
};

export const setUser = user => ({
  type: ActionTypes.LEXON_USER, 
  payload: user
});

export const setCaseFile = casefile => ({
  type: ActionTypes.LEXON_CASEFILE, 
  payload: casefile
});

export default {
  setUser,
  setCaseFile
};