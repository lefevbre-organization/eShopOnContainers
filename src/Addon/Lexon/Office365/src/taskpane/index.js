import "office-ui-fabric-react/dist/css/fabric.min.css";
import Routing  from "./components/routing/routing";
import { AppContainer } from "react-hot-loader";
import { initializeIcons } from "office-ui-fabric-react/lib/Icons";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { I18nextProvider } from "react-i18next";
import i18n from "./services/i18n";
const OfficeHelpers = require("@microsoft/office-js-helpers");
/* global AppCpntainer, Component, document, Office, module, React, require */

initializeIcons();

let isOfficeInitialized = false;

const title = "Lex-on";

const render = Component => {
  ReactDOM.render(
    <AppContainer>
      <I18nextProvider i18n={i18n}>
        <Component title={title} isOfficeInitialized={isOfficeInitialized} />
      </I18nextProvider>
    </AppContainer>,
    document.getElementById("container")
  );
};

/* Render application after Office initializes */
Office.initialize = () => {
  isOfficeInitialized = true;
  render(Routing);
};

/* Initial render showing a progress bar */
render(Routing);

if (module.hot) {
  module.hot.accept("./components/routing/routing", () => {
    const NextApp = require("./components/routing/routing").default;
    render(NextApp);
  });
}
