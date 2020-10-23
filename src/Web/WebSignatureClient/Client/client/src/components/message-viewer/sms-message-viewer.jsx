import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { selectFolder } from '../../actions/application';
import { clearSelectedMessage, getCredentials } from '../../services/application';
import { getSelectedFolder } from '../../selectors/folders';
import mainCss from '../../styles/main.scss';
import styles from './message-viewer.scss';
import ACTIONS from "../../actions/lefebvre";
import materialize from '../../styles/signature/materialize.scss';
import { 
   cancelSignature,
   cancelSignature2 
} from "../../services/api-signaturit";
import SignatureList from './signature-list/signature-list';
import Details from './details/details';
import { NOT_BOOTSTRAPPED } from 'single-spa';
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
    };
    this.dialogClose = this.dialogClose.bind(this);
    this.dialogOpen = this.dialogOpen.bind(this);

    //Sin firmas 
    this.animationSettings = { effect: 'None' };
    // this.alertButtonRef = element => {
    //   this.alertButtonEle = element;
    // };
    this.alertButtons = [{
      // Click the footer buttons to hide the Dialog
      click: () => {
          this.setState({ hideAlertDialog: false });
      },
      buttonModel: { content: 'Aceptar', isPrimary: true }
    }];

    // this.confirmButtonRef = element => {
    //   this.confirmButtonEle = element;
    // };
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

  getDocuments(signature){
    var lookup = {};
    var items = signature.documents;
    var result = [];

    for (var item, i = 0; item = items[i++];) {
      var name = item.file.name;

      if (!(name in lookup)) {
        lookup[name] = 1;
        result.push(name);
      }
    }
    return result;
  }

  getSigners(signature){
    var lookup = {};
    var items = signature.documents;
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

  onCancelSignature(signatureId, auth){
    this.setState({ hideConfirmDialog: true, signatureId: signatureId, auth: auth });
    //cancelSignature2(signatureId, auth);
  }

  onCancelSignatureOk(){
    const signatureId = this.state.signatureId;
    const auth = this.state.auth;

    cancelSignature2(signatureId, auth)
    .then(() => {
      this.setState({ hideAlertDialog2: true, signatureId: '', auth: '' });
      this.props.setUserApp('lefebvre');
      this.props.setGuid(null);
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

  dialogOpen(instance){
    switch (instance) {
      case "alertDialog":
        (this.alertDialogInstance) ? this.alertDialogInstance.cssClass = 'e-fixed' : null;   
        break;
      case "confirmDialog":
        (this.confirmDialogInstance) ? this.confirmDialogInstance.cssClass = 'e-fixed' : null;
        break;
      default:
        break;
    }
  }

  getDaysBetweenDates(date1, date2) {
   
    // To calculate the time difference of two dates 
    var Difference_In_Time = date2.getTime() - date1.getTime(); 
    
    // To calculate the no. of days between two dates 
    var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24); 
  
    return Math.round(Difference_In_Days);
  }


  render() {
    const signature = this.props.selectedSignature;
    let status;
    let status_style;
    const contenido = `
    <span class="lf-icon-check-round" style="font-size:100px; padding: 15px;"></span>
    <div style='text-align: justify; text-justify: inter-word; align-self: center;
    padding-left: 20px;'>
      ${i18n.t('reminderSentModal.text') + ' ' 
      + this.state.signer + '.'}
    </div>`;

    const contenido2 = `
    <span class="lf-icon-check-round" style="font-size:100px; padding: 15px;"></span>
    <div style='text-align: justify; text-justify: inter-word; align-self: center;
    padding-left: 20px;'>
      ${i18n.t('cancelledSignatureModal.text')}
    </div>`;

    const contenido3 = `
    <span class="lf-icon-question" style="font-size:100px; padding: 15px;"></span>
    <div style='text-align: justify; text-justify: inter-word; align-self: center;
    padding-left: 20px;'>
      ${i18n.t('cancelConfirmationModal.text2')}
    </div>`;

    
    switch (signature.status) {
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
         detail={signature}
         getSigners={this.getSigners}
         service={'signature'}
        />
        <div className={styles.clearfix}></div>
        <div className={`${materialize.row} ${styles['mT20']}`}>    
            <div className={`${materialize.col} ${materialize['l8']} left`}>
              {signature.documents.map((signer, index) => {
              return (
                <SignatureList 
                 signer={signer}
                 signatureId={signature.id}
                 index={index}
                 key={signer.id}
                 styles={styles}
                 getEventDate={this.getEventDate}
                 getEventStatus={this.getEventStatus}
                 getSingleEventDate={this.getSingleEventDate}
                 auth={this.props.auth}
                ></SignatureList>            
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
          content={(this.state.hideAlertDialog) ? contenido : contenido2}//'Lo sentimos has agotado el número máximo de firmas contratadas. Si lo deseas, puedes contactar con nuestro departamento de atención a cliente en el teléfono 911231231 o pinchando aquí' 
          ref={alertdialog => this.alertDialogInstance = alertdialog} 
          //target='#target' 
          //buttons={this.alertButtons} 
          open={this.dialogOpen("infoDialog")} 
          close={this.dialogClose}
          showCloseIcon={true}
          //position={ this.position }
        ></DialogComponent>
        <DialogComponent 
          id="confirmDialog" 
          header=' ' 
          visible={this.state.hideConfirmDialog} 
          showCloseIcon={true} 
          animationSettings={this.animationSettings} 
          width='60%'
          content={contenido3} 
          ref={dialog => this.confirmDialogInstance = dialog} 
          //target='#target' 
          buttons={this.confirmButtons} 
          open={this.dialogOpen("confirmDialog")} 
          close={this.dialogClose}
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
          
          `}
        </style>
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
    currentFolder: getSelectedFolder(state) || {},
    selectedMessage: state.application.selectedMessage,
    selectedMessages: state.messages.selectedMessages,
    lefebvre: state.lefebvre,
    login: state.login,
    credentials: state.application.user.credentials,
    selectedSignature: state.application.selectedSignature,
    auth: state.application.user.credentials.encrypted
  }
};

const mapDispatchToProps = dispatch => ({
  showFolder: folder => {
    clearSelectedMessage(dispatch);
    dispatch(selectFolder(folder));
  },
  // setCaseFile: casefile => dispatch(ACTIONS.setCaseFile(casefile)),
  resetIdEmail: () => dispatch(ACTIONS.resetIdEmail()),
  setUserApp: app => dispatch(ACTIONS.setUserApp(app)),
  setGuid: guid => dispatch(ACTIONS.setGUID(guid))
});

export default connect(mapStateToProps, mapDispatchToProps)(SmsMessageViewer);
