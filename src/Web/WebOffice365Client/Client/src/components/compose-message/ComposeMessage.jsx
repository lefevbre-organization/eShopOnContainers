import React, { PureComponent } from "react";
import * as uuid from 'uuid/v4';
import { sendMessage, getMessageByInternetMessageId } from "../../api_graph";
import { getValidEmails } from "../../utils";
import i18n from "i18next";
import { Button, InputGroup, InputGroupAddon, Input } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTrash } from "@fortawesome/free-solid-svg-icons";
import ReactQuill from "react-quill";
import "../../../node_modules/react-quill/dist/quill.snow.css";
import "./composeMessage.scss";
import ACTIONS from "../../actions/lexon";
import { connect } from "react-redux";
import { prettySize } from "../../utils/prettify";
import { Notification, Confirmation } from '../notification/';

const Uppy = require("@uppy/core");
const Tus = require("@uppy/tus");
const MAX_TOTAL_ATTACHMENTS_SIZE = 26214400;
const FORBIDDEN_EXTENSIONS = ["ade", "adp", "apk", "appx", "appxbundle", "bat", "cab", "chm", "cmd", "com", "cpl", "dll", "dmg", "exe", "hta", "ins", "isp", "iso", "jar", "js", "jse", "lib", "lnk", "mde", "msc", "msi", "msix", "msixbundle", "msp", "mst", "nsh", "pif", "ps1", "scr", "sct", "shb", "sys", "vb", "vbe", "vbs", "vxd", "wsc", "wsf", "wsh"];

