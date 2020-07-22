import * as singleSpa from "single-spa";
import { matchingPathname, runScript } from "./utils";

const loadReactApp = async () => {
    await runScript('http://localhost:5000/static/js/main.js');
    //await runScript('https://lefebvre-multichannel-inbox-lexonconnector.azurewebsites.net/static/js/main.js');
    return window.mainnav;
};

const activityFunction = location => location.pathname.startsWith('/navmenu');

export const registerMainnavApp = () => {
    singleSpa.registerApplication('mainnav-app', loadReactApp, activityFunction);
};
