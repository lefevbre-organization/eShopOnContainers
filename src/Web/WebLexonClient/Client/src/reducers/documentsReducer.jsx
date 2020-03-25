import { INITIAL_STATE } from './index';
import ACTIONS from '../actions/documentsAction';

const documentsReducer = (state = INITIAL_STATE.documents, action) => {
  switch (action.type) {
    case ACTIONS.Types.TOGGLE_MODAL_DOCUMENTS: {
      return {
        ...state,
        showModalDocuments: !state.showModalDocuments
      };
    }
    case ACTIONS.Types.TOGGLE_MODAL_ATTACH_DOCUMENTS: {
      return {
        ...state,
        showAttachDocuments: !state.showAttachDocuments
      };
    }

    default:
      return state;
  }
};

export default documentsReducer;
