import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Spinner from '../spinner/spinner';
import HeaderTo from './header-to';
import AttachmentCard from '../attachment/attachment-card';
import { selectFolder } from '../../actions/application';
import {
  clearSelectedMessage,
  getCredentials,
} from '../../services/application';
import { readMessageRaw } from '../../services/message-read';
import { getSelectedFolder } from '../../selectors/folders';
import sanitize from '../../services/sanitize';
import mainCss from '../../styles/main.scss';
import styles from './message-viewer.scss';
import ACTIONS from '../../actions/lexon';
import { setSelected } from '../../actions/messages';

export function addressGroups(address) {
  const ret = {
    name: '',
    email: '',
  };
  const formattedFrom = address.match(/^"(.*)"/);
  ret.name = formattedFrom !== null ? formattedFrom[1] : address;
  ret.email =
    formattedFrom !== null
      ? address.substring(formattedFrom[0].length).trim().replace(/[<>]/g, '')
      : '';
  return ret;
}

export class MessageViewer extends Component {
  constructor() {
    super();
    this.handleGetUserFromConnector = this.handleGetUserFromConnector.bind(this);
  }

  handleGetUserFromConnector() {
    this.clearSelectedList();
  }

  render() {
    const folder = this.props.currentFolder;
    const message = this.props.selectedMessage;
    const firstFrom = addressGroups(
      message.from && message.from.length > 0 ? message.from[0] : ''
    );
    const attachments = message.attachments
      ? message.attachments.filter((a) => !a.contentId)
      : [];
    return (
      <div className={`${this.props.className} ${styles.messageViewer}`}>
        <div className={styles.header}>
          <h1 className={styles.subject}>
            {this.props.selectedMessage.subject}
            <div
              className={`${styles.folder} ${mainCss['mdc-chip']}`}
              onClick={() => this.onFolderClick(folder)}>
              <div className={mainCss['mdc-chip__text']}>{folder.name}</div>
            </div>
          </h1>
          <div className={styles.fromDate}>
            <div className={styles.from}>
              <span className={styles.fromName}>{firstFrom.name}</span>
              <span className={styles.email}>{firstFrom.email}</span>
            </div>
            <div className={styles.date}>
              {new Date(message.receivedDate).toLocaleString(
                navigator.language,
                {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                }
              )}
            </div>
          </div>
          <HeaderTo className={styles.to} recipients={message.recipients} />
        </div>
        <div className={styles.body}>
          <Spinner
            visible={
              this.props.refreshMessageActiveRequests > 0 && !message.content
            }
          />
          <div className={styles.attachments}>
            {attachments.map((a, index) => (
              <AttachmentCard key={index} attachment={a} />
            ))}
          </div>
          <div
            dangerouslySetInnerHTML={{
              __html: sanitize.sanitize(message.content),
            }}></div>
        </div>
      </div>
    );
  }

  clearSelectedList() {
    this.oldSelectedList = Object.assign([], this.props.selectedMessages);
    this.props.setSelected(
      this.props.selectedMessages.map((item) => ({
        ...item,
        messageId: item.id,
      })),
      false,
      this.props.currentFolder.fullName
    );
    window.dispatchEvent(
      new CustomEvent('CheckAllclick', {
        detail: {
          listMessages: this.oldSelectedList,
          chkselected: false,
        },
      })
    );

    this.props.setSelected(
      [this.props.selectedMessage],
      true,
      this.props.currentFolder.fullName
    );

    console.log('LoadingMessage: 2');
    window.dispatchEvent(new CustomEvent('LoadingMessage'));
    readMessageRaw(
      null,
      this.props.credentials,
      null,
      this.props.currentFolder,
      this.props.selectedMessage
    ).then((response) => {
      debugger
      window.dispatchEvent(
        new CustomEvent('Checkclick', {
          detail: {
            id: this.props.selectedMessage.messageId,
            extMessageId: this.props.selectedMessage.messageId,
            subject: this.props.selectedMessage.subject,
            sentDateTime: this.props.selectedMessage.receivedDate,
            chkselected: true,
            folder: this.props.currentFolder.fullName,
            account: this.props.login.formValues.user,
            provider: 'IMAP',
            raw: response.raw,
          },
        })
      );
      window.dispatchEvent(new CustomEvent('LoadedMessage'));
    });
  }

