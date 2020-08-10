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
import { downloadSignedDocument,  downloadSignedDocument2, downloadTrailDocument, downloadTrailDocument2, sendReminder, sendReminder2, cancelSignature, cancelSignature2 } from "../../services/api-signaturit";
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

export const modalReminder = `
  <span class="lf-icon-check-round" style="font-size:100px; padding: 15px;"></span>
    <div style='text-align: justify; text-justify: inter-word; align-self: center;'>
      Se acaba de enviar un recordatorio.
    </div>
`;

export const modalCancelOk = `
  <span class="lf-icon-check-round" style="font-size:100px; padding: 15px;"></span>
    <div style='text-align: justify; text-justify: inter-word; align-self: center;'>
      Petición cancelada correctamente.
    </div>
`;



export class MessageViewer extends Component {
  constructor(props) {
    console.log('Entra en el MessageViewer');
    super(props);
    this.state = {
      hideAlertDialog: false,
      hideAlertDialog2: false,
      hideConfirmDialog: false,
      signatureId: '',
      auth: ''
    };
    this.dialogClose = this.dialogClose;
    this.dialogOpen = this.dialogOpen;

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
          this.onCancelSignatureOk();
      },
      buttonModel: { content: 'Si', isPrimary: true }
      },
      {
      click: () => {
          this.setState({ hideConfirmDialog: false });
      },
      buttonModel: { content: 'No', isPrimary: true }
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

  onSendReminder(signatureId, auth){
    this.setState({ hideAlertDialog: true });
    sendReminder2(signatureId, auth);
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

  getDaysBetweenDates(date1, date2) {
   
    // To calculate the time difference of two dates 
    var Difference_In_Time = date2.getTime() - date1.getTime(); 
    
    // To calculate the no. of days between two dates 
    var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24); 
  
    return Math.round(Difference_In_Days);
  }


  render() {
    console.log('Entra en el message viewer');
    const signature = this.props.selectedSignature;
    let status;
    let status_style;
    const contenido = `
    <span class="lf-icon-check-round" style="font-size:100px; padding: 15px;"></span>
    <div style='text-align: justify; text-justify: inter-word; align-self: center;'>
      ${i18n.t('reminderSentModal.text')}
    </div>`;

    const contenido2 = `
    <span class="lf-icon-check-round" style="font-size:100px; padding: 15px;"></span>
    <div style='text-align: justify; text-justify: inter-word; align-self: center;'>
      ${i18n.t('cancelledSignatureModal.text')}
    </div>`;

    const contenido3 = `
    <span class="lf-icon-question" style="font-size:100px; padding: 15px;"></span>
    <div style='text-align: justify; text-justify: inter-word; align-self: center;'>
      ${i18n.t('cancelConfirmationModal.text2')}
    </div>`;

    let reminderText;
    let expirationDays = signature.data.find(x => x.key === 'expiration');
    let expirationText = i18n.t('signatureViewer.widgets.expiration.doesntExpires');
    let passedTime =  this.getDaysBetweenDates(new Date(signature.created_at), new Date());
    let reminderConfig = signature.data.find(x => x.key === "reminders");
    let remindersSent = false;
    
    if (reminderConfig === undefined || reminderConfig === null){
      reminderText = i18n.t('signatureViewer.widgets.reminders.notConfigured');;
    } else {
      switch (reminderConfig.value) {
        case 'notConfigured':
          reminderText = i18n.t('signatureViewer.widgets.reminders.notConfigured');
          break;
        case 'Daily':
          reminderText = i18n.t('signatureViewer.widgets.reminders.daily');
          break;
        case 'Weekly':
          reminderText = i18n.t('signatureViewer.widgets.reminders.weekly');
          break;
        default:
          if (reminderConfig.value.startsWith('Custom')){
            reminderText = i18n.t('signatureViewer.widgets.reminders.everyXdays').replace('___', reminderConfig.value.split(':')[1]);
          } else {
            reminderText = i18n.t('signatureViewer.widgets.reminders.notConfigured');
          }
          break;
      }
    }
    
    if ((expirationDays && expirationDays.value === 0) || expirationDays === undefined || expirationDays.value === "notConfigured"){
      expirationText = i18n.t('signatureViewer.widgets.expiration.notConfigured');
    }
    else {
      expirationText = i18n.t('signatureViewer.widgets.expiration.expires').replace('___', (expirationDays.value - passedTime) < 0 ? 0 : expirationDays.value - passedTime );
    }


    switch (signature.status) {
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
      case 'pending':
        status = i18n.t('signaturesGrid.statusPending');
        status_style = 'en-progreso';
      default:
        break;
    }

    return (
      <div className={`col l9 ${styles['contenido-central']}`}>
      <div className={styles['cont-progreso-peticion-firma']}>
        <table className={styles['resumen-firma']}>
          <tbody>
            <tr>
              <th>{i18n.t('signatureViewer.grid.document')}</th>
              <th>{i18n.t('signatureViewer.grid.subject')}</th>
              <th>{i18n.t('signatureViewer.grid.signers')}</th>
              <th>{i18n.t('signatureViewer.grid.date')}</th>
              <th>{i18n.t('signatureViewer.grid.status')}</th>
            </tr>            
            <tr>
                <td className={styles.documento}>{signature.documents[0].file.name}</td>
                <td>{(signature.data.find(x => x.key === "subject")) ? signature.data.find(x => x.key === "subject").value : "Sin asunto"} </td>
                <td>
                    {/* <ul className={styles['tooltip-firmantes']}>
                        <li>Maria cruces <span className={styles.email}>margia-cruces@gmail.com</span></li>
                        <li>Maria cruces <span className={styles.email}>m.lopez@gsel.com</span></li>
                    </ul> */}
                    <span className={`${styles['bola-firmantes']} ${styles[status_style]}`}>{this.getSigners(signature).length}</span>
                </td>
                  <td>
                    {new Date(signature.created_at).toLocaleString(navigator.language, {
                    year: 'numeric', month: '2-digit', day: '2-digit',
                    hour: '2-digit', minute: '2-digit', second: '2-digit'
                    })}
                  </td>
                <td className={styles[status_style]}>{status}</td>
            </tr>
          </tbody>
        </table>
        <button 
          className={`${styles['btn-gen-border']} left modal-trigger`} 
          href="#demo-modal2" 
          onClick={() => this.onCancelSignature(signature.id, this.props.auth)} 
          disabled={signature.status==='canceled' || signature.status ==='completed'}>
            {i18n.t('signatureViewer.buttons.cancel')}
        </button>
        <button 
          className={`${styles['btn-gen']} modal-trigger right`} 
          href="#demo-modal1"
          onClick={() => this.onSendReminder(signature.id, this.props.auth)} 
          disabled={signature.status==='canceled' || signature.status ==='completed'}>
           {i18n.t('signatureViewer.buttons.reminder')}
        </button>
        <div className={styles.clearfix}></div>
        <div className={`${materialize.row} ${styles['mT20']}`}>
            <div className={`${materialize.col} ${materialize['l4']} right`}>
                <div className={styles['cont-generico']}>
                    <span className="lf-icon-calendar-cross"></span><span className={styles['title-generico']}>{i18n.t('signatureViewer.widgets.expiration.title')}</span>
                    <p style={{paddingTop: '10px'}}>{expirationText}</p>
                    <div className={styles.clearfix}></div>
                </div>
                <div className={styles['cont-generico']}>
                    <span className="lf-icon-calendar"></span><span className={styles['title-generico']}>{i18n.t('signatureViewer.widgets.reminders.title')}</span>
                    <p style={{paddingTop: '10px'}}>{reminderText}</p>
                    <div className={styles.clearfix}></div>
                </div>
                <button 
                  className={`${styles['btn-gen']} modal-trigger ${styles.mB10} right`}
                  onClick={() => downloadSignedDocument2(signature.id, signature.documents[0].id, signature.documents[0].file.name, this.props.auth)} 
                  disabled={signature.status !=='completed'}>
                    {i18n.t('signatureViewer.buttons.download')}
                </button> 
                <button 
                  className={`${styles['btn-gen']} modal-trigger right`}
                  onClick={() => downloadTrailDocument2(signature.id, signature.documents[0].id, signature.documents[0].file.name, this.props.auth)} 
                  disabled={signature.status !=='completed'}>
                    {i18n.t('signatureViewer.buttons.downloadTrail')}
                </button>
            </div>            
            <div className={`${materialize.col} ${materialize['l8']} left`}>
              {signature.documents.map((signer, i) => {
                i+=1;
                return(
              
                <div className={styles['cont-info-firmantes']}>
                  <div className={`${styles.p15} ${styles.separador}`}>
                      <div className={`${styles['tit-firmante']} left`}>{i18n.t('signatureViewer.signerCard.title.signers')}</div>
                        <span className={`${styles['name_firmante']} left`}>{signer.name}:</span>
                        <span className={styles.email}>{signer.email}</span>
                        <span className={`${styles['numero_firmante']} right`}>{i18n.t('signatureViewer.signerCard.title.signer')} {i}</span>
                      </div>
                      <div className={`${styles.p15} ${styles.separador}`}>
                        <div className={styles['tit-firmante']}>{i18n.t('signatureViewer.signerCard.body.title')}</div>
                        <div className={`${styles['seguimiento-firmante-individual']} ${((this.getEventStatus(signer, 'email_processed') === false) ? styles['no-completado']: ``)}`}>
                          <span className="lf-icon-send"></span>
                          <div className={styles['cont-check-seguimiento']}>
                              <span className={`${((this.getEventStatus(signer, 'email_processed')) ? `lf-icon-check-round-full `: ``)} ${styles['check-seguimiento']}`}></span>
                              <div className={`${styles.linea} ${styles['primer-estado']}`}></div>
                              <div className={styles.info}>
                                <div className={styles.estado}> {i18n.t('signatureViewer.signerCard.body.emailSent')}</div>
                                {this.getEventDate(signer, 'email_processed').split(' ')[0]}<br/>
                                {this.getEventDate(signer, 'email_processed').split(' ')[1]}
                              </div>
                              <div className={styles.clearfix}></div>
                          </div>
                          <div className={styles.clearfix}></div>
                        </div>
                        <div className={`${styles['seguimiento-firmante-individual']} ${((this.getEventStatus(signer, 'email_delivered') === false) ? styles['no-completado']: ``)}`}>
                          <span className={`lf-icon-mail`}></span>
                          <div className={styles['cont-check-seguimiento']}>
                              <span className={`${((this.getEventStatus(signer, 'email_delivered')) ? `lf-icon-check-round-full `: ``)} ${styles['check-seguimiento']}`}></span>
                              <div className={styles.linea}></div>
                              <div className={styles.info}>
                                  <div className={styles.estado}> {i18n.t('signatureViewer.signerCard.body.emailDelivered')}</div>
                                    {this.getEventDate(signer, 'email_delivered').split(' ')[0]}<br/>
                                    {this.getEventDate(signer, 'email_delivered').split(' ')[1]}
                              </div>
                              <div className={styles.clearfix}></div>
                          </div>
                          <div className={styles.clearfix}></div>
                        </div>
                        <div className={`${styles['seguimiento-firmante-individual']} ${((this.getEventStatus(signer, 'email_opened') === false) ? styles['no-completado']: ``)}`}>
                          <span className="lf-icon-mail-open"></span>
                          <div className={styles['cont-check-seguimiento']}>
                              <span className={`${((this.getEventStatus(signer, 'email_opened')) ? `lf-icon-check-round-full `: ``)} ${styles['check-seguimiento']}`}></span>
                              <div className={styles.linea}></div>
                              <div className={styles.info}>
                                  <div className={styles.estado}>
                                    {i18n.t('signatureViewer.signerCard.body.emailOpened')}
                                  </div>
                                    {this.getEventDate(signer, 'email_opened').split(' ')[0]}<br/>
                                    {this.getEventDate(signer, 'email_opened').split(' ')[1]}
                              </div>
                              <div className={styles.clearfix}></div>
                          </div>
                          <div className={styles.clearfix}></div>
                        </div>
                        <div className={`${styles['seguimiento-firmante-individual']} ${((this.getEventStatus(signer, 'document_opened') === false) ? styles['no-completado']: ``)}`}>
                          <span className="lf-icon-document"></span>
                          <div className={styles['cont-check-seguimiento']}>
                              <span className={`${((this.getEventStatus(signer, 'document_opened')) ? `lf-icon-check-round-full `: ``)} ${styles['check-seguimiento']}`}></span>
                              <div className={styles.linea}></div>
                                <div className={styles.info}>
                                      <div className={styles.estado}>{i18n.t('signatureViewer.signerCard.body.docOpened')}</div>
                                        {this.getEventDate(signer, 'document_opened').split(' ')[0]}<br/>
                                        {this.getEventDate(signer, 'document_opened').split(' ')[1]}
                                </div>
                              <div className={styles.clearfix}></div>
                          </div>
                        </div>
                        {/* <div className={`${styles['seguimiento-firmante-individual']} ${styles['no-completado']}`}> */}
                        <div className={`${styles['seguimiento-firmante-individual']} ${((this.getEventStatus(signer, 'document_signed') === false) ? styles['no-completado']: ``)}`}>
                          <span className='lf-icon-document-validate'></span>
                          <div className={styles['cont-check-seguimiento']}>
                              <span className={`${((this.getEventStatus(signer, 'document_signed')) ? `lf-icon-check-round-full `: ``)} ${styles['check-seguimiento']}`}></span>
                              <div className={styles.linea}></div>
                              <div className={styles.info}>
                                  <div className={styles.estado}>{i18n.t('signatureViewer.signerCard.body.docSigned')}</div>
                                    {this.getEventDate(signer, 'document_signed').split(' ')[0]}<br/>
                                    {this.getEventDate(signer, 'document_signed').split(' ')[1]}

                              </div>
                          </div>
                          <div className={styles.clearfix}></div>
                        </div>
                        <div className={styles.clearfix}></div>
                      </div>
                      <div className={styles.p15}>
                        <div className={styles['tit-firmante']}>{i18n.t('signatureViewer.signerCard.footer.title')}</div>
                        <p>
                          {
                            signer.events.map(event => 
                              { 
                                if (event.type === 'reminder_email_processed'){
                                  remindersSent = true;
                                  return (
                                    <span className={styles.fecha}>
                                      {`${this.getSingleEventDate(event, 'reminder_email_processed')}`}<br/>
                                    </span>
                                  )
                                }
                              }
                            )
                          }
                          {(remindersSent ? null : i18n.t('signatureViewer.signerCard.footer.subtitle'))}
                        </p>
                      </div>
                  </div>
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
          width='500px' 
          content={(this.state.hideAlertDialog) ? contenido : contenido2}//'Lo sentimos has agotado el número máximo de firmas contratadas. Si lo deseas, puedes contactar con nuestro departamento de atención a cliente en el teléfono 911231231 o pinchando aquí' 
          ref={alertdialog => this.alertDialogInstance = alertdialog} 
          //target='#target' 
          //buttons={this.alertButtons} 
          open={this.dialogOpen.bind(this)} 
          close={this.dialogClose.bind(this)}
          showCloseIcon={true}
          //position={ this.position }
        ></DialogComponent>
        <DialogComponent 
          id="confirmDialog" 
          header=' ' 
          visible={this.state.hideConfirmDialog} 
          //showCloseIcon={true} 
          animationSettings={this.animationSettings} 
          width='400px' 
          content={contenido3} 
          ref={dialog => this.confirmDialogInstance = dialog} 
          //target='#target' 
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
            top: 392.5px;
            z-index: 1001;
            transform: translateY(+150%);
          }
          #confirmDialog_dialog-header, #confirmDialog_title, #onfirmDialog_dialog-content, .e-footer-content{
            background: #001970;
            color: #fff;
            display:flex;
          }
          #infoDialog_dialog-header, #infoDialog_title, #infoDialog_dialog-content, .e-footer-content{
            background: #001970;
            color: #fff;
            display:flex;
          }
          #confirmDialog_dialog-header, #confirmDialog_title, #confirmDialog_dialog-content, .e-footer-content{
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
          
          `}
        </style>
      </div>
      );
  }

  onFolderClick(folder) {
    this.props.showFolder(folder);
  }
}

MessageViewer.propTypes = {
  refreshMessageActiveRequests: PropTypes.number,
  selectedMessage: PropTypes.object,
  className: PropTypes.string
};

MessageViewer.defaultProps = {
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
});

export default connect(mapStateToProps, mapDispatchToProps)(MessageViewer);
