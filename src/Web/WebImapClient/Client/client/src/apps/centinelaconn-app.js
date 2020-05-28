import * as singleSpa from 'single-spa';
import { runScript } from './utils';

const loadReactApp = async () => {
  // await runScript('http://localhost:3004/static/js/main.js');
  await runScript(window.URL_MF_CENTINELA);
  return window.centinela;
};

const activityFunction = location => location.pathname.startsWith('/');

export const registerCentinelaApp = () => {
  singleSpa.registerApplication(
    'centinela-app',
    loadReactApp,
    activityFunction
  );
};
