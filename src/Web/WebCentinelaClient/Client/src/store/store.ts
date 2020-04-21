import { ApplicationState } from './application/types';
import { MessagesState } from './messages/types';
import messagesReducer from './messages/reducer';
import applicationReducer from './application/reducer';
import { createStore, compose, applyMiddleware, combineReducers } from 'redux';

// Logger with default options
import logger from 'redux-logger';

const rootReducer = combineReducers({
  messages: messagesReducer,
  application: applicationReducer
});

export interface AppState {
  messages: MessagesState;
  application: ApplicationState;
}

export default function configureStore() {
  const composeEnhancers =
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  const store = createStore(
    rootReducer,
    composeEnhancers(applyMiddleware(logger))
  );

  return store;
}
