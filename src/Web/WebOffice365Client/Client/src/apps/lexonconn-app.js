import * as singleSpa from "single-spa";
import { runScript } from "./utils";
import { config } from "../constants";

const loadReactApp = async () => {
  //await runScript("http://localhost:3004/static/js/main.js");
  await runScript(config.url.URL_MF_LEXON);
  return window.lexon;
};

const activityFunction = location => location.pathname.startsWith("/");

export const registerLexonApp = () => {
  singleSpa.registerApplication("lexon-app", loadReactApp, activityFunction);
};
