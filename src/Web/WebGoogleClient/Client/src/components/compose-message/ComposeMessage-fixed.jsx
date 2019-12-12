import React, { PureComponent } from "react";
import { withTranslation } from "react-i18next";

import { sendMessage } from "../../api";
import { getValidEmails } from "../../utils";

import { Button, InputGroup, InputGroupAddon, Input } from "reactstrap";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";

import ReactQuill from "react-quill";
import "../../../node_modules/react-quill/dist/quill.snow.css";

import "./composeMessage.scss";

const Uppy = require("@uppy/core");
const Tus = require("@uppy/tus");
const GoogleDrive = require("@uppy/google-drive");
const { DragDrop, ProgressBar } = require("@uppy/react");

export class ComposeMessage extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      to: props.history.location.state.composeProps.to || "",
      cc: props.history.location.state.composeProps.cc || "",
      bcc: props.history.location.state.composeProps.bcc || "",
      subject: props.history.location.state.composeProps.subject || "",
      content: props.history.location.state.composeProps.content || "",
      showInlineDashboard: false,
      open: false,
      uppyPreviews: []
    };
    this.handleChange = this.handleChange.bind(this);
    this.sendEmail = this.sendEmail.bind(this);
    this.goBack = this.goBack.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.setField = this.setField.bind(this);
    this.uppy = new Uppy({ id: "uppy1", autoProceed: false, debug: true })
      .use(Tus, { endpoint: "https://master.tus.io/files/" })
      .use(GoogleDrive, { serverUrl: "https://companion.uppy.io" });
    this.reader = new FileReader();

    //this.uppy2 = new Uppy({ id: 'uppy2', autoProceed: false, debug: true })
    //    .use(Tus, { endpoint: 'https://master.tus.io/files/' })

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

  closeModal() {
    this.props.history.push("/inbox");
  }

  goBack() {
    this.props.history.goBack();
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
       // Subject: this.state.subject,
        Subject: '=?UTF-8?B?' + window.btoa(this.state.subject) + '?=',
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
      headers,
      body: this.state.content,
      attachments: Fileattached
    }).then(_ => {
      this.resetFields();
      this.closeModal();
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
    const { t } = this.props;

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
                    {t("compose-message.to")}
                  </InputGroupAddon>
                  <Input
                    tabIndex={1}
                    value={this.state.to}
                    placeholder={t("compose-message.comma-separated")}
                    invalid={this.isInvalid("to")}
                    onChange={this.setField("to")}
                  />
                </InputGroup>
                <InputGroup>
                  <InputGroupAddon addonType="prepend">Cc:</InputGroupAddon>
                  <Input
                    tabIndex={2}
                    value={this.state.cc}
                    placeholder={t("compose-message.comma-separated")}
                    invalid={this.isInvalid("cc")}
                    onChange={this.setField("cc")}
                  />
                </InputGroup>
                <InputGroup>
                  <InputGroupAddon addonType="prepend">Bcc:</InputGroupAddon>
                  <Input
                    tabIndex={3}
                    placeholder={t("compose-message.comma-separated")}
                    invalid={this.isInvalid("bcc")}
                    onChange={this.setField("bcc")}
                  />
                </InputGroup>
                <InputGroup>
                  <InputGroupAddon addonType="prepend">
                    {t("compose-message.subject")}
                  </InputGroupAddon>
                  <Input
                    tabIndex={4}
                    placeholder=""
                    value={this.state.subject}
                    onChange={this.setField("subject", false)}
                  />
                </InputGroup>
              </div>
              <div>
                <div className="editor-wrapper">
                  <ReactQuill
                    tabIndex={5}
                    value={this.state.content}
                    onChange={this.handleChange}
                    className="autoResizeHeight"
                  />
                </div>
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
                note={t("compose-message.add-attachments")}
                locale={{
                  strings: {
                    dropHereOr:
                      t("compose-message.drag-and-drop") +
                      " " +
                      t("compose-message.or") +
                      " %{browse}",
                    browse: t("compose-message.browse")
                  }
                }}
              />
            </div>
            <div className="footer compose-footer">
              <Button
                className="mr-auto font-weight-bold"
                color="primary"
                onClick={this.sendEmail}
                title={t("compose-message.send-message")}
              >
                {t("compose-message.send")}
              </Button>{" "}
              <Button
                className="mr-left font-weight-bold btn-outline-primary"
                title={t("compose-message.discard")}
                color="secondary"
                onClick={this.closeModal}
              >
                {t("compose-message.discard")}
              </Button>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default withTranslation()(ComposeMessage);
