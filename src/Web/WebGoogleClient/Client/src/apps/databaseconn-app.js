import * as singleSpa from 'single-spa';
import { runScript } from './utils';

const loadReactApp = async () => {
  await runScript('http://localhost:3006/static/js/main.js');
  //await runScript(window.URL_MF_DATABASE);
  return window.database;
};

const activityFunction = (location) => location.pathname.startsWith('/');

export const registerDatabaseApp = () => {
  singleSpa.registerApplication('database-app', loadReactApp, activityFunction);
};
