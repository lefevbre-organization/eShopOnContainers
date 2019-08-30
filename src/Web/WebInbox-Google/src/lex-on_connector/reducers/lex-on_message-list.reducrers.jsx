import {
    ADD_MESSAGE,
    DELETE_MESSAGE,
    DELETE_LIST_MESSAGES,
    ADD_LIST_MESSAGES
} from "../actions/lex-on_message-list.actions";

const defaultMessageList = {
    selectedMessages: []
};

export function lexonMessageListReducer(state = defaultMessageList, action) {
    switch(action.type) {
        case ADD_MESSAGE: {
            const index = state.selectedMessages.findIndex(message => message.id === action.data.id)
            if (index === -1) {
                return {
                    ...state,
                    selectedMessages: [...state.selectedMessages, action.data]                    
                }
            }
            return state;     
        }

        case DELETE_MESSAGE: {
            return {
                ...state,
                selectedMessages: state.selectedMessages.filter(message => message.id !== action.data.id)
            }         
        }

        case DELETE_LIST_MESSAGES: {
            for (let i=0; i < action.listMessages.length; i++) {
                const index = state.selectedMessages.findIndex(message => message.id === action.listMessages[i])
                if (index > -1) {
                    state.selectedMessages.splice(index, 1);
                }    
            }
            return {
                ...state,
                selectedMessages: state.selectedMessages            }     
        }

        case ADD_LIST_MESSAGES: {
            for (let i=0; i < action.listMessages.length; i++) {
                const index = state.selectedMessages.findIndex(message => message.id === action.listMessages[i])
                if (index === -1) {
                    const data = {id: action.listMessages[i], content: action.listMessages[i]}
                    state.selectedMessages.push(data);
                }    
            }
            return {
                ...state,
                selectedMessages: state.selectedMessages
            }     
        }

        default: return state;
    }
}