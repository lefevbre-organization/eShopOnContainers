import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import PropTypes from 'prop-types';
import { AutoSizer, List } from 'react-virtualized';
import Checkbox from '../form/checkbox/checkbox';
import Spinner from '../spinner/spinner';
import ClearFolderListItem from './clear-folder-list-item';
import { DroppablePayloadTypes } from '../folders/folder-list';
import { getCredentials } from '../../selectors/application';
import { getSelectedFolder } from '../../selectors/folders';
import { getSelectedFolderMessageList } from '../../selectors/messages';
import { prettyDate, prettySize } from '../../services/prettify';
import { selectMessage } from '../../actions/application';
import { setSelected } from '../../actions/messages';
import { preloadMessages, setMessageFlagged } from '../../services/message';
import { editNewMessage, draftMessage } from '../../services/application';
import { readMessage, readMessageRaw } from '../../services/message-read';
import PerfectScrollbar from 'react-perfect-scrollbar';
import 'react-perfect-scrollbar/dist/css/styles.css';
import mainCss from '../../styles/main.scss';
import styles from './message-list.scss';

function parseFrom(from) {
  const firstFrom = from && from.length > 0 ? from[0] : '';
  const formattedFrom = firstFrom.match(/^\"(.*)\"/);
  return formattedFrom !== null ? formattedFrom[1] : firstFrom;
}

function parseTo(recipients) {
  let to = '';

  if (recipients && recipients.length && recipients.length > 0) {
    const rec = recipients[0];
    to = rec.address || '';
  }

  return to;
}

function _dragImage(t, messages, x, y) {
  const imageNode = document.createElement('span');
  imageNode.draggable = true;
  imageNode.style.opacity = '1';
  imageNode.style.position = 'absolute';
  imageNode.style.top = `${Math.max(0, y)}px`;
  imageNode.style.left = `${Math.max(0, x)}px`;
  imageNode.style.pointerEvents = 'none';
  imageNode.style.padding = '6px';
  imageNode.style.backgroundColor = 'white';
  imageNode.innerHTML = t('messageList.moveEmails', {
    emailCount: messages.length,
  });
  return imageNode;
}

class MessageList extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className={`${styles.messageList} ${this.props.className}`}>
        <Spinner
          visible={
            this.props.activeRequests > 0 && this.props.messages.length === 0
          }
        />
        {this.props.messages.length === 0 ? null : (
          <Fragment>
            <ClearFolderListItem />
            <PerfectScrollbar>
              <ul className={`${mainCss['mdc-list']} ${styles.list}`}>
                <AutoSizer defaultHeight={100}>
                  {({ height, width }) => (
                    <List
                      className={styles.virtualList}
                      height={height}
                      width={width}
                      rowRenderer={this.renderItem.bind(this)}
                      rowCount={this.props.messages.length}
                      rowHeight={52}
                    />
                  )}
                </AutoSizer>
              </ul>
            </PerfectScrollbar>
          </Fragment>
        )}
        {this.props.activeRequests > 0 && this.props.messages.length > 0 ? (
          <Spinner
            className={styles.listSpinner}
            canvasClassName={styles.listSpinnerCanvas}
          />
        ) : null}
      </div>
    );
  }

  componentDidMount() {
    this.preloadMessages({ messages: [] });
  }

  componentDidUpdate(previousProps) {
    if( JSON.stringify(previousProps.messages) !== JSON.stringify(this.props.messages)) {
      this.preloadMessages(previousProps);
    }
  }

  renderItem({ index, key, style }) {
    const folder = this.props.selectedFolder;
    const message = this.props.messages[index];
    const selected =
      this.props.selectedMessages.find( msg => msg.messageId === message.messageId);

    let attachments = message.hasAttachments;
    if (
      this.props.downloadedMessages[message.messageId] &&
      this.props.downloadedMessages[message.messageId].attachments
    ) {
      attachments =
        this.props.downloadedMessages[message.messageId].attachments.length > 0;
    }
    return (
      // (message.deleted) ?
      // null
      // :
      <li
        key={key}
        style={style}
        draggable={true}
        onDragStart={(event) => this.onDragStart(event, folder, message)}
        className={`${mainCss['mdc-list-item']}
                ${styles.item}
                ${message.seen ? styles.seen : ''}
                ${message.deleted ? styles.deleted : ''}`}>
        <Checkbox
          id={message.messageId}
          onChange={(event) => this.selectMessage(event, message)}
          checked={selected}
        />
        <span
          className={styles.itemDetails}
          onClick={() =>  this.messageClicked(message) }
          draggable={true}
          onDragStart={(event) => this.onDragStart(event, folder, message)}>
          {folder && folder.type && folder.type.attribute !== '\\Sent' && (
            <span className={styles.from}>{parseFrom(message.from)}</span>
          )}
          {folder && folder.type && folder.type.attribute === '\\Sent' && (
            <span className={styles.from}>{parseTo(message.recipients)}</span>
          )}
          <span
            className={`material-icons ${styles.flag} ${
              message.flagged && styles.flagged
            }`}
            onClick={(event) => {
              event.stopPropagation();
              this.props.toggleMessageFlagged(message);
            }}>
            {'outlined_flag'}
          </span>
          <span className={styles.subject}>{message.subject}</span>
          {attachments && (
            <span
              className='lf-icon lf-icon-add'
              style={{
                fontWeight: 'bold',
                fontSize: 18,
                transform: 'rotateZ(27deg)',
              }}></span>
          )}

          <span className={styles.receivedDate}>
            {prettyDate(message.receivedDate)}
          </span>
          <span className={styles.size}>{prettySize(message.size)}</span>
        </span>
      </li>
    );
  }

  onDragStart(event, fromFolder, message) {
    event.stopPropagation();
    const payload = { type: DroppablePayloadTypes.MESSAGES, fromFolder };
    if (this.props.selectedMessages.length > 0) {
      // Prevent dragging single messages when there is a selection and message is not part of the selection
      if (this.props.selectedMessages.indexOf(message.messageId) < 0) {
        event.preventDefault();
        return;
      }
      const messages = this.props.messages.filter(
        (m) => this.props.selectedMessages.indexOf(m.messageId) > -1
      );
      if (event.dataTransfer.setDragImage) {
        const image = _dragImage(
          this.props.t,
          messages,
          event.pageX,
          event.pageY
        );
        const appendedImage = document.body.appendChild(image);
        setTimeout(() => document.body.removeChild(appendedImage));
        event.dataTransfer.setDragImage(image, -8, -16);
      }
      payload.messages = messages;
    } else {
      payload.messages = [message];
    }
    event.dataTransfer.setData('application/json', JSON.stringify(payload));
  }

  /**
   * Select/unselects the message for which the checkbox is changed.
   *
   * If the shift key is pressed, and it's a select operation, a range of messages will be selected. The range will be
   * the one consisting in the last selected message and the current message in any direction.
   *
   * @param event
   * @param message
   */
  selectMessage(event, message) {
    event.stopPropagation();
    const checked = event.target.checked;
    if (
      checked &&
      event.nativeEvent &&
      event.nativeEvent.shiftKey &&
      this.props.selectedMessages.length > 0
    ) {
      console.log('Debug: Messages selected with range');
      // Range selection
      const messagesToSelect = [];
      const lastSelectedMessageUid = this.props.selectedMessages[
        this.props.selectedMessages.length - 1
      ];
      let selecting = false;
      this.props.messages.forEach((m) => {
        console.log('Debug: Reading message');
        if (
          m.messageId === message.messageId ||
          m.messageId === lastSelectedMessageUid.messageId
        ) {
          selecting = !selecting;
          messagesToSelect.push(m);
        } else if (selecting) {
          messagesToSelect.push(m);
        }
      });
      console.log('Debug: All messages processed. Sending to redux');
      for (let i = 0; i < messagesToSelect.length; i++) {
        this.props.messageSelected(
          [messagesToSelect[i]],
          checked,
          this.props.selectedFolder.fullName,
          this.props.selectedFolder.folderId,
          messagesToSelect[i].uid
        )
      }

      if (checked === true) {
        console.log('Debug: Sending LoadingEvents to connector');
        console.log('LoadingMessage: 4');
        messagesToSelect.forEach( msg => {
          console.log('Debug: Loading event message:' + msg.messageId);
          window.dispatchEvent(new CustomEvent('LoadingMessage', {detail: msg.messageId}));
        })
      }

      const prs = [];
      for (let i = 0; i < messagesToSelect.length; i++) {
        const message = messagesToSelect[i];
        if (checked === true) {
          console.log('Debug: Reading raw message:'+i);
          prs.push(
            readMessageRaw(
              null,
              this.props.credentials,
              null,
              this.props.selectedFolder,
              message
            )
          );
        } else {
          console.log('Debug: Sending uncheck event');
          window.dispatchEvent(
            new CustomEvent('Checkclick', {
              detail: {
                id: message.messageId,
                extMessageId: message.messageId,
                subject: message.subject,
                sentDateTime: message.receivedDate,
                chkselected: checked,
                account: this.props.all.login.formValues.user,
                folder: this.props.selectedFolder.fullName,
                provider: 'IMAP',
                raw: null,
              },
            })
          );
          console.log(
            `MessageId: ${message.messageId} - Folder: ${this.props.selectedFolder.fullName}`
          );
        }
      }

      if (checked === true) {
        Promise.all(prs).then((msgs) => {
          console.log('Debug: raw messages promised finished');
          for (let i = 0; i < msgs.length; i++) {
            console.log('Debug: sending checkclick event message'+i);
            const msg = msgs[i];

            // update redux message with raw data
            // this.props.messageSelected(
            //   [{ ...message, raw: msg.raw }],
            //   true,
            //   this.props.selectedFolder.fullName,
            //   this.props.selectedFolder.folderId
            // );

            window.dispatchEvent(
              new CustomEvent('Checkclick', {
                detail: {
                  id: msg.message.messageId,
                  extMessageId: msg.message.messageId,
                  subject: msg.message.subject,
                  sentDateTime: msg.message.receivedDate,
                  chkselected: checked,
                  account: this.props.all.login.formValues.user,
                  folder: this.props.selectedFolder.fullName,
                  provider: 'IMAP',
                  raw: msg.raw,
                },
              })
            );
            msg.raw = null;
            console.log(
              `MessageId: ${message.messageId} - Folder: ${this.props.selectedFolder.fullName}`
            );
          }
          console.log('Debug: sending event loaded message');
          console.log('LoadedMessage: 4');
          window.dispatchEvent(new CustomEvent('LoadedMessage'));
        });
      }
    } else {
      // Single selection
      console.log('Debug: Single event');
      this.props.messageSelected(
        [message],
        checked,
        this.props.selectedFolder.fullName,
        this.props.selectedFolder.folderId,
        message.uid
      );

      if (checked === true) {
        console.log('Debug: message selected. Sending loadingMessage event')
        console.log('LoadingMessage: 5');
        window.dispatchEvent(new CustomEvent('LoadingMessage', {detail: message.messageId}));
        const rm = readMessageRaw(
          null,
          this.props.credentials,
          null,
          this.props.selectedFolder,
          message
        ).then((response) => {
          // update redux message with raw data
/*          this.props.messageSelected(
            [{ ...message, raw: response.raw }],
            checked,
            this.props.selectedFolder.fullName
          );*/
          console.log('Debug: Sending Message content to connector');
          // Send message to connectors
          window.dispatchEvent(
            new CustomEvent('Checkclick', {
              detail: {
                id: message.messageId,
                extMessageId: message.messageId,
                subject: message.subject,
                sentDateTime: message.receivedDate,
                chkselected: checked,
                account: this.props.all.login.formValues.user,
                folder: this.props.selectedFolder.fullName,
                provider: 'IMAP',
                raw: response.raw,
              },
            })
          );
          response = null;
          console.log(
            `MessageId: ${message.messageId} - Folder: ${this.props.selectedFolder.fullName}`
          );
          console.log('Debug: sending event loaded message');
          console.log('LoadedMessage: 3');
          window.dispatchEvent(new CustomEvent('LoadedMessage'));
        });
      } else {
        console.log('Debug: unselected message Sending uncheck to connector');
        console.log(
          'IdMessage seleccionado: ' +
            message.messageId +
            '  Folder: ' +
            this.props.selectedFolder.fullName
        );
        window.dispatchEvent(
          new CustomEvent('Checkclick', {
            detail: {
              id: message.messageId,
              extMessageId: message.messageId,
              subject: message.subject,
              sentDateTime: message.receivedDate,
              chkselected: checked,
              account: this.props.all.login.formValues.user,
              folder: this.props.selectedFolder.fullName,
              provider: 'IMAP',
              raw: null,
            },
          })
        );
        //window.dispatchEvent(new CustomEvent('LoadedMessage'));
        console.log(
          `MessageId: ${message.messageId} - Folder: ${this.props.selectedFolder.fullName}`
        );
      }
    }
  }

  messageClicked(message) {
    if (
        this.props.selectedFolder.attributes.find(att => att && att.toUpperCase() === "\\DRAFTS")
        || this.props.selectedFolder.name.toUpperCase() === 'DRAFTS' 
        || this.props.selectedFolder.name.toUpperCase() === 'BORRADORES') {
      this.props.messageClickedDraft(message);
      this.props.newMessage('');      
    } else {
      this.props.messageClicked(message);
    }  
    window.dispatchEvent(new CustomEvent("ResetList"));
  } 
  /**
   * Preloads latest received messages whenever <b>new</b> messages are loaded in the list
   */
  preloadMessages(previousProps, preloaded) {
    // console.log(`Previous: ${previousProps.messages.length}   Current: ${this.props.messages.length}`)
    // const messagesToPreload = 15;
    // // const previousIds = previousProps.messages
    // //   .slice(0, messagesToPreload)
    // //   .map((m) => m.messageId);
    // const previousIds = [];
    // const currentIds = this.props.messages
    //     //.slice(0, messagesToPreload)
    //   .map((m) => m.messageId);
    //
    // if (currentIds.some((id) => !previousIds.includes(id))) {
    //   const latestMessagesUids = this.props.messages
    //     //.slice(0, messagesToPreload)
    //     .filter(
    //       (m) =>
    //         !Object.keys(this.props.downloadedMessages).includes(m.messageId)
    //     )
    //     .map((m) => m.uid);
    //
    //     const itv = setInterval( ()=> {
    //       console.log("Preloading messages...")
    //       const aux = [];
    //       for(let i = 0; i < messagesToPreload; i++) {
    //         if(latestMessagesUids.length > 0) {
    //           aux.push(latestMessagesUids.shift());
    //         } else {
    //           break;
    //         }
    //       }
    //       if ('null' != this.props.selectedFolder) {
    //         this.props.preloadMessages(
    //             this.props.selectedFolder,
    //             aux
    //         );
    //
    //         if(latestMessagesUids.length === 0) {
    //           clearInterval(itv);
    //         }
    //       } else {
    //           clearInterval(itv);
    //       }
    //     }, 10000);
      // for(let i = 0; i < latestMessagesUids.length; i+=15) {
      //   if ('null' != this.props.selectedFolder) {
      //     this.props.preloadMessages(
      //         this.props.selectedFolder,
      //         latestMessagesUids.slice(i, i+15)
      //     );
      //   }
      //
      // }
    //}
  }
}

