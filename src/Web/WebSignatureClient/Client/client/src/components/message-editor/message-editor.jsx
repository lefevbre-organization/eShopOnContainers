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
  cancelSignatureCen
} from '../../services/api-signaturit';
import { getUser } from '../../services/accounts';
//import { createUser, addOrUpdateSignature, getUserSignatures } from '../../services/api-signature';
import * as uuid from 'uuid/v4';
import { getUrlType } from '../../services/jwt';
import { getFileType } from '../../services/mimeType';
import  AttachmentsWidget  from './widgets/attachments-widget2';
import { ExpirationWidget } from './widgets/expiration-widget';
import { RemindersWidget } from './widgets/reminders-widget';
import { DialogComponent } from '@syncfusion/ej2-react-popups';

class MessageEditor extends Component {
  constructor(props) {
    console.log('Entra en el message-editor');
    super(props);
    this.state = {
      linkDialogVisible: false,
      linkDialogUrl: '',
      dropZoneActive: false,
      // Stores state of current selection in the dialog (is title, underlined... H1, H2, ..., italic, underline)
      // Used in editor buttons to activate/deactivate them
      editorState: {},
      selectedReminderOption: '',
      reminderDays: 0,
      selectedExpirationOption: '',
      expirationDays: 7,
      hideAlertDialog: false,
      hideConfirmDialog: false,
      bigAttachments: false,
      centinelaDownloadError: (props.attachmentsDownloadError !== undefined) ? props.attachmentsDownloadError : false,
      numPagesOption: 1,
      MaximumSigners: 40,
      isCallApis: false
    };

    this.fileInput = null;
    this.editorRef = null;
    this.headerFormRef = React.createRef();
    this.handleSetState = (patchedState) => this.setState(patchedState);
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
    this.handleOnReminderDaysChange = this.onReminderDaysChange.bind(this);
    this.handleOnExpirationDaysChange = this.onExpirationDaysChange.bind(this);
    this.callApis = this.callApis.bind(this);
    this.combineInfo = this.combineInfo.bind(this);
    this.getDocumentsNamesAndIds = this.getDocumentsNamesAndIds.bind(this);
    this.getDocumentsIds = this.getDocumentsIds.bind(this);
    this.getDocumentsNames = this.getDocumentsNames.bind(this);
    this.buildDocumentsInfo = this.buildDocumentsInfo.bind(this);

    this.onChangeReminder = this.onChangeReminder.bind(this);
    this.onChangeExpiration = this.onChangeExpiration.bind(this);

    this.dialogClose = this.dialogClose;
    this.dialogOpen = this.dialogOpen;
    this.animationSettings = { effect: 'None' };
    this.handleNumPagesOption = this.handleNumPagesOption.bind(this);
    this.showCancelCenModal = this.showCancelCenModal.bind(this);
  }

  showCancelCenModal(){
    this.setState({ hideConfirmDialog: true});
  }


  handleNumPagesOption(option){
    console.log('Se cambia el numpages, option:' + option);
    this.setState({numPagesOption: option});
  }


  dialogClose(){
    if (this.state.centinelaDownloadError === true){
      this.props.onShowError();
    }
    this.setState({
        hideAlertDialog: false, bigAttachments: false, centinelaDownloadError: false, hideConfirmDialog: false
    });
  }

  dialogOpen(){
      this.alertDialogInstance.cssClass = 'e-fixed';
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
      if (lefebvre.mailContacts) {
        this.props.setMailContacts(null);
      }
      if (lefebvre.adminContacts){
        this.props.setAdminContacts(null);
      }
      this.props.setUserApp('lefebvre');
      this.props.setGuid(null);
      //this.props.setTitle(this.props.application.signaturesFilterKey);
      this.props.setTitle('');
      this.props.setIdDocuments(null);
      close(application);
}

  componentDidMount() {
    if (this.fileInput) {
      this.fileInput.onchange = this.onAttachSelected;
    }
    //createSignature();
  }

  removeMessageEditor(aplication) {
    const { close, lefebvre } = this.props;

    if (lefebvre.userApp === "cen" || lefebvre.userApp === "centinela" || lefebvre.userApp === "2"){
      this.setState({hideConfirmDialog: true});
    } else {
      if (lefebvre.mailContacts) {
        this.props.setMailContacts(null);
      }
      this.props.setUserApp('lefebvre');
      this.props.setGuid(null);
      //this.props.setTitle(this.props.application.signaturesFilterKey);
      this.props.setTitle('');
      close(aplication);
    }
  }


  onChangeReminder(reminder) {
    this.setState({
      selectedReminderOption: `option${reminder.option}`,
      reminderDays: reminder.data
    })
  }

  onChangeExpiration(expiration) {
    this.setState({
      selectedExpirationOption: `exp_option${expiration.option}`,
      expirationDays: expiration.data
    })
  }

