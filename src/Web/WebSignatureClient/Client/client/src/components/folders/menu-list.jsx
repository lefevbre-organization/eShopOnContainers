import React, {Component} from 'react';
import {connect} from 'react-redux';
import i18n from '../../services/i18n';

import MenuItem from './menu-item';
import {selectFolder, setTitle, editMessage, setAppTitle} from '../../actions/application';
import { setSignaturesFilterKey, selectSignature } from '../../actions/application';

import {clearSelected} from '../../actions/messages';
import {clearSelectedMessage} from '../../services/application';
import {resetFolderMessagesCache} from '../../services/message';
import {getSelectedFolder} from '../../selectors/folders';
import styles from './menu-list.scss';
import mainCss from '../../styles/main.scss';
import { persistApplicationNewMessageContent } from '../../services/indexed-db';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import { AccordionComponent, AccordionItemDirective, AccordionItemsDirective } from '@syncfusion/ej2-react-navigations';
import { setUserApp, setGUID, setMailContacts, setAdminContacts, setIdDocuments } from '../../actions/lefebvre';

export const DroppablePayloadTypes = {
  FOLDER: 'FOLDER',
  MESSAGES: 'MESSAGES'
};

export class MenuListClass extends Component {
  constructor(props){
    super(props);
    this.state = {
      hideConfirmDialog: false,
      isDisable: true
    }

  }

  expanding = (e) => {
    if(e.index == 0) {
      this.props.setAppTitle(i18n.t('topBar.app'));
    } else {
      this.props.setAppTitle(i18n.t('topBar.certifiedEmail'));
    }
  }

  content = () => {
    const { collapsed } = this.props;
    const option1 = 'En progreso';
    const option2 = 'Completadas';
    const option3 = 'Mostrar todas';
    const option4 = 'Canceladas';
    return (
      <ul className={`${styles['nav-firmas']}`}>
        <li className={`${styles.todas}`}>
          <a href="#" id={option3} onClick={event => this.onClick(event, option3)}>
            <span className="lf-icon-folder"> 
            </span> 
            { 
             collapsed ?  ''  : 
             <span>{i18n.t('sideBar.filterAll')}</span>
             } 
          </a>
        </li>
        <li className={`${styles['en-progreso']}`}>
          <a href="#" id={option1} onClick={event => this.onClick(event, option1)}>
            <span className="lf-icon-folder">
            </span>
            { 
             collapsed ?  ''  : 
             <span>{i18n.t('sideBar.filterInProgress')}</span>
            } 
          </a>
        </li>
        <li className={`${styles.completadas}`}>
          <a href="#" id={option2} onClick={event => this.onClick(event, option2)}>
            <span className="lf-icon-folder">
            </span>
            { 
             collapsed ?  ''  : 
             <span>{i18n.t('sideBar.filterCompleted')}</span>
            } 
          </a>
        </li>
        <li className={`${styles.canceladas}`}>
          <a href="#" id={option4} onClick={event => this.onClick(event, option4)}>
            <span className="lf-icon-folder">
            </span>
            { 
             collapsed ?  ''  : 
             <span>{i18n.t('sideBar.filterCancelled')}</span>
            } 
          </a>
        </li>
      </ul>
 
    ); 
  }

