import { combineReducers } from "redux";
import email from "./email";
import selections from "./selections";

export const INITIAL_STATE = {
  email: {
    selectedMessages: []
  },
  selections: {
    companySelected: null
  }
};

export default combineReducers({
  email,
  selections
});
