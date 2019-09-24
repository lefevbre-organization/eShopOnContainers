import React, { Component } from 'react';
//import './App.css';
import Main from './main';
//import './styles/bootstrap/bootstrap.min.css';

import { Provider } from 'react-redux'
import configureStore from './store/store'

const reduxStore = configureStore(window.REDUX_INITIAL_DATA);

class App extends Component {
  render() {
    return (
      <Provider store={reduxStore}>
        <Main/>
      </Provider>
    );
  }
}

export default App;
