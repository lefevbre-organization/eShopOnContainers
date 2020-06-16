import React, { PureComponent } from 'react';
import * as uuid from 'uuid/v4';
import { sendMessage } from '../../api_graph';
import { getValidEmails } from '../../utils';
import i18n from 'i18next';
import { Button, InputGroup, InputGroupAddon, Input } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBars,
  faTrash,
  faPaperclip,
} from '@fortawesome/free-solid-svg-icons';
import '../../../node_modules/react-quill/dist/quill.snow.css';
import './composeMessage.scss';
import ACTIONS from '../../actions/lexon';
import { connect } from 'react-redux';
import { prettySize } from '../../utils/prettify';
import { Notification, Confirmation } from '../notification/';
import HeaderAddress from './header-address';
import { getUser, classifyEmail } from '../../api_graph/accounts';
import ComposeMessageEditor from './composeMessageEditor';

const Uppy = require('@uppy/core');
const Tus = require('@uppy/tus');
// const MAX_TOTAL_ATTACHMENTS_SIZE = 26214400;
const MAX_TOTAL_ATTACHMENTS_SIZE = 20971520;

const FORBIDDEN_EXTENSIONS = [
  'ade',
  'adp',
  'apk',
  'appx',
  'appxbundle',
  'bat',
  'cab',
  'chm',
  'cmd',
  'com',
  'cpl',
  'dll',
  'dmg',
  'exe',
  'hta',
  'ins',
  'isp',
  'iso',
  'jar',
  'js',
  'jse',
  'lib',
  'lnk',
  'mde',
  'msc',
  'msi',
  'msix',
  'msixbundle',
  'msp',
  'mst',
  'nsh',
  'pif',
  'ps1',
  'scr',
  'sct',
  'shb',
  'sys',
  'vb',
  'vbe',
  'vbs',
  'vxd',
  'wsc',
  'wsf',
  'wsh',
];

