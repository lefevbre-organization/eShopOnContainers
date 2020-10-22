import React, {Component} from 'react';
import {connect} from 'react-redux';
import i18n from 'i18next';

import MenuItem from './menu-item';
import {selectFolder, setTitle, editMessage, setAppTitle, setSelectedService} from '../../actions/application';
import { setSignaturesFilterKey, selectSignature, selectEmail } from '../../actions/application';

import {clearSelected} from '../../actions/messages';
import {clearSelectedMessage} from '../../services/application';
import {resetFolderMessagesCache} from '../../services/message';
import {getSelectedFolder} from '../../selectors/folders';
import styles from './menu-list.scss';
import mainCss from '../../styles/main.scss';
import { persistApplicationNewMessageContent } from '../../services/indexed-db';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import lefebvre, { setUserApp, setGUID, setMailContacts, setAdminContacts, setIdDocuments } from '../../actions/lefebvre';
import { cancelSignatureCen } from "../../services/api-signaturit";

export const DroppablePayloadTypes = {
  FOLDER: 'FOLDER',
  MESSAGES: 'MESSAGES'
};

export class MenuListClass extends Component {
  constructor(props){
    super(props);
    this.state = {
      hideConfirmDialog: false,
      hideAlertDialog: false,
      isDisable: true
    }

  }

  componentDidMount() {
    this.props.setAppTitle(i18n.t('topBar.app'));
    
  }
  
  getConfirm = () => {
    this.setState({hideAlertDialog: true});
  }

  render() {
    const { collapsed, lefebvre } = this.props;
    const selectedFilter = this.props.application.signaturesFilterKey;
    const confirmDiscard = `
      <span class="lf-icon-question" style="font-size:100px; padding: 15px;"></span>
      <div style='text-align: justify; text-justify: inter-word; align-self: center; 
        font-size: 17.5px !important; padding-left: 20px;'>
        ${i18n.t('cancelCentinelaConfirmation.text')}
      </div>
    `;
    const contenido = `
    <img border='0' src='assets/images/icon-warning.png'></img>
    <div style='text-align: justify; text-justify: inter-word; align-self: center;'>
      Lo sentimos. No tienes contratado este servicio de certifiación. 
      Si lo deseas, puedes contactar con nuestro departamento de atención a cliente en el teléfono 911231231 o pinchando <a href='https://www.efl.es/atencion-al-cliente' style='color: white'><u>aquí</u></a>
    </div>`;
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
        <div>
          <MenuItem 
           title={i18n.t('sideBar.filterMenu')}
           icon="lf-icon-signature"
           onClick={this.onClick}
           getConfirm={this.getConfirm}
           collapsed={collapsed}
           optionCancel={true}
           disable={lefebvre.roles
           && lefebvre.roles.includes('Firma Digital') ?
           true : false} /> 

          
          <MenuItem 
           title={i18n.t('sideBar.filterMenuEmail')}
           icon="lf-icon-mail"
           onClick={this.onEmailClick}
           getConfirm={this.getConfirm}
           collapsed={collapsed}
           optionCancel={false}
           disable={lefebvre.roles
           && lefebvre.roles.includes('Email Certificado') ?
           true : false} />
      
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
            close={this.dialogClose.bind(this)}
          />
          
          <DialogComponent 
           id="noServiceDialog" 
           visible={this.state.hideAlertDialog} 
           animationSettings={this.animationSettings} 
           width='50%' 
           showCloseIcon={true} 
           content={contenido}
           ref={alertdialog => this.alertDialogInstance = alertdialog} 
           open={() => this.dialogOpen} 
           close={this.dialogClose.bind(this)}
          />

          <style jsx global>
            {` 
              #noServiceDialog_dialog-header, #noServiceDialog_title, #noServiceDialog_dialog-content, .e-footer-content{
                background: #c5343f;
                color: #fff;
                display:flex;
              }
              .event-disable {
                pointer-events: none;
                opacity: 0.5;
                background: #CCC;
              }
            `}
          </style>
        </div>
    );
  }

  onClick = (event, key) => {
    console.log(event, key);
    const { close, lefebvre, application } = this.props;
    if ((lefebvre.userApp === "cen" || lefebvre.userApp === "centinela" || lefebvre.userApp === "2") && (application.selectedSignature === null || application.selectedSignature === {})){
      this.setState({hideConfirmDialog: true});
    } else {
      event.stopPropagation();
      this.props.signatureClicked(null);
      this.props.emailClicked(null);
      this.props.setSignaturesFilterKey(key);
      this.props.setTitle(event.currentTarget.childNodes[1].textContent);
      this.props.setUserApp('lefebvre');
      this.props.setMailContacts(null);
      this.props.setAdminContacts(null);
      this.props.setGuid(null);
      this.props.setIdDocuments(null);
      this.props.setAppTitle(i18n.t('topBar.app'));
      this.props.setSelectedService('signature');
      this.props.close(this.props.application);
    }
  }

  onEmailClick = (event, key) => {
    console.log(event, key);
    const { close, lefebvre } = this.props;
    if (lefebvre.userApp === "cen" || lefebvre.userApp === "centinela" || lefebvre.userApp === "2"){
      this.setState({hideConfirmDialog: true});
    } else {
      event.stopPropagation();
      this.props.emailClicked(null);
      this.props.signatureClicked(null);
      this.props.setSignaturesFilterKey(key);
      this.props.setTitle(event.currentTarget.childNodes[1].textContent);
      this.props.setAppTitle(i18n.t('topBar.certifiedEmail'));
      this.props.setSelectedService('certifiedEmail'); 
      this.props.close(this.props.application);
      //this.setState({hideAlertDialog: true});
    }
  }

  dialogClose(){
    this.setState({
        hideAlertDialog: false, 
        bigAttachments: false,
        entinelaDownloadError: false,
        hideConfirmDialog: false,
        hideAlertDialog: false
    });
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
      if (lefebvre.mailContacts) {
        this.props.setMailContacts(null);
      }
      if (lefebvre.adminContacts){
        this.props.setAdminContacts(null);
      }
      this.props.setUserApp('lefebvre');
      this.props.setGuid(null);
      //this.props.setTitle(this.props.application.signaturesFilterKey);
      this.props.setTitle('');
      this.props.setIdDocuments(null);
      this.props.close(this.props.application);
  }

}


