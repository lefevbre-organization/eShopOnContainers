import React, { PureComponent } from "react";
import { sendMessage } from "../../api_graph";
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

const Uppy = require("@uppy/core");
const Tus = require("@uppy/tus");

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
      dropZoneActive: false
    };
    this.handleChange = this.handleChange.bind(this);
    this.sendEmail = this.sendEmail.bind(this);
    this.goBack = this.goBack.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.setField = this.setField.bind(this);
    this.uppy = new Uppy({ id: "uppy1", autoProceed: false, debug: true, restrictions: {
      maxFileSize:3145728
    } })
      .use(Tus, { endpoint: "https://master.tus.io/files/" })
      //.use(GoogleDrive, { serverUrl: "https://companion.uppy.io" });
   

    //this.uppy2 = new Uppy({ id: 'uppy2', autoProceed: false, debug: true })
    //    .use(Tus, { endpoint: 'https://master.tus.io/files/' })

    this.uploadFile = this.uploadFile.bind(this);
    //this.addFileToState = this.addFileToState.bind(this);
    this.removeFile = this.removeFile.bind(this);
    this.showAttachActions = false;

    this.uppy.on("complete", result => {
      console.log(
        "Upload complete! We've uploaded these files:",
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
            //this.addFilesToState();
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
    }

    this.props.history.push("/inbox");
  }

  addFileToState(file) {
    const fls = this.uppy.getFiles();

    if(file) {
      for(let i = 0; i < fls.length; i++) {
        if(fls[i].id === file.file.id) {
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
    // this.uppyOne.upload();
  }

  componentWillUnmount() {
    console.log("ComposeMessage. Unmount")
    this.uppy.close();
  }

  handleChange(value, delta, source, editor) {
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

    const email = Object.assign({}, this.state, {  subject: '=?UTF-8?B?' + window.btoa(this.state.subject) + '?='})

    sendMessage({
      data: email,
      attachments: Fileattached
    }).then(_ => {
    }).catch((err)=>{
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
        'list', 'bullet', 'indent',
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
       
        try {
          uppy.addFile(newAttachment);
        }
        catch(err) {
          window.alert("El tamaño de este archivo es superior al permitido por este proveedor.")
        }
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
          <div className="container-panel"
          onDrop={(event) => { this.onDrop(event)} }
          onDragOver={(event) => { this.onDragOver(event)} }
          onDragLeave={(event) => { this.onDragLeave(event)} }>
             {this.state.dropZoneActive ? (
                  <div className="dropZone">
                    <div className="dropZoneMessage">
                      <i className={"material-icons"}>attach_file</i>
                      {i18n.t("messageEditor.dropZoneMessage")}
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
                          onClick={() => { this.removeAttachment(item)} }
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
           
            
{/*             
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
           */}
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