export class ComposeMessage extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      to:
        (props.history.location.state &&
          props.history.location.state.composeProps.to) ||
        "",
      cc:
        (props.history.location.state &&
          props.history.location.state.composeProps.cc) ||
        "",
      bcc:
        (props.history.location.state &&
          props.history.location.state.composeProps.bcc) ||
        "",
      subject:
        (props.history.location.state &&
          props.history.location.state.composeProps.subject) ||
        "",
      content:
        (props.history.location.state &&
          props.history.location.state.composeProps.content) ||
        "",
      showInlineDashboard: false,
      open: false,
      uppyPreviews: [],
      dropZoneActive: false,
      showNotification: false,
      messageNotification: '',
      showEmptySubjectWarning: false
    };
    this.handleChange = this.handleChange.bind(this);
    this.sendEmail = this.sendEmail.bind(this);
    this.goBack = this.goBack.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.setField = this.setField.bind(this);
    this.uppy = new Uppy({
      id: "uppy1",
      autoProceed: false,
      debug: true,
      onBeforeFileAdded: (currentFile, files) => {
        let totalSize = currentFile.size;

        // Check file extension
        if(this.typeAllowed(currentFile.data) === false) {
          this.showNotification(i18n.t("compose-message.forbidden-extension"));
          return false;
        }

        // Check total files size
        for (var file in files) {
          if (Object.prototype.hasOwnProperty.call(files, file)) {
            totalSize += files[file].size;
          }
        }

        if (totalSize > MAX_TOTAL_ATTACHMENTS_SIZE) {
          this.showNotification(i18n.t("compose-message.max-file-size"));
          return false;
        } else {
          return true;
        }
      }
    })
      .use(Tus, { endpoint: "https://master.tus.io/files/" })
    this.uploadFile = this.uploadFile.bind(this);
    this.showAttachActions = false;

    this.uppy.on("file-added", file => {
      console.log("Added file", file);

      // Define this onload every time to get file and base64 every time
      this.reader = new FileReader();
      
      if(file.data.size <= 4194304) {
        this.reader.readAsDataURL(file.data);
      } else {
        this.reader.readAsArrayBuffer(file.data);
      } 

      this.reader.onload = readerEvt =>
        this.addFileToState({ file, base64: readerEvt.target.result });
      this.showAttachActions = true
    });
  }

  typeAllowed(file) {
    let res = true;
    const re = /(?:\.([^.]+))?$/;
    const ext = re.exec(file.name)[1];

    if(ext && FORBIDDEN_EXTENSIONS.find(f => f === ext )) {
      res = false;
    }

    return res;
  }

  removeAttachment(file) {
    this.uppy.removeFile(file.id);
    this.addFileToState();
  }

  closeModal() {
    if (
      this.props.lexon.idCaseFile === null ||
      this.props.lexon.idCaseFile === undefined
    ) {
      this.props.history.goBack();
    } else {
      if(this.props.labelsResult) {
        this.props.loadLabelMessages(this.props.labelsResult.labelInbox);
      }
    }
  }

  goBack() {
    if (this.props.casefile != null && this.props.casefile !== undefined) {
      window.dispatchEvent(new CustomEvent("RemoveCaseFile"));
      this.props.setCaseFile({
        casefile: null,
        bbdd: null,
        company: null
      });
    }

    this.resetFields();  
    this.closeModal();
  }

  sentEmail(email) {
    window.dispatchEvent(
      new CustomEvent("SentMessage", {
        detail: {
          idEmail: email.internetMessageId,
          subject: email.subject,
          date: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') 
        }
      })
    );
    console.log("sentEmail data - id:" + email.internetMessageId + " subject: " + email.subject);
  }

  addFileToState(file) {
    const fls = this.uppy.getFiles();

    if (file) {
      for (let i = 0; i < fls.length; i++) {
        if (fls[i].id === file.file.id) {
          fls[i].content = file.base64;
          break;
        }
      }
    }

    this.setState({
      uppyPreviews: fls
    });
  }

  uploadFile() {
    console.log(this.state.uppyPreviews);
  }

  componentWillUnmount() {
    window.dispatchEvent(new CustomEvent("RemoveCaseFile"));
    this.uppy.close();
  }

  handleChange(value, delta, source, editor) {
    this.setState({ content: value });
  }

  onSendEmail() {
    this.setState({showEmptySubjectWarning: false}, ()=>{
      this._sendEmail();
    })
  }

  onCancel() {
    this.setState({showEmptySubjectWarning: false})
  }

  sendEmail() {
    const validTo = getValidEmails(this.state.to);

    if (!validTo.length){
      this.showNotification(i18n.t('compose-message.min-dest-alert'))
      return;
    }
    
    if (this.state.subject.trim() === ""){
      this.setState({showEmptySubjectWarning: true})
      return;
    }

    this._sendEmail();
  }

  _sendEmail() {
    const validTo = getValidEmails(this.state.to);

    const headers = {
      To: validTo.join(", "),
      Subject: this.state.subject,
      attachments: this.state.uppyPreviews
    };

    const validCc = getValidEmails(this.state.cc);
    if (validCc.length) {
      headers.Cc = validCc.join(", ");
    }

    const validBcc = getValidEmails(this.state.bcc);
    if (validBcc.length) {
      headers.Bcc = validBcc.join(", ");
    }

    const Fileattached = this.state.uppyPreviews;

    const email = Object.assign({}, this.state, { subject: this.state.subject , internetMessageId: `${uuid()}-${uuid()}@lefebvre.es`})

    sendMessage({
      data: email,
      attachments: Fileattached
    }).then(_ => {
      this.sentEmail(email);
    }).catch((err) => {
      console.log(err)
    })
    this.resetFields();
    this.closeModal();      
  }

  resetFields() {
    this.setState({
      to: this.props.to || "",
      cc: this.props.cc || "",
      bcc: this.props.bcc || "",
      subject: this.props.subject || "",
      content: this.props.content || "",
      uppyPreviews: []
    });
  }

  setField(field, trimValue = true) {
    return evt => {
      this.setState({
        [field]: trimValue ? evt.target.value.trim() : evt.target.value
      });
    };
  }

  isInvalid(field) {
    const fieldValue = this.state[field].trim();
    return fieldValue.length > 0 && !getValidEmails(fieldValue).length;
  }

  modules = {
    toolbar: [
      [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
      [{ size: [] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' },
      { 'indent': '-1' }, { 'indent': '+1' }],
      ['link'],
      ['clean']
    ],
    clipboard: {
      // toggle to add extra line breaks when pasting HTML:
      matchVisual: false,
    }
  }

  formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent', 'image',
    'link'
  ]

  /* Drag and drop events */
  onDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    this.setState({ dropZoneActive: false });
    const uppy = this.uppy;
    const addAttachment = (file, dataUrl) => {
      const newAttachment = {
        name: file.name,
        size: file.size,
        type: file.type,
        source: 'Local',
        isRemote: false,
        data: file,
      };

      uppy.addFile(newAttachment);
    };
    Array.from(event.dataTransfer.files).forEach(file => {
      addAttachment(file);
    });
    return true;
  }

  onDragOver(event) {
    event.preventDefault();
    if (
      event.dataTransfer.types &&
      Array.from(event.dataTransfer.types).includes("Files")
    ) {
      this.setState({ dropZoneActive: true });
    }
  }

  onDragLeave(event) {
    event.preventDefault();
    this.setState({ dropZoneActive: false });
  }

  showNotification(message) {
    this.setState({messageNotification: message, showNotification: true});
  }

  closeNotification() {
    const showNotification = !this.state.showNotification;
    this.setState({showNotification: showNotification});
  }

  render() {
    const collapsed = this.props.sideBarCollapsed;
    const { showNotification, messageNotification, showEmptySubjectWarning } = this.state;

    return (
      <React.Fragment>
        <Notification
          initialModalState={showNotification}
          toggleNotification={() => { this.closeNotification() }}
          message={messageNotification}
        />
        <Confirmation 
          initialModalState={showEmptySubjectWarning}
          onAccept={() => { this.onSendEmail() }}
          onCancel={()=>{ this.setState({showEmptySubjectWarning: false})}}
          message={i18n.t('compose-message.no-subject-warning')}
        />
        <div className="compose-dialog">
          <div className="compose-panel">
            <div className="d-flex justify-content-center align-items-center message-toolbar">
              <div className="action-btns">
                <span
                  className={
                    collapsed
                      ? "action-btn mr-2"
                      : "action-btn mr-2 with-side-bar"
                  }
                >
                  <Button
                    onClick={this.props.sideBarToggle}
                    className="btn-transparent"
                  >
                    <FontAwesomeIcon icon={faBars} size="1x" />
                  </Button>
                </span>
              </div>
            </div>
          </div>
          <div className="container-panel"
            onDrop={(event) => { this.onDrop(event) }}
            onDragOver={(event) => { this.onDragOver(event) }}
            onDragLeave={(event) => { this.onDragLeave(event) }}>
            {this.state.dropZoneActive ? (
              <div className="dropZone">
                <div className="dropZoneMessage">
                  <i className={"material-icons"}></i>
                  {i18n.t("compose-message.drag-and-drop")}
                </div>
              </div>
            ) : null}
            <div className="compose-message">
              <div className="message-fields">
                <InputGroup>
                  <InputGroupAddon addonType="prepend">
                    {i18n.t("compose-message.to")}
                  </InputGroupAddon>
                  <Input
                    tabIndex={1}
                    value={this.state.to}
                    placeholder={i18n.t("compose-message.comma-separated")}
                    invalid={this.isInvalid("to")}
                    onChange={this.setField("to")}
                  />
                </InputGroup>
                <InputGroup>
                  <InputGroupAddon addonType="prepend">Cc:</InputGroupAddon>
                  <Input
                    tabIndex={2}
                    value={this.state.cc}
                    placeholder={i18n.t("compose-message.comma-separated")}
                    invalid={this.isInvalid("cc")}
                    onChange={this.setField("cc")}
                  />
                </InputGroup>
                <InputGroup>
                  <InputGroupAddon addonType="prepend">
                    {i18n.t("compose-message.bcc")}
                  </InputGroupAddon>
                  <Input
                    tabIndex={3}
                    placeholder={i18n.t("compose-message.comma-separated")}
                    invalid={this.isInvalid("bcc")}
                    onChange={this.setField("bcc")}
                  />
                </InputGroup>
                <InputGroup>
                  <InputGroupAddon addonType="prepend">
                    {i18n.t("compose-message.subject")}
                  </InputGroupAddon>
                  <Input
                    tabIndex={4}
                    placeholder=""
                    value={this.state.subject}
                    onChange={this.setField("subject", false)}
                  />
                </InputGroup>
              </div>
              <div className="editor-wrapper">
                <ReactQuill
                  tabIndex={5}
                  value={this.state.content}
                  onChange={this.handleChange}
                  className=""
                  modules={this.modules}
                  formats={this.formats}
                />
                <div className="ImagePreviewContainer compose-dropcontainer attachments">
                  {this.state.uppyPreviews.map(item => {
                    return (
                      <div key={item.id} className={"attachment"}>
                        <span className={"fileName"}>{item.name}</span>
                        <span className={"size"}>({prettySize(item.size, 0)})</span>
                        <Button
                          onClick={() => { this.removeAttachment(item) }}
                          className={"delete"}
                        >
                          <FontAwesomeIcon icon={faTrash} size="1x" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="footer compose-footer">
              <Button
                className="mr-auto font-weight-bold"
                color="primary"
                onClick={this.sendEmail}
                title={i18n.t("compose-message.send-message")}
              >
                {i18n.t("compose-message.send")}
              </Button>
              &nbsp;
              <Button
                className="mr-left font-weight-bold btn-outline-primary"
                title={i18n.t("compose-message.discard")}
                color="secondary"
                onClick={() => {
                  this.goBack();
                }}
              >
                {i18n.t("compose-message.discard")}
              </Button>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  lexon: state.lexon
});

const mapDispatchToProps = dispatch => ({
  setCaseFile: casefile => dispatch(ACTIONS.setCaseFile(casefile))
});

export default connect(mapStateToProps, mapDispatchToProps)(ComposeMessage);
