import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { selectFolder } from '../../actions/application';
import { clearSelectedMessage, getCredentials } from '../../services/application';
import { getSelectedFolder } from '../../selectors/folders';
import mainCss from '../../styles/main.scss';
import styles from './message-viewer.scss';
import ACTIONS from "../../actions/lefebvre";
import { downloadSignedDocument,  downloadSignedDocument2, downloadTrailDocument, downloadTrailDocument2, sendReminder, sendReminder2, cancelSignature, cancelSignature2 } from "../../services/api-signaturit";

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



export class MessageViewer extends Component {

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

  renderSignerInfo(signer) {
    let emailSent;
    let emailDelivered;
    let emailOpened;
    let docOpened;
    let docSigned;

    if (signer.status === 'Completed'){
      emailSent = true;
      emailDelivered = true;
      emailOpened = true;
      docOpened = true;
      docSigned = true;
    } else {
      emailSent = this.getEventStatus(signer, 'emailSent');
      emailDelivered = this.getEventStatus(signer, 'emailDelivered');
      emailOpened = this.getEventStatus(signer, 'emailOpened');
      docOpened = this.getEventStatus(signer, 'docOpened');
      docSigned = this.getEventStatus(signer, 'docSigned');
    }    

    return(
      <li key={signer.id} style={{marginTop: 30+'px'}}>Test
        <div className={styles.fromDate}>
          <div className={styles.from}>
            <span className={styles.fromName}>{signer.name}</span>
            <span className={styles.email}>{signer.email}</span>
            <span className={`material-icons`} style={{color: ((emailSent) ? 'blue' : 'black')}}>face</span>
          </div>
          <div className={styles.date}>
            {new Date(signer.created_at).toLocaleString(navigator.language, {
              year: 'numeric', month: '2-digit', day: '2-digit',
              hour: '2-digit', minute: '2-digit', second: '2-digit'
            })}
          </div>
        </div>

        <div className={styles.body} style={{marginTop: 30+'px'}}>
          <span className={`material-icons`} style={{color: 'green'}}>
            send
          </span>
          <span className={`material-icons`} style={{fontSize: 80 + 'px', marginLeft: 10+'px', marginRight: 30+'px'}}>
            remove
          </span>
          <span className={`material-icons`} style={{color: '001978', fontSize: 80 + 'px'}}>
            email
          </span>
          <span className={`material-icons`} style={{fontSize: 80 + 'px', marginLeft: 10+'px', marginRight: 30+'px'}}>
            remove
          </span>
          <span className={`material-icons`} style={{color: '001978', fontSize: 80 + 'px'}}>
            drafts
          </span>
          <span className={`material-icons`} style={{fontSize: 80 + 'px', marginLeft: 10+'px', marginRight: 30+'px'}}>
            remove
          </span>
          <span className={`material-icons`} style={{color: '001978', fontSize: 80 + 'px'}}>
            assignment
          </span>
          <span className={`material-icons`} style={{fontSize: 80 + 'px', marginLeft: 10+'px', marginRight: 30+'px'}}>
            remove
          </span>
          <span className={`material-icons`} style={{color: '001978', fontSize: 80 + 'px'}}>
            assignment_turned_in
          </span>
        </div>
      </li>
      
    );
  }

