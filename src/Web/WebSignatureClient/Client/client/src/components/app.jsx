/* eslint-disable indent */
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import i18n from 'i18next';

import PropTypes from 'prop-types';
import * as uuid from 'uuid/v4';
import Cookies from 'js-cookie';
import history from '../routes/history';
import Spinner from './spinner/spinner';
import TopBar from './top-bar/top-bar';
import MainBar from './main-bar/main-bar';
import SideBar from './side-bar/side-bar';
import MessageEditor from './message-editor/message-editor';
import EmailMessageEditor from './message-editor/email-message-editor';
import SmsMessageEditor from './message-editor/sms-message-editor';
import MessageList from './message-list/message-list';
import MessageViewer from './message-viewer/message-viewer';
import EmailMessageViewer from './message-viewer/email-message-viewer';
import SmsMessageViewer from './message-viewer/sms-message-viewer';
import MessageSnackbar from './message-snackbar/message-snackbar';
import NotFoundSnackbar from './messageNotFound-snackbar/messageNotFound-snackbar';

import {
  clearUserCredentials,
  selectMessage,
  selectFolder,
  outboxEventNotified,
  editMessage,
  setError,
  selectSignature,
  selectEmail,
  setTitle,
  setAppTitle, 
  setSelectedService
} from '../actions/application';
import { clearSelected, setSelected } from '../actions/messages';
import {
  // setEmailShown,
  // resetIdEmail,
  // setCaseFile,
  setGUID,
  setSign,
  setIdDocuments,
  setUserApp
} from '../actions/lefebvre';

import { getSelectedFolder } from '../selectors/folders';

import { AuthenticationException } from '../services/fetch';
import { editNewMessage, clearSelectedMessage } from '../services/application';
import { getFolders, findSentFolder } from '../services/folder';
import { resetFolderMessagesCache } from '../services/message';
import { readMessage } from '../services/message-read';
import { persistApplicationNewMessageContent } from '../services/indexed-db';

import {
  addOrUpdateAccount,
  getUser,
  classifyEmail
} from '../services/accounts';
// import SplitPane from "react-split-pane";
import styles from './app.scss';
import IconButton from './buttons/icon-button';
import { translate } from 'react-i18next';

// import { start, registerApplication } from "single-spa";

// import * as singleSpa from "single-spa";
// import { registerLexonApp } from "../apps/lexonconn-app";
// import { registerMainnavApp } from "../apps/mainnav-app";

import Sidebar from 'react-sidebar';
import LexonComponent from '../apps/lexon_content';
import CalendarComponent from '../apps/calendar_content';
import DataBaseComponent from '../apps/database_content';
import { PROVIDER } from '../constants';

import { preloadEmails, preloadSignatures2, getSignatures, getAttachmentLex, getAttachmentCen, cancelSignatureCen } from "../services/api-signaturit";
import { getFileType } from '../services/mimeType';
import { backendRequest, backendRequestCompleted, preDownloadSignatures } from '../actions/messages';
import { DialogComponent } from '@syncfusion/ej2-react-popups';

const MESSAGENOTFOUND_SNACKBAR_DURATION = 4000;

// const activityFunction = location => location.pathname.startsWith('/lexon-connector');

// registerApplication('lex-on-connector', () => import('../lex-on_connector/index.js'), activityFunction);
// start();

// const hashPrefix = prefix => location => location.hash.startsWith(`#${prefix}`)

// registerApplication('lex-on-connector_debug', () => import('../lex-on_connector/index.js'), hashPrefix('/lexon-connector'))

// start()

class App extends Component {
  constructor(props) {
    console.log('Entrando en App');
    super(props);
    this.state = {
      sidebarOpen: false,
      sidebarDocked: false,
      sideBar: {
        collapsed: false
      },
      sidebarComponent: (
        <img
          border='0'
          alt='Lefebvre'
          src='/assets/images/lexon-fake.png'></img>
      ),
      actualSidebarComponent: 0,
      isUpdatedDefaultAccount: (this.props.application.user) ? true: false,
      attachmentsDownloadError: false,
      hideAlertDialog: false,
      guidNotFound: false
    };

    this.toggleSideBar = this.toggleSideBar.bind(this);
    this.onSetSidebarDocked = this.onSetSidebarDocked.bind(this);
    this.onSetSidebarOpenCalendar = this.onSetSidebarOpenCalendar.bind(this);
    this.onSetSidebarOpenLexon = this.onSetSidebarOpenLexon.bind(this);
    this.onSetSidebarOpenQMemento = this.onSetSidebarOpenQMemento.bind(this);
    this.onSetSidebarOpenCompliance = this.onSetSidebarOpenCompliance.bind(this);
    this.onSetSidebarOpenDatabase = this.onSetSidebarOpenDatabase.bind(this);
    this.handleGetUserFromLexonConnector = this.handleGetUserFromLexonConnector.bind(this);
    this.resetDownloadError = this.resetDownloadError.bind(this);
    this.resetGuidNotFound = this.resetGuidNotFound.bind(this);
    //this.dialogClose = this.dialogClose.bind(this);
  }

