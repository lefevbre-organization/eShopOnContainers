import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { selectFolder } from '../../actions/application';
import { clearSelectedMessage, getCredentials } from '../../services/application';
import { getSelectedFolder } from '../../selectors/folders';
import mainCss from '../../styles/main.scss';
import styles from './email-message-viewer.scss';
import ACTIONS from "../../actions/lefebvre";
import materialize from '../../styles/signature/materialize.scss';
import { 
  downloadTrailDocument, 
  downloadTrailDocument2,
  cancelSignature,
  cancelSignature2 
} from "../../services/api-signaturit";
import EmailList from './email-list/email-list';
import Details from './details/details';
import { NOT_BOOTSTRAPPED } from 'single-spa';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import i18n from 'i18next';

export function addressGroups(address) {
  const ret = {
    name: '',
    email: ''
  };
  const formattedFrom = address.match(/^"(.*)"/);
  ret.name = formattedFrom !== null ? formattedFrom[1] : address;
  ret.email = formattedFrom !== null ? address.substring(formattedFrom[0].length).trim().replace(/[<>]/g, '') : '';
  return ret;
}

export const modalCancelOk = `
  <span class="lf-icon-check-round" style="font-size:100px; padding: 15px;"></span>
    <div style='text-align: justify; text-justify: inter-word; align-self: center;'>
      Petición cancelada correctamente.
    </div>
`;

