// types of action
const Types = {
    ADD_ERROR: "ADD_ERROR",
    REMOVE_ERRORS: "REMOVE_ERRORS",
    UPDATE_HASERROR: "UPDATE_HASERROR"
  };
  
  // actions
  const addError = error => ({
    type: Types.ADD_ERROR,
    payload: error
  });

  const removeErrors = () => ({
    type: Types.REMOVE_ERRORS
  });
  
  export default {
    addError,
    removeErrors,
    Types
  };
  