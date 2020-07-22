import * as singleSpa from "single-spa";
import {matchingPathname, runScript} from "./utils";

const loadReactApp = async () => {
    await runScript(window.URL_MF_CENTINELA);
    return window.centinela;
};

const activityFunction = location => location.pathname.startsWith('/centinela');

export const registerCentinelaApp = () => {
    singleSpa.registerApplication('react-centinela-app', loadReactApp, activityFunction);
};