  onSetSidebarOpenCalendar(open) {
    this.setState({
      sidebarComponent: (
        <CalendarComponent sidebarDocked={this.onSetSidebarDocked} />
      )
    });
    this.setState({ sidebarDocked: open });
  }

  onSetSidebarOpenLexon(open) {
    this.setState({
      sidebarComponent: (
        <LexonComponent sidebarDocked={this.onSetSidebarDocked} />
      )
    });
    this.setState({ sidebarDocked: open });
    this.setState({ actualSidebarComponent: 1 });
  }

  onSetSidebarOpenQMemento(open) {
    this.setState({
      sidebarComponent: (
        <DataBaseComponent sidebarDocked={this.onSetSidebarDocked} />
      )
    });
    this.setState({ sidebarDocked: open });
  }

  onSetSidebarOpenCompliance(open) {
    const lexon = (
      <img
        border='0'
        alt='Lefebvre'
        src='/assets/images/lexon-fake-null.png'></img>
    );
    this.setState({ sidebarComponent: lexon });
    this.setState({ sidebarDocked: open });
  }

  onSetSidebarOpenDatabase(open) {
    const lexon = (
      <img
        border='0'
        alt='Lefebvre'
        src='/assets/images/lexon-fake-null.png'></img>
    );
    this.setState({ sidebarComponent: lexon });
    this.setState({ sidebarDocked: open });
  }

  onSetSidebarDocked(open) {
    this.setState({ sidebarDocked: open });
  }

  sendMessagePutUser(user) {
    const { selectedMessages } = this.props.messages;
    console.log('messages ->', this.props.messages);
    window.dispatchEvent(
      new CustomEvent('PutUserFromLexonConnector', {
        detail: {
          user,
          selectedMessages: selectedMessages,
          idCaseFile: this.props.lexon.idCaseFile,
          bbdd: this.props.lexon.bbdd,
          idCompany: this.props.lexon.idCompany,
          idEmail: this.props.lexon.idEmail,
          idFolder: this.props.lexon.idFolder,
          account: this.props.all.login.formValues.user,
          provider: 'IMAP'
        }
      })
    );
  }

  handleGetUserFromLexonConnector() {
    const { userId } = this.props.lexon;

    // Comentar esto (es para pruebas)
    // const userId = 120;
    // Comentar esto (es para pruebas)

    if (userId) {
      this.sendMessagePutUser(userId);
    }
  }

