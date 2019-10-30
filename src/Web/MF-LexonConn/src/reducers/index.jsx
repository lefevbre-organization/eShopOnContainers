import { combineReducers } from "redux";
import email from "./email";
import selections from "./selections";
import documentsReducer from "./documentsReducer";

export const INITIAL_STATE = {
  email: {
    selectedMessages: []
  },
  selections: {
    companySelected: null
  },
  documents: {
    showModalDocuments: false
  }
};

export default combineReducers({
  email,
  selections,
  documentsReducer
});
