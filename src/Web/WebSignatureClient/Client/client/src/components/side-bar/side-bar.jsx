import React, { Component } from 'react';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import PropTypes from 'prop-types';
import i18n from 'i18next';
import MenuContainer from '../folders/menu-container';
import { DroppablePayloadTypes } from '../folders/menu-list';
import IconButton from '../buttons/icon-button';
import { moveFolder } from '../../services/folder';
import mainCss from '../../styles/main.scss';
import styles from './side-bar.scss';
import { editNewMessage } from '../../services/application';
import PerfectScrollbar from 'react-perfect-scrollbar';
import 'react-perfect-scrollbar/dist/css/styles.css';
import { getAvailableSignatures, getNumAvailableSignatures } from '../../services/api-signaturit';
import { setAvailableSignatures, setNumAvailableSignatures, setUserApp } from '../../actions/lefebvre';
import { setTitle, setAppTitle } from '../../actions/application';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import SendingTypeSelector from './sending-type-selector/sending-type-selector';

class SideBar extends Component {
  constructor(props) {
    console.log('Entra en el side-bar');
    super(props);
    this.state = {
      dragOver: false,
      hideAlertDialog: false,
      hideSendingTypeDialog: false,
      hideConfirmDialog: false
    };
    this.handleOnDragOver = this.onDragOver.bind(this);
    this.handleOnDragLeave = this.onDragLeave.bind(this);
    this.handleOnDrop = this.onDrop.bind(this);
    this.handleOnNewMessage = this.onNewMessage.bind(this);
    this.handleOnNewEmailCertificate = this.onNewEmailCertificate.bind(this);
    this.handleOnNewSending = this.onNewSending.bind(this);
    this.dialogClose = this.dialogClose.bind(this);
    
    //Sin firmas 
    this.animationSettings = { effect: 'None' };
    this.alertButtonRef = element => {
      this.alertButtonEle = element;
    };
    this.alertButtons = [{
      // Click the footer buttons to hide the Dialog
      click: () => {
          this.setState({ hideAlertDialog: false });
      },
      buttonModel: { content: 'Aceptar', isPrimary: true }
    }];
  }

  buttonClick(args) {
    if (args.target.innerHTML.toLowerCase() == 'alert') {
        this.setState({ hideAlertDialog: true });
    }
  }

  dialogClose() {
    this.setState({
        hideAlertDialog: false,
        hideConfirmDialog: false
    });
    //this.alertButtonEle.style.display = 'inline-block';
  }

  sendTypeDialogClose() {
    this.setState({
      hideSendingTypeDialog: false
  });
  }

  dialogOpen() {
    //this.alertButtonEle.style.display = 'none';
  }

  onFocus(args) {
      this.spanEle.classList.add('e-input-focus');
  }

  onBlur(args) {
      this.spanEle.classList.remove('e-input-focus');
  }


