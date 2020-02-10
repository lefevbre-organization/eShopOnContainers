import { INITIAL_STATE } from "./index";
import { ActionTypes } from "../actions/action-types";

const lexon = (state = INITIAL_STATE.lexon, action = {}) => {
  switch (action.type) {
    case ActionTypes.LEXON_USER:
      const user = action.payload;
      const provider = user.slice(0, 2);
      const isNewAccount = user.slice(2, 3) === "1" ? true : false;
      const userId = user.slice(3);
      return {
        ...state,
        user: user,
        provider: provider,
        isNewAccount: isNewAccount,
        userId: userId
      };

    case ActionTypes.LEXON_CASEFILE:
      return {
        ...state,
        idCaseFile: action.payload.casefile,
        bbdd: action.payload.bbdd,
        idCompany: action.payload.company
      };

    case ActionTypes.LEXON_DATABASE:
      return{
        ...state,
        bbdd: action.payload.bbdd      
      }

    case ActionTypes.LEXON_EMAIL:
      return{
        ...state,
        idEmail: action.payload.idEmail,
        idFolder: action.payload.idFolder,
        emailShown: action.payload.emailShown
      }

    case ActionTypes.LEXON_EMAIL_SET_SHOWN:
          return { ...state, emailShown: action.payload }

    default:
      return state;
  }
};

export default lexon;