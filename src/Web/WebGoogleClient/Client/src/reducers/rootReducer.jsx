import { combineReducers } from "redux";
import { signedOutReducer } from "./gapi.reducers";
import { signInStatusResult } from "./gapi.reducers";
import { lexon } from "./lexon";

import { labelsResult } from "../components/sidebar/sidebar.reducers";
import { calendarsResult } from "../components/calendar/sidebar/sidebarCalendar.reducers";

import {
  messagesResult,
  emailMessageResult,
  emailHeaderMessageResult,
  pageTokens,
  searchQuery,
  messageList
} from "../components/content/message-list/reducers/message-list.reducers";

export default combineReducers({
  signedOutReducer,
  signInStatusResult,
  lexon,
  labelsResult,
  calendarsResult,
  messagesResult,
  emailMessageResult,
  emailHeaderMessageResult,
  pageTokens,
  searchQuery,
  messageList
});
