import React, { PureComponent } from "react";
import { sendMessage } from "../../api_graph";
import { getValidEmails } from "../../utils";
import i18n from "i18next";
import { Button, InputGroup, InputGroupAddon, Input } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReactQuill from "react-quill";
import "../../../node_modules/react-quill/dist/quill.snow.css";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import "./composeMessage.scss";
import ACTIONS from "../../actions/lexon";
import { connect } from "react-redux";

const Uppy = require("@uppy/core");
const Tus = require("@uppy/tus");
const GoogleDrive = require("@uppy/google-drive");
const { DragDrop, ProgressBar } = require("@uppy/react");

export class Compose extends PureComponent {
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
      uppyPreviews: []
    };

    this.goBack = this.goBack.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.sendEmail = this.sendEmail.bind(this);
    this.setField = this.setField.bind(this);

    this.uppy = new Uppy({ id: "uppy1", autoProceed: false, debug: true })
      .use(Tus, { endpoint: "https://master.tus.io/files/" })
      .use(GoogleDrive, { serverUrl: "https://companion.uppy.io" });

    this.reader = new FileReader();
    this.handleModalClick = this.handleModalClick.bind(this);
    this.uploadFile = this.uploadFile.bind(this);
    this.addFileToState = this.addFileToState.bind(this);

    this.removeFile = this.removeFile.bind(this);
    this.showAttachActions = false;

    this.uppy.on("complete", result => {
      console.log(
        "Upload complete! We�ve uploaded these files:",
        result.successful
      );
    });

    this.uppy.on("file-added", file => {
      console.log("Added file", file);

      // Define this onload every time to get file and base64 every time
      this.reader = new FileReader();
      //setTimeout(() => { this.reader.readAsDataURL(file.data); }, 4000);
      this.reader.readAsDataURL(file.data);

      this.reader.onload = readerEvt =>
      this.addFileToState({ file, base64: readerEvt.target.result });
      this.showAttachActions = true
    });
  }

  removeFile() {
      //  console.log(this.uppy.getFiles());      
      //this.uppy.getFiles().forEach(file => {   
      //    console.log(file.id)
      //    this.state.uppyPreviews.removeFile(file.id)
      //});
      this.uppy.reset();
      this.showAttachActions = false
      this.setState({
          uppyPreviews: []
      });
  }

  addFileToState({ file, base64 }) {
      for (const prop in this.state.uppyPreviews) {
          //console.log(`obj.${prop} = ${this.state.uppyPreviews[prop]}`);
          //console.log(this.state.uppyPreviews[0].file["name"])
          if (this.state.uppyPreviews[prop].file["id"] === file["id"])
          {
              file["id"] = file["id"] + prop
          }
      }
    this.setState({
      uppyPreviews: [{ file, base64 }, ...this.state.uppyPreviews]
    });
  }

  uploadFile() {
    console.log(this.state.uppyPreviews);
    // this.uppyOne.upload();
  }

  componentWillUnmount() {
    this.uppy.close();
  }

  handleModalClick() {
    this.setState({
      open: !this.state.open
    });
  }

  closeModal() {
    if (
      this.props.lexon.idCaseFile === null ||
      this.props.lexon.idCaseFile === undefined
    ) {
      this.props.history.goBack();
    } else {
      this.props.loadLabelMessages(this.props.labelsResult.labelInbox);
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
    } else {
      this.props.history.goBack();
    }
  }

  handleChange(value) {
    this.setState({ content: value });
  }

  sendEmail() {
    const validTo = getValidEmails(this.state.to);
    if (!validTo.length){
      window.alert("Este mensaje debe tener al menos un destinatario.")
      return;
    }
    else if (this.state.subject.trim() === ""){
      const r = window.confirm("¿Desea enviar este mensaje sin asunto?"); 
      if(r === false){ 
        return;
      }
    }

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

    this.setState({
        subject: '=?UTF-8?B?' + window.btoa(this.state.subject) + '?='
    });

    sendMessage({
      data: this.state,
      attachments: Fileattached
    }).then(response => {
      this.closeModal();
      this.resetFields();
    });
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
            ['link', 'image'],
            ['clean']
        ],
        clipboard: {
            // toggle to add extra line breaks when pasting HTML:
            matchVisual: false,
        }
    }

  formats = [
      'header',
      'bold', 'italic', 'underline', 'strike', 'blockquote',
      'list', 'bullet', 'indent',
      'link', 'image'
  ]


  render() {
    const collapsed = this.props.sideBarCollapsed;


    return (
      <React.Fragment>
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
          <div className="container-panel">
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
                  className="autoResizeHeight"
                  modules={this.modules}
                  formats={this.formats}
                />
              </div>
            </div>
            <div className="ImagePreviewContainer compose-dropcontainer">
              {this.state.uppyPreviews.map(item => {
                return (
                  <object
                    className="FileList"
                    key={item.file.id}
                    type={item.file.type}
                    width="80px"
                    height="auto"
                    data={item.base64}
                  >
                    {item.file.name}
                  </object>
                );
              })}
            </div>
            <ProgressBar uppy={this.uppy} hideAfterFinish={false} />
            <button className={"button-remove-attach mr-left font-weight-bold  " + (this.showAttachActions ? 'show-btn' : 'hidden-btn')} onClick={this.removeFile}>Remove attachments</button>
            <div id="Divfooter" className="compose-droppanel">
              <DragDrop
                uppy={this.uppy}
                width="100%"
                height="130px"
                min-height="130px"
                note={i18n.t("compose-message.add-attachments")}
                locale={{
                  strings: {
                    dropHereOr:
                      i18n.t("compose-message.drag-and-drop") +
                      " " +
                      i18n.t("compose-message.or") +
                      " %{browse}",
                    browse: i18n.t("compose-message.browse")
                  }
                }}
              />
            </div>
            <div className="footer compose-footer">
              <Button
                className="mr-auto font-weight-bold"
                color="primary"
                onClick={this.sendEmail}
                title={i18n.t("compose-message.send-message")}
              >
                {i18n.t("compose-message.send")}
              </Button>{" "}
              <Button
                className="mr-left font-weight-bold btn-outline-primary"
                title={i18n.t("compose-message.discard")}
                color="secondary"
                onClick={this.goBack}
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
  lexon: state.lexon,
  labelsResult: state.labelsResult
});

const mapDispatchToProps = dispatch => ({
  setCaseFile: casefile => dispatch(ACTIONS.setCaseFile(casefile))
});


export default connect(mapStateToProps, mapDispatchToProps)(Compose);