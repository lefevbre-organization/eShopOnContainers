import {ActionTypes} from './action-types';

export const setTitle = (title) => ({type: ActionTypes.APPLICATION_TITLE, payload: title});
export const setAppTitle = (appTitle) => ({type: ActionTypes.APPLICATION_APP_TITLE, payload: appTitle});
export const backendRequest = () => ({type: ActionTypes.APPLICATION_BE_REQUEST});
export const backendRequestCompleted = () => ({type: ActionTypes.APPLICATION_BE_REQUEST_COMPLETED});
export const clearUserCredentials = () => ({type: ActionTypes.APPLICATION_USER_CREDENTIALS_CLEAR});
export const setUserCredentials = (userId, hash, credentials) => ({type: ActionTypes.APPLICATION_USER_CREDENTIALS_SET, payload: {userId, hash, credentials}});
export const refreshUserCredentials = (encrypted, salt) => ({type: ActionTypes.APPLICATION_USER_CREDENTIALS_REFRESH, payload: {encrypted, salt}});
export const selectFolder = folder => ({type: ActionTypes.APPLICATION_FOLDER_SELECT, payload: folder});
export const setSignaturesFilterKey = key => ({type: ActionTypes.APPLICATION_SIGNATURES_FILTER_SET, payload: key});

export const createFolder = folderParentId => ({type: ActionTypes.APPLICATION_FOLDER_CREATE, payload: folderParentId});
export const renameFolder = folder => ({type: ActionTypes.APPLICATION_FOLDER_RENAME, payload: folder});
export const renameFolderOk = (oldFolderId, newFolderId) => ({ type: ActionTypes.APPLICATION_FOLDER_RENAME_OK, payload: {oldFolderId, newFolderId}});
export const setMessageFilterKey = messageFilterKey => ({type: ActionTypes.APPLICATION_MESSAGE_FILTER_SET, payload: messageFilterKey});
export const setMessageFilterKeyword = messageFilterKeyword => ({type: ActionTypes.APPLICATION_MESSAGE_FILTER_KEYWORD_SET, payload: messageFilterKeyword});

export const selectMessage = message => ({type: ActionTypes.APPLICATION_MESSAGE_SELECT, payload: message});
export const selectSignature = signature => ({type: ActionTypes.APPLICATION_SIGNATURE_SELECT, payload: signature});
export const selectEmail = email => ({type: ActionTypes.APPLICATION_EMAIL_SELECT, payload: email});
export const setSelectedService = service => ({type: ActionTypes.APPLICATION_SERVICE_SELECT, payload: service});
/**
 * Refreshes the current selectedMessage if it's still the same (same selectedFolder and same selectedMessage)
 *
 * @param folder
 * @param message
 * @returns {{type: string, payload: {folder: *, message: *}}}
 */
export const refreshMessage = (folder, message) => ({type: ActionTypes.APPLICATION_MESSAGE_REFRESH, payload: {folder, message}});
export const refreshMessageBackendRequest = () => ({type: ActionTypes.APPLICATION_MESSAGE_REFRESH_BE_REQUEST});
export const refreshMessageBackendRequestCompleted = () => ({type: ActionTypes.APPLICATION_MESSAGE_REFRESH_BE_REQUEST_COMPLETED});
export const preDownloadMessages = messages => ({type: ActionTypes.APPLICATION_MESSAGE_PRE_DOWNLOAD, payload: {messages}});
export const preDownloadSignatures = signatures => ({type: ActionTypes.APPLICATION_SIGNATURE_PRE_DOWNLOAD, payload: {signatures}});
export const preDownloadEmails = emails => ({type: ActionTypes.APPLICATION_EMAILS_PRE_DOWNLOAD, payload: {emails}});
export const replaceMessageEmbeddedImages = (folder, message, attachment, blob) => ({type: ActionTypes.APPLICATION_MESSAGE_REPLACE_IMAGE, payload: {folder, message, attachment, blob}});
export const setError = (type, value) => ({type: ActionTypes.APPLICATION_ERROR_SET, payload: {type, value}});

export const editMessage = message => ({type: ActionTypes.APPLICATION_MESSAGE_EDIT, payload: message});

export const outboxSendMessage = message => ({type: ActionTypes.APPLICATION_OUTBOX_SEND, payload: message});
export const outboxUpdateProgress = progress => ({type: ActionTypes.APPLICATION_OUTBOX_UPDATE_PROGRESS, payload: progress});
export const outboxSetSent = (sent, idMessage, eventNotified) => ({type: ActionTypes.APPLICATION_OUTBOX_SET_SENT, payload: {sent, idMessage, eventNotified}});
export const outboxSetError = error => ({type: ActionTypes.APPLICATION_OUTBOX_SET_ERROR, payload: error});
export const outboxMessageProcessed = () => ({type: ActionTypes.APPLICATION_OUTBOX_MESSAGE_PROCESSED});
export const outboxEventNotified = () => ({type: ActionTypes.APPLICATION_OUTBOX_EVENT_NOTIFIED})
export const setUserLefebvre = user => ({type: ActionTypes.APPLICATION_USERLEFEBVRE, payload: user});