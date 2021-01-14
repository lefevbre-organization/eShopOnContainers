import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { selectFolder } from '../../actions/application';
import { clearSelectedMessage } from '../../services/application';
import moment from 'moment'
import styles from './email-message-viewer.scss';
import materialize from '../../styles/signature/materialize.scss';
import {  
  downloadSmsCertificationDocument,
  cancelSignature2 
} from "../../services/api-signaturit";
import SmsList from './sms-list/sms-list';
import Details from './details/details';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import i18n from 'i18next';

export class SmsMessageViewer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hideAlertDialog: false,
      hideAlertDialog2: false,
      hideConfirmDialog: false,
      signatureId: '',
      auth: '',
      signer: 0,
      filterCertificates: []
    };
    this.dialogClose = this.dialogClose;
    this.dialogOpen = this.dialogOpen;

    //Sin firmas 
    this.animationSettings = { effect: 'None' };
    this.alertButtons = [{
      // Click the footer buttons to hide the Dialog
      click: () => {
          this.setState({ hideAlertDialog: false });
      },
      buttonModel: { content: 'Aceptar', isPrimary: true }
    }];

    this.confirmButtons = [{
        click: () => {
            this.setState({ hideConfirmDialog: false });
        },
        buttonModel: { content: 'No', cssClass: 'btn-modal-close' }
      }, 
      {
        click: () => {
          this.setState({ hideConfirmDialog: false });
          this.onCancelSignatureOk();
        },
        buttonModel: { content: 'Si', isPrimary: true }
      }];
  }

  componentDidMount() {
    let filter = [];
    const sms = this.props.selectedSms;
    sms.certificates.forEach(certificate => {
      let index = filter.findIndex(x => (x.phone === certificate.phone));
      if (index === -1){
        filter.push(certificate);
      } else if (filter[index].events.length < certificate.events.length){
        // This is to assure we pick the node that contains all the events because certification_completed is present only in one node
        filter[index] = certificate;
      }
    });
    this.setState({filterCertificates: filter});
  }

  componentDidUpdate(prevProps){
    if (JSON.stringify(this.props.selectedSms) !== JSON.stringify(prevProps.selectedSms)){
      let filter = [];
      this.props.selectedSms.certificates.forEach(certificate => {
        let index = filter.findIndex(x => (x.phone === certificate.phone));
        if (index === -1){
          filter.push(certificate);
        } else if (filter[index].events.length < certificate.events.length){
          // This is to assure we pick the node that contains all the events because certification_completed is present only in one node
          filter[index] = certificate;
        }
      });
      this.setState({filterCertificates: filter});
    }

  }

  getDocments(selectedSms, documents) {
    var counter = [];
    let findRes;
    var certificationType = selectedSms.data.find(d => d.key === 'certification_type');
    certificationType = ( certificationType === null || certificationType === undefined) ? {key: 'certification_type', value: 'open_every_document'} : certificationType
    documents.forEach(doc => {
      if (certificationType.value === 'open_document'){
        findRes = doc.events.find(d => d.type.toLowerCase() === 'documents_opened');
      } else if (certificationType.value === 'open_every_document') {
        findRes = doc.events.find(d => d.type.toLowerCase() === 'document_opened');
      }
      
      (findRes) ? counter.push(findRes) : null;
    })
    
    
   console.log('getDocments', counter.length);
   return (counter) ? counter.length : 0;
  }
  

  getReceiverEvent(receiver) {
    console.log('getReceiverEvent', receiver);
    switch (receiver) {
      case 'delivery':
        return (i18n.t('smsViewer.smsDelivered'));

      case 'open_email': 
        return (i18n.t('smsViewer.smsOpened'));

      case 'open_document': 
      return (i18n.t('smsViewer.docOpened'));

      case 'open_every_document': 
      return (i18n.t('smsViewer.openEveryDocument'));

      case 'download_document': 
      return (i18n.t('smsViewer.docDownloaded'));

      case 'download_every_document': 
      return (i18n.t('smsViewer.downloadEveryDocument'));
      
      default:
        return (i18n.t('smsViewer.emailDelivered'));
    }
  }

  getEventStatus(signer, ev){
    let result;
    console.log({signer});
    console.log({ev});
    result = signer.events.some( e => (e.type.toLowerCase() === ev))
    console.log(result);
    return (result)
  }

  getEventDate(signer, ev){
    const eventos = signer.events;
    let evDate = '';
    let res = '-';
    eventos.some( (e) => {
      if (e.type === ev){
        evDate = e.created_at
      }
    })
    if (evDate !==''){
      res = moment(evDate).locale(navigator.language).format('L LTS');
    }
    return res;
  }

  getSingleEventDate(event, ev){
    let evDate = '';
    let res = '-';
   
    if (event.type === ev){
      evDate = event.created_at
    }

    if (evDate !==''){
      res = moment(evDate).locale(navigator.language).format('L LTS');
    }
    return res;
  }

  getFiles(email) {
    var lookup = {};
    var items = email.certificates;
    var result = [];

    for (var item, i = 0; item = items[i++];) {
      var name = item.file.name;

      if (!(name in lookup)) {
        lookup[name] = 1;
        result.push(
          {
              text:  name,
         
          }
      )  ;
      }
    }
    return result;
  }

  getRecipients(sms){
    var lookup = {};
    var items = sms.certificates;
    var result = [];

    for (var item, i = 0; item = items[i++];) {
      var name = item.phone;

      if (!(name in lookup)) {
        lookup[name] = 1;
        result.push({ text: name });
      }
    }
    return result;
  }

  downloadTrailDocument(smsId, id, name, auth) {
    downloadSmsCertificationDocument(smsId, id, name, auth);
  }

  onCancelSignature(signatureId, auth){
    this.setState({ hideConfirmDialog: true, signatureId: signatureId, auth: auth });
  }

  onCancelSignatureOk(){
    const signatureId = this.state.signatureId;
    const auth = this.state.auth;

    cancelSignature2(signatureId, auth)
    .then(() => {
      this.setState({ hideAlertDialog2: true, signatureId: '', auth: '' });
    })
    .catch(() => {
      this.setState({ hideAlertDialog2: true, signatureId: '', auth: '' });
    });
  }

  dialogClose(){
    this.setState({
      hideAlertDialog: false,
      hideConfirmDialog: false,
      hideAlertDialog2: false
  });
  }

  dialogOpen(){
    this.alertDialogInstance.cssClass = 'e-fixed';
  }

  render() {
    const sms = this.props.selectedSms;

    let status;
    let status_style;
   
    const contenido = `
    <span class="lf-icon-check-round modal-icon-content"></span>
    <div class="modal-text-content">
      ${i18n.t('cancelledSignatureModal.text')}
    </div>`;

    const contenido1 = `
    <span class="lf-icon-question modal-icon-content"></span>
    <div class="modal-text-content">
      ${i18n.t('cancelConfirmationModal.text2')}
    </div>`;

   
    let smsConfig = sms.data.find(x => x.key === "additional_info");
    let certificationType = sms.data.find(x => x.key === "certification_type" || x.key === "type");

    switch (sms.status) {
      case 'completed':
        status = i18n.t('signaturesGrid.statusCompleted');
        status_style = 'completada'
        break;
      case 'ready':
        status = i18n.t('signaturesGrid.statusInProgress');
        status_style = 'en-progreso'
        break;
      case 'error':
        status = i18n.t('signaturesGrid.statusError');
        status_style = 'cancelada';
        break;
      case 'pending':
        status = i18n.t('signaturesGrid.statusPending');
        status_style = 'en-progreso';
        break;
      default:
        break;
    }

    return (
      <div className={`col l9 ${styles['contenido-central']}`}>
      <div className={styles['cont-progreso-peticion-firma']}>
        <Details 
         styles={styles}
         status_style={status_style}
         status={status}
         detail={sms}
         getSigners={this.getRecipients}
         getFiles={this.getFiles}
         service={'sms'}
        />
        <div className={styles.clearfix}></div>
        <div className={`${materialize.row} ${styles['mT20']}`}>
            <div className={`${materialize.col} ${materialize['l12']} left`}>
              {this.state.filterCertificates.map((signer, index) => {
              return (
                <SmsList 
                 signer={signer}
                 signatureConfig={smsConfig ? smsConfig.value.split('|')[index].split(':') : null}
                 smsId={sms.id}
                 sms={sms}
                 index={index}
                 key={signer.id}
                 styles={styles}
                 getReceiverEvent={this.getReceiverEvent}
                 certificationType={certificationType}
                 getDocments={this.getDocments}
                 getEventDate={this.getEventDate}
                 getEventStatus={this.getEventStatus}
                 getSingleEventDate={this.getSingleEventDate}
                 downloadTrailDocument={this.downloadTrailDocument}
                 auth={this.props.auth}
                ></SmsList>            
                )
              })}
            </div>
            <div className={styles.clearfix}></div>
        </div>
      </div>
      <DialogComponent 
          id="infoDialog" 
          //header=' ' 
          visible={this.state.hideAlertDialog || this.state.hideAlertDialog2} 
          animationSettings={this.animationSettings} 
          width='60%' 
          content={contenido}
          ref={alertdialog => this.alertDialogInstance = alertdialog} 
          open={this.dialogOpen.bind(this)} 
          close={this.dialogClose.bind(this)}
          showCloseIcon={true}
        ></DialogComponent>
        <DialogComponent 
          id="confirmDialog" 
          header=' ' 
          visible={this.state.hideConfirmDialog} 
          showCloseIcon={true} 
          animationSettings={this.animationSettings} 
          width='60%'
          content={contenido1} 
          ref={dialog => this.confirmDialogInstance = dialog} 
          buttons={this.confirmButtons} 
          open={() => this.dialogOpen} 
          close={() => this.dialogClose}
        ></DialogComponent>
      </div>
      );
  }

  onFolderClick(folder) {
    this.props.showFolder(folder);
  }
}

SmsMessageViewer.propTypes = {
  refreshMessageActiveRequests: PropTypes.number,
  selectedMessage: PropTypes.object,
  className: PropTypes.string
};

SmsMessageViewer.defaultProps = {
  className: ''
};

const mapStateToProps = state => {
  return {
    refreshMessageActiveRequests: state.application.refreshMessageActiveRequests,
    selectedMessage: state.application.selectedMessage,
    selectedMessages: state.messages.selectedMessages,
    lefebvre: state.lefebvre,
    login: state.login,
    credentials: state.application.user.credentials,
    selectedSms: state.application.selectedSms,
    auth: state.application.user.credentials.encrypted
  }
};

const mapDispatchToProps = dispatch => ({
  showFolder: folder => {
    clearSelectedMessage(dispatch);
    dispatch(selectFolder(folder));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(SmsMessageViewer);
