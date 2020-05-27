import { combineReducers } from 'redux';
import application from './application';
import folders from './folders';
import login from './login';
import messages from './messages';
import lexon from './lexon';
import { currentUser } from './user';

export const INITIAL_STATE = {
  application: {
    title: 'Mail',
    user: {},
    newMessage: null,
    selectedFolderId: {},
    messageFilterKey: null,
    messageFilterKeyword: null,
    createFolderParentId: null,
    renameFolderId: null,
    selectedMessage: null,
    downloadedMessages: {},
    outbox: null,
    pollInterval: 15000,
    errors: {
      diskQuotaExceeded: false,
      authentication: null,
    },
    refreshMessageActiveRequests: 0,
    activeRequests: 0,
  },
  folders: {
    items: [],
    explodedItems: {},
    activeRequests: 0,
  },
  login: {
    formValues: {},
  },
  messages: {
    cache: {},
    selected: [],
    selectedMessages: [],
    locked: [],
    activeRequests: 0,
  },
  lexon: {
    user: null,
    account: null,
    userId: null,
    provider: null,
    isNewAccount: false,
    idCaseFile: null,
    idEmail: null,
    idFolder: null,
    emailShown: null,
    sign: null,
    guid: null,
    idMail: null,
    token: null,
  },
  currentUser: {
    idClienteNavision: null,
    idUserApp: null,
    name: null,
    roles: null,
    sign: null,
    account: null,
  },
};

// https://github.com/reduxjs/redux/issues/749#issuecomment-164327121
export default combineReducers({
  application,
  login,
  folders: folders,
  messages: messages,
  currentUser: currentUser,
  lexon: lexon,
});
