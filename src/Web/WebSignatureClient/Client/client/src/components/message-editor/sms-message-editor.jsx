import React, { Component } from 'react';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import PropTypes from 'prop-types';
import HeaderAddress from './header-address';
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
  createSms,
  
  addOrUpdateSms,
  getUserSms,
  notifySignature,
  cancelSignatureCen,
  preloadSms,
  getNumAvailableSignatures,
  notifyCen
} from '../../services/api-signaturit';
import * as uuid from 'uuid/v4';
import { getFileType } from '../../services/mimeType';
import  AttachmentsWidget  from './widgets/attachments-widget2';
import  CertificatesWidget  from './widgets/certificates-widget';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import RolSelector from './rol-selector/rol-selector';

class SmsMessageEditor extends Component {
  constructor(props) {
    console.log('Entra en el sms-message-editor');
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
    // Global events
    this.handleOnDrop = this.onDrop.bind(this);
    this.handleOnDragOver = this.onDragOver.bind(this);
    this.handleOnDragLeave = this.onDragLeave.bind(this);
    // Header Address Events
    this.handleAddAddress = this.addAddress.bind(this);
    this.handleRemoveAddress = this.removeAddress.bind(this);
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
    this.dialogClose = this.dialogClose.bind(this);
    this.dialogOpen = this.dialogOpen.bind(this);
    this.animationSettings = { effect: 'None' };
    this.handleNumPagesOption = this.handleNumPagesOption.bind(this);
    this.showCancelCenModal = this.showCancelCenModal.bind(this);
    this.getRoleInfo = this.getRoleInfo.bind(this);
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
      certificationType: selectedOptions.length > 0 ? selectedOptions[max-1].certificate : 'delivery'
    })
  }

  showCancelCenModal(){
    this.setState({ hideConfirmDialog: true});
  }

  handleNumPagesOption(option){
    console.log('Se cambia el numpages, option:' + option);
    this.setState({numPagesOption: option});
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
        guid =  uuid();
      }

      this.callApis(
        recipients,
        content.innerHTML,
        lefebvre.userId,
        guid,
        (userBranding && userBranding.externalId) ? userBranding.externalId : ''
      );
    }
  }
  

  dialogClose(){
  	if (this.state.centinelaDownloadError === true){
      	this.props.onShowError();
  	}
    this.setState({
        hideAlertDialog: false, 
        hideConfirmDialog: false, 
        bigAttachments: false, 
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
    
    this.setState({isContacts: this.props.lefebvre.roles.some(e => e === 'Centinela')});
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
    
    const confirmDiscard = `
      <span class="lf-icon-question modal-icon-content"></span>
      <div class="modal-text-content">
        ${i18n.t('cancelCentinelaConfirmation.text')}
      </div>
    `;

    // console.log(mustHaveAttachments);
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

    const {certificationType} = this.state; 

    if (certificationType === "delivery" && application.newMessage.attachments.length > 0) {
      const updatedMessage = { ...this.props.editedMessage };
      updatedMessage.attachments = [];
      this.props.editMessage(updatedMessage);
    }

    console.log(content);

    return (
      <div
        className={`${className} ${styles['message-editor']}`}
        onDrop={this.handleOnDrop}
        onDragOver={this.handleOnDragOver}
        onDragLeave={this.handleOnDragLeave}
        id='sms-message-editor'>
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
              sendingType={sendingType}
            />
            <label>{`${i18n.t('messageEditor.smsCharCounter').replace('#char', this.state.certificationType === 'delivery' ? 100 : 100)}`}</label>
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
              caller={'sms'}
              certType={this.state.certificationType}
            />
          </div>
          <div className={styles['side-container']}>

            <AttachmentsWidget 
              sendingType={sendingType}
              certificationType={certificationType}
              onConfirmAttachRemoval={this.showCancelCenModal}
              isFileTypeDrop={this.state.isFileType}
              resetIsFileDrop={this.resetIsFileDrop}
              fatherContainer={'SmsMessageEditor'}
            ></AttachmentsWidget>
            <CertificatesWidget 
              sendingType={sendingType}
              userApp={lefebvre.userApp}
              onChange={this.onChangeCertification}
            />
          </div>
          {/* {`${(this.props.application.newMessage && this.props.application.newMessage.content && this.props.application.newMessage.content.length) ? this.props.application.newMessage.content.length : 0}/120`} */}
          <div className={styles['action-buttons-sms']}>
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
          visible={this.state.hideAlertDialog || this.state.centinelaDownloadError} 
          animationSettings={this.animationSettings} 
          //width='60%' 
          //content={(this.state.centinelaDownloadError === true ? attachNotFound : (this.props.attachments.length === 0 && mustHaveAttachments ? noAttachmentsModalCertification : (this.state.bigAttachments ? bigFileModal : (onlyPdf) ? onlyPdfModal : (content && content.length > 120 && this.props.attachments.length === 0) ? maxCharacters : (content && content.length > 100 && this.props.attachments.length > 0) ? maxCharactersFile : noSignersModal)))}
          content={this.getModalContent()}
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
        {/* <style jsx global>
          {` 
            #toolsRTE_2_toolbar {
              display: none;
            }          
          `}
        </style> */}
      </div>
    );
  }

  getModalContent(){
    const onlyPdf = ( 
      (this.state.certificationType === 'open_document' || this.state.certificationType === 'open_every_document')
      && this.props.application.newMessage.attachments.some(a => a.contentType.toUpperCase() !== 'APPLICATION/PDF')
    )

    const mustHaveAttachments = (
      (this.state.certificationType === 'open_document' || this.state.certificationType === 'open_every_document')
    )

    const wrongPhone = this.validPhoneNumbers(this.props.to).desc;

    const noSignersModal = `
      <span class="lf-icon-information modal-icon-content"></span>
      <div class="modal-text-content">
        ${i18n.t('noSignersModal.text')}
      </div>`;

    const noAttachmentsModalCertification = `
      <span class="lf-icon-information modal-icon-content"></span>
      <div class="modal-text-content">
        ${i18n.t('noAttachmentsModalCertification.text')}
      </div>`;

    const noAttachModal = `
      <span class="lf-icon-information modal-icon-content"></span>
      <div class="modal-text-content">
        ${i18n.t('noAttachmentsModal.text')}
      </div>`;

    const maxCharacters = `
    <span class="lf-icon-information modal-icon-content"></span>
    <div class="modal-text-content">
      ${i18n.t('maxCharactersModal.text')}
    </div>`;

    const maxCharactersFile = `
    <span class="lf-icon-information modal-icon-content"></span>
    <div class="modal-text-content">
      ${i18n.t('maxCharactersModal.text2')}
    </div>`;

    const bigFileModal = `
      <span class="lf-icon-information modal-icon-content"></span>
      <div class="modal-text-content">
        ${i18n.t('bigFileModal.text')}
      </div>
    `;

    const attachNotFound = `
      <span class="lf-icon-information modal-icon-content"></span>
      <div class="modal-text-content">
        ${i18n.t('attachNotFoundCentinela.text')}
      </div>
    `;

    const onlyPdfModal = `
      <span class="lf-icon-information modal-icon-content"></span>
      <div class="modal-text-content">
        ${i18n.t('onlyPdfModal.text')}
      </div>
    `;

    const prefixModal = `
      <span class="lf-icon-information modal-icon-content"></span>
      <div class="modal-text-content">
        ${i18n.t('prefixModal.text')}
      </div>
    `;

    const numberModal = `
      <span class="lf-icon-information modal-icon-content"></span>
      <div class="modal-text-content">
        ${i18n.t('numberModal.text')}
      </div>
    `;


    if (this.state.centinelaDownloadError === true){
      return attachNotFound;
    } else if(this.props.attachments.length === 0 && mustHaveAttachments){
      return noAttachmentsModalCertification;
    } else if (this.state.bigAttachments){
      return bigFileModal;
    } else if (onlyPdf){
      return onlyPdfModal;
    } else if (this.props.content && this.strip(this.props.content).length > 100 && this.props.attachments.length === 0){
      return maxCharacters;
    } else if (this.props.content && this.strip(this.props.content).length > 100 && this.props.attachments.length > 0){
      return maxCharactersFile;
    } else if (wrongPhone === 'WrongPrefix'){
      return prefixModal;
    } else if (wrongPhone === 'WrongNumber'){
      return numberModal;
    } else {
      return noSignersModal;
    }
    // (this.state.centinelaDownloadError === true 
    //   ? attachNotFound : (this.props.attachments.length === 0 && mustHaveAttachments 
    //     ? noAttachmentsModalCertification : (this.state.bigAttachments 
    //       ? bigFileModal : (onlyPdf) 
    //       ? onlyPdfModal : (content && content.length > 120 && this.props.attachments.length === 0) 
    //       ? maxCharacters : (content && content.length > 100 && this.props.attachments.length > 0) 
    //       ? maxCharactersFile : noSignersModal)))
  }

  strip(html){
    let doc = new DOMParser().parseFromString(html, 'text/html');
    return (doc.body.textContent === null || doc.body.textContent === 'null') ? "" : doc.body.textContent;
 }

  bigAttachments(){
    let maxSize = 15000000;
    let totalSize = 0
    this.props.attachments.map(attachment => totalSize = totalSize + attachment.size);
    return (totalSize >= maxSize);
  }

  validPhoneNumbers(to){
    let res = {valid: true, desc: 'Ok', phones: []};
    to.forEach(recipient => {
      let phone = (recipient && recipient.address && recipient.address.includes('@')) ? recipient.address.split(' ')[1] : recipient.address;
      let prefix = phone.substring(0,3);
      let number = phone.substring(3, phone.length);
      let isNum = /^\d+$/.test(number);
      let phoneLength = phone.length;

      if (!isNum) {
        res = {valid: false, desc: 'WrongNumber', phones: []};
      }
      else if (prefix.substring(0,1) === '+' && prefix !== '+34'){
        res = {valid: false, desc: 'WrongPrefix', phones: []};
      }
      else if (prefix.substring(0,4) === '0034' && phoneLength !== 13){
        res = {valid: false, desc: 'WrongNumber', phones: []};
      }
      else if (!prefix.substring(0,1) === '+' && phoneLength !== 9){
        res = {valid: false, desc: 'WrongNumber', phones: []};
      }

      if (res.valid){
        if (isNum && phoneLength === 9){
          res.phones.push({originalPhone: phone, normalizedPhone: `+34${phone}`, cleanPhone: phone});
        }
        else if (phoneLength === 12 && prefix === '+34'){
          res.phones.push({originalPhone: phone, normalizedPhone: phone, cleanPhone: phone.substring(3, 12)});
        }
        else if (phoneLength === 13 && prefix === '003'){
          res.phones.push({originalPhone: phone, normalizedPhone: `+34${phone.substring(4, 13)}`, cleanPhone: phone.substring(4, 13)});
        }
      }
    });
    return res;
  }

  submit() {
    let validPhoneNumbers = this.validPhoneNumbers(this.props.to);

    if (this.props.to.length === 0 ){
      this.setState({ hideAlertDialog: true });
    } else if (!validPhoneNumbers.valid) {
      this.setState({ hideAlertDialog: true });
    } else if (this.props.content && this.strip(this.props.content).length > 100 && this.props.attachments.length === 0){
      this.setState({ hideAlertDialog: true});
    } else if (this.props.content && this.strip(this.props.content).length > 100 && this.props.attachments.length > 0) {
      this.setState({ hideAlertDialog: true});
    } else if ( this.props.attachments.length === 0 
      && (this.state.certificationType === 'open_document' || this.state.certificationType === 'open_every_document' || this.state.certificationType === 'download_document' || this.state.certificationType === 'download_every_document')){
        this.setState({hideAlertDialog: true})
    } else if ( (this.state.certificationType === 'open_document' || this.state.certificationType === 'open_every_document' || this.state.certificationType === 'download_document' || this.state.certificationType === 'download_every_document')
      && this.props.application.newMessage.attachments.some(a => a.contentType.toUpperCase() !== 'APPLICATION/PDF')){
      this.setState({hideAlertDialog:true})
    } else if (this.bigAttachments()){
      this.setState({ hideAlertDialog: true});
    } else {
      if (this.headerFormRef.current.reportValidity()) {
        // Get content directly from editor, state content may not contain latest changes
        const content = this.getEditor().getContent();
        const { to } = this.props;
        const { lefebvre } = this.props;
          
        let guid = lefebvre.guid;
        if (guid === null) {
          guid = uuid();
        }
  
        if (this.props.attachments) {
          let attachmentsList = [];
          this.props.attachments.forEach((attachment) => {
            var file = new File([attachment.content], attachment.fileName, {
              type: getFileType(attachment.fileName),
              lastModified: new Date(),
            });
            attachmentsList.push({file: file, pages: attachment.pages});
            debugger;
          });
          this.callApis(
            to,
            content,
            this.props.attachments,
            lefebvre.userId,
            guid,
            this.state.certificationType,
            validPhoneNumbers.phones
          );
        }
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

  buildDocumentsInfo(sms) {
    let result;
    debugger;
    result = (sms && sms.certificates) 
      ? sms.certificates.map((c) => {
          return {
            phone: c.phone,
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
    content,
    files,
    userId,
    guid,
    type,
    validPhoneNumbers
  ) {
    const { lefebvre } = this.props;
    this.setState({isCallApis: true});
    createSms(
      recipients,
      content,
      files,
      userId,
      guid,
      type,
      this.props.credentials.encrypted,
      validPhoneNumbers
    ).then((smsInfo) => {
      console.log(smsInfo);
      if (smsInfo.status_code) {
        console.log('Se ha producido un error: ' + smsInfo.status_code + '-' + smsInfo.message);
      } else {
        getUserSms(userId).then((userInfo) => {
          var documentsInfo = this.buildDocumentsInfo(smsInfo);
          debugger;
          console.log('Insertando sólo sms');
          addOrUpdateSms(
            userId,
            smsInfo.id,
            guid,
            lefebvre.userApp,
            smsInfo.created_at,
            type,
            documentsInfo
          );
          //}
          // decAvailableSignatures(userId)
          // .then(res => this.props.setAvailableSignatures(res.data))

          let idUserApp = lefebvre.idUserApp;
          let numDocs = (documentsInfo && documentsInfo.length) ? documentsInfo.length : 0;
          
          this.props.setMailContacts(null);
          this.props.setAdminContacts(null);
          this.props.setUserApp('lefebvre');
          this.props.setGuid(null);
          //this.props.setTitle('');
          this.props.setIdDocuments(null);
          this.props.close(this.props.application);
          this.props.preloadSms(lefebvre.userId, this.props.application.user.credentials.encrypted);
          this.props.setTitle(i18n.t('topBar.certifiedSms'));
          this.props.setSelectedService('certifiedSms'); 
          this.props.setSignaturesFilterKey('Mostrar todas');
          
          notifySignature(
            lefebvre.userId,
            idUserApp,
            1
          );
          getNumAvailableSignatures(idUserApp)
            .then( res => this.props.setNumAvailableSignatures(parseInt(res.data)))
            .catch(err => {
                console.log(err);
            });
          if (lefebvre && lefebvre.userApp === 'centinela' && lefebvre.idDocuments){
            lefebvre.idDocuments.forEach(document => {
              notifyCen('certifiedSms', lefebvre.guid, document.docId, recipients)
              .catch(err => console.log(err));
            });
          } 
        });
      }
      this.setState({isCallApis: false, hideRolDialog: false});
    });
  }

  validateAddress(updatedMessage, id, address, name, email, phone) {
    const addressData = {address: address, name: name, email: email, phone: phone}
    if(updatedMessage.to.length == this.state.MaximumSigners) {
         console.log('Maximum Signers');
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
  addAddress(id, address, name, email, phone) {
    if (address.length > 0) {
      const updatedMessage = { ...this.props.editedMessage };
      const recipientRepeats = updatedMessage.to.some(data => {
      return (data.address === address);    
     });
   
     if(!recipientRepeats){
      this.validateAddress(updatedMessage, id, address, name, email, phone);
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
      // let file = event.dataTransfer.files[event.dataTransfer.files.length-1];
      Array.from(event.dataTransfer.files).forEach((file) => {
        const fileReader = new FileReader();
        fileReader.onload = addAttachment.bind(this, file);
        fileReader.readAsDataURL(file);
        this.setState({isFileType: false});
      });
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
  subject: state.application.newMessage.subject,
  attachments: state.application.newMessage.attachments,
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
  preloadSms: (userId, auth) => preloadSms(dispatch, userId, auth),
  setSelectedService: selectService  => dispatch(setSelectedService(selectService)),
  setSignaturesFilterKey: key => dispatch(setSignaturesFilterKey(key))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(translate()(SmsMessageEditor));