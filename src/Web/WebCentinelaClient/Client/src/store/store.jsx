import rootReducer from '../reducers';
import { createStore, compose, applyMiddleware } from "redux";

// Logger with default options
import logger from "redux-logger";

export default function configureStore() {
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  const store = createStore(rootReducer, composeEnhancers(
    applyMiddleware(logger)
  ));

  return store;
}
