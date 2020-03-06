import { ActionTypes } from "../actions/lexon";

const defaultLexon = {
  user: null,
  userId: null,
  provider: null,
  isNewAccount: false,
  idCaseFile: null,
  bbdd: null,
  idCompany: null,
  account: null,
  mailContacts: null
};

export const lexon = (state = defaultLexon, action = {}) => {
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
    
    case ActionTypes.LEXON_ACCOUNT:
      return {
        ...state,
        account: action.payload
      }

    case ActionTypes.LEXON_MAILCONTACTS:
      return {
        ...state,
        mailContacts: action.payload
      }

    default:
      return state;
  }
};
