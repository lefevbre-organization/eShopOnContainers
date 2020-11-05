import rootReducer from '../reducers';
import { createStore, compose, applyMiddleware } from "redux";
import createSagaMiddleware from 'redux-saga';

// Logger with default options
import logger from "redux-logger";
import {eventsSaga} from "../sagas/events.sagas";

export default function configureStore() {
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

  const sagaMiddleware = createSagaMiddleware()

  const store = createStore(rootReducer, composeEnhancers(
    applyMiddleware(sagaMiddleware, logger)
  ));

  sagaMiddleware.run(eventsSaga)
  return store;
}
