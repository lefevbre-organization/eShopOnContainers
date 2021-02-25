import { combineReducers } from 'redux';
import email from './email';
import selections from './selections';
import documentsReducer from './documentsReducer';
import applicationReducer from './applicationReducer';
import eventsReducer from './eventsReducer';

export const INITIAL_STATE = {
  application: {
    errors: [],
    idCaseFile: null,
    config: {},
    isComposerOpen: false,
    showSpinner: false,
  },
  email: {
    selectedMessages: [],
    loadingMessages: []
  },
  selections: {
    companySelected: null,
    typeSelected: null,
    initialBBDD: null,
    provider: null,
    user: null,
    app: null
  },
  documents: {
    showModalDocuments: false,
    showAttachDocuments: false,
    showImportContacts: false,
  },
  events: {
    eventClassifications: []
  }
};

export default combineReducers({
  email,
  selections,
  documentsReducer,
  applicationReducer,
  events: eventsReducer
});
