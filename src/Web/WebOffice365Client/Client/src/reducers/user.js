import { ActionTypes } from '../actions/user';

const defaultUser = {
  idClienteNavision: null,
  idUserApp: null,
  name: null,
  roles: null,
  sign: null,
  account: null,
};

export const currentUser = (state = defaultUser, action = {}) => {
  switch (action.type) {
    case ActionTypes.SET_CURENT_USER:
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
};
