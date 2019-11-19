import * as singleSpa from "single-spa";
import { runScript } from "./utils";

const loadReactApp = async () => {
  // await runScript('http://localhost:3004/static/js/main.js');
  await runScript(window.URL_MF_LEXON);
  return window.lexon;
};

const activityFunction = location => location.pathname.startsWith("/");

export const registerLexonApp = () => {
  singleSpa.registerApplication("lexon-app", loadReactApp, activityFunction);
};
