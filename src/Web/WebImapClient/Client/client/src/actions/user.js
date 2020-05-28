export const ActionTypes = {
  SET_CURENT_USER: 'SET_CURRENT_USER',
};

export const setCurrentUser = (user) => ({
  type: ActionTypes.SET_CURENT_USER,
  payload: user,
});

export default {
  setCurrentUser,
};