export class ComposeMessage extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      to:
        props.mailContacts && props.mailContacts !== null
          ? props.mailContacts
          : props.history.location.state &&
            props.history.location.state.composeProps.to
          ? props.history.location.state.composeProps.to
          : '',
      to2:
        props.mailContacts && props.mailContacts !== null
          ? props.mailContacts.split(',')
          : props.history.location.state &&
            props.history.location.state.composeProps.to
          ? props.history.location.state.composeProps.to.split(',')
          : [],
      cc:
        (props.history.location.state &&
          props.history.location.state.composeProps.cc) ||
        '',
      cc2:
        props.history.location.state &&
        props.history.location.state.composeProps.cc
          ? props.history.location.state.composeProps.cc.split(',')
          : [],
      bcc:
        (props.history.location.state &&
          props.history.location.state.composeProps.bcc) ||
        '',
      bcc2:
        props.history.location.state &&
        props.history.location.state.composeProps.bcc
          ? props.history.location.state.composeProps.bcc.split(',')
          : [],
      subject:
        (props.history.location.state &&
          props.history.location.state.composeProps.subject) ||
        '',
      isForward:
        (props.history.location.state &&
          props.history.location.state.composeProps.isForward) ||
        false,
      content:
        (props.history.location.state &&
          props.history.location.state.composeProps.content) ||
        '',
      showInlineDashboard: false,
      open: false,
      defaultContent: '',
      uppyPreviews: [],
      dropZoneActive: false,
      showNotification: false,
      errorNotification: false,
      messageNotification: '',
      showEmptySubjectWarning: false,
      isPriority: false,
      readConfirmation: false,
    };
    this.handleChange = this.handleChange.bind(this);
    this.sendEmail = this.sendEmail.bind(this);
    this.goBack = this.goBack.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.setField = this.setField.bind(this);
    this.attachFromLexon = this.attachFromLexon.bind(this);
    this.onTogglePriority = this.onTogglePriority.bind(this);
    this.onToggleReadConfirmation = this.onToggleReadConfirmation.bind(this);

    this.uppy = new Uppy({
      id: 'uppy1',
      autoProceed: false,
      debug: false,
      onBeforeFileAdded: (currentFile, files) => {
        let totalSize = currentFile.size;

        // Check file extension
        if (this.typeAllowed(currentFile.data) === false) {
          this.showNotification(i18n.t('compose-message.forbidden-extension'));
          return false;
        }

        // Check total files size
        for (var file in files) {
          if (Object.prototype.hasOwnProperty.call(files, file)) {
            totalSize += files[file].size;
          }
        }

        if (totalSize > MAX_TOTAL_ATTACHMENTS_SIZE) {
          this.showNotification(i18n.t('compose-message.max-file-size'), false);
          return false;
        } else {
          return true;
        }
      },
    }).use(Tus, { endpoint: 'https://master.tus.io/files/' });
    this.uploadFile = this.uploadFile.bind(this);
    this.showAttachActions = false;

    this.uppy.on('file-added', (file) => {
      console.log('Added file', file);

      if (file.source.startsWith('Attachment:') === false) {
        // Define this onload every time to get file and base64 every time
        this.reader = new FileReader();

        if (file.data.size <= 3145728) {
          this.reader.readAsDataURL(file.data);
        } else {
          this.reader.readAsArrayBuffer(file.data);
        }

        this.reader.onload = (readerEvt) =>
          this.addFileToState({ file, base64: readerEvt.target.result });
        this.showAttachActions = true;
      } else {
        const size = file.source.split(':')[1];
        file.size = parseInt(size);
        const base64 = `data:${file.type};base64,${file.data}`;
        file.data = {
          name: file.name,
          size: file.size,
          type: file.type,
        };
        this.addFileToState({
          file,
          base64,
        });
      }
    });

    this.onAttachButton = this.onAttachButton.bind(this);
    this.onAttachSelected = this.onAttachSelected.bind(this);

    // Header Address Events
    this.handleAddAddress = this.addAddress.bind(this);
    this.handleRemoveAddress = this.removeAddress.bind(this);
    this.handleMoveAddress = this.moveAddress.bind(this);

    setTimeout(() => {
      // If forwarding, add original attachments files
      if (this.state.isForward) {
        for (
          let i = 0;
          i < this.props.messagesResult.openMessageAttachments.length;
          i++
        ) {
          const cm = this.props.messagesResult.openMessageAttachments[i];
          this.uppy.addFile({
            name: cm.filename,
            type: cm.mimeType,
            data: cm.attachment.data,
            size: cm.attachment.size,
            source: `Attachment:${cm.attachment.size}`,
            isRemote: false,
          });
        }
        // call  to addFileToState
      }
    }, 500);
    this.state.defaultContent = this.state.content;
  }

  componentDidMount() {
    const { lexon } = this.props;

    if (lexon.sign && lexon.sign !== '') {
      const { content } = this.state;

      const dc = `<br/><br/><p>${lexon.sign}</p>` + content;
      this.setState({
        defaultContent: dc,
        content: dc,
      });
    }

    window.dispatchEvent(new CustomEvent('OpenComposer'));
    window.addEventListener('AttachDocument', this.attachFromLexon);
  }

  onTogglePriority() {
    const { isPriority } = this.state;
    this.setState({ isPriority: !isPriority });
  }

  onToggleReadConfirmation() {
    const { readConfirmation } = this.state;
    this.setState({ readConfirmation: !readConfirmation });
  }

  attachFromLexon(event) {
    const { detail } = event;
    console.log('attachFromLexon');
    console.log(event.detail);
    const length = detail.content.length;

    this.uppy.addFile({
      name: detail.document.code,
      //      type: cm.mimeType,
      data: detail.content,
      size: length,
      source: `Attachment:${length}`,
      isRemote: false,
    });
  }

  typeAllowed(file) {
    let res = true;
    const re = /(?:\.([^.]+))?$/;
    const ext = re.exec(file.name)[1];

    if (ext && FORBIDDEN_EXTENSIONS.find((f) => f === ext)) {
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
      this.props.history.push(`/${this.props.labelsResult.labelInbox.id}`);
    } else {
      if (this.props.casefile !== null && this.props.casefile !== undefined) {
        window.dispatchEvent(new CustomEvent('RemoveCaseFile'));
        this.props.setCaseFile({
          casefile: null,
          bbdd: null,
          company: null,
        });
      }
      if (this.props.labelsResult) {
        this.props.loadLabelMessages(this.props.labelsResult.labelInbox);
        this.props.history.push(`/${this.props.labelsResult.labelInbox.id}`);
      }
    }
  }

  goBack() {
    if (this.props.casefile !== null && this.props.casefile !== undefined) {
      window.dispatchEvent(new CustomEvent('RemoveCaseFile'));
      this.props.setCaseFile({
        casefile: null,
        bbdd: null,
        company: null,
      });
    } else if (this.props.mailContacts) {
      this.props.setMailContacts(null);
    }
    //this.resetFields();
    this.closeModal();
  }

  sentEmail(email) {
    const emailDate = new Date()
      .toISOString()
      .replace(/T/, ' ')
      .replace(/\..+/, '');

    this.props.setMailContacts(null);

    window.dispatchEvent(
      new CustomEvent('SentMessage', {
        detail: {
          idEmail: email.internetMessageId,
          subject: email.subject,
          date: emailDate,
          provider: 'OUTLOOK',
          account: this.props.lexon.account,
          folder: 'SENT',
        },
      })
    );

    setTimeout(async () => {
      console.log(this.props);
      debugger;
      if (this.props.lexon.bbdd && this.props.lexon.account) {
        try {
          const user = await getUser(this.props.lexon.userId);
          if (user && user.data && user.data.configUser) {
            if (user.data.configUser.getContacts) {
              await classifyEmail(
                email.internetMessageId,
                email.subject,
                emailDate,
                this.state.to2,
                'SENT',
                this.props.lexon.provider,
                this.props.lexon.account,
                this.props.lexon.bbdd,
                user.data.lexonUserId
              );
            }
          }
        } catch (err) {
          //throw err;
        }
      }
    }, 1000);
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
      uppyPreviews: fls,
    });
  }

  uploadFile() {
    console.log(this.state.uppyPreviews);
  }

  componentWillUnmount() {
    //window.dispatchEvent(new CustomEvent("RemoveCaseFile"));
    window.dispatchEvent(new CustomEvent('CloseComposer'));
    window.removeEventListener('AttachDocument', this.attachFromLexon);

    this.uppy.close();
  }

  handleChange(value, delta, source, editor) {
    this.setState({ content: value });
  }

  onSendEmail() {
    this.setState({ showEmptySubjectWarning: false }, () => {
      this._sendEmail();
    });
  }

  onCancel() {
    this.setState({ showEmptySubjectWarning: false });
  }

  sendEmail() {
    const validTo = getValidEmails(this.state.to);

    if (!validTo.length) {
      this.showNotification(i18n.t('compose-message.min-dest-alert'));
      return;
    }

    if (this.state.subject.trim() === '') {
      this.setState({ showEmptySubjectWarning: true });
      return;
    }

    this._sendEmail();
  }

  _sendEmail() {
    const { isPriority, readConfirmation } = this.state;
    const validTo = getValidEmails(this.state.to);

    const headers = {
      To: validTo.join(', '),
      Subject: this.state.subject,
      attachments: this.state.uppyPreviews,
    };

    const validCc = getValidEmails(this.state.cc);
    if (validCc.length) {
      headers.Cc = validCc.join(', ');
    }

    const validBcc = getValidEmails(this.state.bcc);
    if (validBcc.length) {
      headers.Bcc = validBcc.join(', ');
    }

    const Fileattached = this.state.uppyPreviews;

    const email = Object.assign({}, this.state, {
      subject: this.state.subject,
      importance: isPriority ? 'High' : 'Normal',
      isReadReceiptRequested: readConfirmation,
      internetMessageId: `<${uuid()}-${uuid()}@lefebvre.es>`,
    });

    sendMessage({
      data: email,
      attachments: Fileattached,
    })
      .then((_) => {
        this.sentEmail(email);
      })
      .catch((err) => {
        console.log(err);
      });
    this.resetFields();
    this.closeModal();
  }

  resetFields() {
    this.setState({
      to: this.props.to || '',
      cc: this.props.cc || '',
      bcc: this.props.bcc || '',
      subject: this.props.subject || '',
      content: this.props.content || '',
      uppyPreviews: [],
      readConfirmation: false,
      isPriority: false,
    });
  }

  setField(field, trimValue = true) {
    return (evt) => {
      this.setState({
        [field]: trimValue ? evt.target.value.trim() : evt.target.value,
      });
    };
  }

  isInvalid(field) {
    const fieldValue = this.state[field].trim();
    return fieldValue.length > 0 && !getValidEmails(fieldValue).length;
  }

  modules = {
    toolbar: [
      [{ header: '1' }, { header: '2' }, { font: [] }],
      [{ size: [] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [
        { list: 'ordered' },
        { list: 'bullet' },
        { indent: '-1' },
        { indent: '+1' },
      ],
      ['link'],
      ['clean'],
    ],
    clipboard: {
      // toggle to add extra line breaks when pasting HTML:
      matchVisual: false,
    },
  };

  formats = [
    'header',
    'font',
    'size',
    'bold',
    'italic',
    'underline',
    'strike',
    'blockquote',
    'list',
    'bullet',
    'indent',
    'image',
    'link',
  ];

  /* Drag and drop events */
  onDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    this.setState({ dropZoneActive: false });
    const uppy = this.uppy;
    const addAttachment = (file, dataUrl) => {
      let repeated = 0;

      // Check if is repeated
      let extension = '';
      const fls = this.uppy.getFiles();
      for (let i = 0; i < fls.length; i++) {
        // Hay que quitar la extensión del fichero
        const [fn, ex] = fileNameAndExt(fls[i].name);
        const [fn2, _] = fileNameAndExt(file.name);
        extension = ex;

        if (fn.startsWith(fn2)) {
          repeated++;
        }
      }

      let fileName =
        repeated === 0 ? file.name : `${file.name} (${repeated}).${extension}`;

      const newAttachment = {
        name: fileName,
        size: file.size,
        type: file.type,
        source: 'Local',
        isRemote: false,
        data: file,
      };

      uppy.addFile(newAttachment);
    };
    Array.from(event.dataTransfer.files).forEach((file) => {
      addAttachment(file);
    });
    return true;
  }

  onDragOver(event) {
    event.preventDefault();
    if (
      event.dataTransfer.types &&
      Array.from(event.dataTransfer.types).includes('Files')
    ) {
      this.setState({ dropZoneActive: true });
    }
  }

  onDragLeave(event) {
    event.preventDefault();
    this.setState({ dropZoneActive: false });
  }

  showNotification(message, error = false) {
    this.setState({
      messageNotification: message,
      errorNotification: error,
      showNotification: true,
    });
  }

  closeNotification() {
    const showNotification = !this.state.showNotification;
    this.setState({ showNotification: showNotification });
  }

  /**
   * Adds an address to the list matching the id.
   *
   * @param id
   * @param address
   */
  addAddress(id, address) {
    if (address.length > 0) {
      if (id === 'to') {
        const to2 = [...this.state.to2];
        to2.push(address);
        const to = to2.join(',');
        this.setState({ to2, to });
      } else if (id === 'cc') {
        const cc2 = [...this.state.cc2];
        cc2.push(address);
        const cc = cc2.join(',');
        this.setState({ cc2, cc });
      } else if (id === 'bcc2') {
        const bcc2 = [...this.state.bcc2];
        bcc2.push(address);
        const bcc = bcc2.join(',');
        this.setState({ bcc2, bcc });
      }
    }
  }

  /**
   * Removes the address from the under the field matching the id.
   *
   * @param id
   * @param address
   */
  removeAddress(id, address) {
    if (id === 'to') {
      const to2 = [...this.state.to2];
      to2.splice(to2.indexOf(address), 1);
      const to = to2.join(',');
      this.setState({ to2, to });
      this.props.setMailContacts(to);
    } else if (id === 'cc') {
      const cc2 = [...this.state.cc2];
      cc2.splice(cc2.indexOf(address), 1);
      const cc = cc2.join(',');
      this.setState({ cc2, cc });
    } else if (id === 'bcc2') {
      const bcc2 = [...this.state.bcc2];
      bcc2.splice(bcc2.indexOf(address), 1);
      const bcc = bcc2.join(',');
      this.setState({ bcc2, bcc });
    }

    // const updatedMessage = { ...this.props.editedMessage };
    // updatedMessage[id] = [...updatedMessage[id]];
    // updatedMessage[id].splice(updatedMessage[id].indexOf(address), 1);
    // this.props.editMessage(updatedMessage);
  }

  /**
   * Moves an address from the address list under the field matching the fromId to the address field
   * matching the toId.
   *
   * @param fromId
   * @param toId
   * @param address
   */
  moveAddress(fromId, toId, address) {
    // const updatedMessage = { ...this.props.editedMessage };
    // // Remove
    // updatedMessage[fromId].splice(updatedMessage[fromId].indexOf(address), 1);
    // // Add
    // updatedMessage[toId] = [...updatedMessage[toId], address];
    // this.props.editMessage(updatedMessage);
  }

  onAttachButton(event) {
    event.preventDefault();
    event.stopPropagation();

    // Create a new input file
    var input = document.createElement('input');
    input.type = 'file';
    input.style = 'display: none;';
    input.id = '' + Date.now();
    input.multiple = true;
    input.onchange = this.onAttachSelected;
    document.getElementById('inputfileWrapper').appendChild(input);
    document.getElementById(input.id).click();
  }

  onAttachSelected(event) {
    event.preventDefault();
    event.stopPropagation();
    const uppy = this.uppy;
    const addAttachment = (file, dataUrl) => {
      let repeated = 0;

      // Check if is repeated
      let extension = '';
      const fls = this.uppy.getFiles();
      for (let i = 0; i < fls.length; i++) {
        // Hay que quitar la extensión del fichero
        const [fn, ex] = fileNameAndExt(fls[i].name);
        const [fn2, _] = fileNameAndExt(file.name);
        extension = ex;

        if (fn.startsWith(fn2)) {
          repeated++;
        }
      }

      let fileName =
        repeated === 0 ? file.name : `${file.name} (${repeated}).${extension}`;

      const newAttachment = {
        name: fileName,
        size: file.size,
        type: file.type,
        source: 'Local',
        isRemote: false,
        data: file,
      };

      uppy.addFile(newAttachment);
    };

    Array.from(event.target.files).forEach((file) => {
      //const fileReader = new FileReader();
      //fileReader.onload = addAttachment.bind(this, file);
      //fileReader.readAsDataURL(file);
      addAttachment(file);
    });
    return true;
  }

  render() {
    const collapsed = this.props.sideBarCollapsed;
    const {
      showNotification,
      messageNotification,
      showEmptySubjectWarning,
      errorNotification,
      isPriority,
      readConfirmation,
    } = this.state;

    const { to, cc, bcc } = this.props;

    const { to2, cc2, bcc2 } = this.state;

    return (
      <React.Fragment>
        <Notification
          initialModalState={showNotification}
          toggleNotification={() => {
            this.closeNotification();
          }}
          message={messageNotification}
          error={errorNotification}
        />
        <Confirmation
          initialModalState={showEmptySubjectWarning}
          onAccept={() => {
            this.onSendEmail();
          }}
          onCancel={() => {
            this.setState({ showEmptySubjectWarning: false });
          }}
          message={i18n.t('compose-message.no-subject-warning')}
        />
        <div className='compose-dialog'>
          <div className='compose-panel'>
            <div className='d-flex justify-content-center align-items-center message-toolbar'>
              <div className='action-btns'>
                <span
                  className={
                    collapsed
                      ? 'action-btn mr-2'
                      : 'action-btn mr-2 with-side-bar'
                  }>
                  <Button
                    onClick={this.props.sideBarToggle}
                    className='btn-transparent'>
                    <FontAwesomeIcon icon={faBars} size='1x' />
                  </Button>
                </span>
                <div className='priority-wrapper'>
                  {isPriority && (
                    <i
                      className='lf lf-icon-switch-right icon-priority'
                      onClick={this.onTogglePriority}></i>
                  )}
                  {!isPriority && (
                    <i
                      className='lf lf-icon-switch-left icon-priority'
                      onClick={this.onTogglePriority}></i>
                  )}
                  <span className='priority-text'>
                    {i18n.t('compose-message.mark-prioritary')}
                  </span>
                </div>
              </div>
              <div
                className='action-btns'
                style={{
                  justifyContent: 'flex-end',
                  marginRight: 15,
                }}>
                {window.SHOW_EXPERIMENTAL === '1' && (
                  <div className='receipt-wrapper'>
                    {readConfirmation && (
                      <i
                        className='lf lf-icon-switch-right icon-priority'
                        onClick={this.onToggleReadConfirmation}></i>
                    )}
                    {!readConfirmation && (
                      <i
                        className='lf lf-icon-switch-left icon-priority'
                        onClick={this.onToggleReadConfirmation}></i>
                    )}
                    <span className='priority-text'>
                      {i18n.t('compose-message.read-confirmation')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div
            className='container-panel'
            onDrop={(event) => {
              this.onDrop(event);
            }}
            onDragOver={(event) => {
              this.onDragOver(event);
            }}
            onDragLeave={(event) => {
              this.onDragLeave(event);
            }}>
            {this.state.dropZoneActive ? (
              <div className='dropZone'>
                <div className='dropZoneMessage'>
                  <i className={'material-icons'}></i>
                  {i18n.t('compose-message.drag-and-drop')}
                </div>
              </div>
            ) : null}
            <div className='compose-message'>
              <div className='message-fields'>
                <HeaderAddress
                  id={'to'}
                  addresses={to2}
                  onAddressAdd={this.handleAddAddress}
                  onAddressRemove={this.handleRemoveAddress}
                  onAddressMove={this.handleMoveAddress}
                  getAddresses={this.props.getAddresses}
                  label={i18n.t('compose-message.to')}
                />
                <HeaderAddress
                  id={'cc'}
                  addresses={cc2}
                  onAddressAdd={this.handleAddAddress}
                  onAddressRemove={this.handleRemoveAddress}
                  onAddressMove={this.handleMoveAddress}
                  getAddresses={this.props.getAddresses}
                  label={'Cc:'}
                />
                <HeaderAddress
                  id={'bcc2'}
                  addresses={bcc2}
                  onAddressAdd={this.handleAddAddress}
                  onAddressRemove={this.handleRemoveAddress}
                  onAddressMove={this.handleMoveAddress}
                  getAddresses={this.props.getAddresses}
                  label={i18n.t('compose-message.bcc')}
                />

                <InputGroup>
                  <InputGroupAddon addonType='prepend' tabIndex={-1}>
                    {i18n.t('compose-message.subject')}
                  </InputGroupAddon>
                  <Input
                    placeholder=''
                    value={this.state.subject}
                    onChange={this.setField('subject', false)}
                  />
                  {isPriority && (
                    <div style={{ paddingTop: 5, paddingRight: 5, height: 29 }}>
                      <i className='lf-icon-bookmarks-active'></i>
                    </div>
                  )}
                </InputGroup>
              </div>
              <div className='editor-wrapper'>
                <ComposeMessageEditor
                  onChange={this.handleChange}
                  defaultValue={this.state.defaultContent}
                />

                {/* <ReactQuill
                  tabIndex={0}
                  value={this.state.content}
                  onChange={this.handleChange}
                  className=''
                  modules={this.modules}
                  formats={this.formats}
                /> */}
                <div className='ImagePreviewContainer compose-dropcontainer attachments'>
                  {this.state.uppyPreviews.map((item) => {
                    return (
                      <div key={item.id} className={'attachment'}>
                        <span className={'fileName'}>{item.name}</span>
                        <span className={'size'}>
                          ({prettySize(item.size, 0)})
                        </span>
                        <Button
                          onClick={() => {
                            this.removeAttachment(item);
                          }}
                          className={'delete'}>
                          <FontAwesomeIcon icon={faTrash} size='1x' />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className='footer compose-footer'>
              <Button
                className='mr-auto font-weight-bold'
                color='primary'
                onClick={this.sendEmail}
                title={i18n.t('compose-message.send-message')}>
                {i18n.t('compose-message.send')}
              </Button>
              &nbsp;
              <Button
                className='mr-left font-weight-bold btn-outline-primary'
                title={i18n.t('compose-message.discard')}
                color='secondary'
                onClick={() => {
                  this.goBack();
                }}>
                {i18n.t('compose-message.discard')}
              </Button>
              <Button onClick={this.onAttachButton} className={'attach-button'}>
                <FontAwesomeIcon icon={faPaperclip} size='1x' />
                <span>{i18n.t('compose-message.attach')}</span>
              </Button>
              <div id='inputfileWrapper'></div>
            </div>
          </div>
        </div>
        <style jsx>{`
          .editor-wrapper {
            display: flex;
            flex-direction: column;
          }

          .attach-button,
          .attach-button:hover,
          .attach-button:focus,
          .attach-button:active {
            outline: none !important;
            box-shadow: none !important;
            margin-left: 20px !important;
            border: none !important;
            background-color: white !important;
            color: #001978 !important;
            font-size: 14px !important;
          }

          .icon-priority {
            cursor: pointer !important;
          }

          .attach-button .fa-paperclip {
            font-size: 20px;
            margin-right: 5px;
          }

          .lf-icon-bookmarks-active {
            font-size: 20px;
            color: #c43741;
          }
        `}</style>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => ({
  lexon: state.lexon,
  messagesResult: state.messagesResult,
});

const mapDispatchToProps = (dispatch) => ({
  setCaseFile: (casefile) => dispatch(ACTIONS.setCaseFile(casefile)),
  setMailContacts: (mailContacts) =>
    dispatch(ACTIONS.setMailContacts(mailContacts)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ComposeMessage);

function fileNameAndExt(str) {
  var file = str.split('/').pop();
  return [
    file.substr(0, file.lastIndexOf('.')),
    file.substr(file.lastIndexOf('.') + 1, file.length),
  ];
}
