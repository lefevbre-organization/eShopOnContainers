import { INITIAL_STATE } from './index';
import { ActionTypes } from '../actions/action-types';

const lefebvre = (state = INITIAL_STATE.lefebvre, action = {}) => {
    switch (action.type) {
        case ActionTypes.LEFEBVRE_USER:
            const user = action.payload;
            const provider = user.slice(0, 2);
            const isNewAccount = user.slice(2, 3) === '1' ? true : false;
            const userId = user.slice(3);
            return {
                ...state,
                user: user,
                provider: provider,
                isNewAccount: isNewAccount,
                userId: userId
            };

        case ActionTypes.LEFEBVRE_ACCOUNT:
            const account = action.payload;
            return {
                ...state,
                account
            };
        case ActionTypes.LEFEBVRE_CASEFILE:
            return {
                ...state,
                idCaseFile: action.payload.casefile,
                bbdd: action.payload.bbdd,
                idCompany: action.payload.company
            };

        case ActionTypes.LEFEBVRE_DATABASE:
            return {
                ...state,
                bbdd: action.payload
            };

        case ActionTypes.LEFEBVRE_EMAIL:
            return {
                ...state,
                idEmail: action.payload.idEmail,
                idFolder: action.payload.idFolder,
                emailShown: action.payload.emailShown
            };

        case ActionTypes.LEFEBVRE_EMAIL_SET_SHOWN:
            return { ...state, emailShown: action.payload };

        case ActionTypes.LEFEBVRE_RESET_EMAIL:
            return {
                ...state,
                idEmail: null,
                idFolder: null,
                emailShown: null
            };

        case ActionTypes.LEFEBVRE_MAILCONTACTS:
            return {
                ...state,
                mailContacts: action.payload
            };

        case ActionTypes.LEFEBVRE_ACCOUNT_GUID:
            return {
                ...state,
                guid: action.payload
            };

        case ActionTypes.LEFEBVRE_ACCOUNT_SIGN:
            return {
                ...state,
                sign: action.payload
            };

        case ActionTypes.LEFEBVRE_IDMAIL:
            return {
                ...state,
                idMail: action.payload
            };

        case ActionTypes.LEFEBVRE_TOKEN:
            return {
                ...state,
                token: action.payload
            };

        case ActionTypes.LEFEBVRE_USER_NAME:
            return{
                ...state,
                userName: action.payload
            }

        case ActionTypes.LEFEBVRE_USER_AVAILABLE_SIGNATURES:
            return{
                ...state,
                availableSignatures: action.payload
            }

        case ActionTypes.LEFEBVRE_USER_BRANDINGS:
            return{
                ...state,
                userBrandings: action.payload
            }

        case ActionTypes.LEFEBVRE_USER_APP:
            return{
                ...state,
                userApp: action.payload
            }

        case ActionTypes.LEFEBVRE_ENTITY_TYPE:
            return{
                ...state,
                idEntityType: action.payload
            }

        case ActionTypes.LEFEBVRE_ENTITY:
            return{
                ...state,
                idEntity: action.payload
            }

        case ActionTypes.LEFEBVRE_ID_USER_APP:
            return{
                ...state,
                idUserApp: action.payload
            }

        case ActionTypes.LEFEBVRE_ID_DOCUMENT:
            return {
                ...state, 
                idDocuments: action.payload
            }

        case ActionTypes.LEFEBVRE_ADMINCONTACTS:
            return {
                ...state,
                adminContacts: action.payload
            }
            
        default:
            return state;
    }
};

export default lefebvre;