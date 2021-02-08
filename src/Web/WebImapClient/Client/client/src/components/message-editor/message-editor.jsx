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
import { editMessage, draftClean, selectMessage, selectFolder } from '../../actions/application';
import {clearSelected} from '../../actions/messages';
import {clearSelectedMessage} from '../../services/application';
import { getFolders } from '../../services/folder';

import { sendMessage, saveDraft } from '../../services/smtp';
import { prettySize } from '../../services/prettify';
import { getAddresses } from '../../services/message-addresses';
import { deleteMessages, resetFolderMessagesCache } from '../../services/message';
import { persistApplicationNewMessageContent } from '../../services/indexed-db';
import styles from './message-editor.scss';
import mainCss from '../../styles/main.scss';
import i18n from 'i18next';
import ACTIONS, { setEmailShown } from '../../actions/lexon';
import { Notification, Confirmation } from '../notification/';


import ComposeMessageEditor from './composeMessageEditor';
import { Modal } from 'react-bootstrap';
import { json } from 'sjcl';
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
      showNotification: false,
      messageConfirmation: '',
      showConfirmation: false,
      draftTime: '',
      isDraftEdit: false,
      draftId: '',
      closeButton: true
    };

    this.fileInput = null;
    this.editorRef = null;
    this.headerFormRef = React.createRef();
    this.handleSetState = (patchedState) => this.setState(patchedState);
    this.handleSubmit = this.submit.bind(this);
    this.handleDraft = this.saveDraft.bind(this);
    this.handleRemoveDraft = this.removeDraft.bind(this);
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
    this.handleGetUserFromLexonConnector = this.handleGetUserFromLexonConnector.bind(
      this
    );
  }

  componentDidMount() {
    console.log('ComponentDidMount init');
    if (this.fileInput) {
      this.fileInput.onchange = this.onAttachSelected;
    }
   
    window.dispatchEvent(new CustomEvent('OpenComposer'));
    window.addEventListener('AttachDocument', this.attachFromLexon);
    window.addEventListener(
      'GetUserFromCentinelaConnector',
      this.handleGetUserFromLexonConnector
    );
    if (this.props.application.selectedMessage && Object.keys(this.props.application.selectedMessage).length > 0 && this.props.application.selectedFolderId === this.props.draftFolderbyName.folderId)
      this.getMessageById(this.props.application.selectedMessage)
    console.log('ComponentDidMount end');
  }

  async componentDidUpdate(prevProps, prevState) {
    // console.log('*******************************************************************************************************');
    // console.log('prevProps.draft:');
    // console.log(prevProps.draft);
    // console.log('this.props.draft');
    // console.log(this.props.draft);
    // console.log('*******************************************************************************************************');
    // console.log('*******************************************************************************************************');
    // console.log('prevProps.selectedMessageEdit:');
    // console.log(prevProps.selectedMessageEdit.content);
    // console.log('this.props.seledtedMessageEdit');
    // console.log(this.props.selectedMessageEdit.content);
    // console.log('this.props.application.selectedMessage');
    // console.log(this.props.application.selectedMessage.content);
    // console.log('prevProps.application.selectedMessage');
    // console.log(prevProps.application.selectedMessage.content);
    // console.log('*******************************************************************************************************');

    if (this.props.application.outbox !== prevProps.application.outbox){
      //A message has been sent
      const {draftFolderbyName, draftFolderbyAttribute } = this.props;
      const draftFolder = (draftFolderbyAttribute) ? draftFolderbyAttribute : draftFolderbyName;
      
      if (this.props.application.outbox && this.props.application.outbox.sent === true){
        if (this.props.draft !== null || this.props.application.selectedFolderId === draftFolder.folderId) {
          //Sent message was a draft. Manually deleting message from draft folder.
          console.log('Borrando el mensaje...');
          this.props.deleteMessage(this.props.credentials, draftFolder, this.props.selectedMessageEdit);
          this.props.editMessage(null);
          this.props.messageClean();
          this.props.draftClean();
          this.props.close(this.props.application);
        } else {
          this.props.editMessage(null);
          this.props.messageClean();
          this.props.draftClean();
          this.props.close(this.props.application);
        }
      }
    }


    if (prevProps.draft !== this.props.draft){
      if (this.props.draft && this.props.draft.sent === true){
        // Draft has been sent
        console.log('DraftSent')
        const {draftFolderbyAttribute, draftFolderbyName} = this.props;
        const draftFolder = (draftFolderbyAttribute) ? draftFolderbyAttribute : draftFolderbyName;

        if(this.state.draftId !== ''){
          this.props.deleteMessage(this.props.credentials, draftFolder, this.props.selectedMessageEdit);
        }
        
        const folderPromise = this.props.reloadFolders(this.props.credentials);
        const messagePromise = this.props.reloadMessageCache(this.props.application.user, draftFolder);
        await Promise.all([folderPromise, messagePromise]);
        
        const {draft} = this.props;
        const {msgCache} = this.props;
        const createdMessage = Array.from(msgCache[draftFolder.folderId], ([key, value]) => ({key, value})).find(f => f.value.messageId === draft.idMessage);
        this.setState({ showNotification: false, messageNotification: ''});
        this.props.selectMessage(createdMessage.value);
        this.updateAttachmentLinks(createdMessage.key);
        

        if(this.state.draftId !== ''){
          this.setState({ showNotification: true, messageNotification: 'Borrador actualizado.', closeButton: true, draftId: this.props.draft.idMessage});
        } else {
          this.setState({ showNotification: true, messageNotification: 'Borrador guardado.', closeButton: true, draftId: this.props.draft.idMessage});
        }
        this.props.draftClean();

      } else if (this.props.draf && this.props.draft.error === true){
        this.setState({ showNotification: true, messageNotification: 'Error al guardar el borrador', closeButton: true});
      }
    }
    
    // We edit the compose with the original content of the message (inline images may take longer to be available)
    if(this.props.selectedMessageEdit && this.props.selectedMessageEdit.content && (this.props.selectedMessageEdit.content !== prevProps.selectedMessageEdit.content)) {
      this.getContentEdit(this.props.selectedMessageEdit.content);
    } else 
    // Loading info in the first run
    if( 
      (this.props.editedMessage.content === "<br/><br/><br/><br/>" 
      || this.props.editedMessage.content === "" 
      || this.props.editedMessage.content === null)
      && this.props.selectedMessageEdit.content !== null) {
        this.getContentEdit(this.props.selectedMessageEdit.content)
    }
    
    // console.log('*******************************************************************************************************');
    // console.log('prevProps.selectedMessage.attachments:');
    // console.log((prevProps.selectedMessageEdit && prevProps.selectedMessageEdit.attachments) ? prevProps.selectedMessageEdit.attachments.length : 'null' );
    // console.log('this.props.selectedMessage.attachments:');
    // console.log((this.props.selectedMessageEdit && this.props.selectedMessageEdit.attachments) ? this.props.selectedMessageEdit.attachments.length : 'null');
    // console.log('*******************************************************************************************************');


    // This is to load attachment links when they're ready
    if (this.props.selectedMessageEdit && this.props.selectedMessageEdit.attachments !== prevProps.selectedMessageEdit.attachments){
      // Si pasa de null a un valor -> lo debo actualizar porque se están recibiendo datos de un draft que se ha abierto
      // Si pasa de datos a null -> lo tengo que dejar como está porque se ha creado un draft nuevo y no se ha podido obtener aún el array de links de adjuntos
      // El mensaje editado no tiene adjuntos y los adjuntos del mensaje seleccionado han cambiado
      if (this.props.editedMessage && (this.props.editedMessage.attachments === null || this.props.editedMessage.attachments === undefined || this.props.editedMessage.attachments.length === 0) ){
        this.getAttachmentsEdit(this.props.selectedMessageEdit.attachments);
      }
    }
  }

  componentWillUnmount() {
    window.dispatchEvent(new CustomEvent('CloseComposer'));
    window.removeEventListener('AttachDocument', this.attachFromLexon);
    window.removeEventListener(
      'GetUserFromCentinelaConnector',
      this.handleGetUserFromLexonConnector
    );
  }

  handleGetUserFromLexonConnector() {
    window.dispatchEvent(new CustomEvent('OpenComposer'));
  }

  getContentEdit(value) {
    console.log('GetContentEdit')
    const updatedMessage = { ...this.props.editedMessage };
    // if(
    //   updatedMessage.content === "<br/><br/><br/><br/>" 
    //   || updatedMessage.content === "" 
    //   || updatedMessage.content === null) {
    //   this.props.editMessage({ ...updatedMessage, content: value });
    // }
    this.props.editMessage({ ...updatedMessage, content: value });
  }

  getAttachmentsEdit(value){
    console.log(this.getAttachmentsEdit);
    var updatedMessage = { ...this.props.editedMessage };
    console.log('Ha entrado en getAttachments');
    console.log(value);
    console.log(updatedMessage);
    //updatedMessage.attachments = value;
    console.log('Actualizado:');
    console.log(updatedMessage);
    //this.props.editMessage(updatedMessage);
    this.props.editMessage({ ...updatedMessage, attachments: value });
  }

  attachFromLexon(event) {
    console.log('attachFromLexon');
    const { detail } = event;
    console.log('attachFromLexon');
    console.log(event.detail);
    const length = detail.content.length;

    const addAttachment = (detail) => {
      const newAttachment = {
        fileName: detail.document.code,
        size: length,
        // contentType: file.type,
        content: detail.content,
      };
      const updatedMessage = { ...this.props.editedMessage };
      updatedMessage.attachments = updatedMessage.attachments
        ? [...updatedMessage.attachments, newAttachment]
        : [newAttachment];
      this.props.editMessage(updatedMessage);
    };
    addAttachment(event.detail);
  }

  confirmRemoveMessageEditor(application){
    const newMessage = application.newMessage;
    const emptyMesage = { to: [], cc: [], bcc: [], attachments: [], subject: "", content: "<br/><br/><br/><br/>"}

    if (JSON.stringify(newMessage) === JSON.stringify(emptyMesage)){
      this.removeMessageEditor(application);
    } else {
      const { draftId } = this.state;
      const draftSent = this.props.application && this.props.application.draft && this.props.application.draft.sent;
      if (draftId !== '' || draftSent){
        this.setState({ showConfirmation: true, messageConfirmation: '¿Quiere eliminar el borrador definitivamente?'});
      } else {
        this.setState({ showConfirmation: true, messageConfirmation: '¿Quiere descartar el mensaje actual?'});
      }
    }
  }

  removeMessageEditor(application) {
    const { close, lexon, draftClean } = this.props;

    if (lexon.idCaseFile !== null && lexon.idCaseFile !== undefined) {
      window.dispatchEvent(new CustomEvent('RemoveCaseFile'));
      this.props.setCaseFile({
        casefile: null,
        bbdd: null,
        company: null,
      });
    }

    if (lexon.mailContacts) {
      this.props.setMailContacts(null);
    }
    draftClean();
    this.props.messageClean();
    close(application);
    
  }

  acceptConfirmation(){
    const { draftId } = this.state;
    if (draftId !== ''){
      this.handleRemoveDraft();
    } 
    this.setState({showConfirmation: false})
    this.removeMessageEditor(this.props.application);
  }

  cancelConfirmation(){
    const { draftId } = this.state;
    this.setState({showConfirmation: false})
    // if (draftId !== ''){
    //   this.removeMessageEditor(this.props)
    // }
  }

  render() {
    const {
      t,
      className,
      application,
      draft,
      to,
      cc,
      bcc,
      attachments,
      subject,
      content,
      selectedMessageEdit
    } = this.props;
    const {
      showNotification,
      messageNotification,
      errorNotification,
      showConfirmation,
      messageConfirmation,
      draftId,
      draftTime,
      closeButton
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
            closeButton={closeButton}
          />
          <Confirmation
            initialModalState={showConfirmation}
            onAccept={() => {this.acceptConfirmation()}}
            onCancel={() => {this.cancelConfirmation()}}
            titleAccept="Aceptar"
            titleCancel="Cancelar"
            message={messageConfirmation}
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
              ref={(ref) => (this.editorRef = ref)}
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
            className={`ml-3 ${mainCss['mdc-button']} ${mainCss['mdc-button--unelevated']}
            ${styles['action-button']} ${styles.send}`}
            disabled={to.length + cc.length + bcc.length === 0}
            onClick={this.handleDraft}>
             {t('messageEditor.draft')}
          </button>
          {/* {(selectedMessageEdit !== null 
          && Object.keys(selectedMessageEdit).length > 0) ? 
          <button className={`${styles['discard-button']} ml-3`} onClick={this.handleRemoveDraft}>
            {t('messageEditor.discard')}
          </button> 
          : null} */}
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
              ref={(r) => (this.fileInput = r)}
              id='file-input'
              type='file'
              name='name'
              style={{ display: 'none' }}
              multiple='true'
            />
          </button>
          {/* <button
            className={`ml-3 ${mainCss['mdc-button']} ${mainCss['mdc-button--unelevated']}
            ${styles['action-button']} ${styles.send}`}
            disabled={to.length + cc.length + bcc.length === 0}
            onClick={this.handleDraft}>
             {t('messageEditor.draft')}
          </button> */}
          { draftTime !== '' ? 
          <span className={`ml-3 ${styles['draft-time']}`}>{t('messageEditor.draft-save')} {
            draftTime}
          </span> 
          : null}
          <button
            className={`material-icons ${mainCss['mdc-icon-button']} ${styles['action-button']} ${styles.cancel}`}
            onClick={() => this.confirmRemoveMessageEditor(application)}>
            delete
          </button>
        </div>
        <InsertLinkDialog
          visible={this.state.linkDialogVisible}
          closeDialog={() =>
            this.setState({
              linkDialogVisible: false,
              linkDialogInitialUrl: '',
            })
          }
          onChange={(e) => this.setState({ linkDialogUrl: e.target.value })}
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

  validateExistingData(recipient, recipients) {
    const existingData = recipients.some(
      x =>  { return( x === recipient.address)  } 
     );
     return existingData;
  }

  getMessageById(selectedMessage) {
    console.log('getMessageById init');
    const toRecipients = selectedMessage.recipients.filter(x => x.type === 'To');

    const ccRecipients = selectedMessage.recipients.filter(x => x.type === 'Cc');

    const bccRecipients = selectedMessage.recipients.filter(x => x.type === 'Bcc');

    const editedMessageTo = (this.props.editedMessage && this.props.editedMessage.to) ? this.props.editedMessage.to : [];
    const editedMessageCc = (this.props.editedMessage && this.props.editedMessage.cc) ? this.props.editedMessage.cc : [];
    const editedMessageBcc = (this.props.editedMessage && this.props.editedMessage.bcc) ? this.props.editedMessage.bcc : [];

    const subject = selectedMessage.subject;

    const content = selectedMessage.content;

    const attachments = selectedMessage.attachments;

    toRecipients.forEach(toRecipient => {
     const existingData = this.validateExistingData(
       toRecipient, editedMessageTo
      );
      console.log('ExistingData:'+ existingData);
      if(!existingData) {
        console.log('Ha entrado');
        setTimeout(() => {
          this.addAddress('to', toRecipient.address);
        }, 100);
      }
    });

    ccRecipients.forEach(ccRecipient => {
       const existingData = this.validateExistingData(
        ccRecipient, editedMessageCc
       );
       console.log('ExistingData:'+ existingData);
       if(!existingData) {
        console.log('Ha entrado');
        setTimeout(() => {
          this.addAddress('cc', ccRecipient.address);
        }, 100);
      }
    });

    bccRecipients.forEach(bccRecipient => {
      const existingData = this.validateExistingData(
        bccRecipient, editedMessageBcc
       );
       console.log('ExistingData:'+ existingData);
       if(!existingData) {
        console.log('Ha entrado');
        setTimeout(() => {
          this.addAddress('bcc', bccRecipient.address);
        }, 100);
      }
    });


    
    this.getSubjectEdit(subject);
    //this.addAttachments(attachments);
    if (this.props.application.selectedFolderId === this.props.draftFolderbyName.folderId || this.props.application.selectedFolderId === this.props.draftFolderbyAttribute.folderId)
      this.setState({draftId: selectedMessage.messageId});
  }

  eliminateRTEtags(html) {
    var div = document.createElement('div');
    div.innerHTML = html;
    var elements = div.getElementsByClassName('e-content');
    var innerElements = elements[elements.length-1].children;
    var finalString = "";
    for (let i = 0; i < innerElements.length; i++) {
      finalString += innerElements[i].outerHTML
    };
    return finalString;
  }

  replaceBlobs = async (html) => {
    return new Promise((resolve, reject) => {
      console.log('REPLACING BLOB IMAGES');
      const fetchAsBlob = url => fetch(url)
          .then(response => response.blob())
          .catch(err => {
            console.log('Can\'t fetch BLOB');
            console.log(err.message);
          })
  
      const convertBlobToBase64 = blob => new Promise((resolve, reject) => {
        const reader = new FileReader;
        reader.onerror = reject;
        reader.onload = () => {
          resolve(reader.result);
        };
        reader.readAsDataURL(blob);
      });

      var div = document.createElement('div');
      div.innerHTML = html;
  
      var imgs = div.querySelectorAll('img');
      imgs.forEach( (img,i) => {
        var oldVal = img.getAttribute('src');
        if (oldVal.includes('blob:')){
          fetchAsBlob(oldVal)
            .then(convertBlobToBase64)
            .then(value => {
              html = html.replace(oldVal, value);
              if (i === imgs.length -1){
                resolve(html);
              }
            })
            .catch(err => {
              // if (i === imgs.length -1){
                resolve(html);
              // }
            })
         }
      })
      if (imgs.length === 0 || !html.includes('blob:')){
        resolve(html);
      }
    })
  }
    

  async submit() {
    if (this.headerFormRef.current.reportValidity()) {
      // Get content directly from editor, state content may not contain latest changes
      var content = this.eliminateRTEtags(this.getEditor().getContent().innerHTML);
      content = await this.replaceBlobs(content);
      const { credentials, to, cc, bcc, subject } = this.props;
      //const draftFolder = Object.values(this.props.folders.explodedItems).find(folder => folder.name === 'Drafts');

      this.props.sendMessage(credentials, {
        ...this.props.editedMessage,
        to,
        cc,
        bcc,
        subject,
        content,
      });
      //this.props.close(this.props.application);
    }
  }

  getTimeDraft() {
    const date = new Date();
    const time = date.toLocaleString(
      navigator.language, 
      {
        hour: '2-digit', 
        minute: '2-digit', 
        second: "2-digit"
      });
    const hour = time.slice(0, 2);
    return hour >= 12 ? time +' '+ 'PM' : time +' '+ 'AM';
  }
 
  async saveDraft() {
    if (this.headerFormRef.current.reportValidity()) {
      
      // Get content directly from editor, state content may not contain latest changes
      var content = this.eliminateRTEtags(this.getEditor().getContent().innerHTML);
      content = await this.replaceBlobs(content);
      const { user, credentials, to, cc, bcc, subject, selectedMessageEdit } = this.props;
      const fullTime = this.getTimeDraft();
      const { draftFolderbyAttribute, draftFolderbyName} = this.props;
      const draftFolder = (draftFolderbyAttribute) ? draftFolderbyAttribute : draftFolderbyName;

      if(this.state.draftId !== '') {
        this.props.saveDraft(draftFolder, user, credentials, {
          ...this.props.editedMessage,
          to,
          cc,
          bcc,
          subject,
          content,
        });      
      } else {
        this.props.saveDraft(draftFolder, user, credentials, {
          ...this.props.editedMessage,
          to,
          cc,
          bcc,
          subject,
          content,
        });
      }
      this.setState({draftTime: fullTime, showNotification: true, messageNotification: 'Guardando borrador...', closeButton: false});
    }
  }

  removeDraft() { 
    const { 
      credentials, 
      selectedMessageEdit, 
      application,
      draftFolderbyAttribute,
      draftFolderbyName
    } = this.props;

    const draftFolder = (draftFolderbyAttribute) ? draftFolderbyAttribute : draftFolderbyName;

    this.props.deleteMessage(
      credentials, 
      draftFolder, 
      selectedMessageEdit
    );
    this.props.draftClean();
    this.props.messageClean();
    this.props.close(application);
  }
  /**
   * Adds an address to the list matching the id.
   *
   * @param id
   * @param address
   */
  addAddress(id, address) {
    console.log('addAddress');
    if (address.length > 0) {
      const updatedMessage = { ...this.props.editedMessage };
      updatedMessage[id] = [...updatedMessage[id], address];
      console.log('Adding address:'+id+'-'+address);
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
    console.log('removeAddress');
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
    console.log('moveAddress');
    const updatedMessage = { ...this.props.editedMessage };
    // Remove
    updatedMessage[fromId].splice(updatedMessage[fromId].indexOf(address), 1);
    // Add
    updatedMessage[toId] = [...updatedMessage[toId], address];
    this.props.editMessage(updatedMessage);
  }

  getSubjectEdit(value) {
    console.log('getSubjectEdit');
    console.log('Subject:'+value);
    const updatedMessage = { ...this.props.editedMessage };
    this.props.editMessage({ ...updatedMessage, subject: value });
  }

  addAttachments(attachments){
    console.log('addAttachments');
    const updatedMessage = { ...this.props.editedMessage };
    this.props.editMessage({ ...updatedMessage, attachments: attachments });
  }

  updateAttachmentLinks(id){
    console.log('updateAttachmentLinks');
    const updatedMessage = { ...this.props.editedMessage };
    let newAttachments = [];
    if (updatedMessage.attachments) {
      updatedMessage.attachments.forEach((attachment, i) => {
        const link = attachment._links.download.href.replace(/(\/messages\/\d+\/attachments\/)/gm, `/messages/${id}/attachments/`);
        updatedMessage.attachments[i]._links.download.href = link;
        
      });
    }
    this.props.editMessage({...updatedMessage});
  }


  onSubjectChange(event) {
    console.log('onSubjectChange');
    const target = event.target;
    const updatedMessage = { ...this.props.editedMessage };
    this.props.editMessage({ ...updatedMessage, subject: target.value });
  }

  showNotification(message, error = false) {
    this.setState({
      messageNotification: message,
      errorNotification: error,
      showNotification: true,
    });
  }

  closeNotification() {
    const showNotification = !this.state.showNotification;
    this.setState({ showNotification: showNotification });
  }

  onDrop(event) {
    console.log('onDrop');
    event.preventDefault();
    event.stopPropagation();
    this.setState({ dropZoneActive: false });
    const addAttachment = (file, dataUrl) => {
      const newAttachment = {
        fileName: file.name,
        size: file.size,
        contentType: file.type,
        content: dataUrl.currentTarget.result.replace(
          /^data:[^;]*;base64,/,
          ''
        ),
      };
      const updatedMessage = { ...this.props.editedMessage };
      updatedMessage.attachments = updatedMessage.attachments
        ? [...updatedMessage.attachments, newAttachment]
        : [newAttachment];
      this.props.editMessage(updatedMessage);
    };

    // Check file sizes
    const maxFiles = Array.from(event.dataTransfer.files).filter(
      (f) => f.size > MAX_TOTAL_ATTACHMENTS_SIZE
    );
    if (maxFiles.length > 0) {
      this.showNotification(i18n.t('messageEditor.max-file-size'), false);
      return;
    }

    Array.from(event.dataTransfer.files).forEach((file) => {
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
    console.log('removeAttachment');
    const updatedMessage = { ...this.props.editedMessage };
    if (updatedMessage.attachments && updatedMessage.attachments.length) {
      updatedMessage.attachments = updatedMessage.attachments.filter(
        (a) => a !== attachment
      );
      this.props.editMessage(updatedMessage);
    }
  }

  onAttachButton() {
    return this.fileInput && this.fileInput.click();
  }

  onAttachSelected(event) {
    console.log('onAttachSelected');
    event.preventDefault();
    event.stopPropagation();
    this.setState({ dropZoneActive: false });
    const addAttachment = (file, dataUrl) => {
      const newAttachment = {
        fileName: file.name,
        size: file.size,
        contentType: file.type,
        content: dataUrl.currentTarget.result.replace(
          /^data:[^;]*;base64,/,
          ''
        ),
      };
      const updatedMessage = { ...this.props.editedMessage };
      updatedMessage.attachments = updatedMessage.attachments
        ? [...updatedMessage.attachments, newAttachment]
        : [newAttachment];
      this.props.editMessage(updatedMessage);
    };

    // Check file sizes
    const maxFiles = Array.from(event.target.files).filter(
      (f) => f.size > MAX_TOTAL_ATTACHMENTS_SIZE
    );
    if (maxFiles.length > 0) {
      this.showNotification(i18n.t('messageEditor.max-file-size'), false);
      return;
    }

    Array.from(event.target.files).forEach((file) => {
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
    console.log('editorChange');
    console.log(content);
    this.props.editMessage({ ...this.props.editedMessage, content });
    persistApplicationNewMessageContent(this.props.application, content);
  }
}

MessageEditor.propTypes = {
  className: PropTypes.string,
  t: PropTypes.func.isRequired,
};

MessageEditor.defaultProps = {
  className: '',
};

const mapStateToProps = (state) => ({
  application: state.application,
  folders: state.folders,
  draft: state.application.draft,
  selectedMessageEdit: state.application.selectedMessage,
  credentials: getCredentials(state),
  editedMessage: state.application.newMessage,
  to: (state.application.newMessage && state.application.newMessage.to) ? state.application.newMessage.to : [],
  cc: (state.application.newMessage && state.application.newMessage.cc) ? state.application.newMessage.cc : [],
  bcc: (state.application.newMessage && state.application.newMessage.bcc) ? state.application.newMessage.bcc : [],
  attachments: (state.application.newMessage && state.application.newMessage.attachments) ? state.application.newMessage.attachments : [],
  subject: (state.application.newMessage && state.application.newMessage.subject) ? state.application.newMessage.subject : '',
  editor: (state.application.newMessage && state.application.newMessage.editor) ? state.application.newMessage.editor : null,
  content: (state.application.newMessage && state.application.newMessage.content) ? state.application.newMessage.content : null,
  getAddresses: (value) => getAddresses(value, state.messages.cache),
  lexon: state.lexon,
  user: state.application.user,
  msgCache: state.messages.cache,
  draftFolderbyName: Object.values(state.folders.explodedItems).find(folder => folder && folder.name && (folder.name.toUpperCase() === 'DRAFTS' || folder.name.toUpperCase() === 'BORRADORES')),
  draftFolderbyAttribute: Object.values(state.folders.explodedItems).find(folder => folder && folder.name && folder.attributes.find(att => att && att.toUpperCase() === '\\DRAFTS'))

});

const mapDispatchToProps = (dispatch) => ({
  close: (application) => {
    dispatch(editMessage(null));
    // Clear content (editorBlur may be half way through -> force a message in the service worker to clear content after)
    // noinspection JSIgnoredPromiseFromCall
    persistApplicationNewMessageContent(application, '');
  },
  editMessage: (message) => {
    dispatch(editMessage(message));
  },
  messageClean: () => {
    dispatch(selectMessage({}));
  },
  draftClean: () => {
    dispatch(draftClean());
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
      content,
    }),
  saveDraft: (draftFolder, user, credentials,
    { inReplyTo, references, to, cc, bcc, attachments, subject, content }) => {
      saveDraft(dispatch, credentials, {
        inReplyTo,
        references,
        to,
        cc,
        bcc,
        attachments,
        subject,
        content,
      });
    },
  setCaseFile: (casefile) => dispatch(ACTIONS.setCaseFile(casefile)),
  setMailContacts: (mailContacts) =>
    dispatch(ACTIONS.setMailContacts(mailContacts)),
  deleteMessage: (credentials, selectedFolder, selectedMessage) => {
    deleteMessages(dispatch, credentials, selectedFolder, [
      selectedMessage,
    ]);
  },
  reloadFolders: (credentials) => getFolders(dispatch, credentials, true),
  reloadMessageCache: (user, folder) => resetFolderMessagesCache(dispatch, user, folder),
  selectMessage: (message) => {
    dispatch(selectMessage(message));
  },

});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(translate()(MessageEditor));