  render() {
    const { t, collapsed, lefebvre } = this.props;
    const { dragOver } = this.state;

    const contenido = `
      <img border='0' src='assets/images/icon-warning.png'></img>
      <div style='text-align: justify; text-justify: inter-word; align-self: center;'>
        ${i18n.t('noCreditsModal.text')}
        ${i18n.t('noCreditsModal.text2')}
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

    return (
      <aside
        onDragOver={this.handleOnDragOver}
        onDragLeave={this.handleOnDragLeave}
        onDrop={this.handleOnDrop}
        className={`${styles['side-bar']}
          ${mainCss['mdc-drawer']}
          ${mainCss['mdc-drawer--dismissible']}
          ${SideBar.getCollapsedClassName(collapsed)}
          ${dragOver ? styles.dropZone : ''}`}>
        <div
          className={`${mainCss['mdc-drawer__header']} 
          ${styles['top-container']} 
          ${!collapsed ? styles['divheader'] : 
          styles['divheader-without-side-bar']}`}>
          {this.props.errors.diskQuotaExceeded && (
            <span
              isotip={t('sideBar.errors.diskQuotaExceeded')}
              isotip-position='bottom-start'
              isotip-size='small'>
              disc_full
            </span>
          )}
          <div className={`${!collapsed ? styles['add-signature-toggle'] : ''}`}>

            { collapsed ?  
              <span
               className={styles['toggle-without-side-bar']}
               isotip-position='bottom-end'
               isotip-size='larger'>
                <IconButton onClick={this.props.sideBarToggle}>
                <span className='lf-icon-angle-right'></span>
                </IconButton>   
              </span> :  
              <span
               className={styles.toggle, styles['button-toggle']}
               isotip={t('sideBar.hide')}
               isotip-position='bottom-end'
               isotip-size='larger'>
                <IconButton onClick={this.props.sideBarToggle}>
                <span className='lf-icon-angle-left'></span>
                </IconButton> 
               </span> 
            } 
            <button
              style={{ height: 48 }}
              className={`${mainCss['mdc-button']}
                      ${mainCss['mdc-button']} ${styles['nueva-firma']}`}
              onClick={this.handleOnNewSending}>
              <img
                className={styles.plusbuttton}
                border='0'
                src='assets/images/plus.png'></img>
              { !collapsed ?<span className='mdc-button__label' style={{ fontSize: 10.6 }}>
                {t('sideBar.newRequest')}
              </span> : "" }
            </button>
         
          </div>
         
        </div>
        <PerfectScrollbar>
          <MenuContainer collapsed={collapsed} />
        </PerfectScrollbar>
        <DialogComponent 
          id="sendingTypeDialog" 
          header={i18n.t('sideBar.typeSending')}
          visible={this.state.hideSendingTypeDialog} 
          animationSettings={this.animationSettings} 
          width='40%' 
          showCloseIcon={true} 
          open={this.dialogOpen.bind(this)} 
          close={this.sendTypeDialogClose.bind(this)} >
          <SendingTypeSelector 
            onNewMessage={this.handleOnNewMessage}
            onNewEmailCertificate={this.handleOnNewEmailCertificate}
            lefebvre={lefebvre}
          />
        </DialogComponent>
        <DialogComponent 
          id='noSignaturesDialog'
          header=' ' 
          visible={this.state.hideAlertDialog} 
          animationSettings={this.animationSettings} 
          width='50%' 
          showCloseIcon={true} 
          content={contenido}//'Lo sentimos has agotado el número máximo de firmas contratadas. Si lo deseas, puedes contactar con nuestro departamento de atención a cliente en el teléfono 911231231 o pinchando aquí' 
          ref={alertdialog => this.alertDialogInstance = alertdialog} 
          open={this.dialogOpen.bind(this)} 
          close={this.dialogClose}
        ></DialogComponent>
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
          open={this.dialogOpen.bind(this)} 
          close={this.dialogClose}
        />
        <style jsx global>
          {`
            #sendingTypeDialog {
              top: 17% !important;
            }

