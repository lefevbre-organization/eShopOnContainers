export {};

declare global {
  interface Window {
    REACT_APP_ENVIRONMENT: string;
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: any;
  }
}

declare var window: Window;
