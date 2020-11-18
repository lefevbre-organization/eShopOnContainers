import { INITIAL_STATE } from './index';
import ACTIONS from '../actions/eventsAction';

const eventsReducer = (state = INITIAL_STATE.events, action) => {
  switch (action.type) {
    case ACTIONS.Types.GET_EVENT_CLASSIFICATIONS: {
      return state;
    }
    case ACTIONS.Types.GET_EVENT_CLASSIFICATIONS_SUCCESS: {
      return {
        ...state,
        eventClassifications: [...action.payload]
      };
    }
    case ACTIONS.Types.GET_EVENT_CLASSIFICATIONS_ERROR: {
      return state;
    }
    default:
      return state;
  }
};

export default eventsReducer;