  render() {
    const noSignersModal = `
      <span class="lf-icon-information" style="font-size:100px; padding: 15px;"></span>
      <div style='text-align: justify; text-justify: inter-word; align-self: center;
        padding-left: 20px; font-size: 17.5px !important'>
        ${i18n.t('noSignersModal.text')}
      </div>`;

    const noAttachModal = `
      <span class="lf-icon-information" style="font-size:100px; padding: 15px;"></span>
      <div style='text-align: justify; text-justify: inter-word; align-self: center;
        padding-left: 20px; font-size: 17.5px !important'>
        ${i18n.t('noAttachmentsModal.text')}
      </div>`;

    const bigFileModal = `
      <span class="lf-icon-information" style="font-size:100px; padding: 15px;"></span>
      <div style='text-align: justify; text-justify: inter-word; align-self: center;
        padding-left: 20px; font-size: 17.5px !important'>
        ${i18n.t('bigFileModal.text')}
      </div>
    `;

    const attachNotFound = `
      <span class="lf-icon-information" style="font-size:100px; padding: 15px;"></span>
      <div style='text-align: justify; text-justify: inter-word; align-self: center;
        padding-left: 20px; font-size: 17.5px !important'>
        ${i18n.t('attachNotFoundCentinela.text')}
      </div>
    `;

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
      to,
      cc,
      bcc,
      attachments,
      subject,
      content,
    } = this.props;

    console.log(this.state.centinelaDownloadError);
    console.log(this.props.attachmentsDownloadError);

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
          </div>
          <div className={styles['side-container']}>
            <AttachmentsWidget 
              // onAttachButton={this.onAttachButton()} 
              // onAttachSelected={this.onAttachSelected()}
              // removeAttachment={this.removeAttachment()}
              onSelectNumPages={this.handleNumPagesOption}
              onConfirmAttachRemoval={this.showCancelCenModal}
            ></AttachmentsWidget>
            <ExpirationWidget onChange={this.onChangeExpiration}></ExpirationWidget>
            <RemindersWidget onChange={this.onChangeReminder}></RemindersWidget>
          </div>
          <div className={styles['action-buttons']}>
            <button
              className={`${mainCss['mdc-button']} ${mainCss['mdc-button--unelevated']} ${styles['action-button']} ${styles.cancel}`}
              onClick={() => this.removeMessageEditor(application)}>
              {t('messageEditor.discard')}
            </button>
            <button
              className={`${mainCss['mdc-button']} ${mainCss['mdc-button--unelevated']} ${styles['action-button']} ${styles.send}`}
              //disabled={this.props.attachments.length === 0}
              onClick={this.handleSubmit}>
              {t('messageEditor.send')}
            </button>
                        
          </div>
        </div>

