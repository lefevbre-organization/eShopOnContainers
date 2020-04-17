import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as singleSpa from 'single-spa';
import {registerLexonApp} from "./apps/lexonconn-app";
import {registerMainnavApp} from "./apps/mainnav-app";

ReactDOM.render(<App/>, document.getElementById('root'));


registerLexonApp();
registerMainnavApp();

singleSpa.start();
