import { combineReducers } from 'redux';
import application from './application';
import folders from './folders';
import login from './login';
import messages from './messages';
import lexon from './lexon';

export const INITIAL_STATE = {
    application: {
        title: 'Signature',
        user: {},
        newMessage: null,
        selectedFolderId: {},
        messageFilterKey: null,
        messageFilterKeyword: null,
        createFolderParentId: null,
        renameFolderId: null,
        selectedMessage: null,
        selectedSignature: null,
        downloadedMessages: {},
        outbox: null,
        pollInterval: 15000,
        errors: {
            diskQuotaExceeded: false,
            authentication: null
        },
        refreshMessageActiveRequests: 0,
        activeRequests: 0,
        signatures: {},
        signaturesFilterKey: 'Mostrar todas'
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
        selectedMessages: [],
        locked: [],
        activeRequests: 0
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
        userName: null,
        userApp: null, 
        availableSignatures: 0,
        userBrandings: null
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
