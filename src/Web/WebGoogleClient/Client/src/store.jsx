import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import logger from "redux-logger";
import rootReducer from "./reducers/rootReducer";
import { setStateStorage } from "./localstorage";

const configureStore = createStore(rootReducer, applyMiddleware(thunk, logger));

configureStore.subscribe(() => {
  setStateStorage({
    lexon: configureStore.getState().lexon
  });
});

export default configureStore;
