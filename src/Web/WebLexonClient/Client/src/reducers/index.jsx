import { combineReducers } from "redux";
import email from "./email";
import selections from "./selections";
import documentsReducer from "./documentsReducer";
import applicationReducer from "./applicationReducer";

export const INITIAL_STATE = {
  application: {
    errors: [],
    idCaseFile: null
  },
  email: {
    selectedMessages: []
  },
  selections: {
    companySelected: null,
    typeSelected: null
  },
  documents: {
    showModalDocuments: false
  }
};

export default combineReducers({
  email,
  selections,
  documentsReducer,
  applicationReducer
});
