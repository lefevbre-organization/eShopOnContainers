import React from 'react';
import ReactDOM from 'react-dom';
import {createStore} from 'redux';
import {Provider} from 'react-redux';
import {I18nextProvider} from 'react-i18next';
import i18n from './services/i18n';
import Routes from './routes/routes';
import rootReducer from './reducers';
import {loadState, saveState} from './services/state';
import debounce from './services/debounce';

//import { start, registerApplication } from 'single-spa'

//const activityFunction = location => location.pathname.startsWith('/lexon-connector');

//registerApplication('lex-on-connector', () => import('./lex-on_connector/index.js'), activityFunction);
//start();

//const hashPrefix = prefix => location => location.hash.startsWith(`#${prefix}`)

//registerApplication('lex-on-connector_debug', () => import('./lex-on_connector/index.js'), hashPrefix('/lexon-connector'))


//start()

const SAVE_STATE_DEBOUNCE_PERIOD_IN_MILLIS = 500;

/**
 * Starts application asynchronously once all of the required information is available (loadState)
 *
 * @returns {Promise<void>}
 */
async function init () {
  const previousState = await loadState();
  let enhancer;
  if (process.env.NODE_ENV === 'development' && window.__REDUX_DEVTOOLS_EXTENSION__) {
    enhancer = window.__REDUX_DEVTOOLS_EXTENSION__();
  }
  const store = createStore(rootReducer, previousState, enhancer);

  //if (module.hot) {
  //    // Enable Webpack hot module replacement for reducers
  //    module.hot.accept('../reducers', () => {
  //        const nextRootReducer = require('../reducers/index');
  //        store.replaceReducer(nextRootReducer);
  //    });
  //}

  store.subscribe(debounce(() => saveState(store.dispatch, store.getState()), SAVE_STATE_DEBOUNCE_PERIOD_IN_MILLIS));

  ReactDOM.render(
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>
        <Routes />
      </I18nextProvider>
    </Provider>,
    document.getElementById('root')
  );
}

init();

if (module.hot) {
  module.hot.accept();
}
