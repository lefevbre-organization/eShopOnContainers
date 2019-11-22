import { INITIAL_STATE } from "./index";
import { ActionTypes } from "../actions/action-types";

const lexon = (state = INITIAL_STATE.lexon, action = {}) => {
  switch (action.type) {
    case ActionTypes.LEXON_USER:
      const user = action.payload;
      const provider = user.slice(0, 2);
      const isNewAccount = user.slice(2, 3) === '1' ? true : false;
      const userId = user.slice(3);
      return {
        ...state,
        user: user,
        provider: provider,
        isNewAccount: isNewAccount,
        userId: userId
      };

    default:
      return state;
  }
};

export default lexon;