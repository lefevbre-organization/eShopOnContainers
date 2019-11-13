import rootReducer from '../reducers';
import { createStore, applyMiddleware } from "redux";

// Logger with default options
import logger from "redux-logger";


export default function configureStore() {
  const store = createStore(rootReducer,  applyMiddleware(logger));
  return store;
}