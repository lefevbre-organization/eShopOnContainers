import { INITIAL_STATE } from "./index";
import ACTIONS from "../actions/applicationAction";

const applicationReducer = (state = INITIAL_STATE.application, action) => {
  switch (action.type) {
    case ACTIONS.Types.ADD_ERROR: {
      return {
        ...state,
        errors: [...state.errors, action.payload]   
      };
    }
    case ACTIONS.Types.REMOVE_ERRORS: {
      return {
        ...state,
        errors: []
      };
    }

    default:
      return state;
  }
};

export default applicationReducer;
