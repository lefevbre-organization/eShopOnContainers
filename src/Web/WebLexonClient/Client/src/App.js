import React, { Component } from "react";
import "./App.css";
import Main from "./main";
import { I18nextProvider } from "react-i18next";
import i18n from "./services/i18n";

import { Provider } from "react-redux";
import configureStore from "./store/store";

const reduxStore = configureStore(window.REDUX_INITIAL_DATA);

class App extends Component {
  componentDidMount() {
    console.log("ENVIRONMENT ->", window.REACT_APP_ENVIRONMENT);
  }
  
  render() {
    return (
      <Provider store={reduxStore}>
        <I18nextProvider i18n={i18n}>
          <Main />
        </I18nextProvider>
      </Provider>
    );
  }
}

export default App;
