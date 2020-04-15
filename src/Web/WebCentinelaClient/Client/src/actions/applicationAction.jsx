// types of action
const Types = {
  ADD_ERROR: 'ADD_ERROR',
  REMOVE_ERRORS: 'REMOVE_ERRORS',
  UPDATE_HASERROR: 'UPDATE_HASERROR',
  SET_CASEFILE: 'SET_CASEFILE',
  SET_CONFIG: 'SET_CONFIG',
  SET_COMPOSER_OPEN: 'SET_COMPOSER_OPEN'
};

// actions
const addError = error => ({
  type: Types.ADD_ERROR,
  payload: error
});

const setCaseFile = casefile => ({
  type: Types.SET_CASEFILE,
  payload: casefile
});

const removeErrors = () => ({
  type: Types.REMOVE_ERRORS
});

const setConfig = config => ({
  type: Types.SET_CONFIG,
  payload: config
});

const setComposerOpen = open => ({
  type: Types.SET_COMPOSER_OPEN,
  payload: open
});

export default {
  addError,
  removeErrors,
  setCaseFile,
  setConfig,
  setComposerOpen,
  Types
};
