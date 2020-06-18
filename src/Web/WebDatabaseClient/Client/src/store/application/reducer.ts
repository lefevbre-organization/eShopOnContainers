import { createReducer } from 'deox';
import {
  ApplicationState,
  PREFIX,
  AddErrorPayload,
  SetLoadingStatusPayload
} from './types';
import { ApplicationActions } from './actions';

const InitialApplicationState: ApplicationState = {
  errors: [],
  config: {},
  isLoading: false
};

const reducer = createReducer(InitialApplicationState, (handleAction) => [
  handleAction(ApplicationActions.addError, handleAddError()),
  handleAction(ApplicationActions.removeError, handleRemoveErrors()),
  handleAction(ApplicationActions.setLoadingStatus, handleSetLoadingStatus())
]);

function handleAddError() {
  return (state: ApplicationState, action: any) => {
    return {
      ...state,
      errors: [...state.errors, action.payload]
    };
  };
}

function handleRemoveErrors() {
  return (state: ApplicationState) => {
    return {
      ...state,
      errors: []
    };
  };
}

function handleSetLoadingStatus() {
  return (state: ApplicationState, action: any) => {
    return {
      ...state,
      isLoading: action.payload
    };
  };
}

export default reducer;