  restoreSelectedList() {
    this.props.setSelected(
      [this.props.selectedMessage],
      false,
      this.props.currentFolder.fullName
    );
    const ms = this.oldSelectedList.map((item) => ({
      ...item,
      messageId: item.id,
    }));
    //setTimeout(()=>{
    this.props.setSelected(ms, true, this.props.currentFolder.fullName);
    //}, 1000);

    window.dispatchEvent(
      new CustomEvent('Checkclick', {
        detail: {
          id: this.props.selectedMessage.messageId,
          extMessageId: this.props.selectedMessage.messageId,
          subject: this.props.selectedMessage.subject,
          sentDateTime: this.props.selectedMessage.receivedDate,
          chkselected: false,
          folder: this.props.currentFolder.fullName,
          account: this.props.login.formValues.user,
          provider: 'IMAP',
          raw: null,
        },
      })
    );

    debugger
    for (let i = 0; i < this.oldSelectedList.length; i++) {
      window.dispatchEvent(
        new CustomEvent('Checkclick', {
          detail: {
            id: this.oldSelectedList[i].id,
            extMessageId: this.oldSelectedList[i].id,
            subject: this.oldSelectedList[i].subject,
            sentDateTime: this.oldSelectedList[i].sentDateTime,
            chkselected: true,
            folder: this.oldSelectedList[i].folder,
            account: this.props.login.formValues.user,
            provider: 'IMAP',
            raw: this.oldSelectedList[i].raw,
          },
        })
      );
    }
  }
  //clearSelectedMessage(dispatch)

  componentDidMount() {
    this.clearSelectedList();
    window.addEventListener('GetUserFromLexonConnector', this.handleGetUserFromConnector);
    window.addEventListener('GetUserFromCentinelaConnector', this.handleGetUserFromConnector);
  }

  componentWillUnmount() {
    this.restoreSelectedList();
    const { lexon } = this.props;

    clearTimeout(this.refreshPollTimeout);

    window.removeEventListener(
      'GetUserFromLexonConnector',
      this.handleGetUserFromLexonConnector
    );
    window.removeEventListener('GetUserFromCentinelaConnector', this.handleGetUserFromConnector);

    if (lexon.idCaseFile !== null && lexon.idCaseFile !== undefined) {
      window.dispatchEvent(new CustomEvent('RemoveCaseFile'));
      this.props.setCaseFile({
        casefile: null,
        bbdd: null,
        company: null,
      });
    }

    if (
      lexon.idEmail &&
      lexon.idEmail !== null &&
      lexon.idEmail !== undefined
    ) {
      this.props.resetIdEmail(); // Se borra la información del email para que no vuelva a entrar si se refresca la ventana.
    }
  }

  onFolderClick(folder) {
    this.props.showFolder(folder);
  }
}

MessageViewer.propTypes = {
  refreshMessageActiveRequests: PropTypes.number,
  selectedMessage: PropTypes.object,
  className: PropTypes.string,
};

MessageViewer.defaultProps = {
  className: '',
};

const mapStateToProps = (state) => {
  return {
    refreshMessageActiveRequests:
      state.application.refreshMessageActiveRequests,
    currentFolder: getSelectedFolder(state) || {},
    selectedMessage: state.application.selectedMessage,
    selectedMessages: state.messages.selectedMessages,
    lexon: state.lexon,
    login: state.login,
    credentials: state.application.user.credentials,
  };
};

const mapDispatchToProps = (dispatch) => ({
  showFolder: (folder) => {
    clearSelectedMessage(dispatch);
    dispatch(selectFolder(folder));
  },
  setCaseFile: (casefile) => dispatch(ACTIONS.setCaseFile(casefile)),
  resetIdEmail: () => dispatch(ACTIONS.resetIdEmail()),
  setSelected: (messages, selected, shiftKey) =>
    dispatch(setSelected(messages, selected, shiftKey)),
});

export default connect(mapStateToProps, mapDispatchToProps)(MessageViewer);
