import ACTIONS from "../actions/lex-on_message-list.actions";

const defaultMessageList = {
    selectedMessages: []
};

const lexonMessageListReducer = (state = defaultMessageList, action) => {
    switch(action.type) {
        case ACTIONS.Types.ADD_MESSAGE: {
            const index = state.selectedMessages.findIndex(message => message === action.payload)
            if (index === -1) {
                return {
                    ...state,
                    selectedMessages: [...state.selectedMessages, action.payload]                    
                }
            }
            return state;     
        }

        case ACTIONS.Types.DELETE_MESSAGE: {
            return {
                ...state,
                selectedMessages: state.selectedMessages.filter(message => message !== action.payload)
            }         
        }

        case ACTIONS.Types.DELETE_LIST_MESSAGES: {
            for (let i=0; i < action.payload.length; i++) {
                const index = state.selectedMessages.findIndex(message => message === action.payload[i])
                if (index > -1) {
                    state.selectedMessages.splice(index, 1);
                }    
            }
            return {
                ...state,
                selectedMessages: state.selectedMessages            }     
        }

        case ACTIONS.Types.ADD_LIST_MESSAGES: {
            for (let i=0; i < action.payload.length; i++) {
                const index = state.selectedMessages.findIndex(message => message === action.payload[i])
                if (index === -1) {
                    state.selectedMessages.push(action.payload[i]);
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

export default lexonMessageListReducer;
