import {ActionTypes} from './action-types';

export const setUser = user => ({
  type: ActionTypes.LEXON_USER, payload: user
});

export default {
  setUser
};
