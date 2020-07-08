import * as singleSpa from "single-spa";
import {matchingPathname, runScript} from "./utils";

const loadAngularApp = async () => {
    await runScript('https://lefebvreAngular.azurewebsites.net/inline.bundle.js');
    await runScript('https://lefebvreAngular.azurewebsites.net/polyfills.bundle.js');
    await runScript('https://lefebvreAngular.azurewebsites.net/styles.bundle.js');
    await runScript('https://lefebvreAngular.azurewebsites.net/vendor.bundle.js');
    await runScript('https://lefebvreAngular.azurewebsites.net/main.bundle.js');
    return window.angularApp;
};


export const registerMainMenuApp = () => {
    singleSpa.registerApplication('angular-app', loadAngularApp, matchingPathname(['/mainmenu', '/']));
};

