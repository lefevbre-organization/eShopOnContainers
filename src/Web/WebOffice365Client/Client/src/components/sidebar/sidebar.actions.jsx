import { getLabelList, getLabelInbox } from "../../api_graph";

export const GET_LABELS = "GET_LABELS";
export const SELECT_LABEL = "SELECT_LABEL";
export const INBOX_LABEL = "INBOX_LABEL";

export const getLabels = () => dispatch => {
  getLabelList().then(labelList => {
    dispatch({
      type: GET_LABELS,
      payload: labelList
    });
  });
};

export const selectLabel = labelId => dispatch => {
  //dispatch(setSearchQuery(""));
  dispatch({
    type: SELECT_LABEL,
    payload: labelId
  });
};

export const getInbox = () => dispatch => {
  getLabelInbox().then(labelInbox => {
    dispatch({
      type: INBOX_LABEL,
      payload: labelInbox
    });
  });
};

