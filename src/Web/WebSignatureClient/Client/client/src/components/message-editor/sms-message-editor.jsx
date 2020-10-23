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
import { editMessage, setTitle } from '../../actions/application';
import { sendMessage } from '../../services/smtp';
import { getAddresses } from '../../services/message-addresses';
import { persistApplicationNewMessageContent } from '../../services/indexed-db';
import styles from './message-editor.scss';
import mainCss from '../../styles/main.scss';
import i18n from 'i18next';
import ACTIONS from '../../actions/lefebvre';
import ComposeMessageEditor from './composeMessageEditor.jsx';

import Spinner from "../spinner/spinner";
import {
  createSignature,
  createSignature2,
  addOrUpdateSignature,
  getUserSignatures,
  createUser,
  decAvailableSignatures,
  notifySignature,
  cancelSignatureCen,
  preloadSignatures2,
  getNumAvailableSignatures
} from '../../services/api-signaturit';
import { getUser } from '../../services/accounts';
//import { createUser, addOrUpdateSignature, getUserSignatures } from '../../services/api-signature';
import * as uuid from 'uuid/v4';
import { getUrlType } from '../../services/jwt';
import { getFileType } from '../../services/mimeType';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import RolSelector from './rol-selector/rol-selector';

class SmsMessageEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      linkDialogVisible: false,
      linkDialogUrl: '',
      dropZoneActive: false,
      editorState: {},
      hideAlertDialog: false,
      hideConfirmDialog: false,
      hideRolDialog: false,
      numPagesOption: 1,
      MaximumSigners: 40,
      isCallApis: false,
      isFileType: false,
      isContacts: false
    };

    this.fileInput = null;
    this.editorRef = null;
    this.headerFormRef = React.createRef();
    this.handleSetState = (patchedState) => this.setState(patchedState);
    this.handleSubmit = this.submit.bind(this);
    // Header Address Events
    this.handleAddAddress = this.addAddress.bind(this);
    this.handleRemoveAddress = this.removeAddress.bind(this);
    // Subject events
 
    // Editor events
    this.handleEditorChange = this.editorChange.bind(this);
    this.callApis = this.callApis.bind(this);
    this.combineInfo = this.combineInfo.bind(this);
    this.getDocumentsNamesAndIds = this.getDocumentsNamesAndIds.bind(this);
    this.getDocumentsIds = this.getDocumentsIds.bind(this);
    this.getDocumentsNames = this.getDocumentsNames.bind(this);

    this.dialogClose = this.dialogClose.bind(this);
    this.dialogOpen = this.dialogOpen.bind(this);
    this.animationSettings = { effect: 'None' };
    this.handleNumPagesOption = this.handleNumPagesOption.bind(this);
    this.showCancelCenModal = this.showCancelCenModal.bind(this);
    this.getRoleInfo = this.getRoleInfo.bind(this);
  }

  showCancelCenModal(){
    this.setState({ hideConfirmDialog: true});
  }

  handleNumPagesOption(option){
    console.log('Se cambia el numpages, option:' + option);
    this.setState({numPagesOption: option});
  }


  resetReceivedInfo(){
    this.props.setMailContacts(null);
    this.props.setAdminContacts(null);
    this.props.setUserApp('lefebvre');
    this.props.setGuid(null);
    this.props.setTitle('');
    this.props.setIdDocuments(null);
  }

  getRoleInfo(recipients){
    console.log('Roleinfo:');
    console.log(recipients);
    
    if (this.headerFormRef.current.reportValidity()) {
        // Get content directly from editor, state content may not contain latest changes
        const content = this.getEditor().getContent();
        const { lefebvre } = this.props;
        const userBranding = (lefebvre && lefebvre.userBrandings && lefebvre.userBrandings.signature) 
          ? lefebvre.userBrandings.signature.find((b) => b.app === lefebvre.userApp) 
          : '';
  
        let guid = lefebvre.guid;
        if (guid === null) {
          guid = uuid();
        }
  
  

          this.callApis(
            recipients,
            content.innerHTML,
            lefebvre.userId,
            guid,
            (userBranding && userBranding.externalId) ? userBranding.externalId : ''
          );
        }
        //createSignature(to, subject, content.innerHTML, document.getElementById('file-input').files[0], reminders, expiration, lefebvre.userId, guid);
    }
  

  dialogClose(){
    this.setState({
        hideAlertDialog: false, 
        hideConfirmDialog: false, 
        hideRolDialog: false
    });
  }

  dialogOpen(instance){
    switch (instance) {
        case "alertDialog":
            (this.alertDialogInstance && this.alertDialogInstance.cssClass) ? this.alertDialogInstance.cssClass = 'e-fixed' : null;
            break;
        default:
            break;
    }
}

  onDiscardSignatureOk(){
    const {close, lefebvre, application} = this.props
    cancelSignatureCen(lefebvre.guid)
    .then(res => {
      console.log(res);
    })
    .catch(err => {
      console.log(err);
    })

    this.setState({ hideConfirmDialog: false });
    this.resetReceivedInfo();
    close(application);
}

  componentDidMount() {
    if (this.fileInput) {
      this.fileInput.onchange = this.onAttachSelected;
    }
    
    this.setState({isContacts: this.props.lefebvre.userApp === "centinela"});
    //createSignature();
  }

  removeMessageEditor(aplication) {
    const { close, lefebvre } = this.props;

    if (lefebvre.userApp === "cen" || lefebvre.userApp === "centinela" || lefebvre.userApp === "2"){
      this.setState({hideConfirmDialog: true});
    } else {
      this.resetReceivedInfo();
      close(aplication);
    }
  }

  render() {
    const noSignersModal = `
      <span class="lf-icon-information" style="font-size:100px; padding: 15px;"></span>
      <div style='text-align: justify; text-justify: inter-word; align-self: center;
        padding-left: 20px; font-size: 17.5px !important'>
        ${i18n.t('noSignersModal.text')}
      </div>`;

    const confirmDiscard = `
      <span class="lf-icon-question" style="font-size:100px; padding: 15px;"></span>
      <div style='text-align: justify; text-justify: inter-word; align-self: center; 
        font-size: 17.5px !important; padding-left: 20px;'>
        ${i18n.t('cancelCentinelaConfirmation.text')}
      </div>
    `;

    const confirmButtons = [
      {
          click: () => {
          this.setState({ hideConfirmDialog: false });
          },
          buttonModel: {  content: i18n.t('confirmationModal.no'), cssClass: 'btn-modal-close' }
      },
      {
          click: () => {
              this.setState({ hideConfirmDialog: false });
              this.onDiscardSignatureOk();
          },
          buttonModel: { content: i18n.t('confirmationModal.yes'), isPrimary: true }
      }
    ];


    const {
      t,
      className,
      application,
      sendingType,
      to,
      content,
      lefebvre
    } = this.props;

    return (
      <div
        className={`${className} ${styles['message-editor']}`}
        onDrop={this.handleOnDrop}
        onDragOver={this.handleOnDragOver}
        onDragLeave={this.handleOnDragLeave}>
         {this.state.isCallApis ? 
          <div className={styles['spinner-container']}> 
           <div className={styles['spinner']}>
            <Spinner /> 
           </div>
          </div> : ''}
        {this.state.dropZoneActive ? (
          <div className={styles.dropZone}>
            <div className={styles.dropZoneMessage}>
              <i className={'material-icons'}>attach_file</i>
              {t('messageEditor.dropZoneMessage')}
            </div>
          </div>
        ) : null}
        <div className={styles.header}>
          <form ref={this.headerFormRef}>
            <HeaderAddress
              id={'to'}
              addresses={to}
              onAddressAdd={this.handleAddAddress}
              onAddressRemove={this.handleRemoveAddress}
              className={styles.address}
              chipClassName={styles.chip}
              autoSuggestClassName={styles.autoSuggest}
              autoSuggestMenuClassName={styles.autoSuggestMenu}
              getAddresses={this.props.getAddresses}
              label={i18n.t('messageEditor.to')}
              lefebvre={lefebvre}
              isContacts={this.state.isContacts}
            />
            
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
          </div>
          <div className={styles['side-container']}>
            
          </div>
          <div className={styles['action-buttons']}>
            <button
              className={`${mainCss['mdc-button']} ${mainCss['mdc-button--unelevated']} ${styles['action-button']} ${styles.cancel}`}
              onClick={() => this.removeMessageEditor(application)}>
              {t('messageEditor.discard')}
            </button>
            <button
              className={`${mainCss['mdc-button']} ${mainCss['mdc-button--unelevated']} ${styles['action-button']} ${styles.send}`}
              onClick={this.handleSubmit}>
              {t('messageEditor.send')}
            </button>
                        
          </div>
        </div>

        <DialogComponent 
          id="info2Dialog" 
          //header=' ' 
          visible={this.state.hideAlertDialog} 
          animationSettings={this.animationSettings} 
          width='60%' 
          content={noSignersModal}
          ref={alertdialog => this.alertDialogInstance = alertdialog} 
          open={this.dialogOpen("info2Dialog")} 
          close={this.dialogClose}
          showCloseIcon={true}
        />
        <DialogComponent 
          id="confirmDialog" 
          header=' ' 
          visible={this.state.hideConfirmDialog} 
          showCloseIcon={true} 
          animationSettings={this.animationSettings} 
          width='60%' 
          content={confirmDiscard} 
          ref={dialog => this.confirmDialogInstance = dialog} 
          //target='#target' 
          buttons={confirmButtons} 
          open={this.dialogOpen("confirmDialog")} 
          close={this.dialogClose.bind(this)}
        />
        <DialogComponent 
          id="rolDialog" 
          header={i18n.t("messageEditor.grid.recipientsRole")} 
          visible={this.state.hideRolDialog} 
          showCloseIcon={true} 
          animationSettings={this.animationSettings} 
          width='80%'
          //content={RolSelector} 
          ref={dialog => this.rolDialog = dialog} 
          //target='#target' 
          open={this.dialogOpen("rolDialog")} 
          close={this.dialogClose}
        >
          <RolSelector 
          recipients={to}
          onFinishRoles={this.getRoleInfo}
          dialogClose={this.dialogClose.bind(this)}
          />
        </DialogComponent>
        <style jsx global>
          {` 
           .message-editor___1BSzC 
           .header___2SVSM 
           .address___2e6fn 
           .chip___3gDJb {
             border-color: #001970 !important;
            }
            .message-editor___1BSzC 
            .header___2SVSM 
            .address___2e6fn 
            .chip___3gDJb i {
              color: #001970;
            }
            #info2Dialog,
            #confirmDialog {
              max-height: 927px;
              width: 60%;
              left: 20% !important;
              z-index: 1001;
            }
            #rolDialog {
              top: 20% !important;
            }
            #info2Dialog_dialog-header, #info2Dialog_title, #info2Dialog_dialog-content, #info2Dialog.e-footer-content,
            #confirmDialog_dialog-header, #confirmDialog_title, #confirmDialog_dialog-content, .e-footer-content {
              background: #001970;
              color: #fff;
              display:flex;
            }
            .e-dialog .e-dlg-header-content .e-btn.e-dlg-closeicon-btn{
              margin-right: 0;
              margin-left: auto;
              color: #fff
            }
            #confirmDialog .e-dlg-header{
              width: 1%;
            }
            #rolDialog_title {
              width: 40% !important;
              color: #001970;
              font-weight: bold;
              font-size: 15px;
            }
            .e-btn.e-flat.e-primary {
              color: #fff !important;
            }
            .e-btn-icon .e-icon-dlg-close .e-icons{
                color: #fff;
            }
            .e-dialog .e-dlg-header-content 
            .e-btn.e-dlg-closeicon-btn {
              margin-right: 0;
              margin-left: auto;
              color: #fff;
              height: 15px;
              background-color: transparent;
            }
            .e-dialog .e-icon-dlg-close::before {
              content: '\e7fc';
              position: relative;
              font-size: 15px;
            }
            #rolDialog_dialog-header > button {
              margin-right: 10px;
            }
            #rolDialog_dialog-header > button > span {
              color: #001978;
            }
            #confirmDialog_dialog-header > button > span {
              color: white;
            }
            #info2Dialog_dialog-header > button > span {
              color: white;
            }
            #noSignaturesDialog_dialog-header > button > span {
              color: white;
            }
            #confirmDialog .e-btn.e-flat.e-primary {
              text-transform: uppercase;
              font-size: 13px;
              font-family: MTTMilano-Bold,Lato,Arial,sans-serif;
              letter-spacing: .7px;
              color: #001978 !important;
              padding: 10px;
              background-color: #fff;
              border-radius: 0 !important;
              border: 2px solid #fff !important;
              min-width: 80px;
            }
            
            #confirmDialog .e-btn.e-flat.e-primary:hover {
              background-color: #e5e8f1 !important;
              background: #e5e8f1 !important;
              color: #001978 !important;
            }
            
            #confirmDialog .e-btn.e-flat.e-primary:active {
              background-color: #e5e8f1 !important;
              background: #e5e8f1 !important;
              color: #001978 !important;
            }

            .btn-modal-close {
              text-transform: uppercase;
              font-size: 13px;
              font-family: MTTMilano-Bold,Lato,Arial,sans-serif;
              letter-spacing: .7px;
              color: #fff !important;
              padding: 10px;
              background-color: #001978 !important;
              min-width: 80px;
              border-radius: 0 !important;
              border: 2px solid #fff !important;
            }
            
            .btn-modal-close:hover {
              background-color: #e5e8f1 !important;
              background: #e5e8f1 !important;
              color: #001978 !important;
            }
          
            .btn-modal-close:active {
              background-color: #e5e8f1 !important;
              background: #e5e8f1 !important;
              color: #001978 !important;
            }
            #toolsRTE_2, .e-control .e-focused .e-lib .e-richtexteditor {
              height: calc(100% - 20px) !important;
            }
            #toolsRTE_2rte-view {
              overflow: hidden;
            }    
          `}
        </style>
      </div>
    );
  }

  submit() {
    if (this.props.to.length === 0){
      this.setState({ hideAlertDialog: true });
    } else if (this.bigAttachments()){
      this.setState({ hideAlertDialog: true, bigAttachments: true});
    }
    else {
      this.setState({hideRolDialog:true});
      if (this.headerFormRef.current.reportValidity()) {
        // Get content directly from editor, state content may not contain latest changes
        const content = this.getEditor().getContent();
        const { to } = this.props;
        const { lefebvre } = this.props;
        // const userBranding = lefebvre.userBrandings.find(
        //   (b) => b.app === lefebvre.userApp
        // );
  
        
  
        let guid = lefebvre.guid;
        if (guid === null) {
          guid = uuid();
        }
  
        // if (document.getElementById('file-input').files[0]){
        //     var reader = new FileReader();
        //     reader.readAsDataURL(document.getElementById('file-input').files[0]);
        //     reader.onloadend = (evt) => {
        //        console.log(evt.target.result);
        //        var fileData = evt.target.result.split('base64,')[1];
        //        this.callApis(to, subject, content.innerHTML, document.getElementById('file-input').files[0], fileData, reminders, expiration, lefebvre.userId, guid, userBranding.externalId);
        //     }
        //     reader.onerror = function (evt) {
        //         console.log("error reading file");
        //     }
        // } else
    
         
         
            
          //this.callApis(to, subject, content.innerHTML, file, lefebvre.userId, guid, userBranding.externalId);
          this.callApis(
            to,
            cc,
            subject,
            content.innerHTML,
            reminders,
            expiration,
            lefebvre.userId,
            guid,
            ''
          );
    
        //createSignature(to, subject, content.innerHTML, document.getElementById('file-input').files[0], reminders, expiration, lefebvre.userId, guid);
      }
    }
  }

  getDocumentsNames(signature) {
    var lookup = {};
    var items = signature.documents;
    var result = [];

    for (var item, i = 0; (item = items[i++]);) {
      var name = item.file.name;
      var id = item.id;

      if (!(name in lookup)) {
        lookup[name] = 1;
        result.push(name);
      }
    }
    return result;
  }

  getDocumentsIds(signature) {
    var lookup = {};
    var items = signature.documents;
    var result = [];

    for (var item, i = 0; (item = items[i++]);) {
      var id = item.id;

      if (!(id in lookup)) {
        lookup[id] = 1;
        result.push(id);
      }
    }
    return result;
  }

  getDocumentsNamesAndIds(signature) {
    var lookup = {};
    var items = signature.documents;
    var result = [];

    for (var item, i = 0; (item = items[i++]);) {
      var name = item.file.name;
      var id = item.id;
      var info = { name: name, id: id };

      if (!(info in lookup)) {
        lookup[info] = 1;
        result.push(info);
      }
    }
    return result;
  }

  combineInfo(externalIds, internalIds) {
    let merged = [];

    for (let i = 0; i < externalIds.length; i++) {
      merged.push({
        ...externalIds[i],
        ...internalIds.find(
          (itmInner) => itmInner.name === externalIds[i].name
        ),
      });
    }
    return merged;
  }

  //callApis(to, subject, content, file, fileData, reminders, expiration, userId, guid, userBrandingId){
  callApis(
    recipients,
    cc,
    subject,
    content,
    files,
    reminders,
    expiration,
    userId,
    guid,
    userBrandingId
  ) {
    const { lefebvre } = this.props;
    this.setState({isCallApis: true});
    //createSignature2(to, subject, content, file, fileData, reminders, expiration, userId, guid, userBrandingId, this.props.credentials.encrypted)
    createSignature2(
      recipients,
      content,
      files,
      this.state.numPagesOption,
      userId,
      guid,
      userBrandingId,
      this.props.credentials.encrypted
    ).then((signatureInfo) => {
      console.log(signatureInfo);
      if (signatureInfo.status_code) {
        console.log(
          'Se ha producido un error: ' +
          signatureInfo.status_code +
          '-' +
          signatureInfo.message
        );
      } else {
        getUserSignatures(userId).then((userInfo) => {
          // if (userInfo && userInfo.errors && userInfo.errors.code && userInfo.errors.code === "1003"){
          //   var externalIds = getDocumentsNamesAndIds(signatureInfo);
          //   var combinedInfo = combineInfo(externalIds, lefebvre.idDocuments);
          //   debugger;
          //   const signature = {externalId: signatureInfo.id, guid: guid, app: lefebvre.userApp, signers: to, idDocuments:combinedInfo}
          //   createUser(userId, signature);
          // } else {
          // var externalIds = this.getDocumentsIds(signatureInfo);
          // var documentsNames = this.getDocumentsNames(signatureInfo);
          // var combinedInfo = this.combineInfo(externalIds, lefebvre.idDocuments);
          debugger;
          console.log('Insertando sólo firma');
          addOrUpdateSignature(
            userId,
            signatureInfo.id,
            guid,
            lefebvre.userApp,
            documentsInfo
          );
          //}
          // decAvailableSignatures(userId)
          // .then(res => this.props.setAvailableSignatures(res.data))
          notifySignature(
            lefebvre.userId,
            lefebvre.idUserApp,
            documentsInfo.length
          );
          this.props.setMailContacts(null);
          this.props.setAdminContacts(null);
          this.props.setUserApp('lefebvre');
          this.props.setGuid(null);
          this.props.setTitle('');
          this.props.setIdDocuments(null);
          this.props.close(this.props.application);
          this.props.preloadSignatures(lefebvre.userId)
          getNumAvailableSignatures(lefebvre.idUserApp)
            .then( res => this.props.setNumAvailableSignatures(parseInt(res.data)))
            .catch(err => {
                console.log(err);
            });
        });
      }
      this.setState({isCallApis: false, hideRolDialog: false});
    });
  }

  validateAddress(updatedMessage, id, address, name) {
    const addressData = {address: address, name: name}
    if(updatedMessage.to.length == this.state.MaximumSigners
       && id != 'cc') {
         console.log('Maximum Signers');
    } else if(updatedMessage.to.length == this.state.MaximumSigners 
      && id == 'cc') {
      updatedMessage[id] = [...updatedMessage[id], addressData];
      this.props.editMessage(updatedMessage);
    } else {
      updatedMessage[id] = [...updatedMessage[id], addressData];
      this.props.editMessage(updatedMessage);
    }
  }

  /**
   * Adds an address to the list matching the id.
   *
   * @param id
   * @param address
   */
  addAddress(id, address, name) {
    if (address.length > 0) {
      const updatedMessage = { ...this.props.editedMessage };
      const recipientRepeats = updatedMessage.to.some(data => {
      return (data.address === address);    
     });
   
     if(!recipientRepeats){
      this.validateAddress(updatedMessage, id, address, name);
     }
      
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

  getEditor() {
    if (this.editorRef && this.editorRef.refEditor) {
      return this.editorRef.refEditor;
    }
    return null;
  }

  editorWrapperClick() {
    this.getEditor();
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

SmsMessageEditor.propTypes = {
  className: PropTypes.string,
  t: PropTypes.func.isRequired,
};

SmsMessageEditor.defaultProps = {
  className: '',
};

const mapStateToProps = (state) => ({
  application: state.application,
  credentials: getCredentials(state),
  editedMessage: state.application.newMessage,
  sendingType: state.application.newMessage.sendingType,
  to: state.application.newMessage.to,
  name: state.application.newMessage.name,
  editor: state.application.newMessage.editor,
  content: state.application.newMessage.content,
  getAddresses: (value) => getAddresses(value, state.messages.cache),
  lefebvre: state.lefebvre,
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
  // setCaseFile: casefile => dispatch(ACTIONS.setCaseFile(casefile)),
  setMailContacts: (mailContacts) =>
    dispatch(ACTIONS.setMailContacts(mailContacts)),
  setGuid: (guid) => dispatch(ACTIONS.setGUID(guid)),
  setAvailableSignatures: (num) =>
    dispatch(ACTIONS.setAvailableSignatures(num)),
  setNumAvailableSignatures: num =>
    dispatch(ACTIONS.setNumAvailableEmails(num)),
  setTitle: title => dispatch(setTitle(title)),
  setUserApp: app => dispatch(ACTIONS.setUserApp(app)),
  setAdminContacts: contacts => dispatch(ACTIONS.setAdminContacts(contacts)),
  setIdDocuments: id => dispatch(ACTIONS.setIdDocuments(id)),
  preloadSignatures: (userId, auth) => preloadSignatures2(dispatch, userId, auth)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(translate()(SmsMessageEditor));