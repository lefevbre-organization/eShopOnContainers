import { createReducer } from 'deox';
import { ApplicationState } from './types';
import { ApplicationActions } from './actions';

const InitialApplicationState: ApplicationState = {
  errors: [],
  config: {},
  isLoading: false,
  composerStatus: 'closed',
  user: null,
  showArchiveModal: false,
  showAttachModal: false,
};

const reducer = createReducer(InitialApplicationState, (handleAction) => [
  handleAction(ApplicationActions.addError, handleAddError()),
  handleAction(ApplicationActions.removeError, handleRemoveErrors()),
  handleAction(ApplicationActions.setLoadingStatus, handleSetLoadingStatus()),
  handleAction(ApplicationActions.setCurrentUser, handleSetCurrentUser()),
  handleAction(ApplicationActions.setComposerStatus, handleSetComposerStatus()),
  handleAction(
    ApplicationActions.toggleArchiveModal,
    handleToggleArchiveModal()
  ),
  handleAction(ApplicationActions.toggleAttachModal, handleToggleAttachModal()),
]);
function handleAddError() {
  return (state: ApplicationState, action: any) => {
    return {
      ...state,
      errors: [...state.errors, action.payload],
    };
  };
}

function handleRemoveErrors() {
  return (state: ApplicationState) => {
    return {
      ...state,
      errors: [],
    };
  };
}

function handleSetLoadingStatus() {
  return (state: ApplicationState, action: any) => {
    return {
      ...state,
      isLoading: action.payload,
    };
  };
}

function handleSetComposerStatus() {
  return (state: ApplicationState, action: any) => {
    return {
      ...state,
      composerStatus: action.payload,
    };
  };
}
function handleSetCurrentUser() {
  return (state: ApplicationState, action: any) => {
    return {
      ...state,
      user: action.payload,
    };
  };
}

function handleToggleArchiveModal() {
  return (state: ApplicationState, action: any) => {
    return {
      ...state,
      showArchiveModal: !state.showArchiveModal,
    };
  };
}

function handleToggleAttachModal() {
  return (state: ApplicationState, action: any) => {
    return {
      ...state,
      showAttachModal: !state.showAttachModal,
    };
  };
}

export default reducer;