MessageList.propTypes = {
  className: PropTypes.string,
  selectedMessages: PropTypes.array,
};

MessageList.defaultProps = {
  className: '',
  selectedMessages: [],
};

const mapStateToProps = (state) => ({
  credentials: getCredentials(state),
  selectedFolder: getSelectedFolder(state) || {},
  activeRequests: state.messages.activeRequests,
  messages: getSelectedFolderMessageList(state),
  selectedMessage: state.application.selectedMessage,
  selectedMessages: state.messages.selected,
  downloadedMessages: state.application.downloadedMessages,
  sign: state.lexon.sign,
  all: state,
});

const mapDispatchToProps = (dispatch) => ({
  messageClicked: (credentials, downloadedMessages, folder, message) => {
    dispatch(selectMessage(message));
    readMessage(dispatch, credentials, downloadedMessages, folder, message);
  },
  messageClickedDraft: (credentials, downloadedMessages, folder, message) => {
    dispatch(selectMessage(message));
    readMessage(dispatch, credentials, downloadedMessages, folder, message, 'base64');
  },
  newMessage: (sign) => editNewMessage(dispatch, [], sign),
  draftMessage: (selectedMessage, sign) =>
    draftMessage(dispatch, selectedMessage, sign),
  messageSelected: (messages, selected, folderName, folderId, index) =>
    dispatch(setSelected(messages, selected, folderName, folderId, index)),
  preloadMessages: (credentials, folder, messageUids) =>
    preloadMessages(dispatch, credentials, folder, messageUids),
  toggleMessageFlagged: (credentials, folder, message) =>
    setMessageFlagged(dispatch, credentials, folder, message, !message.flagged),
});

const mergeProps = (stateProps, dispatchProps, ownProps) =>
  Object.assign({}, stateProps, dispatchProps, ownProps, {
    messageClicked: (message) =>
      dispatchProps.messageClicked(
        stateProps.credentials,
        stateProps.downloadedMessages,
        stateProps.selectedFolder,
        message,
        stateProps.sign,
        stateProps.selectedMessage
      ),
      messageClickedDraft: (message) =>
      dispatchProps.messageClickedDraft(
        stateProps.credentials,
        stateProps.downloadedMessages,
        stateProps.selectedFolder,
        message,
        stateProps.sign,
        stateProps.selectedMessage
      ),
    preloadMessages: (folder, messageUids) =>
      dispatchProps.preloadMessages(
        stateProps.credentials,
        folder,
        messageUids
      ),
    toggleMessageFlagged: (message) =>
      dispatchProps.toggleMessageFlagged(
        stateProps.credentials,
        stateProps.selectedFolder,
        message
      ),
    draftMessage: (message) =>
      dispatchProps.draftMessage(message, stateProps.sign),
  });

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(translate()(MessageList));
