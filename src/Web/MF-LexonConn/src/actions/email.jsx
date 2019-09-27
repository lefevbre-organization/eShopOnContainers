// types of action
const Types = {
    ADD_MESSAGE: 'ADD_MESSAGE',
    DELETE_MESSAGE: 'DELETE_MESSAGE',
    ADD_LIST_MESSAGES: 'ADD_LIST_MESSAGES',
    DELETE_LIST_MESSAGES: 'DELETE_LIST_MESSAGES'
};

// actions
const addMessage = item => ({
    type: Types.ADD_MESSAGE,
    payload: item
});

const deleteMessage = id => ({
    type: Types.DELETE_MESSAGE,
    payload: id
});

const addListMessages = listItems => ({
    type: Types.ADD_LIST_MESSAGES,
    payload: listItems
});

const deleteListMessages = listItems => ({
    type: Types.DELETE_LIST_MESSAGES,
    payload: listItems
});  

export default {
    addMessage,
    deleteMessage,
    addListMessages,
    deleteListMessages,
    Types
};