  render() {
    const { collapsed } = this.props;
    const selectedFilter = this.props.application.signaturesFilterKey;
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
        // <div key={'firmas'} className={`${styles.itemContainer}`}>
        <div>
          <AccordionComponent expandMode='Single' expanding={this.expanding}  >
            <div>  
              { 
               collapsed ?  
                <div className={`${styles['title-nav-firmas']}`} >
                 <span className="lf-icon-signature">
                 </span>
                </div> :  
                <div className={`${styles['title-nav-firmas']}`}>
                 <span className="lf-icon-signature">
                 </span>{i18n.t('sideBar.filterMenu')}
                </div>
              }  
              <div>
               {this.content()}
              </div>
            </div>
            <div className={'event-disable'}>
              { 
               collapsed ?  
                <div className={`${styles['title-nav-firmas']}`}>
                 <span className="lf-icon-mail">
                 </span>
                </div> :  
                <div className={`${styles['title-nav-firmas']}`}>
                 <span className="lf-icon-mail">
                 </span>{i18n.t('sideBar.filterMenuEmail')}
                </div>
              }  
              <div>
               {this.content()}
              </div>
            </div>
          </AccordionComponent>
        
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
            open={() => this.dialogOpen} 
            close={() => this.dialogClose}
          />
          {/* <MenuItem
            label={'Firmas'} 
            graphic={'input'}
            className={styles.item}
            selected={true}
            />
            <nav className={`${mainCss['mdc-list']} ${styles.childList}`}>
              <MenuItem label={option1} graphic={'stop'} selected = {option1 === selectedFilter} onClick={event => this.onClick(event, option1)}/>
              <MenuItem label={option2} graphic={'stop'} selected = {option2 === selectedFilter} onClick={event => this.onClick(event, option2)}/>
              <MenuItem label={option3} graphic={'stop'} selected = {option3 === selectedFilter} onClick={event => this.onClick(event, option3)}/>
            </nav>    */}

          <style jsx global>
            {` 
              .e-acrdn-header {
               padding: 12px 8px 7px 10px !important;
               background: #001978;
              }
              .e-accordion .e-acrdn-item .e-acrdn-header:hover {
                background: #001978;
              }
              .e-accordion .e-acrdn-item .e-acrdn-header:active {
                background: #001978 !important;
              }
              .e-accordion .e-acrdn-item .e-acrdn-header:focus {
                background: #001978 !important;
              }
              .e-accordion .e-acrdn-item.e-select.e-selected.e-expand-state > .e-acrdn-header, 
              .e-accordion .e-acrdn-item.e-select.e-expand-state > .e-acrdn-header {
                background: #001978;
              }
              .e-accordion .e-acrdn-item 
              .e-acrdn-header .e-toggle-icon {
                display: none;
              }
              .e-accordion .e-acrdn-item .e-acrdn-panel .e-acrdn-content {
                padding: 0px;
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

  expanded = (e) => {
    console.log(e);
    
  }

  onClick(event, key) {
    const { close, lefebvre } = this.props;
    if (lefebvre.userApp === "cen" || lefebvre.userApp === "centinela" || lefebvre.userApp === "2"){
      this.setState({hideConfirmDialog: true});
    } else {
      event.stopPropagation();
      this.props.signatureClicked(null);
      this.props.close(this.props.application);
      this.props.setSignaturesFilterKey(key);
      this.props.setTitle(event.currentTarget.childNodes[1].textContent);
    }
  }

  dialogClose(){
    this.setState({
        hideAlertDialog: false, bigAttachments: false, centinelaDownloadError: false, hideConfirmDialog: false
    });
  }

  onDiscardSignatureOk(){
    const {close, lefebvre, application} = this.props
    // cancelSignatureCen(lefebvre.guid)
    // .then(res => {
    //   console.log(res);
    // })
    // .catch(err => {
    //   console.log(err);
    // })

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
  lefebvre: state.lefebvre,
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
  setTitle: title => dispatch(setTitle(title)),
  setAppTitle: title => dispatch(setAppTitle(title)),
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
  setTitle: title => dispatchProps.setTitle(title),
  setMailContacts: contacts => dispatchProps.setMailContacts(contacts),
  setAdminContacts: contacts => dispatchProps.setAdminContacts(contacts),
  setGuid: guid => dispatchProps.setGuid(guid),
  setUserApp: app => dispatchProps.setUserApp(app),
  setIdDocuments: id => dispatchProps.setIdDocuments(id)
}));

const MenuList = connect(mapStateToProps, mapDispatchToProps, mergeProps)(MenuListClass);
export default MenuList;