  render() {
    console.log('APP.RENDER()');
    console.log('APP.RENDER().state.guidNotFound:'+ this.state.guidNotFound);
    const { t, lefebvre } = this.props;
    const { sideBar, isUpdatedDefaultAccount } = this.state;

    if (!isUpdatedDefaultAccount) {
      return null;
    }

    return (
      <Sidebar
        sidebar={this.state.sidebarComponent}
        open={false}
        pullRight={true}
        docked={this.state.sidebarDocked}
        styles={{
          sidebar: {
            background: 'white',
            zIndex: 999,
            overflowY: 'hidden',
            WebkitTransition: '-webkit-transform 0s',
            willChange: 'transform'
          },
          content: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            overflowY: 'hidden',
            overflowX: 'hidden',
            WebkitOverflowScrolling: 'touch',
            transition: 'left .0s ease-out, right .0s ease-out'
          },
          overlay: {
            zIndex: 1,
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0,
            visibility: 'hidden',
            //transition: "opacity .3s ease-out, visibility .0s ease-out",
            backgroundColor: 'rgba(0,0,0,.3)'
          },
          dragHandle: {
            zIndex: 1,
            position: 'fixed',
            top: 0,
            bottom: 0
          }
        }}>
        <div>
          <MainBar
            sideBarCollapsed={sideBar.collapsed}
            sideBarToggle={this.toggleSideBar}
          />
          <TopBar
            sideBarCollapsed={sideBar.collapsed}
            sideBarToggle={this.toggleSideBar}
          />
          <div id='mainnav-app' />
          {/*<SplitPane split="vertical" minSize={200} maxSize={800} defaultSize={450}  primary="second">*/}
          <div className={styles.app}>
            <Spinner
              visible={this.props.application.activeRequests > 0}
              className={styles.spinner}
              pathClassName={styles.spinnerPath}
            />

            <SideBar
              collapsed={sideBar.collapsed}
              sideBarToggle={this.toggleSideBar}
              casefile={lefebvre.idCaseFile}
              bbdd={lefebvre.bbdd}
            />
            <div id='mainnav-app' />

            <div
              className={`${styles['content-wrapper']}
                                ${
                                  sideBar.collapsed
                                    ? styles['without-side-bar']
                                    : styles['with-side-bar']
                                } ${styles['custom-padding-top']}`}>
              {this.renderContent()}
            </div>

            <div className={styles.productpanel}>
              {/* <span
                className={styles.productsbutton}
                isotip={t('productBar.lefebvre')}
                isotip-position='bottom-end'
                isotip-size='small'>
                {lefebvre.user ? (
                  <IconButton onClick={() => this.onSetSidebarOpenLexon(true)}>
                    <img
                      border='0'
                      alt='Lex-On'
                      src='/assets/images/icon-lexon.png'></img>
                  </IconButton>
                ) : (
                  <IconButton>
                    <img
                      disabled
                      border='0'
                      alt='Lex-On'
                      src='/assets/images/icon-lexon.png'></img>
                  </IconButton>
                )}
                <div className={styles.btnselect}></div>
              </span> */}
              {/* <span
                className={styles.productsbutton}
                isotip={t("productBar.database")}
                isotip-position="bottom-end"
                isotip-size="small"
              >
                 <IconButton onClick={() => this.onSetSidebarOpenQMemento(true)}> 
                <IconButton>
                  <img
                    border="0"
                    alt="Calendar"
                    src="assets/images/icon-qmemento.png"
                    className="disabledimg"
                  ></img>
                </IconButton>
                <div className={styles.btnselect}></div>
              </span>
              <span
                className={styles.productsbutton}
                isotip-position="bottom-end"
                isotip-size="small"
              >
                {/* <IconButton
                  disabled
                  onClick={() => this.onSetSidebarOpenCompliance(true)}
                > 
                <IconButton>
                  <img
                    border="0"
                    alt="Calendar"
                    src="assets/images/icon-compliance.png"
                    className="disabledimg"
                  ></img>
                </IconButton>
                <div className={styles.btnselect}></div>
              </span>
              <span
                className={styles.productsbutton}
                isotip={t("productBar.calendar")}
                isotip-position="bottom-end"
                isotip-size="small"
              >
                <IconButton onClick={() => this.onSetSidebarOpenCalendar(true)}> 
                <IconButton>
                  <img
                    border="0"
                    alt="Calendar"
                    src="assets/images/icon-calendar.png"
                    className="disabledimg"
                  ></img>
                </IconButton>
                <div className={styles.btnselect}></div>
              </span>
              {/* <span
                className={styles.productsbutton}
                isotip={t("sideBar.hide")}
                isotip-position="bottom-end"
                isotip-size="small"
              >
                <IconButton onClick={() => this.onSetSidebarDocked(false)}>
                  close
                </IconButton>
                <div className={styles.btnselect}></div>
              </span>

              <span className={styles.spaceproduct}></span>*/}
            </div>

            <MessageSnackbar />
            <NotFoundSnackbar />
          </div>

          {/*<div className={styles.connector}  style={{
                      backgroundImage: 'url(' + imgUrl + ')',
                      backgroundSize: '120px',
                      backgroundPosition: 'center 110px',
                      backgroundRepeat: 'no-repeat',
                      height: '100%'
                  }}>
                      <div id="lexon-app" className={styles.panelconnectortitle}>
                      </div>
                      <div id="lexon-app-dev" className={styles.panelconnectortitle}>
                      </div>

                  </div>*/}
          {/*</SplitPane>*/}
        </div>
      </Sidebar>
    );
  }

  renderConnector() {
    this.props.history.push('/#/lexon-connector');
  }

  resetDownloadError(){
    this.setState({ attachmentsDownloadError: false});
  }

  resetGuidNotFound(){
    var guid = this.props.lefebvre.guid;
    this.setState({ guidNotFound: false});
    this.props.setUserApp('lefebvre');
    this.props.setGUID(null);
    cancelSignatureCen(guid)
    .then(res => console.log('Cancelación en centinela: ' + res))
    .catch(err => console.log('Error cancelación centinela: ' + err));
  }

  // guidNotFoundDialogClose(){
  //   this.setState({ showGuidNotFoundCenDialog: false});
  //   cancelSignatureCen(this.props.lefebvre.guid);
  //   this.props.setUserApp('lefebvre');
  //   this.props.setGuid(null);
  // }

  renderContent() {
    console.log('APP.RENDERCONTENT()');
    console.log('APP.RENDERCONTENT().state.guidNotFound:'+ this.state.guidNotFound);
    const { application } = this.props;
    console.log('application.newMessage', application.newMessage);
    // const content = `
    //   <span class="lf-icon-information" style="font-size:100px; padding: 15px;"></span>
    //   <div style='text-align: justify; text-justify: inter-word; align-self: center;'>
    //     Descargando documentos de centinela
    //   </div>
    //   <div class="progress-line"></div>
    // `;

    const content = `  
      <div style='width: 100%;'>  
        <div style='text-align: justify; text-justify: inter-word; align-self: center;'>
          ${i18n.t('downloadindCentinelaModal.text')}
        </div>
        <div class='${styles['progress-line']}'/>
      </div>
    `;

    // const content2 = `
    //   <div style='width: 100%;'>  
    //   <div style='text-align: justify; text-justify: inter-word; align-self: center;'>
    //     ${i18n.t('signatureNotFoundCentinela.text')}
    //   </div>
    // `;
    
    if (
      application.newMessage &&
      Object.keys(application.newMessage).length > 0
      && application.newMessage.sendingType == 'signature'
    ) {
      return <MessageEditor className={styles['message-viewer']} attachmentsDownloadError={this.state.attachmentsDownloadError} onShowError={this.resetDownloadError} />;
    } else if(
      application.newMessage &&
      Object.keys(application.newMessage).length > 0
      && application.newMessage.sendingType == 'emailCertificate'
      ) {
      return <EmailMessageEditor className={styles['message-viewer']} attachmentsDownloadError={this.state.attachmentsDownloadError} onShowError={this.resetDownloadError} />;
    } else if
    (
      application.newMessage &&
      Object.keys(application.newMessage).length > 0
      && application.newMessage.sendingType == 'smsCertificate'
    ) {
      return <SmsMessageEditor className={styles['message-viewer']}  />;
    } else if (application.selectedSignature && Object.keys(application.selectedSignature).length > 0) {
      return <MessageViewer className={styles['message-viewer']} />;
    } else if (application.selectedEmail && Object.keys(application.selectedEmail).length > 0) {
      return <EmailMessageViewer className={styles['message-viewer']} />;
    } else if (application.selectedSms && Object.keys(application.selectedSms).length > 0) {
      return <SmsMessageViewer className={styles['message-viewer']} />;
    } 
    
    return (
      <Fragment>
        <MessageList className={styles['message-grid']} guidNotFound={this.state.guidNotFound} onShowGuidNotFound={this.resetGuidNotFound}/>
        <DialogComponent 
          id="info2Dialog" 
          //header=' ' 
          visible={this.state.hideAlertDialog} 
          // visible={true} 
          animationSettings={this.animationSettings} 
          width='500px' 
          content={ content }
          //content={(this.props.attachments.length === 0 ? noAttachModal : (this.state.bigAttachments ? bigFileModal : noSignersModal))}
          ref={alertdialog => this.alertDialogInstance = alertdialog} 
          isModal={true}
          //target='#target' 
          //buttons={this.alertButtons} 
          // open={this.dialogOpen.bind(this)} 
          // close={this.dialogClose.bind(this)}
          // showCloseIcon={true}
          //position={ this.position }
        />
        {/* <DialogComponent
          id = "infoDialogGuidNotFound"
          visible = { this.state.showGuidNotFoundCenDialog }
          animationSettings={this.animationSettings} 
          width='500px'
          content={ content2 }
          ref = {alertdialog2 => this.alertDialogInstance2 = alertdialog2} 
          isModal = { true }
          close ={ this.dialogClose }
        /> */}
        {/*<div className={styles["fab-container"]}>
          {outbox === null ? (
            <button
              className={`${mainCss["mdc-fab"]} ${mainCss["mdc-button--raised"]}`}
            >
              <span className={`material-icons ${mainCss["mdc-fab__icon"]}`}>
                chat_bubble_outline
              </span>
            </button>
          ) : null}
        </div>*/}
        <style jsx global>
          {`
            #info2Dialog
            {
              max-height: 927px;
              width: 300px;
              //left: 770px;
              //top: 392.5px;
              z-index: 1001;
              //transform: translateY(+150%);
              left: 35% !important;
              position: absolute !important;
            }
            #info2Dialog_dialog-header, #info2Dialog_title, #info2Dialog_dialog-content, #info2Dialog.e-footer-content,
            .e-footer-content {
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
            // .e-btn.e-flat.e-primary {
            //   color: #fff !important;
            // }
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
            .e-control .e-btn .e-lib .e-flmenu-okbtn .e-primary .e-flat{
              color: #001970 !important;
            }
            
          `}
        </style>
      </Fragment>
    );
  }

  registerConnectorApp() {
    // let el = document.getElementById('main-lexon-connector')
    // if (!el) {
    //     try {
    //         const activityFunction = location => location.pathname.startsWith('/');
    //         registerApplication('lexon-app-dev', () => import('../lex-on_connector/index.js'), activityFunction);
    //         start();
    //         //registerLexonApp();
    //         registerMainnavApp();
    //         //singleSpa.start();
    //     }
    //     catch (error) {
    //         //console.error(error);
    //     }
    // }
  }

  openSignature(signature){
    this.props.signatureClicked(signature);
    this.props.setGUID(null);
    return false;
  }

  openEmail(email){
    this.props.emailClicked(email);
    this.props.setGUID(null);
    return false;
  }

  async componentDidMount() {
    document.title = this.props.application.title;
    var { mailContacts, adminContacts } = this.props.lefebvre;
    var self = this;
    let dataMailContacts = [];
    let dataAdminContacts = []; 

    (mailContacts) ? mailContacts.map(c => { return dataMailContacts.push({address: c, name: ''}) }) : null;
    (adminContacts) ? adminContacts.map(c => { return dataAdminContacts.push({address: c, name: ''}) }) : null;
    
    //Starting poll to update the inbox automatically
    //this.startPoll();
    setInterval(this.startPoll.bind(this), window.POLLING_INTERVAL);
    //this.startPoll.bind(this);
    //adding connector App to right slide panel
    //setTimeout(function () { this.registerConnectorApp(); }, 2200);
    this.registerConnectorApp();

    const { lefebvre } = this.props;

    console.log('******************************');
    console.log('******************************');
    console.log('******************************');
    console.log('');
    console.log('App.ComponentDidMount: Llamando a preloadSignatures(lefebvre.userId)');
    console.log('******************************');
    console.log('******************************');
    console.log('******************************');
    console.log('');

    if (lefebvre.targetService === 'signature'){
      this.props.setSelectedService('signature');
      this.props.setAppTitle(i18n.t('topBar.app'));
      this.props.preloadSignatures(lefebvre.userId)
        .then( () => {
          if (lefebvre.guid !== null){ // Viene guid de firma interno. Puede ser por petición de firma nueva o para ver el estado de una firma existente.
            const { signatures } = this.props.application;
            let newSignature = true;
            if (signatures && signatures.length > 0){
              (signatures.some(s => 
                (s.data.find( d => d.key === "lefebvre_guid" && d.value === lefebvre.guid)) 
                  ? newSignature = this.openSignature(s) 
                  : null)
              )
            } 
            if (newSignature) {
              if ((lefebvre.userApp === "lex" || lefebvre.userApp === "lexon") && lefebvre.idEntityType === 14 && lefebvre.idEntity && lefebvre.idEntity > 0){ // Hay que recuperar un adjunto de lexon
                this.props.setTitle(i18n.t('messageEditor.title'));
                this.getFilesFromLexon()
                  .then(files => {
                    if (files === null) {
                      this.props.newMessage('signature', dataMailContacts, dataAdminContacts);
                    } else {
                      this.props.newMessage('signature', dataMailContacts, dataAdminContacts, null, files);
                    }
                  })
                  .catch(() => this.props.newMessage('signature', dataMailContacts, dataAdminContacts))
              } 
              else if ((lefebvre.userApp === "cen" || lefebvre.userApp === "centinela" || lefebvre.userApp === "2")){
                if (lefebvre.idDocuments && lefebvre.idDocuments.length > 0){
                  this.props.setTitle(i18n.t('messageEditor.title'));
                  this.getFilesFromCentinela()
                    .then(files => {
                      if (files === null){
                        this.setState({hideAlertDialog: false, attachmentsDownloadError: true})
                        this.props.setUserApp('lefebvre');
                        this.props.newMessage('signature', dataMailContacts, dataAdminContacts);
                      }
                      else {
                        this.setState({hideAlertDialog: false});
                        this.props.backendRequestCompleted();
                        this.props.setIdDocuments(files.documentsInfo);
                        this.props.newMessage('signature', dataMailContacts, dataAdminContacts, null, files.attachmentsList);
                      }
                    })
                    .catch(err => {
                      this.setState({hideAlertDialog: false});
                      this.props.backendRequestCompleted();
                      this.props.newMessage('signature', dataMailContacts, dataAdminContacts);
                    })
                }
                else {
                  // Received guid is of a document that is in signing process in centinela's backend but we don´t have it
                  // Show modal
                  // Send Centinela a Cancelation Request for that guid.
                  console.log('NO SE ENCUENTRA EL GUID, SE DEBE DE MOSTRAR AVISO');
                  console.log('guidNotFound se pasa a true');
                  this.setState({guidNotFound: true})
                }
              }
            }
            else {
              this.props.setUserApp('lefebvre');
              this.props.setTitle(i18n.t('signatureViewer.title'));
            }  
          }
        })
        .catch(err => { throw new Error(err);} );
        this.props.preloadEmails(lefebvre.userId);
    } else if (lefebvre.targetService === "certifiedEmail") {
      this.props.setSelectedService('certifiedEmail');
      this.props.setTitle(i18n.t('messageEditor.certifiedEmailTitle'));
      this.props.setAppTitle(i18n.t('topBar.certifiedEmail'));
      this.props.preloadEmails(lefebvre.userId)
        .then( () => {
          if (lefebvre.guid !== null){ // Viene guid de firma interno. Puede ser por petición de firma nueva o para ver el estado de una firma existente.
            const { emails } = this.props.application;
            let newEmail = true;
            if (emails && emails.length > 0){
              (emails.some(e => 
                (e.data.find( d => d.key === "lefebvre_guid" && d.value === lefebvre.guid)) 
                  ? newEmail = this.openEmail(e) 
                  : null)
              )
            } 
            if (newEmail) {
              if ((lefebvre.userApp === "lex" || lefebvre.userApp === "lexon") && lefebvre.idEntityType === 14 && lefebvre.idEntity && lefebvre.idEntity > 0){ // Hay que recuperar un adjunto de lexon
                this.getFilesFromLexon()
                  .then(files => {
                    if (files === null) {
                      this.props.newMessage('emailCertificate', dataMailContacts, dataAdminContacts);
                    } else {
                      this.props.newMessage('emailCertificate', dataMailContacts, dataAdminContacts, null, files);
                    }
                  })
                  .catch(() => this.props.newMessage('emailCertificate', dataMailContacts, dataAdminContacts))
              } 
              else if ((lefebvre.userApp === "cen" || lefebvre.userApp === "centinela" || lefebvre.userApp === "2")){
                if (lefebvre.idDocuments && lefebvre.idDocuments.length > 0){
                  this.getFilesFromCentinela()
                    .then(files => {
                      if (files === null){
                        this.props.setUserApp('lefebvre');
                        this.props.newMessage('emailCertificate', dataMailContacts, dataAdminContacts);
                      }
                      else {
                        this.setState({hideAlertDialog: false});
                        this.props.backendRequestCompleted();
                        this.props.setIdDocuments(files.documentsInfo);
                        this.props.newMessage('emailCertificate', dataMailContacts, dataAdminContacts, null, files.attachmentsList);
                      }
                    })
                    .catch(err => {
                      this.setState({hideAlertDialog: false});
                      this.props.backendRequestCompleted();
                      this.props.newMessage('emailCertificate', dataMailContacts, dataAdminContacts);
                    })
                }
                else {
                  // Received guid is of a document that is in signing process in centinela's backend but we don´t have it
                  // Show modal
                  // Send Centinela a Cancelation Request for that guid.
                  console.log('NO SE ENCUENTRA EL GUID, SE DEBE DE MOSTRAR AVISO');
                  console.log('guidNotFound se pasa a true');
                  this.setState({guidNotFound: true})
                }
              }
            } else {
              this.props.setUserApp('lefebvre');
            }  
          }
        })
        .catch(err => { throw new Error(err);} );
        this.props.preloadSignatures(lefebvre.userId);      
    }

    console.log('ENVIRONMENT ->', window.REACT_APP_ENVIRONMENT);
  }

  async getFilesFromLexon(){
    return new Promise((resolve, reject) => {
      const {lefebvre} = this.props;

      this.props.getAttachmentLex(lefebvre.bbdd, lefebvre.idEntity, lefebvre.idUserApp)
      .then((attachment) => {
          if (attachment.data === null){ //El fichero no existe o no se ha podido recuperar
            resolve(null);
          }
          else {
            const length = attachment.data.length;
            const fileName = (attachment.infos[0].message.includes("- id:")) ? attachment.infos[0].message.split("fichero:")[1].split("- id:")[0].replace(/"/g,'').trim() : attachment.infos[0].message.split("fichero:")[1].replace(/"/g,'').trim();
            const newAttachment = [{
              fileName: fileName,
              size: length,
              contentType: getFileType(fileName),
              content: attachment.data
            }]
            resolve(newAttachment);
          }
      })
      .catch(err => {
        console.log("Error in getFilesFromLexon:");
        console.log(err)
        reject(err);
      });
    })
    
  }

  getFilesFromCentinela(){
    return new Promise((resolve, reject) => {
      const {lefebvre} = this.props;
      
      let documentsInfo = []; 
      let attachmentsList = [];
      let i = 0;
      let error = 0;

      if (lefebvre.idDocuments.length > 0){
        this.props.backendRequest();
        this.setState({hideAlertDialog: true});
      }

      lefebvre.idDocuments.forEach(document => {
        this.props.getAttachmentCen(lefebvre.userId, document.docId)
        .then((attachment) => {
          if (attachment.data === null) { //El fichero no existe o no se ha podido recuperar
            error += 1;
            cancelSignatureCen(document.docId)
            .then(res => {
              console.log(res);
            })
            .catch(err => {
              console.log(err);
            });
          }
          else {
            const length = attachment.data.length;
            const fileName = (attachment.infos[0].message.includes("- id:")) ? attachment.infos[0].message.split("fichero:")[1].split("- id:")[0].replace(/"/g,'').trim() : attachment.infos[0].message.split("fichero:")[1].replace(/"/g,'').trim();
            const fileType = fileName.split('.');
            const newAttachment = {
              fileName: fileName,
              size: length,
              contentType: getFileType(fileName),
              content: attachment.data
            }

            if (fileType[fileType.length-1] === 'pdf' || fileType[fileType.length-1] === 'PDF'){
              const pdfjsLib = require('pdfjs-dist');
              pdfjsLib.GlobalWorkerOptions.workerSrc = '../../assets/scripts/pdf.worker.js'

              pdfjsLib.getDocument({data: atob(attachment.data)})
              .promise.then(doc => {
                var numPages = doc.numPages;
                newAttachment.pages = numPages;
                console.log('# Document Loaded');
                console.log('Number of Pages: ' + numPages);
              });
            } 

            attachmentsList.push(newAttachment);
            documentsInfo.push({docId: document.docId, docName: fileName});
          }
          i += 1;

          if ( i > 0 && (lefebvre.idDocuments.length === attachmentsList.length + error) ){
            if (error > 0){
              this.setState({hideAlertDialog: false, attachmentsDownloadError: true})
            }
            resolve({attachmentsList, documentsInfo});
          }
        })
        .catch(err => {
          console.log("Error in getFilesFromCentinela:");
          console.log(err);
          reject(err);
        });        
      });
    });
  }

  renderNotFoundModal() {
    this.props.setError('messageNotFound', 'No se encuentra el mensaje'); //tenia authentication
    setTimeout(
      () => this.props.setError('messageNotFound', null),
      MESSAGENOTFOUND_SNACKBAR_DURATION
    );
    
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  componentWillUnmount() {
    clearTimeout(this.refreshPollTimeout);

    window.removeEventListener(
      'GetUserFromLexonConnector',
      this.handleGetUserFromLexonConnector
    );
  }

  startPoll() {
      const {lefebvre, application} = this.props;
      if ((application.selectedSignature === null || (application.selectedSignature.constructor === Object && Object.entries(application.selectedSignature).length === 0))
        && (application.selectedEmail === null || (application.selectedEmail.constructor === Object && Object.entries(application.selectedEmail).length === 0))){  
        if (application.selectedService === 'signature'){
          this.props.preloadSignatures(lefebvre.userId);
        } else if (application.selectedService === 'certifiedEmail'){
          this.props.preloadEmails(lefebvre.userId)
        } else {
            this.props.preloadSignatures(lefebvre.userId);
            this.props.preloadEmails(lefebvre.userId);
        }
        //this.props.backendRequestCompleted();
      } else {
        if (application.selectedService === 'signature'){
          this.props.preloadSignatures(lefebvre.userId);
          let signature = application.signatures.find(s => s.id === application.selectedSignature.id)
          this.props.signatureClicked(signature);
        } else {
          this.props.preloadEmails(lefebvre.userId);
          let email = application.emails.find(s => s.id === application.selectedEmail.id)
          this.props.emailClicked(email);
        }        
      }  
  }


  toggleSideBar() {
    const toggleCollapsed = !this.state.sideBar.collapsed;
    this.setState({
      sideBar: {
        collapsed: toggleCollapsed
      }
    });
  }
}

