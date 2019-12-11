import {combineReducers} from 'redux';
import application from './application';
import folders from './folders';
import login from './login';
import messages from './messages';
import lexon from './lexon';

export const INITIAL_STATE = {
  application: {
    title: 'Mail',
    user: {},
    newMessage: null,
    selectedFolderId: {},
    messageFilterKey: null,
    createFolderParentId: null,
    renameFolderId: null,
    selectedMessage: null,
    downloadedMessages: {},
    outbox: null,
    pollInterval: 15000,
    errors: {
      diskQuotaExceeded: false,
      authentication: null
    },
    refreshMessageActiveRequests: 0,
    activeRequests: 0
  },
  folders: {
    items: [],
    explodedItems: {},
    activeRequests: 0
  },
  login: {
    formValues: {}
  },
  messages: {
    cache: {},
    selected: [],
    selectedMessageId: [],
    locked: [],
    activeRequests: 0
  },
  lexon: {
    user: null,
    userId: null,
    provider: null,
    isNewAccount: false,
    idCaseFile: null
  }
};

// https://github.com/reduxjs/redux/issues/749#issuecomment-164327121
export default combineReducers({
  application,
  login,
  folders: folders,
  messages: messages,
  lexon: lexon
});
