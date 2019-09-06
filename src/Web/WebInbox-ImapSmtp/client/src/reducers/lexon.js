import { INITIAL_STATE } from "./index";
import { ActionTypes } from "../actions/action-types";

const lexon = (state = INITIAL_STATE.lexon, action = {}) => {
  switch (action.type) {
    case ActionTypes.LEXON_USER:
      return { ...state, user: action.payload };

    default:
      return state;
  }
};

export default lexon;
