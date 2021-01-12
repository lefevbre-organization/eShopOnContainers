import React, { Component } from 'react';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { Col } from 'reactstrap';
import Dropzone from "react-dropzone";
import i18n from 'i18next';
import { DialogComponent } from '@syncfusion/ej2-react-popups';

import ACTIONS from '../../actions/lefebvre';
import { editMessage, setTitle, setSelectedService, setSignaturesFilterKey } from '../../actions/application';
import { persistApplicationNewMessageContent } from '../../services/indexed-db';
import styles from './message-editor.scss';
import ProgressBar from '../progress-bar/progress-bar';
import { createCertifiedDocument, preloadCertifiedDocuments } from '../../services/api-signaturit';
import * as uuid from 'uuid/v4';


class DocumentMessageEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
        files: [],
        percentage: 0,
        maxPercentage: 100,
        maxSize: 15,
        hideAlertDialog: false,
        dialogType: ''
    }
    this.dialogOpen = this.dialogOpen.bind(this);
    this.animationSettings = { effect: 'None' };
  }

  resetReceivedInfo() {
    this.props.setUserApp('lefebvre');
    this.props.setTitle(i18n.t('topBar.certifiedDocument'));
    this.props.setIdDocuments(null);
    this.props.setSelectedService('certifiedDocument'); 
    this.props.setSignaturesFilterKey('Mostrar todas');
  }

  onDrop(files) {
    this.setState({ percentage: 0 });
    const fileSize = Math.floor((files[0].size / Math.pow(1024, 2)))
    if ( fileSize <= this.state.maxSize ) {
      //this.props.editMessage(null);

      this.setState({
        files: files.map(file => Object.assign(file, {
          preview: URL.createObjectURL(file)
        }))
      })

      const addAttachment = (file, dataUrl) => {
        const newAttachment = {
          fileName: file.name,
          size: file.size,
          contentType: file.type,
          content: dataUrl.currentTarget.result.replace(
              /^data:[^;]*;base64,/,
              ''
          ),
          };

          const updatedMessage = { ...this.props.editedMessage };
          updatedMessage.attachments = [newAttachment];
          this.props.editMessage(updatedMessage);
      };

      const updateProgressBar = (fileData) => {
        if (fileData.lengthComputable) {    
          setInterval(() => {
            this.setState({
              percentage: this.state.percentage === 
              this.state.maxPercentage ? 
              this.state.maxPercentage : 
              this.state.percentage + 10
            });
          }, 400);       
         
        }
      }
      
      Array.from(files).forEach((file) => {
        const fileReader = new FileReader();
        //fileReader.addEventListener('progress', handleEvent)
        fileReader.onload = addAttachment.bind(this, file);
        fileReader.onprogress = updateProgressBar.bind(file);
        fileReader.readAsDataURL(file);
        this.setState({isFileType: false});
      });
    } else {
      this.setState({hideAlertDialog: true, dialogType: 'bigFile'});
    }
  }
  
  getSizeFile(size) {
    if (size === 0) return '0 Bytes';

    const kb = 1024;

    const sizes = ['bytes', 'kb', 'mb'];

    const i = Math.floor(Math.log(size) / Math.log(kb));

    return parseFloat((size / Math.pow(kb, i)).toFixed(2)) + ' ' + sizes[i];
  } 

  removeFile(name) {
    const newFiles = this.state.files.filter(x => x.name !== name)
    this.setState({files: newFiles});
  }

  removeDocumentMessageEditor(application) {
    const { close, lefebvre } = this.props;
    this.resetReceivedInfo();
    close(application);
  }

  sendDocument(){ 
    createCertifiedDocument(this.props.lefebvre.userId, uuid(), this.props.attachments, this.props.lefebvre.token)
    .then(() => {
      this.setState({hideAlertDialog: true, dialogType: 'completed'});
      setTimeout(() => {
        this.removeDocumentMessageEditor(this.props.application); 
      }, 1500);
    }).catch((err) => {
      this.setState({hideAlertDialog: true, dialogType: 'error'});         
    });
  }

  dialogOpen(instance){
    switch (instance) {
        case "alertDialog":
            (this.alertDialogInstance && this.alertDialogInstance.cssClass) ? this.alertDialogInstance.cssClass = 'e-fixed' : null;
            break;
        default:
            break;
    }
}

  dialogClose(){
    this.setState({
        hideAlertDialog: false,
        dialogType: ''
    });
  }

  render() {

    const { 
      files, 
      maxPercentage,
      dialogType 
    } = this.state;
    const {
      application,
      lefebvre
    } = this.props;

    const thumbs = files.map(file => (
        <div key={file.name}>
          <div className={`${styles['file-list']} mb-3`}>
            <span className="light-blue-text">{file.name}</span>
            <span className="ml-5 light-blue-text">{this.getSizeFile(file.size)}</span>
            <a onClick={() => this.removeFile(file.name)} className={styles['lf-icon-remove']}>
             {this.state.percentage === maxPercentage ? 
             <span className="lf-icon-trash light-blue-text"></span> : 
             <span className="lf-icon-close-round light-blue-text"></span>
             } 
            </a>
          </div>
          <ProgressBar key={file.name} completed={this.state.percentage} />
          <div className={`${styles['file-percentage']} mt-2`}>
            <span className="light-blue-text">{`${this.state.percentage}% completado`}</span>
            {/* <span className="light-blue-text">96kb/sec</span> */}
          </div>
        </div>
      ));

      const noAttachModal = `
      <span class="lf-icon-information modal-icon-content"></span>
      <div class="modal-text-content">
        ${i18n.t('bigFileModal.text')}
      </div>`;

      const certifiedModal = `
      <span class="lf-icon-information modal-icon-content"></span>
      <div class="modal-text-content">
        ${i18n.t('documentCertifiedModal.text')}
      </div>`;

      const errorModal = `
      <span class="lf-icon-warning modal-icon-content"></span>
      <div class="modal-text-content">
        ${i18n.t('documentErrorModal.text')}
      </div>`;

    return (
        <Col md="12" className={styles['document-message-editor']}>
          <div className={styles['box-attach']}>
            <Dropzone
                onDrop={this.onDrop.bind(this)}
                // accept="/*,.pdf" 
                multiple={false} >
              {({getRootProps, getInputProps}) => (
                <div {...getRootProps({ className: styles['dropzone'] })}>
                  <input {...getInputProps()} />
                  <span 
                    className={`lf-icon-drag-drop light-blue-text 
                    ${styles['icon-drag-drop']}`}>
                  </span>
                  <p className={`light-blue-text ${styles['drop-file']}`}>{i18n.t('documentEditor.dragDrop')}</p>
                  <p className={`light-blue-text ${styles['desktop-file']}`}>
                    {i18n.t('documentEditor.upload')}
                    <a className="ml-1">
                     {i18n.t('documentEditor.computer')}
                    </a>  
                  </p>
                </div>
               )}
            </Dropzone>
              <h5 className="light-blue-text">{i18n.t('documentEditor.file')}</h5>
            <aside>
              {thumbs}
            </aside>
            {files.length > 0 ?
            <div className={`${styles['container-action']} mt-4`}>
                <button className={`${styles['btn-action']} ${styles['btn-action-cancel']}`}
                  onClick={() => this.removeDocumentMessageEditor(application)}
                >
                  {i18n.t('documentEditor.cancelButton')}
                </button>
                <button className={`${styles['btn-action']} ${styles['btn-action-certification']}`} 
                  disabled={this.state.percentage !== maxPercentage}
                  onClick={() => this.sendDocument()}
                >
                  {i18n.t('documentEditor.acceptButton')}
                </button>
            </div> : null}
          </div>
          <DialogComponent 
            id={dialogType !== 'error' ? 'infoDialogDocument' : 'errorDialogDocument'} 
            visible={this.state.hideAlertDialog} 
            animationSettings={this.animationSettings} 
            width='60%' 
            content={
              dialogType === 'bigFile' ? 
              noAttachModal : 
              dialogType === 'completed' ? 
              certifiedModal : 
              dialogType === 'error' ? 
              errorModal : null 
            }
            ref={alertdialog => this.alertDialogInstance = alertdialog} 
            open={this.dialogOpen("infoDialogDocument")} 
            close={this.dialogClose}
            showCloseIcon={true}
        />   
      </Col>
    );
  }

}

