import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import logger from 'redux-logger';
import rootReducer from './reducers/rootReducer';
import { setStateStorage } from './localstorage';

const composeEnhancers =
  typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({})
    : compose;

const enhancer = composeEnhancers(applyMiddleware(thunk, logger));
const configureStore = createStore(rootReducer, enhancer);

configureStore.subscribe(() => {
  const stateStorage = configureStore.getState();
  setStateStorage({
    lexon: stateStorage.lexon || null,
    currentUser: stateStorage.currentUser || null,
    calendarsResult: stateStorage.calendarsResult || null
  });
});

export default configureStore;
