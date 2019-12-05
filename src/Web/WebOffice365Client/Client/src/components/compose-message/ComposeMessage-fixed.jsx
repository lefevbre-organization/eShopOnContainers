import React, { PureComponent } from "react";
import { withTranslation } from "react-i18next";
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

    this.uppy.on("complete", result => {
      console.log(
        "Upload complete! We�ve uploaded these files:",
        result.successful
      );
    });

    this.uppy.on("file-added", file => {
      console.log("Added file", file);
      this.reader.onload = readerEvt =>
        this.addFileToState({ file, base64: readerEvt.target.result });
      // Define this onload every time to get file and base64 every time
      this.reader.readAsDataURL(file.data);
    });
  }

  addFileToState({ file, base64 }) {
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
    this.props.history.push("/inbox");
  }

  goBack() {
    if (this.props.casefile != null && this.props.casefile !== undefined) {
      window.dispatchEvent(new CustomEvent("RemoveCaseFile"));
      this.props.setCaseFile();

      const userLexon = localStorage.getItem("lexon");
      console.log("userLexon ->", userLexon);
    }
    this.props.history.goBack();
  }

  handleChange(value) {
    this.setState({ content: value });
  }

  sendEmail() {
    const validTo = getValidEmails(this.state.to);

    if (
      !validTo.length ||
      this.state.subject.trim() === "" ||
      this.state.content === ""
    ) {
      return;
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

    sendMessage({
      data: this.state,
      attachments: Fileattached
    }).then(response => {
      this.closeModal();
      this.resetFields();
    });
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
                  <InputGroupAddon addonType="prepend">Bcc:</InputGroupAddon>
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
  lexon: state.lexon
});

const mapDispatchToProps = dispatch => ({
  setCaseFile: casefile => dispatch(ACTIONS.setCaseFile(casefile))
});

export default connect(mapStateToProps, mapDispatchToProps)(Compose);
