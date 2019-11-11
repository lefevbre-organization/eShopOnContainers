import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { bindActionCreators, compose } from "redux";
import {
  getEmailMessage,
  modifyMessages
} from "../actions/message-list.actions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import MessageToolbar from "../message-toolbar/MessageToolbar";

import "./messageContent.scss";

//BEGIN functions for attachment functionality

function b64toBlob(b64Data, contentType, sliceSize) {
  contentType = contentType || "";
  sliceSize = sliceSize || 512;

  var byteCharacters = atob(b64Data);
  var byteArrays = [];

  for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    var slice = byteCharacters.slice(offset, offset + sliceSize);

    var byteNumbers = new Array(slice.length);
    for (var i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    var byteArray = new Uint8Array(byteNumbers);

    byteArrays.push(byteArray);
  }

  var blob = new Blob(byteArrays, { type: contentType });
  return blob;
}

//function getAttachments(messageID, parts, callback) {
//    var attachId = parts.body.attachmentId;
//    var request = window.gapi.client.gmail.users.messages.attachments.get({
//        'id': attachId,
//        'messageId': messageID,
//        'userId': 'me'
//    });
//    request.execute(function (attachment) {
//        callback(parts.filename, parts.mimeType, attachment);
//    });
//}

function addAttachmentElement(blobUrl, filename) {
  var aLink = document.createElement("a");
  var linkText = document.createTextNode(filename);
  aLink.appendChild(linkText);
  aLink.href = blobUrl;
  aLink.title = filename;
  aLink.download = filename;
  aLink.style.textDecoration = "none";
  aLink.style.padding = "5px";
  aLink.style.margin = "15px 0";
  aLink.style.clear = "both";
  return aLink;
}

function addAttachmentContainer(mimeType) {
  var aDiv = document.createElement("span");
  aDiv.style.whiteSpace = "nowrap";
  aDiv.style.backgroundColor = "#fafafa";
  aDiv.style.border = "solid 1px #aaa";
  aDiv.style.padding = "5px";
  aDiv.style.margin = "10px";
  aDiv.style.display = "inline-block";
  var Img = addAttachmentImg(mimeType);
  aDiv.appendChild(Img);
  return aDiv;
}

function addAttachmentImg(mimeType) {
  var aImg = document.createElement("img");
  var imgPath;

  switch (mimeType) {
    case "image/png":
      imgPath = "../assets/img/file-extensions/png.png";
      break;
    case "image/jpeg":
      imgPath = "../assets/img/file-extensions/jpg.png";
      break;
    case "application/pdf":
      imgPath = "../assets/img/file-extensions/pdf.png";
      break;
    case "text/plain":
      imgPath = "../assets/img/file-extensions/txt.png";
      break;
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      imgPath = "../assets/img/file-extensions/doc.png";
      break;
    default:
      imgPath = "../assets/img/file-extensions/default.png";
      break;
    // code block
  }
  aImg.src = imgPath;
  aImg.style.alt = "Attached file";
  //aImg.height = 42;
  //aImg.width = 42;
  aImg.style.display = "inline-block";
  aImg.style.verticalAlign = "middle";
  return aImg;
}

function addDivDivider() {
  var aDiv = document.createElement("div");
  aDiv.style.height = "30px";
  aDiv.id = "Dividier";
  return aDiv;
}

//END functions for attachment functionality

export class MessageContent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      errorMessage: undefined
    };

    this.iframeRef = React.createRef();
    this.modifyMessage = this.modifyMessage.bind(this);
  }

  componentDidMount(prevProps) {
    const messageId = this.props.match.params.id;
    this.props.getEmailMessage(messageId);
  }

  componentDidUpdate(prevProps) {
    const { emailMessageResult } = this.props;
    if (!emailMessageResult.loading) {
      if (!emailMessageResult.failed) {
        if (this.iframeRef.current) {
          const { body } = this.iframeRef.current.contentWindow.document;
          body.style.margin = "0px";
          body.style.fontFamily = "Arial, Helvetica, sans-serif";
          body.style.fontSize = "13px";
          body.innerHTML = this.props.emailMessageResult.body.content;

          //Adding attach files
          var attach = emailMessageResult.attach;
          if (typeof attach !== "undefined" && attach.length > 0) {
            var iframe = document.getElementById("message-iframe");
            var Divider = addDivDivider();
            iframe.contentDocument.body.appendChild(Divider);
            for (var i = 0; i < attach.length; i++) {
              let dataBase64Rep = attach[i].contentBytes
                .replace(/-/g, "+")
                .replace(/_/g, "/");
              let urlBlob = b64toBlob(
                dataBase64Rep,
                attach[i].contentType,
                attach[i].size
              );
              //console.log(urlBlob);
              var blobUrl = URL.createObjectURL(urlBlob);
              var Attachment = addAttachmentElement(blobUrl, attach[i].name);
              var AttachmentDiv = addAttachmentContainer(attach[i].contentType);
              AttachmentDiv.appendChild(Attachment);
              iframe.contentDocument.body.appendChild(AttachmentDiv);
            }
          }
        }
      } else {
        if (!this.state.errorMessage) {
          this.setState({
            //errorMessage: emailMessageResult.error.result.error.message,
            errorMessage: "error",
            modal: true
          });
        }
      }
    }
  }

  renderSpinner() {
    return (
      <div className="d-flex h-100 justify-content-center align-items-center  ">
        <FontAwesomeIcon icon={faSpinner} spin size="3x" />
      </div>
    );
  }

  renderErrorModal() {
    //to-do alberto
    // catch error page and redirect
    //return <Redirect to="/notfound" />;
  }

  modifyMessage(addLabelIds, removeLabelIds) {
    const id = this.props.emailMessageResult.result.id;
    const actionParams = {
      ...(addLabelIds && { addLabelIds }),
      ...(removeLabelIds && { removeLabelIds })
    };
    this.props.modifyMessages({ ids: [id], ...actionParams });
    this.props.history.goBack();
  }

  render() {
    if (this.props.emailMessageResult.loading) {
      return this.renderSpinner();
    }

    return (
      <React.Fragment>
        <MessageToolbar
          sideBarCollapsed={this.props.sideBarCollapsed}
          sideBarToggle={this.props.sideBarToggle}
          history={this.props.history}
          onClick={this.modifyMessage}
          messageResult={this.props.emailMessageResult}
        />

        <div className="d-flex justify-content-center align-items-center message-content">
          {this.props.emailMessageResult.loading ? this.renderSpinner() : null}
          {this.state.errorMessage ? (
            this.renderErrorModal()
          ) : (
            <iframe
              ref={this.iframeRef}
              title="Message contents"
              id="message-iframe"
              style={{
                display: this.props.emailMessageResult.loading
                  ? "none"
                  : "block"
              }}
            />
          )}
        </div>
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  emailMessageResult: state.emailMessageResult
});

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      getEmailMessage,
      modifyMessages
    },
    dispatch
  );

export default compose(
  withRouter,
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(MessageContent);
