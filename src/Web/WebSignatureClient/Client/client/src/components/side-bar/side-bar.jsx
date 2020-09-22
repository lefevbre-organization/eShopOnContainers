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
import { getAvailableSignatures } from '../../services/api-signaturit';
import { setAvailableSignatures } from '../../actions/lefebvre';
import { setTitle } from '../../actions/application';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import SendingTypeSelector from './sending-type-selector/sending-type-selector';

class SideBar extends Component {
  constructor(props) {
    console.log('Entra en el side-bar');
    super(props);
    this.state = {
      dragOver: false,
      hideAlertDialog: false,
      hideSendingTypeDialog: false
    };
    this.handleOnDragOver = this.onDragOver.bind(this);
    this.handleOnDragLeave = this.onDragLeave.bind(this);
    this.handleOnDrop = this.onDrop.bind(this);
    this.handleOnNewMessage = this.onNewMessage.bind(this);
    this.handleOnNewSending = this.onNewSending.bind(this);
    
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
        hideAlertDialog: false
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
    const { t, collapsed } = this.props;
    const { dragOver } = this.state;
    const contenido = `
      <img border='0' src='assets/images/icon-warning.png'></img>
      <div style='text-align: justify; text-justify: inter-word; align-self: center;'>
        Lo sentimos has agotado el número máximo de firmas contratadas. 
        Si lo deseas, puedes contactar con nuestro departamento de atención a cliente en el teléfono 912108000 o pinchando <a href='https://www.efl.es/atencion-al-cliente' style='color: white'><u>aquí</u></a>
      </div>`;
    // const contenido = `
    //   <div id='demo-modal' className='modal modal-warning'>
    //       <div className='modal-content'>
    //           <a href='#!' className='right modal-action modal-close waves-effect waves-red btn close-alert'><span class=' lf-icon-close'></span></a>
    //           <span className='lf-icon-warning left icon-alert'></span>
    //           <div class='right w-75'>
    //               <p>Lo sentimos, has agotado el número máximo de firmas contratadas.
    //                   Si lo deseas, puedes contactar con nuestro departamento de atención al
    //                   cliente en el teléfono 911231231 o pinchando <a href='#' class='underline'>aquí</a>.</p>
    //           </div>
    //           <div class='clearfix'></div>
    //       </div>
    //   </div>
    // `
    
    // const contenido = `
    // <div>
    //   <span style='padding-right:3px; padding-top: 3px; display:inline-block;'>
    //     <img border='0' src='assets/images/icon-warning.png'></img>
    //   </span>
    //   <div><p>
    //   Lo sentimos has agotado el número máximo de firmas contratadas. Si lo deseas, puedes contactar con nuestro departamento de atención a cliente en el teléfono 911231231 o pinchando aquí
    //   </p></div>
    // </div>
    // `
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
          {/*{(location.protocol !== 'https:' &&
            <span className='material-icons' isotip={t('sideBar.errors.noSSL')}
              isotip-position='bottom-start' isotip-size='small'>
            lock_open
            </span>)}*/}
          {this.props.errors.diskQuotaExceeded && (
            <span
              className='material-icons'
              isotip={t('sideBar.errors.diskQuotaExceeded')}
              isotip-position='bottom-start'
              isotip-size='small'>
              disc_full
            </span>
          )}
          {/* <img className={styles.logo} border="0" alt="Lefebvre" src="assets/images/logo-elderecho.png"></img>*/}
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
              {/* <i className='material-icons mdc-button__icon' style={{ fontSize: 48 }}>add_circle_outline</i>*/}
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
          // header={i18n.t('sideBar.typeSending')} 
          visible={this.state.hideSendingTypeDialog} 
          animationSettings={this.animationSettings} 
          width='35%' 
          showCloseIcon={true} 
          // isModal={true}
          open={this.dialogOpen.bind(this)} 
          close={this.sendTypeDialogClose.bind(this)} >
          <SendingTypeSelector 
            onNewMessage={this.handleOnNewMessage}
          />
        </DialogComponent>
        <DialogComponent 
          id="noSignaturesDialog" 
          header=' ' 
          visible={this.state.hideAlertDialog} 
          animationSettings={this.animationSettings} 
          width='50%' 
          showCloseIcon={true} 
          content={contenido}//'Lo sentimos has agotado el número máximo de firmas contratadas. Si lo deseas, puedes contactar con nuestro departamento de atención a cliente en el teléfono 911231231 o pinchando aquí' 
          ref={alertdialog => this.alertDialogInstance = alertdialog} 
          //target='#target' 
          // buttons={this.alertButtons} 
          open={this.dialogOpen.bind(this)} 
          close={this.dialogClose.bind(this)}
          //position={ this.position }
        ></DialogComponent>
        <style jsx global>
          {`
            #noSignaturesDialog{
              max-height: 927px;
              width: 300px;
              left: 770px;
              //top: 392.5px;
              z-index: 1001;
              //transform: translateY(+200%);
            }

            #sendingTypeDialog{
              top: 17% !important;
            }

            #sendingTypeDialog .e-dlg-header{
              width: 60% !important;
            }

            #noSignaturesDialog_dialog-header, #noSignaturesDialog_title, #noSignaturesDialog_dialog-content, .e-footer-content{
              background: #c5343f;
              color: #fff;
              display:flex;
            }

            #sendingTypeDialog_dialog-header, #sendingTypeDialog_title, #sendingTypeDialog_dialog-content, .e-footer-content{
              background: #001978;
              color: #fff;
            }

            .e-dlg-header {
              width: 1% !important;
            }

            .e-dialog .e-icon-dlg-close::before {
              content: '\e7fc';
              position: relative;
              font-size: 12px
            }

            noSignaturesDialog .e-btn.e-flat.e-primary {
              color: #fff !important;
            }

            .material-icons {
              font-size: 18px !important;
              color: #001978 !important;
            }

            .right-icon {
              position: absolute;
              right: 0px;
            }
          `}
        </style>
      </aside>
    );
  }

  onNewSending() {
    this.setState({hideSendingTypeDialog: true});
  }

  onNewMessage() {
    const { lefebvre, t } = this.props;

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
          this.props.newMessage(lefebvre.sign);
        }
      } else {
        this.props.setAvailableSignatures(response.data);
        this.props.setTitle(t('messageEditor.title'));
        this.props.newMessage(lefebvre.sign);
      }
    })
    .catch(err => {
      if (err.message === "Failed to fetch"){
        //Mostrar aviso no se han podido recuperar firmas
        //alert('No se ha podido comprobar si tiene firmas disponibles');
        this.setState({ hideAlertDialog: true });
        // this.props.setAvailableSignatures(1);
        if (window.REACT_APP_ENVIRONMENT === 'PREPRODUCTION' || window.REACT_APP_ENVIRONMENT === 'LOCAL'){
          this.props.newMessage(lefebvre.sign);
          this.props.setTitle(t('messageEditor.title'));
        }
      }
    })
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
  newMessage: sign => editNewMessage(dispatch, [], [], sign),
  setAvailableSignatures: num => dispatch(setAvailableSignatures(num)),
  setTitle: title => dispatch(setTitle(title))
});

const mergeProps = (stateProps, dispatchProps, ownProps) =>
  Object.assign({}, stateProps, dispatchProps, ownProps, {
    moveFolderToFirstLevel: folder =>
      dispatchProps.moveFolderToFirstLevel(stateProps.application.user, folder),
    setAvailableSignatures: num => dispatchProps.setAvailableSignatures(num),
    setTitle: title => dispatchProps.setTitle(title)
  });

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(translate()(SideBar));
