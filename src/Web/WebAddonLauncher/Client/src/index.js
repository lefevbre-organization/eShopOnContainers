import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './routes/App';
import * as singleSpa from 'single-spa';
import {registerLexonApp} from "./apps/lexonconn-app";
import {registerCentinelaApp} from "./apps/centinelaconn-app";
import {registerMainnavApp} from "./apps/mainnav-app";

ReactDOM.render(<App/>, document.getElementById('root'));


registerLexonApp();
registerCentinelaApp();
registerMainnavApp();

singleSpa.start();
