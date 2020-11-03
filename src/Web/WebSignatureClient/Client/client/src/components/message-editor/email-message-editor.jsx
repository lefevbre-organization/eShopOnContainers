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
import { editMessage, setTitle, setSelectedService, setSignaturesFilterKey } from '../../actions/application';
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
  createEmail,
  addOrUpdateEmail,
  getUserEmails,
  notifySignature,
  cancelSignatureCen,
  preloadEmails,
  getNumAvailableSignatures
} from '../../services/api-signaturit';
import { getUser } from '../../services/accounts';
import * as uuid from 'uuid/v4';
import { getUrlType } from '../../services/jwt';
import { getFileType } from '../../services/mimeType';
import  AttachmentsWidget  from './widgets/attachments-widget2';
import  CertificatesWidget  from './widgets/certificates-widget';
import { DialogComponent } from '@syncfusion/ej2-react-popups';


class EmailMessageEditor extends Component {
  constructor(props) {
    console.log('Entra en el message-editor');
    super(props);
    this.state = {
      linkDialogVisible: false,
      linkDialogUrl: '',
      dropZoneActive: false,
      editorState: {},
      selectedCertificationOption: 1,
      certificationType: 'delivery',
      hideAlertDialog: false,
      hideConfirmDialog: false,
      bigAttachments: false,
      centinelaDownloadError: (props.attachmentsDownloadError !== undefined) ? props.attachmentsDownloadError : false,
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
    this.callApis = this.callApis.bind(this);
    this.combineInfo = this.combineInfo.bind(this);
    this.getDocumentsNamesAndIds = this.getDocumentsNamesAndIds.bind(this);
    this.getDocumentsIds = this.getDocumentsIds.bind(this);
    this.getDocumentsNames = this.getDocumentsNames.bind(this);
    this.buildDocumentsInfo = this.buildDocumentsInfo.bind(this);

    this.onChangeCertification = this.onChangeCertification.bind(this);

    this.dialogClose = this.dialogClose;
    this.dialogOpen = this.dialogOpen;
    this.animationSettings = { effect: 'None' };
    this.showCancelCenModal = this.showCancelCenModal.bind(this);
   
    this.resetIsFileDrop = this.resetIsFileDrop.bind(this);
  }

  onChangeCertification(certificates) {
    let selectedOptions = [];
    let max = 0;
    certificates.forEach(certificate => {
      if (certificate.checked){
        selectedOptions.push({option: certificate.option, certificate: certificate.id});
        (max <= certificate.option) ? max = certificate.option : null;
      }
    });
    this.setState({
      selectedCertificationOption: max,
      certificationType: selectedOptions[max-1].certificate
    })
    console.log("***++++++****+++++****++++****++++");
    console.log('Selected Options:')
    console.log(selectedOptions);
    console.log('max:')
    console.log(max);
    console.log('Lo que voy a guardar en selectedCertificationOption:' + max);
    console.log('Lo que voy a guardar en certificationType: ' + selectedOptions[max-1].certificate);
    console.log(this.state.selectedCertificationOption);
    console.log(this.state.certificationType);
  }


  showCancelCenModal(){
    this.setState({ hideConfirmDialog: true});
  }


  resetIsFileDrop(){
    console.log('Reset isFileDrop');
    this.setState({isFileType: false});
  }

  resetReceivedInfo(){
    this.props.setMailContacts(null);
    this.props.setAdminContacts(null);
    this.props.setUserApp('lefebvre');
    this.props.setGuid(null);
    this.props.setTitle('');
    this.props.setIdDocuments(null);
  }


  dialogClose(){
    if (this.state.centinelaDownloadError === true){
      this.props.onShowError();
    }
    this.setState({
        hideAlertDialog: false, 
        bigAttachments: false, 
        centinelaDownloadError: false,
        hideConfirmDialog: false
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
      sendingType,
      to,
      cc,
      bcc,
      attachments,
      subject,
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
              onAddressMove={this.handleMoveAddress}
              className={styles.address}
              chipClassName={styles.chip}
              autoSuggestClassName={styles.autoSuggest}
              autoSuggestMenuClassName={styles.autoSuggestMenu}
              getAddresses={this.props.getAddresses}
              label={i18n.t('messageEditor.to')}
              lefebvre={lefebvre}
              isContacts={this.state.isContacts}
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
              lefebvre={lefebvre}
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
              sendingType={sendingType}
              onConfirmAttachRemoval={this.showCancelCenModal}
              isFileTypeDrop={this.state.isFileType}
              resetIsFileDrop={this.resetIsFileDrop}
              fatherContainer={'EmailMessageEditor'}
            ></AttachmentsWidget>
            <CertificatesWidget 
              userApp={lefebvre.userApp}
              onChange={this.onChangeCertification}
            />
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

        <DialogComponent 
          id="info2Dialog" 
          //header=' ' 
          visible={this.state.hideAlertDialog || this.state.centinelaDownloadError} 
          animationSettings={this.animationSettings} 
          width='60%' 
          content={(this.state.centinelaDownloadError === true ? attachNotFound : (this.props.attachments.length === 0 ? noAttachModal : (this.state.bigAttachments ? bigFileModal : noSignersModal)))}
          ref={alertdialog => this.alertDialogInstance = alertdialog} 
          open={this.dialogOpen.bind(this)} 
          close={this.dialogClose.bind(this)}
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
          `}
        </style>
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
    if (this.props.to.length === 0 ){
      this.setState({ hideAlertDialog: true });
    } else if ( this.props.attachments.length === 0 
      && (this.state.certificationType === 'open_document' || this.state.certificationType === 'open_every_document' || this.state.certificationType === 'download_document' || this.state.certificationType === 'download_every_document')){
        this.setState({hideAlertDialog: true})
    } 
    else if (this.bigAttachments()){
      this.setState({ hideAlertDialog: true});
    }
    else {
      if (this.headerFormRef.current.reportValidity()) {
        // Get content directly from editor, state content may not contain latest changes
        const content = this.getEditor().getContent();
        const { to, cc, subject } = this.props;
        const { lefebvre } = this.props;
        const userBranding = (lefebvre && lefebvre.userBrandings && lefebvre.userBrandings.certifiedEmail) 
          ? lefebvre.userBrandings.certifiedEmail.find((b) => b.app === lefebvre.userApp) 
          : '';
          
        let guid = lefebvre.guid;
        if (guid === null) {
          guid = uuid();
        }
  
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
          this.callApis(
            to,
            cc,
            subject,
            content.innerHTML,
            this.props.attachments,
            lefebvre.userId,
            guid,
            this.state.certificationType,
            userBranding
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

  buildDocumentsInfo(email) {
    let result;
    debugger;
    result = (email && email.certificates) 
      ? email.certificates.map((c) => {
          return {
            email: c.email,
            name: c.name,
            externalId: c.id,
            document: (c.file)
              ? {
                externalFileName: c.file.name,
                internalInfo: ( this.props.lefebvre && this.props.lefebvre.idDocuments ) 
                  ? this.props.lefebvre.idDocuments.find((d) =>{
                    if (d.docName.replace(/[)( ]/g, '_') === c.file.name) {
                      return {
                        docId: d.docId,
                        docName: d.docName 
                      }
                    }
                  })
                  : null
              }
              : null
          }
        })
      : null

    return result;
  }

  callApis(
    recipients,
    cc,
    subject,
    content,
    files,
    userId,
    guid,
    type,
    userBrandingId
  ) {
    const { lefebvre } = this.props;
    this.setState({isCallApis: true});
    createEmail(
      recipients,
      cc,
      subject,
      content,
      files,
      userId,
      guid,
      type,
      userBrandingId.externalId,
      this.props.credentials.encrypted
    ).then((emailInfo) => {
      console.log(emailInfo);
      if (emailInfo.status_code) {
        console.log('Se ha producido un error: ' + emailInfo.status_code + '-' + emailInfo.message);
      } else {
        getUserEmails(userId).then((userInfo) => {
          var documentsInfo = this.buildDocumentsInfo(emailInfo);
          debugger;
          console.log('Insertando sólo email');
          addOrUpdateEmail(
            userId,
            emailInfo.id,
            guid,
            lefebvre.userApp,
            emailInfo.created_at,
            type,
            documentsInfo
          );
          //}
          // decAvailableSignatures(userId)
          // .then(res => this.props.setAvailableSignatures(res.data))

          let idUserApp = lefebvre.idUserApp;
          let numDocs = documentsInfo.length;
          
          this.props.setMailContacts(null);
          this.props.setAdminContacts(null);
          this.props.setUserApp('lefebvre');
          this.props.setGuid(null);
          //this.props.setTitle('');
          this.props.setIdDocuments(null);
          this.props.close(this.props.application);
          this.props.preloadEmails(lefebvre.userId);
          this.props.setTitle(i18n.t('topBar.certifiedEmail'));
          this.props.setSelectedService('certifiedEmail'); 
          this.props.setSignaturesFilterKey('Mostrar todas');
          
          notifySignature(
            lefebvre.userId,
            idUserApp,
            numDocs
          );
          getNumAvailableSignatures(idUserApp)
            .then( res => this.props.setNumAvailableSignatures(parseInt(res.data)))
            .catch(err => {
                console.log(err);
            });
        });
      }
      this.setState({isCallApis: false});
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

  /**
   * Moves an address from the address list under the field matching the fromId to the address field
   * matching the toId.
   *
   * @param fromId
   * @param toId
   * @param address
   */
  moveAddress(fromId, toId, address, name) {
    const updatedMessage = { ...this.props.editedMessage };
    const addressData = {address: address, name: name}
    // Remove
    updatedMessage[fromId].splice(updatedMessage[fromId].indexOf(address), 1);
    // Add
    updatedMessage[toId] = [...updatedMessage[toId], addressData];
    this.props.editMessage(updatedMessage);
  }

  onSubjectChange(event) {
    const target = event.target;
    const updatedMessage = { ...this.props.editedMessage };
    this.props.editMessage({ ...updatedMessage, subject: target.value });
  }

  onDrop(event) {
    event.preventDefault();
    event.stopPropagation();

    this.setState({ dropZoneActive: false })
    
    const addAttachment = (file, dataUrl) => {
       const fileType = file.name.split('.');
        if(fileType[1] == 'pdf' || fileType[1] == 'docx' 
        || fileType[1] == 'doc') {

          const newAttachment = {
            fileName: file.name,
            size: file.size,
            contentType: file.type,
            content: dataUrl.currentTarget.result.replace(
                /^data:[^;]*;base64,/,
                ''
            ),
            };

          if (fileType[1] === 'pdf'){
            const pdfjsLib = require('pdfjs-dist');
            pdfjsLib.GlobalWorkerOptions.workerSrc = '../../../../assets/scripts/pdf.worker.js'

            pdfjsLib.getDocument({data: atob(newAttachment.content)})
            .promise.then(doc => {
              var numPages = doc.numPages;
              newAttachment.pages = numPages;
              console.log('# Document Loaded');
              console.log('Number of Pages: ' + numPages);

              const updatedMessage = { ...this.props.editedMessage };
              updatedMessage.attachments = updatedMessage.attachments
                  ? [...updatedMessage.attachments, newAttachment]
                  : [newAttachment];
              this.props.editMessage(updatedMessage);
            });
          } else {
            const updatedMessage = { ...this.props.editedMessage };

            updatedMessage.attachments = updatedMessage.attachments
                ? [...updatedMessage.attachments, newAttachment]
                : [newAttachment];
            this.props.editMessage(updatedMessage);
          }
        } else {
            this.setState({isFileType: true});
            console.log('tipo de archivo invalido!');
        }
       
    };
    if (this.props.editedMessage.attachments.length === 0){
      let file = event.dataTransfer.files[event.dataTransfer.files.length-1];
      //Array.from(event.dataTransfer.files).forEach((file) => {
        const fileReader = new FileReader();
        fileReader.onload = addAttachment.bind(this, file);
        fileReader.readAsDataURL(file);
        this.setState({isFileType: false});
      //});
    }
    
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

EmailMessageEditor.propTypes = {
  className: PropTypes.string,
  t: PropTypes.func.isRequired,
};

EmailMessageEditor.defaultProps = {
  className: '',
};

const mapStateToProps = (state) => ({
  application: state.application,
  credentials: getCredentials(state),
  editedMessage: state.application.newMessage,
  sendingType: state.application.newMessage.sendingType,
  to: state.application.newMessage.to,
  cc: state.application.newMessage.cc,
  bcc: state.application.newMessage.bcc,
  attachments: state.application.newMessage.attachments,
  subject: state.application.newMessage.subject,
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
  setTitle: title => dispatch(setTitle(title)),
  setUserApp: app => dispatch(ACTIONS.setUserApp(app)),
  setAdminContacts: contacts => dispatch(ACTIONS.setAdminContacts(contacts)),
  setIdDocuments: id => dispatch(ACTIONS.setIdDocuments(id)),
  preloadEmails: (userId, auth) => preloadEmails(dispatch, userId, auth),
  setSelectedService: selectService  => dispatch(setSelectedService(selectService)),
  setSignaturesFilterKey: key => dispatch(setSignaturesFilterKey(key))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(translate()(EmailMessageEditor));