const mapStateToProps = state => ({
  application: state.application,
  selectedFolder: getSelectedFolder(state) || {},
  foldersState: state.folders,
  messages: state.messages,
  lefebvre: state.lefebvre
});

const mapDispatchToProps = dispatch => ({
  selectFolder: (folder, user) => {
    dispatch(selectFolder(folder));
    clearSelectedMessage(dispatch);
    dispatch(clearSelected());
    resetFolderMessagesCache(dispatch, user, folder);
  },
  setSignaturesFilterKey: (key) => dispatch(setSignaturesFilterKey(key)),
  signatureClicked: signature => dispatch(selectSignature(signature)),
  emailClicked: email => { dispatch(selectEmail(email));},
  setTitle: title => dispatch(setTitle(title)),
  setAppTitle: title => dispatch(setAppTitle(title)),
  setSelectedService: selectService  => dispatch(setSelectedService(selectService)),
  close: (application) => {
    dispatch(editMessage(null));
    // Clear content (editorBlur may be half way through -> force a message in the service worker to clear content after)
    // noinspection JSIgnoredPromiseFromCall
    persistApplicationNewMessageContent(application, '');
  },
  setMailContacts: contacts => dispatch(setMailContacts(contacts)),
  setAdminContacts: contacts => dispatch(setAdminContacts(contacts)),
  setGuid: guid => dispatch(setGUID(guid)),
  setUserApp: app => dispatch(setUserApp(app)),
  setIdDocuments: id => dispatch(setIdDocuments(id))
});

const mergeProps = (stateProps, dispatchProps, ownProps) => (Object.assign({}, stateProps, dispatchProps, ownProps, {
  selectFolder: folder =>
    dispatchProps.selectFolder(folder, stateProps.application.user),
  setSignaturesFilterKey: key => dispatchProps.setSignaturesFilterKey(key),
  signatureClicked: signature => dispatchProps.signatureClicked(signature),
  emailClicked: email => dispatchProps.emailClicked(email),
  setTitle: title => dispatchProps.setTitle(title),
  setMailContacts: contacts => dispatchProps.setMailContacts(contacts),
  setAdminContacts: contacts => dispatchProps.setAdminContacts(contacts),
  setGuid: guid => dispatchProps.setGuid(guid),
  setUserApp: app => dispatchProps.setUserApp(app),
  setIdDocuments: id => dispatchProps.setIdDocuments(id)
}));

const MenuList = connect(mapStateToProps, mapDispatchToProps, mergeProps)(MenuListClass);
export default MenuList;
