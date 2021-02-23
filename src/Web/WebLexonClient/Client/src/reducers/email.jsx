import { INITIAL_STATE } from "./index";
import ACTIONS from "../actions/email";

const email = (state = INITIAL_STATE.email, action) => {
    switch(action.type) {        
        case ACTIONS.Types.ADD_MESSAGE: {
            const aux = [...state.selectedMessages.filter(m => m.id !== action.payload.id), action.payload];
            return {
                ...state,
                selectedMessages: aux
            }
        }

        case ACTIONS.Types.DELETE_MESSAGE: {     
            return {
                ...state,
                selectedMessages: state.selectedMessages.filter(message => message.id !== action.payload)
            }         
        }

        case ACTIONS.Types.DELETE_LIST_MESSAGES: {
            console.log("action ->", action);
            for (let i=0; i < action.payload.length; i++) {
                const index = state.selectedMessages.findIndex(message => message.id === action.payload[i].id)

                if (index > -1) {
                    state.selectedMessages.splice(index, 1);
                }    
            }
            return {
                ...state,
                selectedMessages: [...state.selectedMessages]
            }     
        }

        case ACTIONS.Types.ADD_LIST_MESSAGES: {
            for (let i=0; i < action.payload.length; i++) {
                const aux = [...state.selectedMessages.filter(m => m.id !== action.payload[i].id), action.payload[i]];
                state.selectedMessages = aux;
            }
            return {
                ...state,
                selectedMessages: [...state.selectedMessages]
            }     
        }

        case ACTIONS.Types.RESET_LIST_MESSAGES: {        
            return {
                ...state,
                selectedMessages: []
            }     
        }

        case ACTIONS.Types.ADD_LOADING_MESSAGE: {
            const aux = [...state.loadingMessages.filter(m => m !== action.payload.id), action.payload];
            return {
                ...state,
                loadingMessages: aux
            }
        }

        case ACTIONS.Types.DELETE_LOADING_MESSAGE: {     
            return {
                ...state,
                loadingMessages: state.loadingMessages.filter(message => message !== action.payload)
            }         
        }

        case ACTIONS.Types.RESET_LIST_LOADING_MESSAGES: {        
            return {
                ...state,
                loadingMessages: []
            }     
        }

        default: return state;
    }
}

export default email;
