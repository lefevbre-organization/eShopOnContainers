// types of action
const Types = {
    ADD_ERROR: "ADD_ERROR",
    REMOVE_ERRORS: "REMOVE_ERRORS",
    UPDATE_HASERROR: "UPDATE_HASERROR",
    SET_CASEFILE: "SET_CASEFILE"
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
  
  export default {
    addError,
    removeErrors,
    setCaseFile,
    Types
  };
  