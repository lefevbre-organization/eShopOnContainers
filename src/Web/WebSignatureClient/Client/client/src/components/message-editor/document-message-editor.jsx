import React, { Component } from 'react';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { Col } from 'reactstrap';
import Dropzone from "react-dropzone";
import i18n from 'i18next';
import { DialogComponent } from '@syncfusion/ej2-react-popups';

import ACTIONS from '../../actions/lefebvre';
import { editMessage, setTitle } from '../../actions/application';
import { persistApplicationNewMessageContent } from '../../services/indexed-db';
import styles from './message-editor.scss';
import ProgressBar from '../progress-bar/progress-bar';
import { createCertifiedDocument } from '../../services/api-signaturit';
import * as uuid from 'uuid/v4';


class DocumentMessageEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
        files: [],
        percentage: 0,
        maxPercentage: 100,
        maxSize: 15,
        hideAlertDialog: false
    }
    this.dialogOpen = this.dialogOpen.bind(this);
    this.animationSettings = { effect: 'None' };
  }

  resetReceivedInfo() {
    this.props.setUserApp('lefebvre');
    this.props.setGuid(null);
    this.props.setTitle('');
    this.props.setIdDocuments(null);
  }

  onDrop(files) {
    const fileSize = Math.floor((files[0].size / Math.pow(1024, 2)))
    if(fileSize <= this.state.maxSize) {
      this.setState({
        files: files.map(file => Object.assign(file, {
          preview: URL.createObjectURL(file)
        }))
      })
      const uploaders = files.map(file => {
        const formData = new FormData()
        formData.append('file', file);
  
              const xhr = new XMLHttpRequest();
              xhr.upload.onprogress = event => {
               const percentage = parseInt((event.loaded / event.total) * 100);
              this.setState({percentage}); // Update progress here
              };
              xhr.onreadystatechange = () => {
                if (xhr.readyState !== 4) return;
                if (xhr.status !== 200) {
                 console.log('error'); // Handle error here
                }
                 console.log('success'); // Handle success here
              };
              xhr.open('POST', 'https://httpbin.org/post', true);
              xhr.send(formData);
      })
    } else {
      this.setState({hideAlertDialog: true});
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

  removeDocumentMessageEditor(aplication) {
    const { close, lefebvre } = this.props;

    if (lefebvre.userApp === "cen" || lefebvre.userApp === "centinela" || lefebvre.userApp === "2"){
      this.setState({hideConfirmDialog: true});
    } else {
      this.resetReceivedInfo();
      close(aplication);
    }
  }

  sendDocument(){
    createCertifiedDocument(this.props.lefebvre.userId, uuid(), this.state.files, this.props.lefebvre.token)
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
        hideAlertDialog: false
    });
  }

  render() {

    const { 
      files, 
      maxPercentage 
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
            <a onClick={() => this.removeFile(file.name)}>
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
      <span class="lf-icon-information" style="font-size:100px; padding: 15px;"></span>
      <div style='text-align: justify; text-justify: inter-word; align-self: center;
        padding-left: 20px; font-size: 17.5px !important'>
        ${i18n.t('bigFileModal.text')}
      </div>`;


    return (
        <Col md="12" className={styles['document-message-editor']}>
          <div className={styles['box-attach']}>
            <Dropzone
                onDrop={this.onDrop.bind(this)}
                accept="/*,.pdf" 
                multiple={false} >
              {({getRootProps, getInputProps}) => (
                <div {...getRootProps({ className: styles['dropzone'] })}>
                  <input {...getInputProps()} />
                  <span className={`lf-icon-drag-drop ${styles['icon-drag-drop']}`}></span>
                  <p className={styles['drop-file']}>{i18n.t('documentEditor.dragDrop')}</p>
                  <p className={styles['desktop-file']}>
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
            id="infoDialogDocument" 
            visible={this.state.hideAlertDialog} 
            animationSettings={this.animationSettings} 
            width='60%' 
            content={noAttachModal}
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
  lefebvre: state.lefebvre
});

const mapDispatchToProps = (dispatch) => ({
  close: (application) => {
    dispatch(editMessage(null));
    // Clear content (editorBlur may be half way through -> force a message in the service worker to clear content after)
    // noinspection JSIgnoredPromiseFromCall
    persistApplicationNewMessageContent(application, '');
  },
  setUserApp: app => dispatch(ACTIONS.setUserApp(app)),
  setTitle: title => dispatch(setTitle(title)),
  setGuid: (guid) => dispatch(ACTIONS.setGUID(guid)),
  setIdDocuments: id => dispatch(ACTIONS.setIdDocuments(id))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(translate()(DocumentMessageEditor));