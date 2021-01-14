import {
  editMessage,
  selectMessage
} from '../actions/application';
import { abortControllerWrappers, abortFetch } from './fetch';

export function editNewMessage(dispatch, sendingType, to = [], cc = [], sign = null, attachments = []) {
  dispatch(
    editMessage({
      sendingType,
      to: to,
      cc: cc,
      bcc: [],
      attachments: attachments,
      subject: '',
      content: `<br/>${sign?sign:''}`
    })
  );
}

export function editMessageAsNew(dispatch, message) {
  const recipientMapper = r => r.address;
  const to = message.recipients
    .filter(r => r.type === 'To')
    .map(recipientMapper);
  const cc = message.recipients
    .filter(r => r.type === 'Cc')
    .map(recipientMapper);
  const bcc = message.recipients
    .filter(r => r.type === 'Bcc')
    .map(recipientMapper);
  dispatch(editMessage({ ...message, to, cc, bcc }));
}

/**
 * Aborts any active request to read a message from the BE.
 *
 * Clears the selected message in the application.
 *
 * @param dispatch, store's dispatch function
 */
export function clearSelectedMessage(dispatch) {
  abortFetch(abortControllerWrappers.readMessageAbortController);
  dispatch(selectMessage(null));
}
