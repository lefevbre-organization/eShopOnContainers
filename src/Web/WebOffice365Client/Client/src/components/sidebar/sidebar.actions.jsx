import { getLabelList, getLabelInbox, getChildLabel } from "../../api_graph";

export const GET_LABELS = "GET_LABELS";
export const GET_CHILD_LABEL = "GET_CHILD_LABELS";
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

// export const getChildLabel = () => dispatch => {
//   getChildLabel().then(labelList => {
//     dispatch({
//       type: GET_CHILD_LABEL,
//       payload: labelList
//     });
//   });
// };

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

