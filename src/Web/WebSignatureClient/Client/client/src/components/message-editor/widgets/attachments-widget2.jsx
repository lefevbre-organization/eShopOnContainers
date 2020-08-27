import React, {Component} from 'react';
import { connect } from 'react-redux';
import styles from './widgets.scss';
import mainCss from '../../../styles/main.scss';
import { editMessage } from '../../../actions/application';
import i18n from 'i18next';

class AttachmentsWidget extends Component{
    constructor(props){
        super(props);
        this.state = {
            optionSelected: 1,
            isFileType: false
        };
        this.fileInput = null;
        this.onAttachButton = this.onAttachButton.bind(this);
        this.onAttachSelected = this.onAttachSelected.bind(this);
    
    }

    componentDidMount() {
        if (this.fileInput) {
          this.fileInput.onchange = this.onAttachSelected;
        }
    }

    render(){
        return (
            <div className={styles['widget']}>
                <div className={styles['p10']}>
                    <span className={"lf-icon-add " + styles['title-icon']}></span><span className={styles["generic-title"]}>{i18n.t('attachmentsWidget.title')}</span>
                    {this.props.attachments.map((a, i) => (
                        <p id={`p_${i}`} key={`p_${i}`} className={styles["subtitle"]}>{a.fileName} - ({(a.size / 1000000).toFixed(2)} MB)
                            <a id={`a_${i}`} key={`a_${i}`} href="#" onClick={() => this.removeAttachment(a)}>
                                <span id={`s_${i}`} key={`s_${i}`}  className={`lf-icon-trash right ${styles["icon-trash"]} ${styles['right']}`}></span> 
                            </a>
                        </p>
                    ))}
                    <button
                        className={`${mainCss['mdc-button']} ${mainCss['mdc-button--unelevated']} ${styles['right']}`}
                        onClick={this.onAttachButton}
                        disabled={this.props.attachments.length > 0}
                    >
                        {i18n.t('attachmentsWidget.attachButton')}
                        <input
                            ref={r => (this.fileInput = r)}
                            id='file-input'
                            type='file'
                            name='name'
                            style={{ display: 'none' }}
                            multiple={true}
                        />
                    </button>
                    <div className="clearfix"></div>
                </div>
                {this.state.isFileType ? <span className={styles['alert-file-type']}>
                   {i18n.t('attachmentsWidget.messageAlert')}
                    <i className='lf-icon-close-round-full'></i>
                </span> : ''}
                <div className={styles["sign"]}>
                
                    {/* <span className={(this.state.optionSelected === 1 ? 'lf-icon-box-active' : 'lf-icon-box-inactive')}></span>
                    <a href="#" onClick={()=> this.setState({optionSelected: 1})}> {i18n.t('attachmentsWidget.pagesConfiguration.single')}</a>
                    <br></br>
                    <span className={(this.state.optionSelected === 2 ? 'lf-icon-box-active' : 'lf-icon-box-inactive')}></span>
                    <a href="#" onClick={()=> this.setState({optionSelected: 2})}> {i18n.t('attachmentsWidget.pagesConfiguration.all')}</a> */}

                    {/* <span className={(this.state.optionSelected === 1 ? 'lf-icon-step-final' : 'lf-icon-step-first')} style={{color: '#001970'}}></span>
                    <a href="#" onClick={()=> this.setState({optionSelected: 1})}> {i18n.t('attachmentsWidget.pagesConfiguration.single')}</a>
                    <br></br>
                    <span className={(this.state.optionSelected === 2 ? 'lf-icon-step-final' : 'lf-icon-step-first')}  style={{color: '#001970'}}></span>
                    <a href="#" onClick={()=> this.setState({optionSelected: 2})}> {i18n.t('attachmentsWidget.pagesConfiguration.all')}</a> */}

                    {/* <span className={(this.state.optionSelected === 1 ? 'lf-icon-radio-button-active' : 'lf-icon-step-first')} style={{color: '#001970'}}></span>
                    <a href="#" onClick={()=> this.setState({optionSelected: 1})}> {i18n.t('attachmentsWidget.pagesConfiguration.single')}</a>
                    <br></br>
                    <span className={(this.state.optionSelected === 2 ? 'lf-icon-radio-button-active' : 'lf-icon-step-first')}  style={{color: '#001970'}}></span>
                    <a href="#" onClick={()=> this.setState({optionSelected: 2})}> {i18n.t('attachmentsWidget.pagesConfiguration.all')}</a> */}

                    <span className={(this.state.optionSelected === 1 ? 'lf-icon-check-round-full' : 'lf-icon-step-first')} style={{color: '#001970'}}></span>
                    <a href="#" onClick={()=> {this.setState({optionSelected: 1}); this.props.onSelectNumPages(1)}}> {i18n.t('attachmentsWidget.pagesConfiguration.single')}</a>
                    <br></br>
                    <span className={(this.state.optionSelected === 2 ? 'lf-icon-check-round-full' : 'lf-icon-step-first')}  style={{color: '#001970'}}></span>
                    <a href="#" onClick={()=> {this.setState({optionSelected: 2}); this.props.onSelectNumPages(2)}}> {i18n.t('attachmentsWidget.pagesConfiguration.all')}</a>

                </div>
                <div className="clearfix"></div>
            </div>)
    }

