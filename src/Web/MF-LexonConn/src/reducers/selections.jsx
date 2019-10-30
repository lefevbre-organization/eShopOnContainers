import { INITIAL_STATE } from "./index";
import ACTIONS from "../actions/selections";

const selections = (state = INITIAL_STATE.selections, action) => {
  switch (action.type) {
    case ACTIONS.Types.SET_COMPANY_SELECTED: {
      return {
        ...state,
        companySelected: action.payload
      };
    }

    default:
      return state;
  }
};

export default selections;
