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

    case ACTIONS.Types.SET_TYPE_SELECTED: {
      return {
        ...state,
        typeSelected: action.payload
      };
    }
    case ACTIONS.Types.SET_INITIAL_BBDD: {
      return {
        ...state,
        initialBBDD: action.payload
      }
    }
    case ACTIONS.Types.CLEAR_INITIAL_BBDD: {
      return {
        ...state,
        initialBBDD: null
      }
    }

    default:
      return state;
  }
};

export default selections;
