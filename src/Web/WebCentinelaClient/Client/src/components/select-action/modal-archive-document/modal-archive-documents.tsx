import React, { Component, Fragment, createRef } from 'react';
import i18n from 'i18next';
import { Base64 } from 'js-base64';
import { Button, Modal, Container } from 'react-bootstrap';
import { connect, ConnectedProps } from 'react-redux';
import 'react-perfect-scrollbar/dist/css/styles.css';
import { AppState } from '../../../store/store';
import { bindActionCreators } from 'redux';
import { ApplicationActions } from '../../../store/application/actions';
import { Step1 } from './step1';
import { Step2 } from './step2';
import { Step3 } from './step3';
import {
  Evaluation,
  CentInstance,
  uploadFile
} from '../../../services/services-centinela';
import { identity } from 'lodash';
const parse = require('emailjs-mime-parser').default;
const base64js = require('base64-js');

const mapStateToProps = (state: AppState) => {
  return {
    showAttachDocuments: state.application.showArchiveModal,
    selected: state.messages.selected,
    user: state.application.user
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    ...bindActionCreators(
      {
        toggleArchiveModal: ApplicationActions.toggleArchiveModal
      },
      dispatch
    )
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type ReduxProps = ConnectedProps<typeof connector>;

interface Props extends ReduxProps {
  toggleNotification: any;
}

interface State {
  implantation: Evaluation | null;
  complete: boolean;
  search: string;
  step: number;
  entity: number;
  messages: any;
  files: any;
  attachments: any;
  copyEmail: boolean;
  copyAttachments: boolean;
  instance?: CentInstance;
}

class ModalArchiveDocuments extends Component<Props, State> {
  private step3Ref: any;
  constructor(props: Props) {
    super(props);
    this.step3Ref = createRef();

    this.state = {
      complete: false,
      implantation: null,
      search: '',
      step: 1,
      entity: 0,
      messages: [],
      files: [],
      attachments: [],
      copyEmail: true,
      copyAttachments: true,
      instance: undefined
    };

    this.onCopyAttachments = this.onCopyAttachments.bind(this);
    this.onCopyEmail = this.onCopyEmail.bind(this);
    this.onImplantation = this.onImplantation.bind(this);
    this.onInstanceSelected = this.onInstanceSelected.bind(this);
    this.onChangeSelected = this.onChangeSelected.bind(this);
  }

  componentDidMount() {}

  componentDidUpdate(prevProps: Props) {
    if (
      (prevProps.showAttachDocuments === false &&
        this.props.showAttachDocuments === true) ||
      (prevProps.showAttachDocuments === true &&
        this.props.showAttachDocuments === false)
    ) {
      this.initMessages();
    }
  }

  initMessages() {
    const { selected } = this.props;
    const messages = [];
    let attachments: any = [];

    // Parsing messages
    for (let i = 0; i < selected.length; i++) {
      const attchs: any = this.parseMessage(selected[i]);
      attachments = [...attachments, ...attchs];
      const nm = Object.assign({}, selected[i], { attachments: attchs });
      messages.push(nm);
    }

    this.setState({ messages, attachments });
  }

  isAttachment(node: any): boolean {
    let bRes = false;
    if (node['x-attachment-id']) {
      bRes = true;
    } else if (
      node['content-disposition'] &&
      (node['content-disposition'][0].initial.indexOf('attachment') > -1 ||
        node['content-disposition'][0].initial.indexOf('inline') > -1) &&
      node['content-disposition'][0].params.filename &&
      this.isFileAllowed(node['content-disposition'][0].params.filename)
    ) {
      bRes = true;
    }

    return bRes;
  }

  isFileAllowed(name: string): boolean {
    const fe = name.split('.').pop();
    return extensionsAllowed.indexOf(fe ? fe.toUpperCase() : '') > -1;
  }

  findAttachments(email: any): any {
    let attachs: any = [];
    if (email.childNodes) {
      for (let i = 0; i < email.childNodes.length; i++) {
        if (
          email.childNodes[i]._isMultipart === false &&
          this.isAttachment(email.childNodes[i].headers)
        ) {
          attachs.push({
            ...email.childNodes[i],
            checked: true
          });
        } else {
          attachs = [...attachs, ...this.findAttachments(email.childNodes[i])];
        }
      }
    }
    return attachs;
  }

  parseMessage(message: any) {
    let attachments = [];
    if (message.raw) {
      let mime = null;
      try {
        //console.log(message.raw)
        mime = parse(message.raw);
      } catch (err) {
        console.log(err);
      }

      if (mime) {
        attachments = this.findAttachments(mime);
      }
    }

    return attachments;
  }

  closeDialog() {
    const { toggleArchiveModal } = this.props;
    setTimeout(() => {
      this.setState({
        search: '',
        step: 1,
        entity: 0,
        messages: [],
        files: [],
        complete: false
      });
    }, 1000);
    toggleArchiveModal && toggleArchiveModal();
  }

  nextStep() {
    const { step } = this.state;
    if (step === 1) {
      const selected = this.state.attachments.filter((m: any) => m.checked);
      this.setState({ step: 2, copyAttachments: selected.length > 0 });
    } else if (step === 2) {
      this.setState({ step: 3 });
    } else if (step === 3) {
      this.closeDialog();
      this.saveDocuments();
    } // else {
    //   this.setState({ step: step + 1 });
    // }
  }

  prevStep() {
    const { step } = this.state;
    if (step === 2) {
      this.setState({ step: 1, instance: undefined });
    } else if (step === 3) {
      if (this.step3Ref.current.back() === true) {
        this.setState({ step: 2, instance: undefined });
      } else {
        this.setState({ instance: undefined });
      }
    }
  }

  async saveDocuments() {
    const { toggleNotification } = this.props;
    const { messages, instance } = this.state;
    let result = true;

    for (let m = 0; m < messages.length; m++) {
      if (messages[m] && messages[m].raw) {
        const mime = parse(messages[m].raw);

        if (this.state.copyEmail) {
          // Upload eml file
          const raw = Base64.encode(messages[m].raw, false);
          const r1 = await uploadFile(
            this.props.user,
            instance?.conceptObjectId || 0,
            {
              name: messages[m].subject + '.eml',
              content: raw
            }
          );

          if (r1 !== 200 && r1 !== 201) {
            result = false;
          }
        }

        if (this.state.copyAttachments) {
          for (let j = 0; j < this.state.attachments.length; j++) {
            const node = this.state.attachments[j];

            if (node.checked === true) {
              let rawAttach = base64js.fromByteArray(node.content);
              const r2 = await uploadFile(
                this.props.user,
                instance?.conceptObjectId || 0,
                {
                  name: node.contentType.params.name,
                  content: rawAttach
                }
              );

              if (r2 !== 200 && r2 !== 201) {
                result = false;
              }
            }
          }
        }
      }
    }

    if (result) {
      toggleNotification(i18n.t('modal-archive.modal-save-ok'));
    } else {
      toggleNotification(i18n.t('modal-archive.modal-save-ko'), true);
    }
  }

  saveDisabled() {
    const {
      step,
      copyAttachments,
      copyEmail,
      implantation,
      instance
    } = this.state;
    if (step === 1 && (copyAttachments === true || copyEmail === true)) {
      if (copyAttachments === true && copyEmail === false) {
        const selected = this.state.attachments.filter((m: any) => m.checked);
        return selected.length == 0;
      }

      return false;
    }
    if (step === 2 && implantation && implantation.evaluationId > 0) {
      return false;
    }

    if (step === 3 && instance) {
      return false;
    }

    return true;
  }

  renderButtons() {
    const { step, complete, files } = this.state;

    switch (step) {
      case 1:
        return (
          <Fragment>
            <Button
              bsPrefix="btn btn-outline-primary"
              onClick={() => {
                this.closeDialog();
              }}
            >
              {i18n.t('modal-archive.cancel')}
            </Button>
            <Button
              disabled={this.saveDisabled()}
              bsPrefix="btn btn-primary"
              onClick={() => {
                this.nextStep();
              }}
            >
              {i18n.t('modal-archive.continue')}
            </Button>
          </Fragment>
        );
      case 2:
        return (
          <Fragment>
            <Button
              bsPrefix="btn btn-outline-primary"
              onClick={() => {
                this.closeDialog();
              }}
            >
              {i18n.t('modal-archive.cancel')}
            </Button>
            <Button
              bsPrefix="btn btn-outline-primary"
              onClick={() => {
                this.prevStep();
              }}
            >
              {i18n.t('modal-archive.back')}
            </Button>
            <Button
              disabled={this.saveDisabled()}
              bsPrefix="btn btn-primary"
              onClick={() => {
                this.nextStep();
              }}
            >
              {i18n.t('modal-archive.continue')}
            </Button>
          </Fragment>
        );
      case 3:
        return (
          <Fragment>
            <Button
              bsPrefix="btn btn-outline-primary"
              onClick={() => {
                this.closeDialog();
              }}
            >
              {i18n.t('modal-archive.cancel')}
            </Button>
            <Button
              bsPrefix="btn btn-outline-primary"
              onClick={() => {
                this.prevStep();
              }}
            >
              {i18n.t('modal-archive.back')}
            </Button>
            <Button
              disabled={this.saveDisabled()}
              bsPrefix="btn btn-primary"
              onClick={() => {
                this.nextStep();
              }}
            >
              {i18n.t('modal-archive.save')}
            </Button>
          </Fragment>
        );
      case 4:
        return (
          <Fragment>
            <Button
              bsPrefix="btn btn-outline-primary"
              onClick={() => {
                this.closeDialog();
              }}
            >
              {i18n.t('modal-archive.cancel')}
            </Button>
            <Button
              bsPrefix="btn btn-outline-primary"
              onClick={() => {
                this.prevStep();
              }}
            >
              {i18n.t('modal-archive.back')}
            </Button>
            <Button
              disabled={files.length === 0}
              bsPrefix="btn btn-primary"
              onClick={() => {
                this.nextStep();
              }}
            >
              {i18n.t('modal-archive.continue')}
            </Button>
          </Fragment>
        );

      default:
        return null;
    }
  }

  onCopyEmail(check: boolean) {
    const { copyEmail } = this.state;
    if (copyEmail !== check) {
      this.setState({ copyEmail: check });
    }
  }

  onCopyAttachments(check: boolean) {
    const { copyAttachments } = this.state;
    if (copyAttachments !== check) {
      this.setState({ copyAttachments: check });
    }
  }

  onImplantation(imp: Evaluation) {
    const { implantation } = this.state;
    if (implantation?.evaluationId !== imp.evaluationId) {
      this.setState({ implantation: imp });
    }
  }

  onInstanceSelected(inst?: CentInstance) {
    this.setState({ instance: inst });
  }

  onChangeSelected(event: any, data: any) {
    const aux = [...this.state.attachments];
    for (let i = 0; i < aux.length; i++) {
      if (aux[i] === data) {
        aux[i].checked = event.checked;
      }
    }

    this.setState({ attachments: [...aux] });
  }

  render() {
    const { user, showAttachDocuments } = this.props;
    const { messages, step, implantation, copyAttachments } = this.state;
    let attachments = false;
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      if (msg.attachments && msg.attachments.length > 0) {
        attachments = true;
        break;
      }
    }
    return (
      <div className="modal-connection-emails">
        <Modal
          show={showAttachDocuments}
          onHide={() => {
            this.closeDialog();
          }}
          size="lg"
          aria-labelledby="contained-modal-title-vcenter"
          centered
          dialogClassName="modal"
        >
          <Modal.Header className="align-items-center" closeButton>
            <h5
              className="modal-title d-flex align-items-center"
              id="documentarGuardardocumentacionLabel"
            >
              <img
                className='imgproduct'
                alt='Centinela'
                src={`${(window as any).URL_MF_CENTINELA_BASE}/assets/img/icon-centinela.svg`}></img>

              <span>{i18n.t('modal-archive.title')}</span>
              {/* <span>{step}</span> */}
            </h5>
          </Modal.Header>
          <Modal.Body className="mimodal">
            <Container>
              <Fragment>
                <div
                  style={{
                    display: this.state.step === 1 ? 'block' : 'none'
                  }}
                >
                  <Step1
                    selected={messages}
                    attachments={attachments}
                    onCopyEmail={this.onCopyEmail}
                    onCopyAttachments={this.onCopyAttachments}
                    onChange={this.onChangeSelected}
                  />
                </div>
                <div
                  style={{
                    display: this.state.step === 2 ? 'block' : 'none'
                  }}
                >
                  <Step2
                    user={user}
                    show={step === 2}
                    step={attachments && copyAttachments ? 3 : 2}
                    implantation={''}
                    onImplantation={this.onImplantation}
                  />
                </div>
                <div
                  style={{
                    display: this.state.step === 3 ? 'block' : 'none'
                  }}
                >
                  <Step3
                    ref={this.step3Ref}
                    user={user}
                    show={step === 3}
                    implantation={implantation}
                    onInstanceSelected={this.onInstanceSelected}
                  />
                </div>
                <div
                  style={{
                    display: this.state.step === 4 ? 'block' : 'none'
                  }}
                >
                  <div>Step 4</div>
                </div>
              </Fragment>
            </Container>
          </Modal.Body>
          <Modal.Footer>{this.renderButtons()}</Modal.Footer>
        </Modal>

        <style jsx>{`
          .modal-header h5 span {
            color: white;
            cursor: default;
          }

          .modal-header h5 span.lf-icon-compliance {
            font-size: 28px !important;
          }

          .e-checkbox-wrapper .e-frame.e-check,
          .e-checkbox-wrapper .e-checkbox:focus + .e-frame.e-check,
          .e-checkbox-wrapper:hover .e-frame.e-check {
            background-color: #001978;
          }

          .modal-footer .btn-primary:hover {
            color: white;
          }

          .modal-header h5 span {
            font-size: 22px !important;
            margin-left: 15px;
          }

          .e-checkbox-wrapper .e-check,
          .e-css.e-checkbox-wrapper .e-check {
            font-size: 16px;
          }

          .e-checkbox-wrapper .e-frame {
            width: 25px;
            height: 25px;
            line-height: 16px;
          }

          .e-checkbox-wrapper .e-frame + .e-label {
            height: 13px;
            color: #001978;
            font-family: MTTMilano-Medium;
            font-size: 16px;
            font-weight: 500;
            line-height: 16px;
          }

          .e-checkbox-wrapper .e-frame,
          .e-css.e-checkbox-wrapper:hover .e-frame,
          .e-checkbox-wrapper:hover .e-frame,
          .e-css.e-checkbox-wrapper:hover .e-frame {
            border-color: #001978;
          }

          .e-radio:checked + .e-success::after {
            /* csslint allow: adjoining-classes */
            background-color: #001978;
            border-color: #001978;
          }

          ol > li:before {
            padding-top: 4px;
          }

          .e-radio:checked + label::before,
          .e-radio:checked:focus + label::before,
          .e-radio:checked + .e-success::before,
          .e-radio:checked:focus + .e-success::before,
          .e-radio:checked + .e-success:hover::before,
          .e-radio + .e-success:hover::before,
          .e-radio:checked + label:hover::before {
            border-color: #001978;
          }

          .e-radio:checked + label::after {
            color: #001978;
          }

          .e-radio:checked:focus + label::after,
          .e-radio:checked + label:hover::after,
          .e-radio:checked + label:hover::before {
            background-color: #001978 !important;
          }

          .e-radio:checked:focus + .e-success::after,
          .e-radio:checked + .e-success:hover::after {
            background-color: #001978;
            border-color: #001978;
          }

          .e-radio + label .e-label {
            height: 15px;
            color: #001978;
            font-family: MTTMilano-Medium, Lato, Arial, sans-serif;
            font-size: 16px;
            font-weight: 500;
          }

          input[type='radio'] + label:before {
            width: 24px;
            height: 24px;
          }

          input[type='radio']:checked + label:after {
            width: 18px;
            height: 18px;
          }

          .e-radio + label .e-label {
            margin-left: 10px;
            padding: 0;
          }

          .e-radio-wrapper {
            display: inline-block;
            line-height: 2;
          }

          .container {
            max-width: none !important;
          }

          .container p {
            color: #001978;
          }

          .btn-secundary {
            min-width: 165px;
            border-radius: 0;
            border: 2px solid #001978;
            background-color: #001978;
            text-transform: uppercase;
            font-size: 13px;
            font-family: MTTMilano-Bold, Lato, Arial, sans-serif;
            letter-spacing: 0.7px;
            color: #ffff;
            padding: 10px;
          }

          .btn-secundary:focus {
            background-color: #001978 !important;
            border: 2px solid #001978 !important;
            color: #ffff !important;
          }

          .btn-outline-primary:focus {
            border-color: #001978 !important;
          }

          strong {
            font-weight: 500;
            font-family: MTTMilano-Medium, Lato, Arial, sans-serif;
          }

          table {
            color: #7c868c;
          }

          .modal-dialog {
            margin-top: 4rem;
          }

          .modal-content {
            border: 0;
            border-radius: 0;
          }

          .modal-header {
            border: 0;
            background-color: #001978;
            color: #fff;
            font-size: 22px;
            border-radius: 0;
          }

          .modal .modal-dialog .modal-content .modal-header:not(.infoModal) {
            min-height: 64px;
            padding: 0 50px;
          }

          .modal-header h5 span {
            font-size: 28px;
            margin-right: 15px;
          }
          .modal-header .modal-title {
            margin-left: 20px;
            font-size: 22px;
          }
          .modal-header .close {
            font-family: MTTMilano, Lato, Arial, sans-serif;
            opacity: 1;
            color: #fff;
            font-size: 16px;
            text-shadow: 0 0 0;
          }

          .modal-header .close:before {
            content: '\\e938';
            color: #fff;
            font-family: 'lf-font' !important;
            speak: none;
            font-style: normal;
            font-weight: normal;
            font-variant: normal;
            text-transform: none;
            line-height: 1;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }

          .modal-header .close span:first-child {
            color: #001978;
            display: none;
          }
          .modal-body.mimodal {
            background-color: #ffffff;
            height: 550px;
            padding-top: 0 !important;
          }

          .modal-body.info {
            background-color: #001978;
          }

          .modal-body.info .content {
            color: #fff;
            font-size: 19px;
          }

          .modal-body.info .content [class^='lf-icon'] {
            font-size: 100px;
            margin-right: 50px;
          }

          .modal-footer {
            border: 0;
            border-radius: 0;
            justify-content: flex-end !important;
            background-color: #ffffff;
          }
          .modal-footer.info {
            background-color: #001978;
          }

          .modal-footer .btn-primary:hover {
            /* background-color: #e5e8f1 !important; */
          }

          .modal-footer .btn-primary {
            margin-left: 10px;
            background-color: #001978 !important;
            border-color: #001978 !important;
          }

          .form-group .requerido {
            color: #d81f2a;
            font-size: 20px;
            text-align: start;
          }

          .lexon-select-like-custom-trigger {
            height: 45px;
            width: 350px;
            border: 1px solid #d2d2d2;
            background-color: #ffffff;
            outline: none;
            color: #7c868c;
            font-size: 15px;
            text-align: left;
            position: relative;
            padding-left: 10px;
          }
          .lexon-select-like-custom-trigger:focus {
            outline: none;
          }
          .lexon-select-like-custom-trigger span {
            font-size: 20px;
            position: absolute;
            top: 10px;
            right: 10px;
            color: #001978;
            transition: all 0.5s ease;
          }
          .lexon-select-like-custom-trigger.opened span {
            -moz-transform: rotate(180deg);
            -webkit-transform: rotate(180deg);
            -o-transform: rotate(180deg);
            -ms-transform: rotate(180deg);
            transform: rotate(180deg);
          }
          .lexon-select-like-custom-list-container {
            transition: all 0.5s ease;
            height: 0;
            width: 350px;
            position: absolute;
            z-index: 2;
            overflow: hidden;
          }
          .lexon-select-like-custom-list-container.opened {
            height: 230px;
            overflow: visible;
          }
          .lexon-select-like-custom-list {
            height: 230px;
            width: 350px;
            border: 1px solid #d2d2d2;
            background-color: #ffffff;
            box-shadow: 0 0 4px 1px rgba(102, 175, 233, 0.6);
            position: absolute;
            z-index: 1;
            padding: 5px;
            overflow: scroll;
          }
          .lexon-select-like-custom-list li {
            border-bottom: solid 1px #001978;
            height: 43px;
            color: #7c868c;
            font-size: 15px;
            line-height: 43px;
            padding: 0 10px;
            margin: 0 2px;
          }
          .lexon-select-like-custom-list li:last-child {
            border-bottom: none;
          }
          .lexon-select-like-custom-list li span {
            color: #7c868c;
          }
          .lexon-select-like-custom-list li.selected,
          .lexon-select-like-custom-list li:hover {
            background-color: #e5e8f1;
            color: #001978;
            cursor: pointer;
          }
          .lexon-select-like-custom-list li.selected span,
          .lexon-select-like-custom-list li:hover span {
            color: #001978;
          }

          .lexon-clasification-list-container {
            border: 1px solid #d2d2d2;
            position: relative;
            z-index: 1;
          }
          .lexon-clasification-list-container label {
            line-height: 45px;
          }
          .lexon-clasification-list-search {
            position: absolute;
            top: 0;
            right: -1px;
            display: inline-block;
          }
          .lexon-clasification-list-search .lexon-clasification-list-results {
            position: relative;
            height: 45px;
            width: 190px;
            float: left;
            padding-top: 5px;
          }
          .lexon-clasification-list-search p {
            color: #001978;
            font-size: 10px;
            display: inline-block;
            padding: 5px 10px;
            margin-bottom: 0;
          }
          .lexon-clasification-list-search p strong {
            font-size: 13px;
          }
          .lexon-clasification-list-search a.search-trigger-show {
            font-size: 20px;
            color: #001978;
            font-weight: bold !important;
            display: inline-block;
            width: 30px;
            height: 30px;
            padding: 4px;
            transition: background-color 0.5ms;
            border-radius: 50%;
          }
          .lexon-clasification-list-search a.search-trigger:hover {
            background-color: #001978;
            color: #e5e8f1;
          }
          .lexon-clasification-list-searcher {
            width: 0;
            transition: all 0.5s ease;
            display: inline-block;
            height: 45px;
            background-color: #e5e8f1;
            -webkit-border-radius: 50px 0 0 50px;
            border-radius: 50px 0 0 50px;
            line-height: 35px;
            float: right;
            overflow: hidden;
          }
          .lexon-clasification-list-searcher.opened {
            width: 317px;
          }
          .lexon-clasification-list-searcher label {
            float: left;
            font-size: 20px;
            margin: 8px 10px 0 10px;
            line-height: inherit;
          }
          .lexon-clasification-list-searcher input {
            float: left;
            width: 235px;
            background-color: transparent;
            border: none;
            color: #001978;
            font-weight: bold;
            margin-top: 5px;
          }
          .lexon-clasification-list-searcher a {
            float: right;
            font-size: 12px;
            color: #001978;
            font-weight: bold !important;
            display: inline-block;
            width: 25px;
            height: 25px;
            padding: 5px 7px;
            transition: background-color 0.5ms;
            border-radius: 50%;
            line-height: 18px;
            margin: 9px 5px;
          }
          .lexon-clasification-list-searcher a:hover {
            background-color: #001978;
            color: #e5e8f1;
          }
          .lexon-clasification-list-container table {
            width: 99%;
            margin: 5px;
          }
          .lexon-clasification-list-container table thead {
            border-bottom: 1px solid #001978;
            color: #001978;
            font-size: 13px;
            font-weight: bold;
          }
          .lexon-clasification-list-container table tbody {
            height: 340px;
            display: block;
            width: 99%;
            margin: 5px;
          }
          .lexon-clasification-list-container table tbody tr {
            border-bottom: 1px solid #d2d2d2;
          }

          .lexon-clasification-list-container tr {
            display: table;
            width: 100%;
            box-sizing: border-box;
          }
          .lexon-clasification-list-container table th,
          .lexon-clasification-list-container table td {
            padding: 12px;
          }
          .lexon-clasification-list-container table tr th:nth-child(1),
          .lexon-clasification-list-container table tr td:nth-child(1) {
            width: 25%;
          }
          .lexon-clasification-list-container table tr th:nth-child(2),
          .lexon-clasification-list-container table tr td:nth-child(2) {
            width: 25%;
          }
          .lexon-clasification-list-container table tr th:nth-child(3),
          .lexon-clasification-list-container table tr td:nth-child(3) {
            width: 50%;
          }
          .lexon-clasification-list-container table td span {
            display: inline-block;
            width: 25px;
            height: 25px;
            padding: 6px;
            transition: background-color 0.3ms;
            border-radius: 50%;
            margin-right: 5px;
          }
          .lexon-clasification-list-container table tr.selected td span {
            color: #001978;
          }
          .lexon-clasification-list-container table tr.selected td span {
            background-color: #001978;
            color: #e5e8f1;
          }
          .lexon-clasification-list-container table tbody tr.selected,
          .lexon-clasification-list-container table tbody tr:hover {
            background-color: #e5e8f1;
            cursor: pointer;
            color: #001978;
          }

          @media (max-width: 374px) {
            .modal-footer {
              justify-content: space-between !important;
            }
          }

          @media (max-width: 767px) {
            .modal .modal-dialog .modal-content .modal-header:not(.infoModal) {
              padding: 1rem;
            }
            .modal-body {
              padding: 1rem;
            }
          }

          @media (min-width: 768px) {
            .modal-footer,
            .modal-body {
              padding: 1rem 50px;
            }
          }

          @media (max-height: 570px) {
            .modal-dialog {
              margin-top: 3.5rem;
            }
          }

          @media (min-width: 992px) {
            .modal-lg,
            .modal-xl {
              max-width: 900px;
            }
          }
        `}</style>
      </div>
    );
  }
}

export default connector(ModalArchiveDocuments);

const extensionsAllowed = [
  'JPG',
  'PNG',
  'GIF',
  'BMP',
  'DIB',
  'JPEG',
  'TGA',
  'TIF',
  'TIFF',
  'PCX',
  'PIC',
  'EMF',
  'ICO',
  'TXT',
  'MDB',
  'WRI',
  'LOG',
  'XPS',
  'HTM',
  'HTML',
  'CSS',
  'URL',
  'XML',
  'AVI',
  'FLV',
  'MP4',
  'MKV',
  'MOV',
  'MPEG',
  'MPG',
  'DIVX',
  'WMV',
  'RAR',
  'ZIP',
  '7Z',
  'PDF',
  'DOC',
  'XLS',
  'PPT',
  'DOC',
  'XLS',
  'PPT',
  'EML',
  'WAV',
  'MP3',
  'DOCX',
  'DOCM',
  'DOT',
  'DOTX',
  'DOTM',
  'ODT',
  'RTF',
  'XLSX',
  'XLM',
  'XLSM',
  'XLT',
  'XLTX',
  'XLTM',
  'XLSB',
  'XLAM',
  'XLV',
  'CSV',
  'ODS',
  'PPTX',
  'PPTM',
  'POT',
  'POTX',
  'POTM',
  'PPA',
  'PPAM',
  'PPS',
  'PPSX',
  'PPSM',
  'SLDX',
  'SLDM',
  'THMX',
  'ODP'
];