export class EmailMessageViewer extends Component {
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
    const email = this.props.selectedEmail;
    const filter = email.certificates.filter((certificate, index, self) => 
      self.findIndex(x =>(x.email === certificate.email)) === index
    );
    this.setState({filterCertificates: filter});
  }


  getDocments(documents, ev) {
    var result = [];
    documents.forEach((document, i) => {
     var event = document.events.find( e => (e.type.toLowerCase() === ev))
      result.push(
        {
          type:  event.type,
       
        }
    )  ;
   });
   console.log('getDocments', result.length);
   return result;
  }
  

  getReceiverEvent(receiver) {
    console.log('getReceiverEvent', receiver);
    switch (receiver) {
      case 'delivery':
        return (i18n.t('emailViewer.emailDelivered'));

      case 'open_email': 
        return (i18n.t('emailViewer.emailOpened'));

      case 'open_document': 
      return (i18n.t('emailViewer.docOpened'));

      case 'open_every_document': 
      return (i18n.t('emailViewer.openEveryDocument'));

      case 'download_document': 
      return (i18n.t('emailViewer.docDownloaded'));

      case 'download_every_document': 
      return (i18n.t('emailViewer.downloadEveryDocument'));
      
      default:
        return (i18n.t('emailViewer.emailDelivered'));
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
      res = new Date(evDate).toLocaleString(navigator.language, {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      })
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
      res = new Date(evDate).toLocaleString(navigator.language, {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      })
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

  getRecipients(email){
    var lookup = {};
    var items = email.certificates;
    var result = [];

    for (var item, i = 0; item = items[i++];) {
      var name = item.email;

      if (!(name in lookup)) {
        lookup[name] = 1;
        result.push(name);
      }
    }
    return result;
  }

  downloadTrailDocument(emailId, id, name, auth) {
    downloadTrailDocument2(emailId, id, name, auth);
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
    const email = this.props.selectedEmail;

    let status;
    let status_style;
   
    const contenido = `
    <span class="lf-icon-check-round" style="font-size:100px; padding: 15px;"></span>
    <div style='text-align: justify; text-justify: inter-word; align-self: center;
    padding-left: 20px;'>
      ${i18n.t('cancelledSignatureModal.text')}
    </div>`;

    const contenido1 = `
    <span class="lf-icon-question" style="font-size:100px; padding: 15px;"></span>
    <div style='text-align: justify; text-justify: inter-word; align-self: center;
    padding-left: 20px;'>
      ${i18n.t('cancelConfirmationModal.text2')}
    </div>`;

   
    let emailConfig = email.data.find(x => x.key === "roles");
    let certificationType = email.data.find(x => x.key === "certification_type" || x.key === "type");

    switch (email.status) {
      case 'canceled':
        status = i18n.t('signaturesGrid.statusCancelled');
        status_style = 'cancelada';
        break;
      case 'declined':
        status = i18n.t('signaturesGrid.statusDeclined');
        status_style = 'cancelada';
        break;
      case 'expired':
        status = i18n.t('signaturesGrid.statusExpired');
        status_style = 'cancelada';
        break;      
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
         detail={email}
         getSigners={this.getRecipients}
         getFiles={this.getFiles}
         service={'email'}
        />
        <div className={styles.clearfix}></div>
        <div className={`${materialize.row} ${styles['mT20']}`}>
            <div className={`${materialize.col} ${materialize['l12']} left`}>
              {this.state.filterCertificates.map((signer, index) => {
              return (
                <EmailList 
                 signer={signer}
                 signatureConfig={emailConfig ? emailConfig.value.split('|')[index].split(':') : null}
                 emailId={email.id}
                 email={email}
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
                ></EmailList>            
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
        <style global jsx>
          {`
           #infoDialog, #confirmDialog{
            max-height: 927px;
            width: 300px;
            left: 770px;
            //top: 392.5px;
            z-index: 1001;
            //transform: translateY(+150%);
            }
            #confirmDialog_dialog-header, 
            #confirmDialog_title, 
            #confirmDialog_dialog-content, 
            .e-footer-content{
              background: #001970;
              color: #fff;
              display:flex;
              width: auto;
            }
            #infoDialog_dialog-header, 
            #infoDialog_title, #infoDialog_dialog-content, 
            .e-footer-content{
              background: #001970;
              color: #fff;
              display:flex;
            }
            #confirmDialog_dialog-header, 
            #confirmDialog_title, 
            #confirmDialog_dialog-content, 
            .e-footer-content{
              background: #001970;
              color: #fff;
              display:flex;
            }
            .e-btn.e-flat.e-primary {
              color: #fff !important;
            }
            .e-btn-icon .e-icon-dlg-close .e-icons{
              color: #fff;
            }
            .e-dialog .e-dlg-header-content .e-btn.e-dlg-closeicon-btn{
              margin-right: 0;
              margin-left: auto;
              color: #fff
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

            #infoDialog, .e-dialog .e-dlg-content {
              font-size: 17.5px !important;
            }

            .e-btn .e-btn-icon.e-icon-right, .e-css.e-btn .e-btn-icon.e-icon-right {
              display: none;
           }
          
          `}
        </style>
      </div>
      );
  }

  onFolderClick(folder) {
    this.props.showFolder(folder);
  }
}

EmailMessageViewer.propTypes = {
  refreshMessageActiveRequests: PropTypes.number,
  selectedMessage: PropTypes.object,
  className: PropTypes.string
};

EmailMessageViewer.defaultProps = {
  className: ''
};

const mapStateToProps = state => {
  return {
    refreshMessageActiveRequests: state.application.refreshMessageActiveRequests,
    currentFolder: getSelectedFolder(state) || {},
    selectedMessage: state.application.selectedMessage,
    selectedMessages: state.messages.selectedMessages,
    lefebvre: state.lefebvre,
    login: state.login,
    credentials: state.application.user.credentials,
    selectedEmail: state.application.selectedEmail,
    auth: state.application.user.credentials.encrypted
  }
};

const mapDispatchToProps = dispatch => ({
  showFolder: folder => {
    clearSelectedMessage(dispatch);
    dispatch(selectFolder(folder));
  },
  resetIdEmail: () => dispatch(ACTIONS.resetIdEmail()),
});

export default connect(mapStateToProps, mapDispatchToProps)(EmailMessageViewer);
