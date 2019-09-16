export const ActionTypes = {
  LEXON_USER: "LEXON_USER"
};

export const setUser = user => ({
  type: ActionTypes.LEXON_USER, 
  payload: user
});

export default {
  setUser
};