        {/* <InsertLinkDialog
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
        /> */}
        <DialogComponent 
          id="info2Dialog" 
          //header=' ' 
          visible={this.state.hideAlertDialog || this.state.centinelaDownloadError} 
          animationSettings={this.animationSettings} 
          width='60%' 
          content={(this.state.centinelaDownloadError === true ? attachNotFound : (this.props.attachments.length === 0 ? noAttachModal : (this.state.bigAttachments ? bigFileModal : noSignersModal)))}
          //content={(this.props.attachments.length === 0 ? noAttachModal : (this.state.bigAttachments ? bigFileModal : noSignersModal))}
          ref={alertdialog => this.alertDialogInstance = alertdialog} 
          //target='#target' 
          //buttons={this.alertButtons} 
          open={this.dialogOpen.bind(this)} 
          close={this.dialogClose.bind(this)}
          showCloseIcon={true}
          //position={ this.position }
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
          open={() => this.dialogOpen} 
          close={() => this.dialogClose}
        />
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
            .e-dialog .e-btn .e-btn-icon.e-icon-dlg-close{
              color: white;
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
            #confirmDialog_dialog-header, .e-dialog 
            .e-icon-dlg-close::before {
              content: '\e7fc';
              position: relative;
              color: white;
              font-size: 15px;
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
            #toolsRTE_2 {
              height: calc(100% - 20px) !important;
            }
          `}
        </style>
        {/* <style jsx global>
        {`
          input:not([type]){
            border-bottom: 1px solid #001970 !important
          }
        `}
        </style> */}
      </div>
    );
  }

  bigAttachments(){
    let maxSize = 15000000;
    let totalSize = 0
    this.props.attachments.map(attachment => totalSize = totalSize + attachment.size);
    return (totalSize >= maxSize);
  }

  
  submit() {
    if (this.props.to.length === 0 || this.props.attachments.length === 0){
      this.setState({ hideAlertDialog: true });
    } else if (this.bigAttachments()){
      this.setState({ hideAlertDialog: true, bigAttachments: true});
    }
    else {
      if (this.headerFormRef.current.reportValidity()) {
        // Get content directly from editor, state content may not contain latest changes
        const content = this.getEditor().getContent();
        const { to, cc, subject } = this.props;
        const { lefebvre } = this.props;
        // const userBranding = lefebvre.userBrandings.find(
        //   (b) => b.app === lefebvre.userApp
        // );
  
        let reminders = [];
        switch (this.state.selectedReminderOption) {
          case 'option1': // every x days
            if (this.state.selectedExpirationOption === 'exp_option1') {
              for (let index = 0; index < this.state.expirationDays; index++) {
                if (this.state.reminderDays * (index + 1) <= this.state.expirationDays) {
                  reminders[index] = this.state.reminderDays * (index + 1);
                }
              }
            } else {
              for (let index = 0; index < 30; index++) {
                reminders[index] = this.state.reminderDays * (index + 1);
              }
            }
            break;
          case 'option2': //daily
            if (this.state.selectedExpirationOption === 'exp_option1') {
              for (let index = 0; index < this.state.expirationDays; index++) {
                reminders[index] = index + 1;
                //reminders.push(index + 1);
              }
            } else {
              for (let index = 0; index < 30; index++) {
                reminders[index] = index + 1;
              }
            }
            break;
          case 'option3': //weekly
            if (this.state.selectedExpirationOption === 'exp_option1') {
              for (let index = 0; index < this.state.expirationDays; index++) {
                if (7 * (index + 1) < this.state.expirationDays) {
                  reminders[index] = 7 * (index + 1);
                }
              }
            } else {
              for (let index = 0; index < 30; index++) {
                reminders[index] = 7 * (index + 1);
              }
            }
            break;
          default:
            reminders[0] = -1;
            break;
        }
  
        let expiration;
        switch (this.state.selectedExpirationOption) {
          case 'exp_option1': // expires
            expiration = this.state.expirationDays;
            break;
          case 'exp_option2': // never expires
            expiration = 0;
            break;
          default:
            expiration = -1;
            break;
        }
  
        console.log('Recordatorios y exp: ');
        console.log({ reminders });
        console.log(expiration);
  
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
        if (this.props.attachments) {
          let attachmentsList = [];
          this.props.attachments.forEach((attachment) => {
            //var attachment = this.props.attachments[0];
            var file = new File([attachment.content], attachment.fileName, {
              type: getFileType(attachment.fileName),
              lastModified: new Date(),
            });
            attachmentsList.push({file: file, pages: attachment.pages});
            debugger;
          });
          //this.callApis(to, subject, content.innerHTML, file, this.props.attachments[0].content, reminders, expiration, lefebvre.userId, guid, userBranding.externalId);
          this.callApis(
            to,
            cc,
            subject,
            content.innerHTML,
            this.props.attachments,
            reminders,
            expiration,
            lefebvre.userId,
            guid,
            ''
          );
        }
        //createSignature(to, subject, content.innerHTML, document.getElementById('file-input').files[0], reminders, expiration, lefebvre.userId, guid);
      }
    }
  }

  example() {
    var lookup = {};
    var items = json.DATA;
    var result = [];

    for (var item, i = 0; (item = items[i++]);) {
      var name = item.name;

      if (!(name in lookup)) {
        lookup[name] = 1;
        result.push(name);
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

  buildDocumentsInfo(signature) {
    let result;

    result = signature.documents.map((e) => {
      return {
        externalFileName: e.file.name,
        externalId: e.id,
        signer: { name: e.name, email: e.email },
        internalInfo: this.props.lefebvre.idDocuments.find((d) => {
          if (d.docName.replace(/ /g, '_') === e.file.name) {
            return d.docId;
          }
        }),
      };
    });

    return result;
  }

  //callApis(to, subject, content, file, fileData, reminders, expiration, userId, guid, userBrandingId){
  callApis(
    to,
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
      to,
      cc,
      subject,
      content,
      files,
      this.state.numPagesOption,
      reminders,
      expiration,
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
          var documentsInfo = this.buildDocumentsInfo(signatureInfo);
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
        });
      }
      this.setState({isCallApis: false});
      this.props.close(this.props.application);
    });
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
      if(updatedMessage.to.length == this.state.MaximumSigners
         && id != 'cc') {
           console.log('Maximum Signers');
      }else if(updatedMessage.to.length == this.state.MaximumSigners 
        && id == 'cc') {
        updatedMessage[id] = [...updatedMessage[id], address];
        this.props.editMessage(updatedMessage);
      }else {
        updatedMessage[id] = [...updatedMessage[id], address];
        this.props.editMessage(updatedMessage);
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

  onReminderDaysChange(event) {
    const target = event.target;
    this.setState = { reminderDays: target.value };
  }

  onExpirationDaysChange(event) {
    const target = event.target;
    this.setState = { expirationDays: target.value };
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
  credentials: getCredentials(state),
  editedMessage: state.application.newMessage,
  to: state.application.newMessage.to,
  cc: state.application.newMessage.cc,
  bcc: state.application.newMessage.bcc,
  attachments: state.application.newMessage.attachments,
  subject: state.application.newMessage.subject,
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
  setTitle: title => dispatch(setTitle(title)),
  setUserApp: app => dispatch(ACTIONS.setUserApp(app)),
  setAdminContacts: contacts => dispatch(ACTIONS.setAdminContacts(contacts)),
  setIdDocuments: id => dispatch(ACTIONS.setIdDocuments(id))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(translate()(MessageEditor));