            #sendingTypeDialog .e-dlg-header {
              width: 60% !important;
            }

            #noSignaturesDialog_dialog-header, 
            #noSignaturesDialog_title, 
            #noSignaturesDialog_dialog-content, 
            .e-footer-content  {
              background: #c5343f !important;
              color: #fff !important;
              display:flex !important;
            }

            #sendingTypeDialog_dialog-header, #sendingTypeDialog_title {
              background: #001978;
              color: #fff;
              font-size: 14px;
              padding-left: 22px;
            }

            #sendingTypeDialog_dialog-header {
              padding: 24px !important;
            }

            #sendingTypeDialog_dialog-content {
              padding-top: 15px;
              padding-bottom: 30px;
            }

            #confirmDialog_dialog-header > button > span {
              color: white;
              font-size: 12px;
            }

            #sendingTypeDialog_dialog-header > button > span {
              color: white;
              font-size: 12px;
            }

            .e-dlg-header {
              width: 1% !important;
            }

            .e-dialog .e-icon-dlg-close::before {
              content: '\e7fc';
              position: relative;
              font-size: 12px
            }

            #noSignaturesDialog .e-btn.e-flat.e-primary {
              color: #fff !important;
            }
          `}
        </style>
      </aside>
    );
  }


  onNewSending() {
    this.setState({hideSendingTypeDialog: true});
  }

  dialogClose(){
    this.setState({
        hideConfirmDialog: false
    });
  }

  onDiscardSignatureOk(){
    const {lefebvre, application} = this.props

    cancelSignatureCen(lefebvre.guid)
    .then(res => {
      console.log(res);
    })
    .catch(err => {
      console.log(err);
    })

    this.setState({ hideConfirmDialog: false });

    getAvailableSignatures(lefebvre.idUserApp, 1)
      .then(response => {
        setAvailableSignatures(response.data);
        if (response.data === false || response.data === "false"){
          //alert('Ha agotado todas sus solicitudes de firma. Debe comprar más');
          this.setState({ hideAlertDialog: true });
          // Lo pongo para poder probar siempre aunque devuelva false, luego hay que quitar las tres líneas que siguen este comentario.
          if (window.REACT_APP_ENVIRONMENT === 'PREPRODUCTION' || window.REACT_APP_ENVIRONMENT === 'LOCAL'){
            this.props.setAvailableSignatures(response.data);
            this.props.setTitle(t('messageEditor.title'));
            this.props.setAppTitle(i18n.t('topBar.app'));
            this.props.newMessage('signature', lefebvre.sign);
            this.props.setUserApp('lefebvre');
            this.props.setMailContacts(null);
            this.props.setAdminContacts(null);
            this.props.setGuid(null);
            this.props.setIdDocuments(null);

          }
        } else {
          this.props.setAvailableSignatures(response.data);
          this.props.setTitle(t('messageEditor.title'));
          this.props.setAppTitle(i18n.t('topBar.app'));
          this.props.newMessage('signature', lefebvre.sign);
          this.props.setUserApp('lefebvre');
          this.props.setMailContacts(null);
          this.props.setAdminContacts(null);
          this.props.setGuid(null);
          this.props.setIdDocuments(null);
        }
      })
      .catch(err => {
        if (err.message === "Failed to fetch"){
          //Mostrar aviso no se han podido recuperar firmas
          //alert('No se ha podido comprobar si tiene firmas disponibles');
          this.setState({ hideAlertDialog: true });
          // this.props.setAvailableSignatures(1);
          if (window.REACT_APP_ENVIRONMENT === 'PREPRODUCTION' || window.REACT_APP_ENVIRONMENT === 'LOCAL'){
            this.props.setAppTitle(i18n.t('topBar.app'));
            this.props.newMessage('signature', lefebvre.sign);
            this.props.setTitle(t('messageEditor.title'));
            this.props.setUserApp('lefebvre');
            this.props.setMailContacts(null);
            this.props.setAdminContacts(null);
            this.props.setGuid(null);
            this.props.setIdDocuments(null);
          }
        }
      })
    
    getNumAvailableSignatures(lefebvre.idUserApp)
      .then(res => this.props.setNumAvailableSignatures(parseInt(res.data)))
      .catch(err => {
          console.log(err);
          this.props.setNumAvailableSignatures(0);
      });
  }

  onNewMessage() {
    const { lefebvre, t, application } = this.props;

    if ((lefebvre.userApp === "cen" || lefebvre.userApp === "centinela" || lefebvre.userApp === "2") && (application.selectedSignature === null || application.selectedSignature === {})){
      this.setState({hideConfirmDialog: true});
    } 
    else {
      getAvailableSignatures(lefebvre.idUserApp, 1)
      .then(response => {
        setAvailableSignatures(response.data);
        if (response.data === false || response.data === "false"){
          //alert('Ha agotado todas sus solicitudes de firma. Debe comprar más');
          this.setState({ hideAlertDialog: true });
          // Lo pongo para poder probar siempre aunque devuelva false, luego hay que quitar las tres líneas que siguen este comentario.
          if (window.REACT_APP_ENVIRONMENT === 'PREPRODUCTION' || window.REACT_APP_ENVIRONMENT === 'LOCAL'){
            if (lefebvre.userId === 'E1654569'){
              this.props.setAvailableSignatures(response.data);
              this.props.newMessage('signature', lefebvre.sign);
              this.props.setAppTitle(i18n.t('topBar.app'));
              this.props.setTitle(i18n.t('messageEditor.title'));
              this.props.setUserApp('lefebvre');
            }
          }
        } else {
          this.props.setAvailableSignatures(response.data);
          this.props.newMessage('signature', lefebvre.sign);
          this.props.setAppTitle(i18n.t('topBar.app'));
              this.props.setTitle(i18n.t('messageEditor.title'));
          this.props.setUserApp('lefebvre');        }
      })
      .catch(err => {
        if (err.message === "Failed to fetch"){
          //Mostrar aviso no se han podido recuperar firmas
          //alert('No se ha podido comprobar si tiene firmas disponibles');
          this.setState({ hideAlertDialog: true });
          // this.props.setAvailableSignatures(1);
          if (window.REACT_APP_ENVIRONMENT === 'PREPRODUCTION' || window.REACT_APP_ENVIRONMENT === 'LOCAL'){
            if (lefebvre.userId === 'E1654569'){
              this.props.newMessage('signature', lefebvre.sign);
              this.props.setAppTitle(i18n.t('topBar.app'));
              this.props.setTitle(i18n.t('messageEditor.title'));
              this.props.setUserApp('lefebvre');
            }
          }
        }
      })

      getNumAvailableSignatures(lefebvre.idUserApp)
      .then(res => this.props.setNumAvailableSignatures(parseInt(res.data)))
      .catch(err => {
          console.log(err);
          this.props.setNumAvailableSignatures(0);
      });
    }
    this.sendTypeDialogClose();
  }

  onNewEmailCertificate() {
    const { lefebvre, t, application } = this.props;

    if ((lefebvre.userApp === "cen" || lefebvre.userApp === "centinela" || lefebvre.userApp === "2") && (application.selectedSignature === null || application.selectedSignature === {})){
      this.setState({hideConfirmDialog: true});
    } 
    else {
      getAvailableSignatures(lefebvre.idUserApp, 1)
      .then(response => {
        setAvailableSignatures(response.data);
        if (response.data === false || response.data === "false"){
          //alert('Ha agotado todas sus solicitudes de firma. Debe comprar más');
          this.setState({ hideAlertDialog: true });
          // Lo pongo para poder probar siempre aunque devuelva false, luego hay que quitar las tres líneas que siguen este comentario.
          if (window.REACT_APP_ENVIRONMENT === 'PREPRODUCTION' || window.REACT_APP_ENVIRONMENT === 'LOCAL'){
            if (lefebvre.userId === 'E1654569'){
              this.props.setAvailableSignatures(response.data);
              this.props.newMessage('emailCertificate', null);
              this.props.setAppTitle(i18n.t('topBar.certifiedEmail'));
              this.props.setTitle(i18n.t('messageEditor.certifiedEmailTitle'));
              this.props.setUserApp('lefebvre');
            }
          }
        } else {
          this.props.setAvailableSignatures(response.data);
          this.props.newMessage('emailCertificate', null);
          this.props.setAppTitle(i18n.t('topBar.certifiedEmail'));
          this.props.setTitle(i18n.t('messageEditor.certifiedEmailTitle'));
          this.props.setUserApp('lefebvre');        }
      })
      .catch(err => {
        if (err.message === "Failed to fetch"){
          //Mostrar aviso no se han podido recuperar firmas
          //alert('No se ha podido comprobar si tiene firmas disponibles');
          this.setState({ hideAlertDialog: true });
          // this.props.setAvailableSignatures(1);
          if (window.REACT_APP_ENVIRONMENT === 'PREPRODUCTION' || window.REACT_APP_ENVIRONMENT === 'LOCAL'){
            if (lefebvre.userId === 'E1654569'){
              this.props.newMessage('emailCertificate', null);
              this.props.setAppTitle(i18n.t('topBar.certifiedEmail'));
              this.props.setTitle(i18n.t('messageEditor.certifiedEmailTitle'));
              this.props.setUserApp('lefebvre');
            }
          }
        }
      })

      getNumAvailableSignatures(lefebvre.idUserApp)
      .then(res => this.props.setNumAvailableSignatures(parseInt(res.data)))
      .catch(err => {
          console.log(err);
          this.props.setNumAvailableSignatures(0);
      });
    }
    this.sendTypeDialogClose();
  }

  onDragOver(event) {
    event.preventDefault();
    if (
      event.dataTransfer.types &&
      Array.from(event.dataTransfer.types).includes('application/json')
    ) {
      this.setState({ dragOver: true });
    }
  }

  onDragLeave(event) {
    event.preventDefault();
    this.setState({ dragOver: false });
  }

  onDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    this.setState({ dragOver: false });
    if (
      event.dataTransfer.types &&
      Array.from(event.dataTransfer.types).includes('application/json')
    ) {
      const payload = JSON.parse(
        event.dataTransfer.getData('application/json')
      );
      if (payload.type === DroppablePayloadTypes.FOLDER) {
        this.props.moveFolderToFirstLevel(payload.folder);
      }
    }
  }

  static getCollapsedClassName(collapsed) {
    return collapsed ? '' : `${styles.open} ${mainCss['mdc-drawer--open']}`;
  }
}

SideBar.propTypes = {
  t: PropTypes.func.isRequired,
  sideBarToggle: PropTypes.func.isRequired,
  collapsed: PropTypes.bool.isRequired,
  application: PropTypes.object,
  errors: PropTypes.object,
  newMessage: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  application: state.application,
  errors: state.application.errors,
  lefebvre: state.lefebvre
});

const mapDispatchToProps = dispatch => ({
  moveFolderToFirstLevel: (user, folder) =>
    moveFolder(dispatch, user, folder, null),
  newMessage: (sendingType, sign) => editNewMessage(dispatch, sendingType, [], [], sign),
  setAvailableSignatures: num => dispatch(setAvailableSignatures(num)),
  setNumAvailableSignatures: num => dispatch(setNumAvailableSignatures(num)),
  setTitle: title => dispatch(setTitle(title)),
  setAppTitle: title => dispatch(setAppTitle(title)),
  setUserApp: app => dispatch(setUserApp(app))
});

const mergeProps = (stateProps, dispatchProps, ownProps) =>
  Object.assign({}, stateProps, dispatchProps, ownProps, {
    moveFolderToFirstLevel: folder =>
      dispatchProps.moveFolderToFirstLevel(stateProps.application.user, folder),
    setAvailableSignatures: num => dispatchProps.setAvailableSignatures(num),
    setNumAvailableSignatures: num => dispatchProps.setNumAvailableSignatures(num),
    setTitle: title => dispatchProps.setTitle(title),
    setUserApp: app => dispatchProps.setUserApp(app)
  });

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(translate()(SideBar));
