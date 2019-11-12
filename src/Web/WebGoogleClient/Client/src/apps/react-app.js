import * as singleSpa from "single-spa";
import {matchingPathname, runScript} from "./utils";

const loadReactApp = async () => {
    await runScript('http://localhost:3003/static/js/main.js');
    return window.reactApp;
};

const activityFunction = location => location.pathname.startsWith('/');

export const registerReactApp = () => {
    singleSpa.registerApplication('react-app', loadReactApp, activityFunction);
};