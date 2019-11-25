import {createStore} from 'redux';
import rootReducer, {INITIAL_STATE} from '../reducers';

export const createMockStore = initialState => createStore(rootReducer, initialState);
//if (module.hot) {
//    // Enable Webpack hot module replacement for reducers
//    module.hot.accept('../reducers', () => {
//        const nextRootReducer = require('../reducers');
//        store.replaceReducer(nextRootReducer);
//    });
}
export const MOCK_STORE = createMockStore(INITIAL_STATE);

