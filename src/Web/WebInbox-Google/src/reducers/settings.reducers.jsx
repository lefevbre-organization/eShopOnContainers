import { STORE_USER } from "../actions/settings.actions";

const defaultSettings = {
    userId: ''
};

export const storeUser = (state = defaultSettings, action) => {
    switch (action.type) {
        case STORE_USER:
            return {
                ...state,
                userId: action.userId
            };      

        default:
            return state;
    }
};
  