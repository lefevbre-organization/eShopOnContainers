import React from 'react';
import ReactDOM from 'react-dom';
import { I18nextProvider } from "react-i18next";
import './index.css';
import App from './routes/App';
import i18n from "./services/i18n"
import * as singleSpa from 'single-spa';
import {registerLexonApp} from "./apps/lexonconn-app";
import {registerCentinelaApp} from "./apps/centinelaconn-app";
import {registerMainnavApp} from "./apps/mainnav-app";

ReactDOM.render(
   <I18nextProvider i18n={i18n}>
    <App/>
    </I18nextProvider>, 
    document.getElementById('root'));


registerLexonApp();
registerCentinelaApp();
registerMainnavApp();

singleSpa.start();