    onAttachButton() {
        this.setState({isFileType: false});
        return this.fileInput && this.fileInput.click();
    }

    onAttachSelected(event) {
        event.preventDefault();
        event.stopPropagation();

        const addAttachment = (file, dataUrl) => {
           const fileType = file.name.split('.');
            if(fileType[1] == 'pdf' || fileType[1] == 'docx' 
            || fileType[1] == 'doc') {
              const pdfjsLib = require('pdfjs-dist');
              pdfjsLib.GlobalWorkerOptions.workerSrc = '../../../../assets/scripts/pdf.worker.js'
  
              const newAttachment = {
              fileName: file.name,
              size: file.size,
              contentType: file.type,
              content: dataUrl.currentTarget.result.replace(
                  /^data:[^;]*;base64,/,
                  ''
              ),
              };
  
              pdfjsLib.getDocument({data: atob(newAttachment.content)})
              .promise.then(doc => {
                  var numPages = doc.numPages;
                  newAttachment.pages = numPages;
                  console.log('# Document Loaded');
                  console.log('Number of Pages: ' + numPages);
  
                  const updatedMessage = { ...this.props.editedMessage };
                  updatedMessage.attachments = updatedMessage.attachments
                      ? [...updatedMessage.attachments, newAttachment]
                      : [newAttachment];
                  this.props.editMessage(updatedMessage);
              });
            } else {
                this.setState({isFileType: true});
                console.log('tipo de archivo invalido!');
            }
           
        };
        Array.from(event.target.files).forEach((file) => {
          const fileReader = new FileReader();
          fileReader.onload = addAttachment.bind(this, file);
          fileReader.readAsDataURL(file);
        });
        return true;
    }

    removeAttachment(attachment) {
        const userApp = this.props.userApp;
        if (userApp === 'centinela' || userApp === 'cen' || userApp == 2){
            this.props.onConfirmAttachRemoval();
        } else {
            this.setState({isFileType: false});
            const updatedMessage = { ...this.props.editedMessage };
            if (updatedMessage.attachments && updatedMessage.attachments.length) {
                updatedMessage.attachments = updatedMessage.attachments.filter(
                (a) => a !== attachment
                );
                this.props.editMessage(updatedMessage);
            }
        }
    }
    
}

const mapStateToProps = (state) => ({
    attachments: state.application.newMessage.attachments,
    editedMessage: state.application.newMessage,
    userApp: state.lefebvre.userApp
  });
  
  const mapDispatchToProps = (dispatch) => ({
    editMessage: (message) => {
        dispatch(editMessage(message));
      }
    
  });
  
  export default connect(
    mapStateToProps,
    mapDispatchToProps
  )((AttachmentsWidget));