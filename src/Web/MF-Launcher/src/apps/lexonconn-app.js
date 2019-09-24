import * as singleSpa from "single-spa";
import {matchingPathname, runScript} from "./utils";

const loadReactApp = async () => {
    await runScript('http://localhost:3004/static/js/main.js');
    return window.lexon;
};

const activityFunction = location => location.pathname.startsWith('/lexon');

export const registerLexonApp = () => {
    // Launch prod //////////////////////////////////////////////////////////////
    singleSpa.registerApplication('react-app', loadReactApp, activityFunction);
    /////////////////////////////////////////////////////////////////////////////

    // Launch dev ///////////////////////////////////////////////////////////////////////////////////////////////
    // const activityFunction = location => location.pathname.startsWith('/');
    // singleSpa.registerApplication('lex-on-connector', () => import('../lex-on_connector/index.js'), activityFunction);    
    //singleSpa.start();
    // Launch dev ///////////////////////////////////////////////////////////////////////////////////////////////
};
