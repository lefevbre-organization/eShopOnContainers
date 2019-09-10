import { combineReducers } from "redux";
import { signedOutReducer } from "./gapi.reducers";
import { signInStatusResult } from "./gapi.reducers";
import { storeUser } from "./settings.reducers";

import { labelsResult } from "../components/sidebar/sidebar.reducers";
import { messagesResult, emailMessageResult, pageTokens, searchQuery, messageList } from "../components/content/message-list/reducers/message-list.reducers";
import { lexonMessageListReducer } from "../lex-on_connector/reducers/lex-on_message-list.reducrers.jsx";

export default combineReducers({
  signedOutReducer,
  signInStatusResult,
  storeUser,
  labelsResult,
  messagesResult,
  emailMessageResult,
  pageTokens,
  searchQuery,  
  messageList,
  lexonMessageListReducer
});
