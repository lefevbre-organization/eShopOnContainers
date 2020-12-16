import React, { Component } from 'react';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { Col } from 'reactstrap';
import Dropzone from "react-dropzone";
import styles from './message-editor.scss';
import ProgressBar from '../progress-bar/progress-bar';

class DocumentMessageEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
        files: []
    }

  }

  componentWillUnmount() {
    // Make sure to revoke the data uris to avoid memory leaks
    this.state.files.forEach(file => URL.revokeObjectURL(file.preview))
  }

  onDrop(files) {
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
            //  <ProgressBar key={file.name} completed={percentage} />
             console.log(percentage); // Update progress here
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
  }
  
  getSizeFile(size) {
    if (size === 0) return '0 Bytes';

    const kb = 1024;

    const sizes = ['bytes', 'kb', 'mb', 'gb'];

    const i = Math.floor(Math.log(size) / Math.log(kb));

    return parseFloat((size / Math.pow(kb, i)).toFixed(2)) + ' ' + sizes[i];
  } 

  render() {
    const { files } = this.state;
    console.log('document-message-editor', files);
    const thumbs = files.map(file => (
        <div key={file.name}>
          <div className={`${styles['file-list']} mb-3`}>
            <span className="light-blue-text">{file.name}</span>
            <span className="ml-5 light-blue-text">{this.getSizeFile(file.size)}</span>
            <a ><span className="lf-icon-close-round light-blue-text"></span></a>
          </div>
          <ProgressBar key={file.name} completed={60} />
        </div>
      ));

    return (
        <Col md="12" className={styles['document-message-editor']}>
            <div className={styles['box-attach']}>
            <Dropzone
                onDrop={this.onDrop.bind(this)}
                accept="/*,.pdf"
            >
          {({getRootProps, getInputProps}) => (
            <div {...getRootProps({ className: styles['dropzone'] })}>
              <input {...getInputProps()} />
              <span className={`lf-icon-drag-drop ${styles['icon-drag-drop']}`}></span>
              <p className={styles['drop-file']}>Arrastra tu archivo aquí</p>
              <p className={styles['desktop-file']}>o cárgalo desde <a>tu equipo</a> </p>
            </div>
          )}
        </Dropzone>
        <h5 className="light-blue-text">Archivo</h5>
        <aside>
          {thumbs}
        </aside>
            </div>
        </Col> 
    );
  }

}

DocumentMessageEditor.propTypes = {
 
};

DocumentMessageEditor.defaultProps = {

};

const mapStateToProps = (state) => ({
});

const mapDispatchToProps = (dispatch) => ({
  
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(translate()(DocumentMessageEditor));