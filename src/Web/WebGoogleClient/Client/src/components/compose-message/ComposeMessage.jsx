import React, { PureComponent } from 'react';
import { sendMessage, getMessageHeader } from '../../api';
import { getValidEmails } from '../../utils';
import i18n from 'i18next';
import { Button, InputGroup, InputGroupAddon, Input } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBars,
  faTrash,
  faPaperclip
} from '@fortawesome/free-solid-svg-icons';
import ReactQuill from 'react-quill';
import '../../../node_modules/react-quill/dist/quill.snow.css';
import './composeMessage.scss';
import ACTIONS from '../../actions/lexon';
import { connect } from 'react-redux';
import { prettySize } from '../../utils/prettify';
import { Notification, Confirmation } from '../notification/';
import HeaderAddress from './header-address';
import { getUser, classifyEmail } from '../../api/accounts';
import ComposeMessageEditor from './composeMessageEditor';

const Uppy = require('@uppy/core');
const Tus = require('@uppy/tus');
const MAX_TOTAL_ATTACHMENTS_SIZE = 26214400;
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
  'wsh'
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
      content:
        (props.history.location.state &&
          props.history.location.state.composeProps.content) ||
        '',
      showInlineDashboard: false,
      open: false,
      uppyPreviews: [],
      dropZoneActive: false,
      showNotification: false,
      errorNotification: false,
      messageNotification: '',
      showEmptySubjectWarning: false
    };

    this.handleChange = this.handleChange.bind(this);
    this.sendEmail = this.sendEmail.bind(this);
    this.goBack = this.goBack.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.setField = this.setField.bind(this);
    this.onAttachButton = this.onAttachButton.bind(this);
    this.onAttachSelected = this.onAttachSelected.bind(this);
    // Header Address Events
    this.handleAddAddress = this.addAddress.bind(this);
    this.handleRemoveAddress = this.removeAddress.bind(this);
    this.handleMoveAddress = this.moveAddress.bind(this);

    this.fileInput = null;

    this.uppy = new Uppy({
      id: 'uppy1',
      autoProceed: false,
      debug: true,
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
      }
    }).use(Tus, { endpoint: 'https://master.tus.io/files/' });
    this.uploadFile = this.uploadFile.bind(this);
    this.showAttachActions = false;

    this.uppy.on('file-added', file => {
      console.log('Added file', file);

      // Define this onload every time to get file and base64 every time
      this.reader = new FileReader();
      this.reader.readAsDataURL(file.data);

      this.reader.onload = readerEvt =>
        this.addFileToState({ file, base64: readerEvt.target.result });
      this.showAttachActions = true;
    });
  }

  componentDidMount() {
    const { lexon } = this.props;

    if (this.fileInput) {
      this.fileInput.onchange = this.onAttachSelected;
    }

    if (lexon.sign && lexon.sign !== '') {
      const { content } = this.state;
      this.setState({ content: `<br/><br/><p>${lexon.sign}</p>` + content });
    }
  }

  typeAllowed(file) {
    let res = true;
    const re = /(?:\.([^.]+))?$/;
    const ext = re.exec(file.name)[1];

    if (ext && FORBIDDEN_EXTENSIONS.find(f => f === ext)) {
      res = false;
    }

    return res;
  }

  removeAttachment(file) {
    this.uppy.removeFile(file.id);
    this.addFileToState();
  }

  closeModal() {
    this.props.history.push('/inbox');
  }

  goBack() {
    if (this.props.casefile != null && this.props.casefile !== undefined) {
      window.dispatchEvent(new CustomEvent('RemoveCaseFile'));
      this.props.setCaseFile({
        casefile: null,
        bbdd: null,
        company: null
      });
    } else if (this.props.mailContacts) {
      this.props.setMailContacts(null);
    }

    this.props.history.push('/inbox');
  }

  async sentEmail(message) {
    //const emailDate = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
    console.log(
      'SentEmail:' +
        message.id +
        ' Subject:' +
        message.subject +
        ' SentDate:' +
        message.sentDateTime
    );
    this.props.setMailContacts(null);

    window.dispatchEvent(
      new CustomEvent('SentMessage', {
        detail: {
          idEmail: message.id,
          subject: message.subject, // window.atob(subject.replace('=?UTF-8?B?', '').replace('?=', '')),
          date: message.emailDate,
          folder: '[GMAIL]/Enviados',
          account: this.props.lexon.account,
          provider: 'GOOGLE'
        }
      })
    );

    setTimeout(async () => {
      if (this.props.lexon.bbdd && this.props.lexon.account) {
        try {
          const user = await getUser(this.props.lexon.userId);
          if (user && user.data && user.data.configUser) {
            if (user.data.configUser.getContacts) {
              await classifyEmail(
                message.id,
                message.subject,
                message.sentDateTime,
                this.state.to2,
                '[GMAIL]/Enviados',
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

    window.dispatchEvent(new CustomEvent('RemoveCaseFile'));
    // Get User config to auto classify emails
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
    // this.uppyOne.upload();
  }

  componentWillUnmount() {
    window.dispatchEvent(new CustomEvent('RemoveCaseFile'));
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
    const validTo = getValidEmails(this.state.to);

    const headers = {
      To: validTo.join(', '),
      //Subject: this.state.subject,
      Subject: '=?UTF-8?B?' + window.btoa(this.state.subject) + '?=',
      attachments: this.state.uppyPreviews
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

    sendMessage({
      headers,
      body: this.state.content,
      attachments: Fileattached
    })
      .then(function(response) {
        return response.json();
      })
      .then(email => {
        //this.sentEmail(email.id, this.state.subject);
        getMessageHeader(email.id)
          .then(headers => {
            console.log('Headers:' + headers);
            const message = {
              id: this.getContentByHeader(headers, 'Message-Id'),
              subject: this.getContentByHeader(headers, 'Subject'),
              sentDateTime: this.getContentByHeader(headers, 'Date')
            };
            this.sentEmail(message);
          })
          .catch(err => console.log('Error getting Headers:' + err));
      });
    this.resetFields();
    this.closeModal();
  }

  getContentByHeader(message, header) {
    for (let i = 0; i < message.payload.headers.length; i++) {
      if (
        message.payload.headers[i].name.toUpperCase() === header.toUpperCase()
      ) {
        return message.payload.headers[i].value;
      }
    }
  }

  resetFields() {
    this.setState({
      to: this.props.to || '',
      cc: this.props.cc || '',
      bcc: this.props.bcc || '',
      to2: [],
      cc2: [],
      bcc2: [],
      subject: this.props.subject || '',
      content: this.props.content || '',
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
      [{ header: '1' }, { header: '2' }, { font: [] }],
      [{ size: [] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [
        { list: 'ordered' },
        { list: 'bullet' },
        { indent: '-1' },
        { indent: '+1' }
      ],
      ['link'],
      ['clean']
    ],
    clipboard: {
      // toggle to add extra line breaks when pasting HTML:
      matchVisual: false
    }
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
    'link'
  ];

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
        data: file
        //content: dataUrl.currentTarget.result.replace(/^data:[^;]*;base64,/, "")
      };

      uppy.addFile(newAttachment);
    };
    Array.from(event.dataTransfer.files).forEach(file => {
      //const fileReader = new FileReader();
      //fileReader.onload = addAttachment.bind(this, file);
      //fileReader.readAsDataURL(file);
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

  showNotification(message, isError = false) {
    this.setState({
      messageNotification: message,
      errorNotification: isError,
      showNotification: true
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
        this.props.setMailContacts(to);
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

  onAttachButton() {
    console.log(this.fileInput);
    this.fileInput && this.fileInput.click();
  }

  onAttachSelected(event) {
    event.preventDefault();
    event.stopPropagation();
    const uppy = this.uppy;
    const addAttachment = (file, dataUrl) => {
      const newAttachment = {
        name: file.name,
        size: file.size,
        type: file.type,
        source: 'Local',
        isRemote: false,
        data: file
        //content: dataUrl.currentTarget.result.replace(/^data:[^;]*;base64,/, "")
      };

      uppy.addFile(newAttachment);
    };

    Array.from(event.target.files).forEach(file => {
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
      errorNotification
    } = this.state;
    const { to2, cc2, bcc2 } = this.state;

    const { to, cc, bcc } = this.props;

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
              </div>
            </div>
          </div>
          <div
            className='container-panel'
            onDrop={event => {
              this.onDrop(event);
            }}
            onDragOver={event => {
              this.onDragOver(event);
            }}
            onDragLeave={event => {
              this.onDragLeave(event);
            }}>
            {this.state.dropZoneActive ? (
              <div className='dropZone'>
                <div className='dropZoneMessage'>
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
                </InputGroup>
              </div>

              <div className='editor-wrapper'>
                <ComposeMessageEditor
                  onChange={this.handleChange}
                  defaultValue={this.state.content}
                />
                <div className='ImagePreviewContainer compose-dropcontainer attachments'>
                  {this.state.uppyPreviews.map(item => {
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
                <input
                  ref={r => (this.fileInput = r)}
                  id='file-input'
                  type='file'
                  name='name'
                  style={{ display: 'none' }}
                  multiple='true'
                />
              </Button>
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

          .attach-button .fa-paperclip {
            font-size: 20px;
            margin-right: 5px;
          }
        `}</style>
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  lexon: state.lexon
});

const mapDispatchToProps = dispatch => ({
  setCaseFile: casefile => dispatch(ACTIONS.setCaseFile(casefile)),
  setMailContacts: mailContacts =>
    dispatch(ACTIONS.setMailContacts(mailContacts))
});

export default connect(mapStateToProps, mapDispatchToProps)(ComposeMessage);
