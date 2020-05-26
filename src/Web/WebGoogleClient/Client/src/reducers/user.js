import { ActionTypes } from '../actions/user';

const defaultUser = {
  userId: null,
  userIdApp: null,
  name: null,
  sign: null,
  account: null,
  roles: null,
};

export const currentUser = (state = defaultUser, action = {}) => {
  switch (action.type) {
    case ActionTypes.SET_CURENT_USER:
      const { idClientNavision, idUserApp, name, roles } = action.payload;
      return {
        ...state,
        userId: idClientNavision,
        userIdApp: idUserApp,
        name,
        roles,
      };
    default:
      return state;
  }
};
