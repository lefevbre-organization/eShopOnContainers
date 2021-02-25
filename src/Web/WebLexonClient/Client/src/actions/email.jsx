// types of action
const Types = {
    ADD_MESSAGE: 'ADD_MESSAGE',
    DELETE_MESSAGE: 'DELETE_MESSAGE',
    ADD_LIST_MESSAGES: 'ADD_LIST_MESSAGES',
    DELETE_LIST_MESSAGES: 'DELETE_LIST_MESSAGES',
    RESET_LIST_MESSAGES: 'RESET_LIST_MESSAGES',
    ADD_LOADING_MESSAGE: 'ADD_LOADING_MESSAGE',
    DELETE_LOADING_MESSAGE: 'DELETE_LOADING_MESSAGE',
    RESET_LIST_LOADING_MESSAGES: 'RESET_LIST_LOADING_MESSAGES',
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

const resetListMessages = () => ({
    type: Types.RESET_LIST_MESSAGES
})

const addLoadingMessage = item => ({
    type: Types.ADD_LOADING_MESSAGE,
    payload: item
});

const deleteLoadingMessage = id => ({
    type: Types.DELETE_LOADING_MESSAGE,
    payload: id
});

const resetListLoadingMessages = () => ({
    type: Types.RESET_LIST_LOADING_MESSAGES
})

export default {
    addMessage,
    deleteMessage,
    addListMessages,
    deleteListMessages,
    resetListMessages,
    addLoadingMessage,
    deleteLoadingMessage,
    resetListLoadingMessages,
    Types
};
