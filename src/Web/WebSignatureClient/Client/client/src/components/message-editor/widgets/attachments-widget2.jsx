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
        return (<div className={styles['widget']}>
        <div className={styles['p10']}>
    <span className={"lf-icon-add " + styles['title-icon']}></span><span className={styles["generic-title"]}>{i18n.t('attachmentsWidget.title')}</span>
            {this.props.attachments.map((a, i) => (
                <p id={`p_${i}`} className={styles["subtitle"]}>{a.fileName} 
                    <a id={`a_${i}`} href="#" onClick={() => this.removeAttachment(a)}>
                        <span id={`s_${i}`} className={`lf-icon-trash right ${styles["icon-trash"]} ${styles['right']}`}></span> 
                    </a>
                </p>
            ))}
            <button
                className={`${mainCss['mdc-button']} ${mainCss['mdc-button--unelevated']} ${styles['right']}`}
                onClick={this.onAttachButton}
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
        <div className={styles["sign"]}>
            <span className="lf-icon-check"></span>
            <a href="#"> {i18n.t('attachmentsWidget.pagesConfiguration')}</a>
        </div>
        <div className="clearfix"></div>
    </div>)
    }

    onAttachButton() {
        return this.fileInput && this.fileInput.click();
    }

    onAttachSelected(event) {
        event.preventDefault();
        event.stopPropagation();
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
          updatedMessage.attachments = updatedMessage.attachments
            ? [...updatedMessage.attachments, newAttachment]
            : [newAttachment];
          this.props.editMessage(updatedMessage);
        };
        Array.from(event.target.files).forEach((file) => {
          const fileReader = new FileReader();
          fileReader.onload = addAttachment.bind(this, file);
          fileReader.readAsDataURL(file);
        });
        return true;
    }

    removeAttachment(attachment) {
        const updatedMessage = { ...this.props.editedMessage };
        if (updatedMessage.attachments && updatedMessage.attachments.length) {
            updatedMessage.attachments = updatedMessage.attachments.filter(
            (a) => a !== attachment
            );
            this.props.editMessage(updatedMessage);
        }
    }
    
}

const mapStateToProps = (state) => ({
    attachments: state.application.newMessage.attachments,
    editedMessage: state.application.newMessage
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
  