import * as singleSpa from "single-spa";
import {matchingPathname, runScript} from "./utils";

const loadReactApp = async () => {
    await runScript('http://localhost:3004/static/js/main.js');
    return window.lexon;
};

const activityFunction = location => location.pathname.startsWith('/lexon');

export const registerLexonApp = () => {
    singleSpa.registerApplication('react-app', loadReactApp, activityFunction);
};