  render() {
    console.log('Entra en el message viewer');
    const signature = this.props.selectedSignature;
    let status;

    switch (signature.status) {
      case 'canceled':
        status = <font color="#c43333">Canceled</font> 
        break;
      case 'declined':
        status = <font color="#c43333">Rejected</font> 
        break;
      case 'completed':
        status = <font color="#1fb53a">Completed</font>
        break;
      case 'ready':
        status = <font color="#001978">In progress </font>
        break;
      case 'expired':
        status = <font color="#001978">In progress </font>
        break;      
      default:
        break;
    }

    return (
      <div className={`${this.props.className} ${styles.messageViewer}`}>
        <div className={styles.header}>
          <h1 className={styles.subject}>
            {/* {this.props.selectedMessage.subject} */}
            {signature.documents[0].file.name} - ({status})
            <div className={`${styles.folder} ${mainCss['mdc-chip']}`}>
                <div className={mainCss['mdc-chip__text']}>Páginas:{signature.documents[0].file.pages}</div>
            </div>
            <div className={`${styles.folder} ${mainCss['mdc-chip']}`}>            
                <div className={mainCss['mdc-chip__text']}>Tamaño:{Math.trunc((signature.documents[0].file.size)/1024)}KB</div>
            </div>
            <div className={`${styles.folder} ${mainCss['mdc-chip']}`}>            
              <div className={mainCss['mdc-chip__text']}>Firmantes:{signature.documents.length}</div>
            </div>
            <div className={styles.signatureDate}>
              {new Date(signature.documents[0].created_at).toLocaleString(navigator.language, {
                  year: 'numeric', month: '2-digit', day: '2-digit',
                  hour: '2-digit', minute: '2-digit', second: '2-digit'
              })}
            </div>
          </h1>          
          <h6 className={styles.subject}>

            <button class="mdc-button" onClick={() => cancelSignature2(signature.id, this.props.auth)} disabled={signature.status==='canceled' || signature.status ==='completed'}>
              <span class="mdc-button__ripple"></span>
              <i class="material-icons mdc-button__icon">cancel_schedule_send</i>
              <span class="mdc-button__label">CANCELAR</span>
            </button>
            <button class="mdc-button" onClick={() => sendReminder2(signature.id, this.props.auth)} disabled={signature.status==='canceled' || signature.status ==='completed'}>
              <span class="mdc-button__ripple"></span>
              <i class="material-icons mdc-button__icon">send</i>
              <span class="mdc-button__label">ENVIAR RECORDATORIO</span>
            </button>
            <button class="mdc-button" onClick={() => downloadSignedDocument2(signature.id, signature.documents[0].id, signature.documents[0].file.name, this.props.auth)} disabled={signature.status !=='completed'}>
              <span class="mdc-button__ripple"></span>
              <i class="material-icons mdc-button__icon">cloud_download</i>
              <span class="mdc-button__label">DESCARGAR DOC</span>
            </button>
            <button class="mdc-button" onClick={() => downloadTrailDocument2(signature.id, signature.documents[0].id, signature.documents[0].file.name, this.props.auth)} disabled={signature.status !=='completed'}>
              <span class="mdc-button__ripple"></span>
              <i class="material-icons mdc-button__icon">attachment</i>
              <span class="mdc-button__label">DESCARGAR AUDIT</span>
            </button>
          </h6>        
          <hr></hr>  
        {signature.documents.map((signer, i) => {
          i+=1;
          return (
            <div className={styles.recipient}>
              <div className={styles.recipientHeader}>
                <div className={styles.from}>
                  {/* <span className={styles.fromName}>Firmante ({i}): {signer.name}</span> */}
                  <span className={styles.fromName}>Firmante ({i}): </span>
                  <span className={styles.email}>{signer.email}</span>
                </div>
                <div className={styles.date}>
                  {new Date(signer.created_at).toLocaleString(navigator.language, {
                    year: 'numeric', month: '2-digit', day: '2-digit',
                    hour: '2-digit', minute: '2-digit', second: '2-digit'
                  })}
                </div>
              </div>
              <div className={styles.recipientBody}>
                <div id={`Signer-${signer.id}`} className={styles.recipientEvents}>
                  <span className={`material-icons`} style={{color: ((this.getEventStatus(signer, 'email_processed')) ? '#001978' : 'grey'), fontSize: 60 + 'px'}}>
                    send
                  </span>
                  <span className={`material-icons`} style={{fontSize: 60 + 'px'}}>
                    remove
                  </span>
                  <span className={`material-icons`} style={{color: ((this.getEventStatus(signer, 'email_delivered')) ? '#001978' : 'grey'), fontSize: 60 + 'px'}}>
                    email
                  </span>
                  <span className={`material-icons`} style={{fontSize: 60 + 'px'}}>
                    remove
                  </span>
                  <span className={`material-icons`} style={{color: ((this.getEventStatus(signer, 'email_opened')) ? '#001978' : 'grey'), fontSize: 60 + 'px'}}>
                    drafts
                  </span>
                  <span className={`material-icons`} style={{fontSize: 60 + 'px'}}>
                    remove
                  </span>
                  <span className={`material-icons`} style={{color: ((this.getEventStatus(signer, 'document_opened')) ? '#001978' : 'grey'), fontSize: 60 + 'px'}}>
                    assignment
                  </span>
                  <span className={`material-icons`} style={{fontSize: 60 + 'px'}}>
                    remove
                  </span>
                  <span className={`material-icons`} style={{color: ((this.getEventStatus(signer, 'document_signed')) ? '#001978' : 'grey'), fontSize: 60 + 'px'}}>
                    assignment_turned_in
                  </span>
                  <span>Email Sent</span>
                  <span></span>
                  <span>Email Delivered</span>
                  <span></span>
                  <span>Email Opened</span>
                  <span></span>
                  <span>Document Opened</span>
                  <span></span>
                  <span>Document Signed</span>
                  <span className={styles.eventDate}>{(this.getEventStatus(signer, 'email_processed')) ? this.getEventDate(signer, 'email_processed') : ''}</span>
                  <span></span>
                  <span className={styles.eventDate}>{(this.getEventStatus(signer, 'email_delivered')) ? this.getEventDate(signer, 'email_delivered') : ''}</span>
                  <span></span>
                  <span className={styles.eventDate}>{(this.getEventStatus(signer, 'email_opened')) ? this.getEventDate(signer, 'email_opened') : ''}</span>
                  <span></span>
                  <span className={styles.eventDate}>{(this.getEventStatus(signer, 'document_opened')) ? this.getEventDate(signer, 'document_opened') : ''}</span>
                  <span></span>
                  <span className={styles.eventDate}>{(this.getEventStatus(signer, 'document_signed')) ? this.getEventDate(signer, 'document_signed') : ''}</span>
                </div>                  
              </div>
              <hr style={{width: 80+'%'}}></hr>
            </div>
          )      
        })}           
      </div>    

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
