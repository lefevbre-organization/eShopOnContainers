import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';
import { 
  sendMessage, 
  getMessageHeader, 
  createDraft,
  getDraftListWithRFC,
  getAttachments,
  dataUrlToFile,
  deleteDraft,
  getEmbeddedImages
} from '../../api';
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
import {
  getEmailHeaderMessage,
  getEmailMessage,
  updateComposerData
} from '../content/message-list/actions/message-list.actions';
import { connect } from 'react-redux';
import { prettySize } from '../../utils/prettify';
import { Notification, Confirmation } from '../notification/';
import HeaderAddress from './header-address';
import { getUser, classifyEmail } from '../../api/accounts';
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
      isReply:
      (props.history.location.state &&
        props.history.location.state.composeProps.isReply) ||
      false,
      showInlineDashboard: false,
      open: false,
      defaultContent: '',
      uppyPreviews: [],
      dropZoneActive: false,
      showNotification: false,
      errorNotification: false,
      messageNotification: '',
      showEmptySubjectWarning: false,
      draftTime: '',
      draftId: '',
      isDraftEdit: false,
      embeddedImgLoaded: false,
      draftInProgress: false,
      draftQueue: 0
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
    this.attachFromLexon = this.attachFromLexon.bind(this);
    this.handleGetUserFromLexonConnector = this.handleGetUserFromLexonConnector.bind(
      this
    );

    this.uppy = new Uppy({
      id: 'uppy1',
      autoProceed: false,
      debug: true,
      onBeforeFileAdded: (currentFile, files) => {
        let totalSize = currentFile.size;
        console.log('onBeforeFileAdded', currentFile)
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

      // Define this onload every time to get file and base64 every time
      if (file.source.startsWith('Attachment:') === false) {
        this.reader = new FileReader();
        this.reader.readAsDataURL(file.data);

        this.reader.onload = (readerEvt) =>
          this.addFileToState({ file, base64: readerEvt.target.result });
        this.showAttachActions = true;
      } else {
        const size = file.source.split(':')[1];
        file.size = parseInt(size);

        this.addFileToState({
          file,
          base64: `data:${file.type};base64,${file.data}`,
        });
      }
    });

    setTimeout(() => {
      // If forwarding, add original attachments files
      if (this.state.isForward) {
        console.log('If forwarding, add original attachments files');
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

    if(this.props.composer.content && this.props.composer.content !== '') {
      this.state.defaultContent = this.props.composer;
    } else {
      if (this.props.lexon.sign && this.props.lexon.sign !== '') {
        this.state.content = `<br/><br/><p>${this.props.lexon.sign}</p>` + this.state.content;
      }
    }

    this.state.defaultContent = this.state.content;
    this.state = { ...this.state, ...this.props.composer };
  }

  componentDidMount(prevProps) {
    window.dispatchEvent(new CustomEvent('OpenComposer'));
    window.addEventListener('AttachDocument', this.attachFromLexon);
    window.addEventListener(
      'GetUserFromCentinelaConnector',
      this.handleGetUserFromLexonConnector
    );

    //this.removeFields();

    const messageId = this.props.match.params.id;
    if(messageId){
      this.props.getEmailHeaderMessage(messageId);
      this.props.getEmailMessage(messageId)
    }

    //this.interval = setInterval(this.saveDraft(), this.state.draftStoreDelay);
  }

  addSignToContent() {
    const { lexon } = this.props;
    return

    if(this.props.composer.content && this.props.composer.content !== '') {
      this.setState({...this.props.composer, defaultContent: this.props.composer.content} );
    } else {
      if (lexon.sign && lexon.sign !== '') {
        const {content} = this.state;
        const dc = `<br/><br/><p>${lexon.sign}</p>` + content;
        this.setState({
          defaultContent: dc,
          content: dc,
        });
      }
    }
  }

  getAttachById(messageId, attachments) {
    const addAttachment = (attach) => {
      getAttachments({messageId, attachmentId: attach.body.attachmentId})
      .then((attachment) => {
        const dataUrl = attachment.data;

        const blob = dataUrlToFile({dataUrl, mimeType: attach.mimeType });

        var fileOfBlob = new File([blob], attach.filename);
   
        this.uppy.addFile({
          content: `data:${attach.mimeType};base64,${attachment.data}`,
          name: attach.filename,
          type: attach.mimeType,
          data: fileOfBlob, 
          source: 'Local', 
          isRemote: false 
        });
    
      })
      .catch((err) => {
        console.log('Error' + err);
      });
    };

    attachments.forEach(file => {
      if(file.filename != '') {
        addAttachment(file);
      }
    });
   
  }

  getAddressesById() {
    const to = this.props.emailMessageResult.result.messageHeaders.find(x => x.name == "To");

    const cc = this.props.emailMessageResult.result.messageHeaders.find(x => x.name == "Cc");
            
    const bcc = this.props.emailMessageResult.result.messageHeaders.find(x => x.name == "Bcc");
    if(to) {
      const toEmails = to.value.split(',');
      toEmails.forEach(toEmail => {
        this.addAddress('to', toEmail);
      });
    }

    if(cc) {
      const ccEmails = cc.value.split(',');
      ccEmails.forEach(ccEmail => {
        this.addAddress('cc', ccEmail);
      });
    }
    
    if (bcc) {
      const bccEmails = bcc.value.split(',');
      bccEmails.forEach(bccEmail => {
        this.addAddress('bcc2', bccEmail);
      });
    }
  }

  formatBodyImages(messageId, attachments, embedddedImages) {
    const addImages = async (attach, image) => {
      const attachment = await getAttachments({messageId, attachmentId: attach.body.attachmentId});
      const dataUrl = attachment.data
         .replace(/-/g, "+")
         .replace(/_/g, "/");
      const src = image.replace(/.*src="([^"]*)".*/, '$1');
      let body = '';
      if(this.state.defaultContent) {
        let regExp = RegExp(src,"g")
        body = this.state.defaultContent.replace(regExp, `data:${attach.mimeType};base64,${dataUrl}`);
      } else {
        let regExp = RegExp(src,"g")
        body = this.props.emailMessageResult.body.replace(regExp, `data:${attach.mimeType};base64,${dataUrl}`);
      }
      this.setState({
       defaultContent: body,
       content: body,
       embeddedImgLoaded: true
      });
    }

    const extractHeaders = (attachments) => {
      attachments.forEach(attachment => {
        const headers = attachment.headers;
        if (headers){
          const inline = headers.find(h => h.name === 'Content-Disposition' && (h.value.includes("inline") || h.value.includes("attachment")));
          const attID = headers.find(h => h.name === "Content-ID");
          if (inline && attID){
            const image = embedddedImages.find(i => i.includes(attID.value.replace('<', '').replace('>','')));
            if (image)
              addImages(attachment, image);
          }
        }
        if (attachment.parts && attachment.parts.length > 0){
          extractHeaders(attachment.parts);
        }
      })
    }
  
    if (attachments && attachments.length > 0){
      extractHeaders(attachments);
    }
  }

  getById() {
    if(this.props.emailMessageResult.body != ''){
      const messageId = this.props.emailMessageResult.result.messageHeaders.find(x => 
        x.name == "Message-ID" || x.name == "Message-Id");
        getDraftListWithRFC(
          messageId.value      
          ).then((data) => {
            const messageId = this.props.emailMessageResult.result.id;

            const attachments = this.props.emailMessageResult.attach;
      
            const embeddedImages = getEmbeddedImages(this.props.emailMessageResult.body);

            this.formatBodyImages(messageId, attachments, embeddedImages);
         
            this.getAddressesById();

            const subject = this.props.emailMessageResult.result.messageHeaders.find(x => x.name == "Subject");

            const content =  this.props.emailMessageResult.body === 'null'  
            ? 
            '' 
            : this.props.emailMessageResult.body; 

            if(attachments) {
              this.getAttachById(messageId, attachments);
            }
            
            this.setState({
              subject: subject.value, 
              defaultContent: content,
              content: content,
              draftId: data.result.drafts[0].id,
              isDraftEdit: true
            });
        });
    }
  }

  handleGetUserFromLexonConnector() {
    window.dispatchEvent(new CustomEvent('OpenComposer'));
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
    const findSelected = this.props.labelsResult.labels.find(x =>
      x.selected == true
     );
     if(findSelected) {
      this.props.history.push(`/${findSelected.id.toLowerCase()}`);
     } else {
      this.props.history.push('/inbox');
     }
  }

   goBack() {
     this.props.updateComposerData({});

     if (this.props.casefile != null && this.props.casefile !== undefined) {
      window.dispatchEvent(new CustomEvent('RemoveCaseFile'));
      this.props.setCaseFile({
        casefile: null,
        bbdd: null,
        company: null,
      });
    } else if (this.props.mailContacts) {
      this.props.setMailContacts(null);
    }
    if(this.state.draftId) {
        deleteDraft({ draftId: this.state.draftId }).then(() => {
          this.closeModal();
        });
    } else {
      this.closeModal();
    } 
  }

  async sentEmail(message) {
    //const emailDate = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
    this.props.setMailContacts(null);
    this.props.updateComposerData({});

    window.dispatchEvent(
      new CustomEvent('SentMessage', {
        detail: {
          idEmail: message.id,
          subject: message.subject, // window.atob(subject.replace('=?UTF-8?B?', '').replace('?=', '')),
          date: message.emailDate,
          folder: '[GMAIL]/Enviados',
          account: this.props.lexon.account,
          provider: 'GOOGLE',
        },
      })
    );

    setTimeout(async () => {
      if (this.props.lexon.bbdd && this.props.lexon.account) {
        try {
          const user = await getUser(this.props.lexon.userId);
          if (user && user.data && user.data.configUser) {
            if (user.data.configUser.getContacts) {
              console.log(this.state);

              await classifyEmail(
                message.id,
                message.subject,
                message.sentDateTime,
                message.to,
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
    console.log('addFileToState', fls)
    this.setState({
      uppyPreviews: fls,
    });
  }

  uploadFile() {
    console.log(this.state.uppyPreviews);
    // this.uppyOne.upload();
  }

  componentDidUpdate(prevProps, prevState) {
    if((prevState.to !== this.state.to 
      || prevState.cc !== this.state.cc 
      || prevState.bcc !== this.state.bcc 
      || prevState.subject !== this.state.subject
      || prevState.content !== this.state.content
      || prevState.uppyPreviews !== this.state.uppyPreviews) 
      && !this.props.match.params.id) {
        if (!this.state.draftInProgress){
          this.setState({draftInProgress: true, draftQueue: 0});
          this.saveDraft();
        } else {
          this.setState({draftQueue: this.state.draftQueue + 1})
        }
    }   

    if((prevState.to !== this.state.to 
      || prevState.cc !== this.state.cc 
      || prevState.bcc !== this.state.bcc 
      || prevState.subject !== this.state.subject
      || prevState.content !== this.state.content
      || prevState.uppyPreviews !== this.state.uppyPreviews) 
      && this.props.match.params.id 
      && this.state.isDraftEdit) {
        if (!this.state.draftInProgress){
          this.setState({draftInProgress: true, draftQueue: 0});
          this.saveDraft();
        } else {
          this.setState({draftQueue: this.state.draftQueue + 1})
        }   
    }

    if (this.state.draftQueue > 0 && !this.state.draftInProgress){
      this.setState({draftInProgress: true, draftQueue: 0});
      this.saveDraft();
    }

    if(
      prevProps.emailMessageResult !== this.props.emailMessageResult
      ) {
      this.getById();
    }
    if (!this.state.embeddedImgLoaded && (this.state.isForward || this.state.isReply)){
      const messageId = this.props.emailHeaderMessageResult.headers.find(h => h.name.toUpperCase() === "MESSAGE-ID");
      if (messageId && messageId.value){
        const attachments = this.props.emailMessageResult.attach;
        const embeddedImages = getEmbeddedImages(this.props.emailMessageResult.body);
        this.formatBodyImages(messageId.value, attachments, embeddedImages);  
      }
    }
  }

  componentWillUnmount() {
    window.dispatchEvent(new CustomEvent('CloseComposer'));
    window.dispatchEvent(new CustomEvent('RemoveCaseFile'));
    window.removeEventListener('AttachDocument', this.attachFromLexon);
    window.removeEventListener(
      'GetUserFromCentinelaConnector',
      this.handleGetUserFromLexonConnector
    );

    this.removeFields();
    this.props.setMailContacts(null);
    this.uppy.close();
  }

  handleChange(value, delta, source, editor) {
    if(value) {
      this.setState({content: value}, () => {
        this.props.updateComposerData( { ...this.state, defaultContent: this.state.content});
      });
    }
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

  b64EncodeUnicode(str) {
    return btoa(
      encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
        return String.fromCharCode(parseInt(p1, 16));
      })
    );
  }

  getTimeDraft() {
    const date = new Date();
    const time = date.toLocaleString(
      navigator.language, 
      {
        hour: '2-digit', 
        minute: '2-digit', 
        second: "2-digit"
      });
    const hour = time.slice(0, 2);
    return hour >= 12 ? time +' '+ 'PM' : time +' '+ 'AM';
  }
  
  saveDraft() {

    const validTo = getValidEmails(this.state.to);
    
    const headers = {
      To: validTo.join(', '),
      Subject: '=?UTF-8?B?' + this.b64EncodeUnicode(this.state.subject) + '?=',
      attachments: this.state.uppyPreviews,
      From: this.props.googleUser.getBasicProfile(),
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

    const fullTime = this.getTimeDraft();

    console.log('saveDraft', this.state.content)

    if(this.state.to != '' 
    || this.state.cc != ''
    || this.state.bcc != ''
    || this.state.subject != '' 
    || this.state.content != ''){
      //this.setState({draftPollingCount: this.state.draftPollingCount + 1});
      setTimeout(() => {
        createDraft({
          headers,
          body: this.state.content ? this.state.content : 'null',
          attachments: Fileattached,
          draftId: this.state.draftId
        }).then((draft) => {
          console.log('DRAFT GUARDADO: ' + draft.id)
          this.setState({draftTime: fullTime, draftId: draft.id, draftInProgress: false});
        })
        .catch((err) => {
          console.log('ERROR GUARDANDO DRAFT');
          console.log('Error sending email:' + err);
          this.setState({draftInProgress: false});
        });
      });
    }
    
  }

  _sendEmail() {
    const validTo = getValidEmails(this.state.to);

    const headers = {
      To: validTo.join(', '),
      Subject: '=?UTF-8?B?' + this.b64EncodeUnicode(this.state.subject) + '?=',
      attachments: this.state.uppyPreviews,
      From: this.props.googleUser.getBasicProfile(),
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
      attachments: Fileattached,
    })
      .then((email) => {
        //this.sentEmail(email.id, this.state.subject);
        getMessageHeader(email.id)
          .then((headers) => {
            const message = {
              id: this.getContentByHeader(headers, 'Message-Id'),
              subject: this.getContentByHeader(headers, 'Subject'),
              sentDateTime: this.getContentByHeader(headers, 'Date'),
              to: validTo
            };
            this.sentEmail(message);
          })
          .catch((err) => {
            console.log('Error getting Headers:' + err);
          });
      })
      .catch((err) => {
        console.log('Error sending email:' + err);
      });
    this.resetFields();
    if(this.state.draftId) {
      deleteDraft({ draftId: this.state.draftId }).then(() => {
        this.closeModal();
      });
    } else {
      this.closeModal();
    } 
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
      uppyPreviews: [],
    });
  }

  removeFields() {

    this.props.updateComposerData({});
    this.setState({
      content: '',
      defaultContent: '',
      to: '',
      cc: '',
      bcc: '',
      subject: '',
      draftId: '',
      draftTime: '',
      to2: [],
      cc2: [],
      bcc2: [],
      uppyPreviews: []
    });
  }

  setField(field, trimValue = true) {
    return (evt) => {
      this.setState({
        [field]: trimValue ? evt.target.value.trim() : evt.target.value,
      } , ()=>{ this.props.updateComposerData(this.state); });
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
        //content: dataUrl.currentTarget.result.replace(/^data:[^;]*;base64,/, "")
      };

      uppy.addFile(newAttachment);
    };
    Array.from(event.dataTransfer.files).forEach((file) => {
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
        this.setState({ to2, to }, ()=>{ this.props.updateComposerData(this.state); });
        this.props.setMailContacts(to);
      } else if (id === 'cc') {
        const cc2 = [...this.state.cc2];
        cc2.push(address);
        const cc = cc2.join(',');
        this.setState({ cc2, cc }, ()=>{ this.props.updateComposerData(this.state); });
      } else if (id === 'bcc2') {
        const bcc2 = [...this.state.bcc2];
        bcc2.push(address);
        const bcc = bcc2.join(',');
        this.setState({ bcc2, bcc }, ()=>{ this.props.updateComposerData(this.state); });
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
      this.setState({ to2, to }, ()=>{ this.props.updateComposerData(this.state); });
      this.props.setMailContacts(to);
    } else if (id === 'cc') {
      const cc2 = [...this.state.cc2];
      cc2.splice(cc2.indexOf(address), 1);
      const cc = cc2.join(',');
      this.setState({ cc2, cc }, ()=>{ this.props.updateComposerData(this.state); });
    } else if (id === 'bcc2') {
      const bcc2 = [...this.state.bcc2];
      bcc2.splice(bcc2.indexOf(address), 1);
      const bcc = bcc2.join(',');
      this.setState({ bcc2, bcc }, ()=>{ this.props.updateComposerData(this.state); });
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
        //content: dataUrl.currentTarget.result.replace(/^data:[^;]*;base64,/, "")
      };
      console.log('onAttachSelected', newAttachment);
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
      draftTime
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
                  defaultValue={this.state.defaultContent}
                />
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
              { draftTime != '' ? <span className="draft-time">{i18n.t('compose-message.draft-save')} {draftTime}</span> : null}
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

          .attach-button .fa-paperclip {
            font-size: 20px;
            margin-right: 5px;
          }

          .draft-time {
            color: #001978;
            font-size: 15px;
            font-weight: 500;
            position: relative;
            top: 2px;
          }

          #toolsRTE_2rte-view {
            border-bottom: 0 solid transparent !important;
            border: 1px solid rgba(0, 0, 0, 0.1);
            border-right: 0 solid transparent !important;
            border-left: 0 solid transparent !important;
            margin-top: 76px !important;
          }
          
        `}</style>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    lexon: state.lexon,
    messagesResult: state.messagesResult,
    emailMessageResult: state.emailMessageResult,
    emailHeaderMessageResult: state.emailHeaderMessageResult,
    composer: state.composer
  };
};

const mapDispatchToProps = (dispatch) => ({
  setCaseFile: (casefile) => dispatch(ACTIONS.setCaseFile(casefile)),
  setMailContacts: (mailContacts) =>
    dispatch(ACTIONS.setMailContacts(mailContacts)),
  getEmailMessage: (messageId) => 
    dispatch(getEmailMessage(messageId)),
  getEmailHeaderMessage: (messageId) => 
    dispatch(getEmailHeaderMessage(messageId)),
  updateComposerData: (data) => dispatch(updateComposerData(data))
    
});

export default compose(
  withRouter, connect(mapStateToProps, mapDispatchToProps))(ComposeMessage);

function fileNameAndExt(str) {
  var file = str.split('/').pop();
  return [
    file.substr(0, file.lastIndexOf('.')),
    file.substr(file.lastIndexOf('.') + 1, file.length),
  ];
}