App.propTypes = {
  application: PropTypes.object,
  outbox: PropTypes.object,
  folders: PropTypes.object,
  reloadFolders: PropTypes.func,
  reloadMessageCache: PropTypes.func,
  loadMessageByFolder: PropTypes.func,
  newMessage: PropTypes.func.isRequired //,
  // resetIdEmail: PropTypes.func
};

const mapStateToProps = state => ({
  application: state.application,
  auth: state.application.user.credentials.encrypted,
  outbox: state.application.outbox,
  folders: state.folders,
  receivedFolder: getSelectedFolder(state) || {},
  messages: state.messages,
  lefebvre: state.lefebvre,
  email: state.login.formValues.user,
  all: state
});

const mapDispatchToProps = dispatch => ({
  reloadFolders: credentials => getFolders(dispatch, credentials, true),
  reloadMessageCache: (user, folder) =>
    resetFolderMessagesCache(dispatch, user, folder),
  newMessage: (sendingType, to, cc, sign, attachments) => editNewMessage(dispatch, sendingType, to, cc, sign, attachments),
  selectFolder: (folder, user) => {
    dispatch(selectFolder(folder));
    clearSelectedMessage(dispatch);
    dispatch(clearSelected());
    resetFolderMessagesCache(dispatch, user, folder);
  },
  messageClicked: (credentials, downloadedMessages, folder, message) => {
    dispatch(selectMessage(message));
    readMessage(dispatch, credentials, downloadedMessages, folder, message);
  },
  // setEmailShown: flag => dispatch(setEmailShown(flag)),
  outboxEventNotified: () => dispatch(outboxEventNotified()),
  logout: () => {
    dispatch(clearUserCredentials());
    history.push('/login');
  },
  close: application => {
    dispatch(editMessage(null));
    //persistApplicationNewMessageContent(application, "");
  },
  setError: (err, msg) => dispatch(setError(err, msg)),
  // resetIdEmail: () => dispatch(resetIdEmail()),
  // setCaseFile: casefile => dispatch(setCaseFile(casefile)),
  // setSelected: (messages, selected, shiftKey) =>
  //   dispatch(setSelected(messages, selected, shiftKey)),
  setGUID: guid => dispatch(setGUID(guid)),
  setSign: sign => dispatch(setSign(sign)),
  setUserApp: app => dispatch(setUserApp(app)),
  preloadSignatures: (userId, auth) => preloadSignatures2(dispatch, userId, auth),
  preloadEmails: (userId, auth) => preloadEmails(dispatch, userId, auth),
  signatureClicked: signature => dispatch(selectSignature(signature)),
  emailClicked: email => dispatch(selectEmail(email)),
  getAttachmentLex: (bbdd, id, user) => getAttachmentLex(bbdd, id, user),
  getAttachmentCen: (userId, documentId) => getAttachmentCen(userId, documentId),
  setIdDocuments: ids => dispatch(setIdDocuments(ids)),
  backendRequest: () => dispatch(backendRequest()),
  backendRequestCompleted: () => dispatch(backendRequestCompleted()),
  setSelectedService: service => dispatch(setSelectedService(service)),
  setAppTitle: title => dispatch(setAppTitle(title)),
  setTitle: title => dispatch(setTitle(title))
});

