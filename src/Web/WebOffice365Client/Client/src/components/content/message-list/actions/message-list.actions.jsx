import { getMessageList } from "../../../../api_graph";
import { getMessage } from "../../../../api_graph";
import { getMessageHeader } from "../../../../api_graph";
import { batchModify } from "../../../../api_graph";
import { selectLabel } from "../../../sidebar/sidebar.actions";

export const GET_MESSAGES = "GET_MESSAGES";
export const GET_MESSAGES_LOAD_IN_PROGRESS = "GET_MESSAGES_LOAD_IN_PROGRESS";
export const GET_MESSAGES_FAILED = "GET_MESSAGES_FAILED";
export const TOGGLE_SELECTED = "TOGGLE_SELECTED";
export const MESSAGE_LOAD_IN_PROGRESS = "MESSAGE_LOAD_IN_PROGRESS";
export const MESSAGE_LOAD_SUCCESS = "MESSAGE_LOAD_SUCCESS";
export const MESSAGE_LOAD_FAIL = "MESSAGE_LOAD_FAIL";
export const MESSAGE_HEADER_LOAD_FAIL = "MESSAGE_HEADER_LOAD_FAIL";
export const MESSAGE_HEADER_LOAD_IN_PROGRESS =
  "MESSAGE_HEADER_LOAD_IN_PROGRESS";
export const MESSAGE_HEADER_LOAD_SUCCESS = "MESSAGE_HEADER_LOAD_SUCCESS";
export const EMPTY_MESSAGES = "EMPTY_MESSAGES";
export const SET_PAGE_TOKENS = "SET_PAGE_TOKENS";
export const ADD_INITIAL_PAGE_TOKEN = "ADD_INITIAL_PAGE_TOKEN";
export const CLEAR_PAGE_TOKENS = "CLEAR_PAGE_TOKENS";
export const MODIFY_MESSAGES_SUCCESS = "MODIFY_MESSAGES_SUCCESS";
export const MODIFY_MESSAGES_FAILED = "MODIFY_MESSAGES_FAILED";
export const SET_SEARCH_QUERY = "SET_SEARCH_QUERY";
export const ADD_MESSAGE = "ADD_MESSAGE";
export const DELETE_MESSAGE = "DELETE_MESSAGE";
export const DELETE_LIST_MESSAGES = "DELETE_LIST_MESSAGES";
export const ADD_LIST_MESSAGES = "ADD_LIST_MESSAGES";

export const getLabelMessages = ({ labelIds, q = "", pageToken }) => (
  dispatch,
  getState
) => {
  dispatch(setMessageListLoadInProgress());

  const state = getState();
  const { searchQuery } = state;

  if (searchQuery !== "") {
    dispatch(selectLabel("-1"));
  }

  //Set PageToken to call api getMessageList
  if (state.messagesResult.paginatioDirectionSelected != null) {
    // = prev
    if (state.messagesResult.paginatioDirectionSelected === "prev") {
      var skipValue = state.messagesResult["@odata.nextLink"].split("skip=")[1];
      pageToken =
        state.messagesResult["@odata.nextLink"].split("skip=")[0] +
        "skip=" +
        (skipValue - 40);
    }
    // = next
    else {
      pageToken = state.messagesResult["@odata.nextLink"];
    }
  }

  // reset the state before reloading the object
  delete state.messagesResult;

  getMessageList({ labelIds, maxResults: 20, q: searchQuery, pageToken })
    .then(response => {
      dispatch({
        type: GET_MESSAGES,
        payload: response
      });

      dispatch(setPageTokens());
    })
    .catch(err => {
      dispatch({
        type: GET_MESSAGES_FAILED,
        payload: err
      });
    });
};

export const setSearchQuery = q => ({
  type: SET_SEARCH_QUERY,
  payload: q
});

export const setPageTokens = tokens => ({
  type: SET_PAGE_TOKENS,
  payload: tokens
});

export const emptyLabelMessages = () => ({
  type: EMPTY_MESSAGES
});

export const toggleSelected = (messageIds, selected) => ({
  type: TOGGLE_SELECTED,
  payload: {
    messageIds,
    selected
  }
});

export const getEmailMessage = messageId => dispatch => {
  dispatch(setMessageLoadInProgress());
  getMessage(messageId)
    .then(response => {
      dispatch({
        type: MESSAGE_LOAD_SUCCESS,
        payload: response
      });
    })
    .catch(error => {
      dispatch({
        type: MESSAGE_LOAD_FAIL,
        payload: error
      });
    });
};

export const getEmailHeaderMessage = messageId => dispatch => {
  dispatch(setMessageHeaderLoadInProgress());
  getMessageHeader(messageId)
    .then(response => {
      dispatch({
        type: MESSAGE_HEADER_LOAD_SUCCESS,
        payload: response
      });
    })
    .catch(error => {
      dispatch({
        type: MESSAGE_HEADER_LOAD_FAIL,
        payload: error
      });
    });
};

const setMessageLoadInProgress = () => ({
  type: MESSAGE_LOAD_IN_PROGRESS
});

const setMessageHeaderLoadInProgress = () => ({
  type: MESSAGE_HEADER_LOAD_IN_PROGRESS
});

const setMessageListLoadInProgress = () => ({
  type: GET_MESSAGES_LOAD_IN_PROGRESS
});

export const addInitialPageToken = token => ({
  type: ADD_INITIAL_PAGE_TOKEN,
  payload: token
});

export const clearPageTokens = () => ({
  type: CLEAR_PAGE_TOKENS
});

export const modifyMessages = ({
  ids,
  addLabelIds = [],
  removeLabelIds = []
}) => dispatch => {
  batchModify({ ids, addLabelIds, removeLabelIds })
    .then(modifiedIds => {
      dispatch({
        type: MODIFY_MESSAGES_SUCCESS,
        payload: { modifiedIds, addLabelIds, removeLabelIds }
      });
    })
    .catch(error => {
      dispatch({
        type: MODIFY_MESSAGES_FAILED
      });
    });
};

export const addMessage = messageId => dispatch => {
  const data = {
    id: messageId,
    content: messageId
  };

  dispatch({
    type: ADD_MESSAGE,
    data
  });
};

export const deleteMessage = messageId => dispatch => {
  const data = {
    id: messageId,
    content: messageId
  };

  dispatch({
    type: DELETE_MESSAGE,
    data
  });
};

export const deleteListMessages = listMessages => dispatch => {
  dispatch({
    type: DELETE_LIST_MESSAGES,
    listMessages
  });
};

export const addListMessages = listMessages => dispatch => {
  dispatch({
    type: ADD_LIST_MESSAGES,
    listMessages
  });
};
