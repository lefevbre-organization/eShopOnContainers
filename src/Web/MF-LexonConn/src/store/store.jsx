import { createStore, applyMiddleware } from "redux";

// Logger with default options
import logger from "redux-logger";

import lexonMessageListReducer from '../reducers/lex-on_message-list.reducrers'

export default function configureStore() {
  const store = createStore(lexonMessageListReducer,  applyMiddleware(logger));
  return store;
}