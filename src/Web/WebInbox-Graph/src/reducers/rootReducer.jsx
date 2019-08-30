import { combineReducers } from "redux";
import { signedOutReducer } from "./gapi.reducers";
import { signInStatusResult } from "./gapi.reducers";
import { storeUser } from "./settings.reducers";

import { labelsResult } from "../components/sidebar/sidebar.reducers";
import { messagesResult, emailMessageResult, pageTokens, searchQuery, messageList } from "../components/content/message-list/reducers/message-list.reducers";

export default combineReducers({
  signedOutReducer,
  signInStatusResult,
  storeUser,
  labelsResult,
  messagesResult,
  emailMessageResult,
  pageTokens,
  searchQuery,
  messageList
});
