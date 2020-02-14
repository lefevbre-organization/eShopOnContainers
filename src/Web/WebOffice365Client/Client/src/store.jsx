import { createStore, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";
import logger from "redux-logger";
import rootReducer from "./reducers/rootReducer";
import { setStateStorage } from "./localstorage";

const composeEnhancers =
typeof window === 'object' &&
window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?   
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
  }) : compose;

const enhancer = composeEnhancers(applyMiddleware(thunk, logger));
const configureStore = createStore(rootReducer, enhancer);

configureStore.subscribe(() => {
  setStateStorage({
    lexon: configureStore.getState().lexon
  });
});

export default configureStore;
