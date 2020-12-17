import { combineReducers } from 'redux';
import { signedOutReducer } from './gapi.reducers';
import { signInStatusResult } from './gapi.reducers';
import { lexon } from './lexon';
import { currentUser } from './user';

import { labelsResult } from '../components/sidebar/sidebar.reducers';
import { calendarsResult } from '../calendar/components/sidebar/sidebarCalendar.reducers';

import {
  messagesResult,
  emailMessageResult,
  emailHeaderMessageResult,
  pageTokens,
  searchQuery,
  messageList,
  composer
} from '../components/content/message-list/reducers/message-list.reducers';

export default combineReducers({
  signedOutReducer,
  signInStatusResult,
  currentUser,
  lexon,
  labelsResult,
  calendarsResult,
  messagesResult,
  emailMessageResult,
  emailHeaderMessageResult,
  pageTokens,
  searchQuery,
  messageList,
  composer
});
