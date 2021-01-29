import sanitize from './sanitize';
import { HttpHeaders, isSuccessful } from './fetch';
import { URLS } from './url';
import { round } from '../services/prettify';
import {
  outboxMessageProcessed,
  outboxSendMessage as sendMessageAction,
  outboxUpdateProgress,
  draftUpdateProgress,
  draftClean,
  outboxSetSent,
  draftSetSent,
  outboxSetError,
  draftSetError,
} from '../actions/application';

const SNACKBAR_DURATION = 4000;

export function sendMessage(
  dispatch,
  credentials,
  {
    inReplyTo = [],
    references = [],
    to,
    cc,
    bcc,
    attachments = [],
    subject,
    content,
  }
) {
  const normalizedAttachments = attachments.map( at => ({ ...at, fileName: removeAccents(at.fileName)}));
  const message = {
    recipients: [
      ...to.map((address) => ({ type: 'To', address: address })),
      ...cc.map((address) => ({ type: 'Cc', address: address })),
      ...bcc.map((address) => ({ type: 'Bcc', address: address })),
    ],
    inReplyTo,
    references,
    attachments: normalizedAttachments,
    subject: subject,
    content: sanitize.sanitize(content),
  };  
  const postMessageRequest = new XMLHttpRequest();
  postMessageRequest.open('POST', URLS.SMTP);
  postMessageRequest.setRequestHeader(
    HttpHeaders.ISOTOPE_CREDENTIALS,
    credentials.encrypted
  );
  postMessageRequest.setRequestHeader(
    HttpHeaders.ISOTOPE_SALT,
    credentials.salt
  );
  postMessageRequest.setRequestHeader(
    HttpHeaders.CONTENT_TYPE,
    `application/json; charset=${document.characterSet}`
  );
  const upload = postMessageRequest.upload;
  upload.onprogress = (e) =>
    dispatch(outboxUpdateProgress(round(e.loaded / e.total, 2)));
  const errorHandler = () => {
    dispatch(outboxSetError(true));
  };
  postMessageRequest.onload = (event) => {
    if (isSuccessful(event.target.status)) {
      if (event && event.target && event.target.response) {
        //if (event.target.hasOwnProperty('response')){
        dispatch(outboxSetSent(true, event.target.response, false));
      } else {
        dispatch(outboxSetSent(true, '', false));
      }
      dispatch(draftClean());
      setTimeout(() => dispatch(outboxMessageProcessed()), SNACKBAR_DURATION);
    } else {
      errorHandler();
    }
  };
  postMessageRequest.onerror = errorHandler;
  dispatch(sendMessageAction(message));
  postMessageRequest.send(JSON.stringify(message));
}

export function saveDraft(
  dispatch,
  credentials,
  {
    inReplyTo = [],
    references = [],
    to,
    cc,
    bcc,
    attachments = [],
    subject,
    content,
  }
) {
  const normalizedAttachments = (attachments) ? attachments.map( at => ({ ...at, fileName: removeAccents(at.fileName)})) : [];
  const message = {
    recipients: [
      ...to.map((address) => ({ type: 'To', address: address })),
      ...cc.map((address) => ({ type: 'Cc', address: address })),
      ...bcc.map((address) => ({ type: 'Bcc', address: address })),
    ],
    inReplyTo,
    references,
    attachments: normalizedAttachments,
    subject: subject,
    content: sanitize.sanitize(content),
  };  
  const postMessageRequest = new XMLHttpRequest();
  postMessageRequest.open('POST', URLS.DRAFT);
  postMessageRequest.setRequestHeader(
    HttpHeaders.ISOTOPE_CREDENTIALS,
    credentials.encrypted
  );
  postMessageRequest.setRequestHeader(
    HttpHeaders.ISOTOPE_SALT,
    credentials.salt
  );
  postMessageRequest.setRequestHeader(
    HttpHeaders.CONTENT_TYPE,
    `application/json; charset=${document.characterSet}`
  );
  const upload = postMessageRequest.upload;
  upload.onprogress = (e) =>
    dispatch(draftUpdateProgress(round(e.loaded / e.total, 2)));
  const errorHandler = () => {
    dispatch(draftSetError(true));
  };
  postMessageRequest.onload = (event) => {
    if (isSuccessful(event.target.status)) {
      if (event && event.target && event.target.response) {
        //if (event.target.hasOwnProperty('response')){
        dispatch(draftSetSent(true, event.target.response, false));
      } else {
        dispatch(draftSetSent(true, '', false));
      }
    } else {
      errorHandler();
    }
  };
  postMessageRequest.onerror = errorHandler;
  // dispatch(sendMessageAction(message));
  postMessageRequest.send(JSON.stringify(message));
}

const removeAccents = (str) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}