DocumentMessageEditor.propTypes = {
 
};

DocumentMessageEditor.defaultProps = {

};

const mapStateToProps = (state) => ({
  application: state.application,
  lefebvre: state.lefebvre,
  editedMessage: state.application.newMessage,
  attachments: state.application.newMessage.attachments
});

const mapDispatchToProps = (dispatch) => ({
  close: (application) => {
    dispatch(editMessage(null));
    // Clear content (editorBlur may be half way through -> force a message in the service worker to clear content after)
    // noinspection JSIgnoredPromiseFromCall
    persistApplicationNewMessageContent(application, '');
  },
  editMessage: (message) => {
    dispatch(editMessage(message));
  },
  setUserApp: app => dispatch(ACTIONS.setUserApp(app)),
  setTitle: title => dispatch(setTitle(title)),
  setGuid: (guid) => dispatch(ACTIONS.setGUID(guid)),
  setIdDocuments: id => dispatch(ACTIONS.setIdDocuments(id)),
  setSelectedService: selectService  => dispatch(setSelectedService(selectService)),
  setSignaturesFilterKey: key => dispatch(setSignaturesFilterKey(key)),
  preloadCertifiedDocuments: userId => dispatch(preloadCertifiedDocuments(userId))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(translate()(DocumentMessageEditor));