import { combineReducers } from 'redux';
import email from './email';
import selections from './selections';
import documentsReducer from './documentsReducer';
import applicationReducer from './applicationReducer';

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
  },
  selections: {
    companySelected: null,
    typeSelected: null,
    initialBBDD: null,
    user: null
  },
  documents: {
    showModalDocuments: false,
    showAttachDocuments: false,
    showImportContacts: false,
  },
};

export default combineReducers({
  email,
  selections,
  documentsReducer,
  applicationReducer,
});
