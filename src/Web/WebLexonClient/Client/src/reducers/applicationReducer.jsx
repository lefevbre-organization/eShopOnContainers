import { INITIAL_STATE } from './index';
import ACTIONS from '../actions/applicationAction';

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

    case ACTIONS.Types.SET_CASEFILE: {
      return {
        ...state,
        idCaseFile: action.payload
      };
    }

    case ACTIONS.Types.SET_CONFIG: {
      return {
        ...state,
        config: {
          ...action.payload
        }
      };
    }

    case ACTIONS.Types.SET_COMPOSER_OPEN: {
      return {
        ...state,
        isComposerOpen: action.payload
      };
    }
    default:
      return state;
  }
};

export default applicationReducer;
