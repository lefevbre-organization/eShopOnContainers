import React, { Component } from 'react';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import PropTypes from 'prop-types';
import EDITOR_BUTTONS from './editor-buttons';
import Button from '../buttons/button';
import HeaderAddress from './header-address';
import MceButton from './mce-button';
import InsertLinkDialog from './insert-link-dialog';
import { getCredentials } from '../../selectors/application';
import { editMessage } from '../../actions/application';
import { sendMessage } from '../../services/smtp';
import { prettySize } from '../../services/prettify';
import { getAddresses } from '../../services/message-addresses';
import { persistApplicationNewMessageContent } from '../../services/indexed-db';
import styles from './message-editor.scss';
import mainCss from '../../styles/main.scss';
import i18n from 'i18next';
import ACTIONS from '../../actions/lexon';
import { Notification } from '../notification/';

import ComposeMessageEditor from './composeMessageEditor.jsx';
const MAX_TOTAL_ATTACHMENTS_SIZE = 20971520;

class MessageEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      linkDialogVisible: false,
      linkDialogUrl: '',
      dropZoneActive: false,
      // Stores state of current selection in the dialog (is title, underlined... H1, H2, ..., italic, underline)
      // Used in editor buttons to activate/deactivate them
      editorState: {},
      messageNotification: '',
      errorNotification: '',
      showNotification: false
    };

    this.fileInput = null;
    this.editorRef = null;
    this.headerFormRef = React.createRef();
    this.handleSetState = patchedState => this.setState(patchedState);
    this.handleSubmit = this.submit.bind(this);
    // Global events
    this.handleOnDrop = this.onDrop.bind(this);
    this.handleOnDragOver = this.onDragOver.bind(this);
    this.handleOnDragLeave = this.onDragLeave.bind(this);
    // Header Address Events
    this.handleAddAddress = this.addAddress.bind(this);
    this.handleRemoveAddress = this.removeAddress.bind(this);
    this.handleMoveAddress = this.moveAddress.bind(this);
    // Subject events
    this.handleOnSubjectChange = this.onSubjectChange.bind(this);
    // Editor events
    this.handleEditorChange = this.editorChange.bind(this);
    this.onAttachButton = this.onAttachButton.bind(this);
    this.onAttachSelected = this.onAttachSelected.bind(this);
    this.attachFromLexon = this.attachFromLexon.bind(this);
  }

  componentDidMount() {
    if (this.fileInput) {
      this.fileInput.onchange = this.onAttachSelected;
    }

    window.dispatchEvent(new CustomEvent('OpenComposer'));
    window.addEventListener('AttachDocument', this.attachFromLexon);
  }

  componentWillUnmount() {
    window.dispatchEvent(new CustomEvent('CloseComposer'));
    window.removeEventListener('AttachDocument', this.attachFromLexon);
  }

  attachFromLexon(event) {
    const { detail } = event;
    console.log('attachFromLexon');
    console.log(event.detail);
    const length = detail.content.length;

    const addAttachment = detail => {
      const newAttachment = {
        fileName: detail.document.code,
        size: length,
        // contentType: file.type,
        content: detail.content
      };
      const updatedMessage = { ...this.props.editedMessage };
      updatedMessage.attachments = updatedMessage.attachments
        ? [...updatedMessage.attachments, newAttachment]
        : [newAttachment];
      this.props.editMessage(updatedMessage);
    };
    addAttachment(event.detail);
  }

  removeMessageEditor(aplication) {
    const { close, lexon } = this.props;

    if (lexon.idCaseFile !== null && lexon.idCaseFile !== undefined) {
      window.dispatchEvent(new CustomEvent('RemoveCaseFile'));
      this.props.setCaseFile({
        casefile: null,
        bbdd: null,
        company: null
      });
    }

    if (lexon.mailContacts) {
      this.props.setMailContacts(null);
    }

    close(aplication);
  }

  render() {
    const {
      t,
      className,
      application,
      to,
      cc,
      bcc,
      attachments,
      subject,
      content
    } = this.props;
    const {
      showNotification,
      messageNotification,
      errorNotification
    } = this.state;

    return (
      <div
        className={`${className} ${styles['message-editor']}`}
        onDrop={this.handleOnDrop}
        onDragOver={this.handleOnDragOver}
        onDragLeave={this.handleOnDragLeave}>
        {this.state.dropZoneActive ? (
          <div className={styles.dropZone}>
            <div className={styles.dropZoneMessage}>
              <i className={'material-icons'}>attach_file</i>
              {t('messageEditor.dropZoneMessage')}
            </div>
          </div>
        ) : null}
        <div className={styles.header}>
          <Notification
            initialModalState={showNotification}
            toggleNotification={() => {
              this.closeNotification();
            }}
            message={messageNotification}
            error={errorNotification}
          />
          <form ref={this.headerFormRef}>
            <HeaderAddress
              id={'to'}
              addresses={to}
              onAddressAdd={this.handleAddAddress}
              onAddressRemove={this.handleRemoveAddress}
              onAddressMove={this.handleMoveAddress}
              className={styles.address}
              chipClassName={styles.chip}
              autoSuggestClassName={styles.autoSuggest}
              autoSuggestMenuClassName={styles.autoSuggestMenu}
              getAddresses={this.props.getAddresses}
              label={i18n.t('messageEditor.to')}
            />
            <HeaderAddress
              id={'cc'}
              addresses={cc}
              onAddressAdd={this.handleAddAddress}
              onAddressRemove={this.handleRemoveAddress}
              onAddressMove={this.handleMoveAddress}
              className={styles.address}
              chipClassName={styles.chip}
              autoSuggestClassName={styles.autoSuggest}
              autoSuggestMenuClassName={styles.autoSuggestMenu}
              getAddresses={this.props.getAddresses}
              label={t('messageEditor.cc')}
            />
            <HeaderAddress
              id={'bcc'}
              addresses={bcc}
              onAddressAdd={this.handleAddAddress}
              onAddressRemove={this.handleRemoveAddress}
              onAddressMove={this.handleMoveAddress}
              className={styles.address}
              chipClassName={styles.chip}
              autoSuggestClassName={styles.autoSuggest}
              autoSuggestMenuClassName={styles.autoSuggestMenu}
              getAddresses={this.props.getAddresses}
              label={t('messageEditor.bcc')}
            />
            <div className={styles.subject}>
              <input
                type={'text'}
                placeholder={t('messageEditor.subject')}
                value={subject}
                onChange={this.handleOnSubjectChange}
              />
            </div>
          </form>
        </div>
        <div
          className={styles['editor-wrapper']}
          onClick={() => this.editorWrapperClick()}>
          <div className={styles['editor-container']}>
            <ComposeMessageEditor
              ref={ref => (this.editorRef = ref)}
              onChange={this.handleEditorChange}
              defaultValue={content}
            />

            <div className={styles.attachments}>
              {attachments.map((a, index) => (
                <div key={index} className={styles.attachment}>
                  <span className={styles.fileName}>{a.fileName}</span>
                  <span className={styles.size}>({prettySize(a.size, 0)})</span>
                  <Button
                    className={styles.delete}
                    icon={'delete'}
                    onClick={() => this.removeAttachment(a)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className={styles['action-buttons']}>
          <button
            className={`${mainCss['mdc-button']} ${mainCss['mdc-button--unelevated']}
            ${styles['action-button']} ${styles.send}`}
            disabled={to.length + cc.length + bcc.length === 0}
            onClick={this.handleSubmit}>
            {t('messageEditor.send')}
          </button>
          <button
            className={`${styles['action-button']} ${styles.attach}`}
            onClick={this.onAttachButton}>
            <div
              className={`material-icons ${mainCss['mdc-list-item__graphic']} ${styles.icon}`}>
              attach_file
            </div>
            <div>
              <span>{i18n.t('messageEditor.attach')}</span>
            </div>
            <input
              ref={r => (this.fileInput = r)}
              id='file-input'
              type='file'
              name='name'
              style={{ display: 'none' }}
              multiple='true'
            />
          </button>
          <button
            className={`material-icons ${mainCss['mdc-icon-button']} ${styles['action-button']} ${styles.cancel}`}
            onClick={() => this.removeMessageEditor(application)}>
            delete
          </button>
        </div>
        <InsertLinkDialog
          visible={this.state.linkDialogVisible}
          closeDialog={() =>
            this.setState({
              linkDialogVisible: false,
              linkDialogInitialUrl: ''
            })
          }
          onChange={e => this.setState({ linkDialogUrl: e.target.value })}
          url={this.state.linkDialogUrl}
          insertLink={this.handleEditorInsertLink}
        />
      </div>
    );
  }

  renderEditorButtons() {
    return (
      <div className={`${mainCss['mdc-card']} ${styles['button-container']}`}>
        {Object.entries(EDITOR_BUTTONS).map(([k, b]) => (
          <MceButton
            key={k}
            className={styles.button}
            activeClassName={styles.active}
            iconClassName={styles.buttonIcon}
            active={
              this.state.editorState && this.state.editorState[k] === true
            }
            label={b.label}
            icon={b.icon}
            onToggle={() =>
              b.toggleFunction(this.getEditor(), b, this.handleSetState)
            }
          />
        ))}
      </div>
    );
  }

  submit() {
    if (this.headerFormRef.current.reportValidity()) {
      // Get content directly from editor, state content may not contain latest changes
      const content = this.getEditor().getContent();
      const { credentials, to, cc, bcc, subject } = this.props;
      this.props.sendMessage(credentials, {
        ...this.props.editedMessage,
        to,
        cc,
        bcc,
        subject,
        content
      });
      this.props.close(this.props.application);
    }
  }
  /**
   * Adds an address to the list matching the id.
   *
   * @param id
   * @param address
   */
  addAddress(id, address) {
    if (address.length > 0) {
      const updatedMessage = { ...this.props.editedMessage };
      updatedMessage[id] = [...updatedMessage[id], address];
      this.props.editMessage(updatedMessage);
    }
  }

  /**
   * Removes the address from the under the field matching the id.
   *
   * @param id
   * @param address
   */
  removeAddress(id, address) {
    const updatedMessage = { ...this.props.editedMessage };
    updatedMessage[id] = [...updatedMessage[id]];
    updatedMessage[id].splice(updatedMessage[id].indexOf(address), 1);
    this.props.editMessage(updatedMessage);
  }

  /**
   * Moves an address from the address list under the field matching the fromId to the address field
   * matching the toId.
   *
   * @param fromId
   * @param toId
   * @param address
   */
  moveAddress(fromId, toId, address) {
    const updatedMessage = { ...this.props.editedMessage };
    // Remove
    updatedMessage[fromId].splice(updatedMessage[fromId].indexOf(address), 1);
    // Add
    updatedMessage[toId] = [...updatedMessage[toId], address];
    this.props.editMessage(updatedMessage);
  }

  onSubjectChange(event) {
    const target = event.target;
    const updatedMessage = { ...this.props.editedMessage };
    this.props.editMessage({ ...updatedMessage, subject: target.value });
  }

  showNotification(message, error = false) {
    this.setState({
      messageNotification: message,
      errorNotification: error,
      showNotification: true
    });
  }

  closeNotification() {
    const showNotification = !this.state.showNotification;
    this.setState({ showNotification: showNotification });
  }

  onDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    this.setState({ dropZoneActive: false });
    const addAttachment = (file, dataUrl) => {
      const newAttachment = {
        fileName: file.name,
        size: file.size,
        contentType: file.type,
        content: dataUrl.currentTarget.result.replace(/^data:[^;]*;base64,/, '')
      };
      const updatedMessage = { ...this.props.editedMessage };
      updatedMessage.attachments = updatedMessage.attachments
        ? [...updatedMessage.attachments, newAttachment]
        : [newAttachment];
      this.props.editMessage(updatedMessage);
    };

    // Check file sizes
    const maxFiles = Array.from(event.dataTransfer.files).filter(
      f => f.size > MAX_TOTAL_ATTACHMENTS_SIZE
    );
    if (maxFiles.length > 0) {
      this.showNotification(i18n.t('messageEditor.max-file-size'), false);
      return;
    }

    Array.from(event.dataTransfer.files).forEach(file => {
      const fileReader = new FileReader();
      fileReader.onload = addAttachment.bind(this, file);
      fileReader.readAsDataURL(file);
    });
    return true;
  }

  onDragOver(event) {
    event.preventDefault();
    if (
      event.dataTransfer.types &&
      Array.from(event.dataTransfer.types).includes('Files')
    ) {
      this.setState({ dropZoneActive: true });
    }
  }

  onDragLeave(event) {
    event.preventDefault();
    this.setState({ dropZoneActive: false });
  }

  removeAttachment(attachment) {
    const updatedMessage = { ...this.props.editedMessage };
    if (updatedMessage.attachments && updatedMessage.attachments.length) {
      updatedMessage.attachments = updatedMessage.attachments.filter(
        a => a !== attachment
      );
      this.props.editMessage(updatedMessage);
    }
  }

  onAttachButton() {
    return this.fileInput && this.fileInput.click();
  }

  onAttachSelected(event) {
    event.preventDefault();
    event.stopPropagation();
    this.setState({ dropZoneActive: false });
    const addAttachment = (file, dataUrl) => {
      const newAttachment = {
        fileName: file.name,
        size: file.size,
        contentType: file.type,
        content: dataUrl.currentTarget.result.replace(/^data:[^;]*;base64,/, '')
      };
      const updatedMessage = { ...this.props.editedMessage };
      updatedMessage.attachments = updatedMessage.attachments
        ? [...updatedMessage.attachments, newAttachment]
        : [newAttachment];
      this.props.editMessage(updatedMessage);
    };

    // Check file sizes
    const maxFiles = Array.from(event.target.files).filter(
      f => f.size > MAX_TOTAL_ATTACHMENTS_SIZE
    );
    if (maxFiles.length > 0) {
      this.showNotification(i18n.t('messageEditor.max-file-size'), false);
      return;
    }

    Array.from(event.target.files).forEach(file => {
      const fileReader = new FileReader();
      fileReader.onload = addAttachment.bind(this, file);
      fileReader.readAsDataURL(file);
    });
    return true;
  }

  getEditor() {
    if (this.editorRef && this.editorRef.refEditor) {
      return this.editorRef.refEditor;
    }
    return null;
  }

  editorWrapperClick() {
    this.getEditor().focusIn();
  }

  /**
   * Every change in the editor will trigger this method.
   *
   * For performance reasons, we'll only persist the editor content every EDITOR_PERSISTED_AFTER_CHARACTERS_ADDED
   *
   * @param content
   */
  editorChange(content) {
    this.props.editMessage({ ...this.props.editedMessage, content });
    persistApplicationNewMessageContent(this.props.application, content);
  }
}

MessageEditor.propTypes = {
  className: PropTypes.string,
  t: PropTypes.func.isRequired
};

MessageEditor.defaultProps = {
  className: ''
};

const mapStateToProps = state => ({
  application: state.application,
  credentials: getCredentials(state),
  editedMessage: state.application.newMessage,
  to: state.application.newMessage.to,
  cc: state.application.newMessage.cc,
  bcc: state.application.newMessage.bcc,
  attachments: state.application.newMessage.attachments,
  subject: state.application.newMessage.subject,
  editor: state.application.newMessage.editor,
  content: state.application.newMessage.content,
  getAddresses: value => getAddresses(value, state.messages.cache),
  lexon: state.lexon
});

const mapDispatchToProps = dispatch => ({
  close: application => {
    dispatch(editMessage(null));
    // Clear content (editorBlur may be half way through -> force a message in the service worker to clear content after)
    // noinspection JSIgnoredPromiseFromCall
    persistApplicationNewMessageContent(application, '');
  },
  editMessage: message => {
    dispatch(editMessage(message));
  },
  sendMessage: (
    credentials,
    { inReplyTo, references, to, cc, bcc, attachments, subject, content }
  ) =>
    sendMessage(dispatch, credentials, {
      inReplyTo,
      references,
      to,
      cc,
      bcc,
      attachments,
      subject,
      content
    }),
  setCaseFile: casefile => dispatch(ACTIONS.setCaseFile(casefile)),
  setMailContacts: mailContacts =>
    dispatch(ACTIONS.setMailContacts(mailContacts))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(translate()(MessageEditor));
