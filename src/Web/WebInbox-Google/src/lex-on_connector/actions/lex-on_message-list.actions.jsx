export const ADD_MESSAGE = "ADD_MESSAGE";
export const DELETE_MESSAGE = "DELETE_MESSAGE";
export const DELETE_LIST_MESSAGES = "DELETE_LIST_MESSAGES";
export const ADD_LIST_MESSAGES = "ADD_LIST_MESSAGES";

export const addMessage = (messageId) => dispatch => {
    const data = {
        id: messageId,
        content: messageId
    };

    dispatch({
        type: ADD_MESSAGE,
        data
    });
};

export const deleteMessage = (messageId) => dispatch => {
    const data = {
        id: messageId,
        content: messageId
    };

    dispatch({
        type: DELETE_MESSAGE,
        data     
    });
};

export const deleteListMessages = (listMessages) => dispatch => {
    dispatch({
        type: DELETE_LIST_MESSAGES,
        listMessages
    });    
};

export const addListMessages = (listMessages) => dispatch => {
    dispatch({
        type: ADD_LIST_MESSAGES,
        listMessages
    });    
};
