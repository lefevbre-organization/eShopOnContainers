import * as singleSpa from "single-spa";
import {matchingPathname, runScript} from "./utils";

const loadReactApp = async () => {
    await runScript(window.URL_MF_LEXON);
    return window.lexon;
};

const activityFunction = location => location.pathname.startsWith('/lexon');

export const registerLexonApp = () => {
    singleSpa.registerApplication('react-app', loadReactApp, activityFunction);
};