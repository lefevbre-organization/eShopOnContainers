import React, { Component } from 'react';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { Col } from 'reactstrap';
import Dropzone from "react-dropzone";
import styles from './message-editor.scss';



class DocumentMessageEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
        files: []
    }

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

  omponentWillUnmount() {
    // Make sure to revoke the data uris to avoid memory leaks
    this.state.files.forEach(file => URL.revokeObjectURL(file.preview))
  }

  render() {
    const {files} = this.state;

    const thumbs = files.map(file => (
        <div key={file.name}>
          <div>
            <img
              src={file.preview}
            />
          </div>
        </div>
      ));

    return (
        <Col md="12" className={styles['document-message-editor']}>
            <div className={styles['box-attach']}>
            <Dropzone
                onDrop={this.onDrop.bind(this)}
                accept="image/*,audio/*,video/*"
            >
          {({getRootProps, getInputProps}) => (
            <div {...getRootProps({ className: styles['dropzone'] })}>
              <input {...getInputProps()} />
              <p>Drop files here</p>
            </div>
          )}
        </Dropzone>
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