const mergeProps = (stateProps, dispatchProps, ownProps) =>
  Object.assign({}, stateProps, dispatchProps, ownProps, {
    reloadFolders: () =>
      dispatchProps.reloadFolders(stateProps.application.user.credentials),
    reloadMessageCache: folder =>
      dispatchProps.reloadMessageCache(stateProps.application.user, folder),
    selectFolder: folder =>
      dispatchProps.selectFolder(folder, stateProps.application.user),
    messageClicked: message =>
      dispatchProps.messageClicked(
        stateProps.application.user.credentials,
        stateProps.application.downloadedMessages,
        stateProps.receivedFolder,
        message
      ),
    // setEmailShown: flag => dispatchProps.setEmailShown(flag),
    outboxEventNotified: () => dispatchProps.outboxEventNotified(),
    close: application => dispatchProps.close(stateProps.application),
    setError: (err, msg) => dispatchProps.setError(err, msg),
    // resetIdEmail: () => dispatchProps.resetIdEmail(),
    // setCaseFile: casefile => dispatchProps.setCaseFile(casefile),
    preloadSignatures: (userId) => dispatchProps.preloadSignatures(userId, stateProps.application.user.credentials.encrypted),
    signatureClicked: signature => dispatchProps.signatureClicked(signature),
    emailClicked: email => dispatchProps.emailClicked(email),
    getAttachmentLex: (bbdd, id, user) => dispatchProps.getAttachmentLex(bbdd, id, user),
    getAttachmentCen: (userId, documentId) => dispatchProps.getAttachmentCen(userId, documentId),
    setIdDocuments: ids => dispatchProps.setIdDocuments(ids),
    backendRequest: () => dispatchProps.backendRequest(),
    backendRequestCompleted: () => dispatchProps.backendRequestCompleted(),
    preloadEmails: (userId) => dispatchProps.preloadEmails(userId, stateProps.application.user.credentials.encrypted),
    setSelectedService: service => dispatchProps.setSelectedService(service),
    setAppTitle: title => dispatchProps.setAppTitle(title),
    setTitle: title => dispatchProps.setTitle(title)
  });


export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(translate()(App));
