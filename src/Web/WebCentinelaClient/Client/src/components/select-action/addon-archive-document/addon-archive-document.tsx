import React, { Component, Fragment, createRef } from 'react';
import i18n from 'i18next';
import { Base64 } from 'js-base64';
import { Button, Container } from 'react-bootstrap';
import { connect, ConnectedProps } from 'react-redux';
import 'react-perfect-scrollbar/dist/css/styles.css';
import { AppState } from '../../../store/store';
import { bindActionCreators } from 'redux';
import { ApplicationActions } from '../../../store/application/actions';
import queryString from 'query-string';
import Spinner from '../../spinner/spinner';
import { Step1 } from '../modal-archive-document/step1';
import { Step2 } from '../modal-archive-document/step2';
import { Step3 } from '../modal-archive-document/step3';
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
  addonData: any;
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
  isLoading: boolean;
}

class AddonArchiveDocuments extends Component<Props, State> {
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
      instance: undefined,
      isLoading: false
    };

    this.onCopyAttachments = this.onCopyAttachments.bind(this);
    this.onCopyEmail = this.onCopyEmail.bind(this);
    this.onImplantation = this.onImplantation.bind(this);
    this.onInstanceSelected = this.onInstanceSelected.bind(this);
    this.onChangeSelected = this.onChangeSelected.bind(this);
  }

  componentDidMount() {
    this.initMessages();
  }

  componentDidUpdate(prevProps: Props) {

  }

  initMessages() {
    const { selected, addonData } = this.props;
    const messages = [];
    let attachments: any = [];
    // Parsing messages
    for (let i = 0; i < addonData.selectedMessages.length; i++) {
      const selected = addonData.selectedMessages[i];
      const attchs: any = this.parseMessage(selected);
      attachments = [...attachments, ...attchs];
      const nm = Object.assign({}, selected, { attachments: attchs });
      messages.push(nm);
    }

    this.setState({messages, attachments});
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

  goBackAddon() {
    const values = queryString.parse(window.location.search);
    let redirect_uri = values.redirect_uri
      ? values.redirect_uri
      : (window as any).GOOGLE_SCRIPT_CENTINELA;
    window.location.replace(
      `${redirect_uri}` + '?success=1' + '&state=' + values.state
    );
  }

  nextStep() {
    const { step } = this.state;
    if (step === 1) {
      const selected = this.state.attachments.filter((m: any) => m.checked);
      this.setState({ step: 2, copyAttachments: selected.length > 0 });
    } else if (step === 2) {
      this.setState({ step: 3 });
    } else if (step === 3) {
      this.setState({isLoading: true});
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
    this.setState({isLoading: false});
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
                this.goBackAddon();
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
                this.goBackAddon();
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
                this.goBackAddon();
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
                this.goBackAddon();
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
    const { 
      messages, 
      step, 
      implantation, 
      copyAttachments, 
      isLoading 
    } = this.state;
    let attachments = false;
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      if (msg.attachments && msg.attachments.length > 0) {
        attachments = true;
        break;
      }
    }
    return (
      <div className="">
          <header className="addon-header">
            <h5
              className="title d-flex align-items-center"
              id="documentarGuardardocumentacionLabel"
            >
              <img
                className='imgproduct'
                alt='Centinela'
                src={`${(window as any).URL_MF_CENTINELA_BASE}/assets/img/icon-centinela.svg`}></img>

              <span className="title-space">{i18n.t('modal-archive.title')}</span>
            </h5>
          </header>
          {isLoading && (
           <div className='spinner-wrapper'>
            <Spinner />
           </div>
           )}
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
          <div>{this.renderButtons()}</div>

        <style jsx>{`
          .addon-header {
            height: 48px;
            width: 100%;
            background-color: #001978;
            position: absolute;
            top: 1px;
            color: #fff;
            font-size: 22px;
            border-radius: 0;
          }

          .imgproduct {
            height: 29px;
          }

          .addon-header .title {
            margin-left: 20px;
            font-size: 22px;
            margin-top: 12px;
          }

          .title-space {
            margin-left: 20px;
          }

          .list-checks {
            list-style: none;
          }

          .step2-container {
            margin: 25px;
            padding-top: 1px;
          }

          .step3-container {
            margin: 35px;
            padding-top: 10px;
          }

          .fpdropdown-body ul { 
            list-style: none;
            text-align: left;
          }

          .breadcrumbs {
            text-align: left;
          }

          .e-content {
            height: 317px !important;
          }

          .step3-container .substep0 .e-content {
            height: 411px !important;
          }

          #centinela-app .e-checkbox-wrapper .e-frame.e-check,
          .e-checkbox-wrapper .e-checkbox:focus + .e-frame.e-check,
          .e-checkbox-wrapper:hover .e-frame.e-check {
            background-color: #001978;
          }

          #centinela-app .btn-primary {
            margin-left: 10px;
            background-color: #001978 !important;
            border-color: #001978 !important;
          }

          #centinela-app .btn-primary:hover {
            color: white;
          }

          #centinela-app h5 span {
            font-size: 22px !important;
            margin-left: 15px;
          }

          #centinela-app .e-checkbox-wrapper .e-check,
          .e-css.e-checkbox-wrapper .e-check {
            font-size: 16px;
          }

          #centinela-app .e-checkbox-wrapper .e-frame {
            width: 25px;
            height: 25px;
            line-height: 16px;
          }

          #centinela-app .e-checkbox-wrapper .e-frame + .e-label {
            height: 13px;
            color: #001978;
            font-family: MTTMilano-Medium;
            font-size: 16px;
            font-weight: 500;
            line-height: 16px;
          }

          #centinela-app .e-checkbox-wrapper .e-frame,
          .e-css.e-checkbox-wrapper:hover .e-frame,
          .e-checkbox-wrapper:hover .e-frame,
          .e-css.e-checkbox-wrapper:hover .e-frame {
            border-color: #001978;
          }

          #centinela-app .e-radio:checked + .e-success::after {
            /* csslint allow: adjoining-classes */
            background-color: #001978;
            border-color: #001978;
          }

          #centinela-app ol > li:before {
            padding-top: 4px;
          }

          #centinela-app .e-radio:checked + label::before,
          .e-radio:checked:focus + label::before,
          .e-radio:checked + .e-success::before,
          .e-radio:checked:focus + .e-success::before,
          .e-radio:checked + .e-success:hover::before,
          .e-radio + .e-success:hover::before,
          .e-radio:checked + label:hover::before {
            border-color: #001978;
          }

          #centinela-app .e-radio:checked + label::after {
            color: #001978;
          }

          #centinela-app .e-radio:checked:focus + label::after,
          .e-radio:checked + label:hover::after,
          .e-radio:checked + label:hover::before {
            background-color: #001978 !important;
          }

          #centinela-app .e-radio:checked:focus + .e-success::after,
          .e-radio:checked + .e-success:hover::after {
            background-color: #001978;
            border-color: #001978;
          }

          #centinela-app .e-radio + label .e-label {
            height: 15px;
            color: #001978;
            font-family: MTTMilano-Medium, Lato, Arial, sans-serif;
            font-size: 16px;
            font-weight: 500;
          }

          #centinela-app input[type='radio'] + label:before {
            width: 24px;
            height: 24px;
          }

          #centinela-app input[type='radio']:checked + label:after {
            width: 18px;
            height: 18px;
          }

          #centinela-app .e-radio + label .e-label {
            margin-left: 10px;
            padding: 0;
          }

          #centinela-app .e-radio-wrapper {
            display: inline-block;
            line-height: 2;
          }

          #centinela-app .container {
            max-width: none !important;
            padding-top: 18px;
          }

          #centinela-app .container p {
            color: #001978;
          }

          #centinela-app .btn-secundary {
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

          #centinela-app .btn-secundary:focus {
            background-color: #001978 !important;
            border: 2px solid #001978 !important;
            color: #ffff !important;
          }

          #centinela-app .btn-outline-primary:focus {
            border-color: #001978 !important;
          }

          #centinela-app strong {
            font-weight: 500;
            font-family: MTTMilano-Medium, Lato, Arial, sans-serif;
          }

          #centinela-app table {
            color: #7c868c;
          }

          #centinela-app  h5 span {
            font-size: 28px;
            margin-right: 15px;
          }
          
          #centinela-app .form-group .requerido {
            color: #d81f2a;
            font-size: 20px;
            text-align: start;
          }

          #centinela-app .lexon-select-like-custom-trigger {
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
          #centinela-app .lexon-select-like-custom-trigger:focus {
            outline: none;
          }
          #centinela-app .lexon-select-like-custom-trigger span {
            font-size: 20px;
            position: absolute;
            top: 10px;
            right: 10px;
            color: #001978;
            transition: all 0.5s ease;
          }
          #centinela-app .lexon-select-like-custom-trigger.opened span {
            -moz-transform: rotate(180deg);
            -webkit-transform: rotate(180deg);
            -o-transform: rotate(180deg);
            -ms-transform: rotate(180deg);
            transform: rotate(180deg);
          }
          #centinela-app .lexon-select-like-custom-list-container {
            transition: all 0.5s ease;
            height: 0;
            width: 350px;
            position: absolute;
            z-index: 2;
            overflow: hidden;
          }
          #centinela-app .lexon-select-like-custom-list-container.opened {
            height: 230px;
            overflow: visible;
          }
          #centinela-app .lexon-select-like-custom-list {
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
          #centinela-app .lexon-select-like-custom-list li {
            border-bottom: solid 1px #001978;
            height: 43px;
            color: #7c868c;
            font-size: 15px;
            line-height: 43px;
            padding: 0 10px;
            margin: 0 2px;
          }
          #centinela-app .lexon-select-like-custom-list li:last-child {
            border-bottom: none;
          }
          #centinela-app .lexon-select-like-custom-list li span {
            color: #7c868c;
          }
          #centinela-app .lexon-select-like-custom-list li.selected,
          .lexon-select-like-custom-list li:hover {
            background-color: #e5e8f1;
            color: #001978;
            cursor: pointer;
          }
          #centinela-app .lexon-select-like-custom-list li.selected span,
          .lexon-select-like-custom-list li:hover span {
            color: #001978;
          }

          #centinela-app .lexon-clasification-list-container {
            border: 1px solid #d2d2d2;
            position: relative;
            z-index: 1;
          }
          #centinela-app .lexon-clasification-list-container label {
            line-height: 45px;
          }
          #centinela-app .lexon-clasification-list-search {
            position: absolute;
            top: 0;
            right: -1px;
            display: inline-block;
          }
          #centinela-app .lexon-clasification-list-search .lexon-clasification-list-results {
            position: relative;
            height: 45px;
            width: 190px;
            float: left;
            padding-top: 5px;
          }
          #centinela-app .lexon-clasification-list-search p {
            color: #001978;
            font-size: 10px;
            display: inline-block;
            padding: 5px 10px;
            margin-bottom: 0;
          }
          #centinela-app .lexon-clasification-list-search p strong {
            font-size: 13px;
          }
          #centinela-app .lexon-clasification-list-search a.search-trigger-show {
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
          #centinela-app .lexon-clasification-list-search a.search-trigger:hover {
            background-color: #001978;
            color: #e5e8f1;
          }
          #centinela-app .lexon-clasification-list-searcher {
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
          #centinela-app .lexon-clasification-list-searcher.opened {
            width: 317px;
          }
          #centinela-app .lexon-clasification-list-searcher label {
            float: left;
            font-size: 20px;
            margin: 8px 10px 0 10px;
            line-height: inherit;
          }
          #centinela-app .lexon-clasification-list-searcher input {
            float: left;
            width: 235px;
            background-color: transparent;
            border: none;
            color: #001978;
            font-weight: bold;
            margin-top: 5px;
          }
          #centinela-app .lexon-clasification-list-searcher a {
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
          #centinela-app .lexon-clasification-list-searcher a:hover {
            background-color: #001978;
            color: #e5e8f1;
          }
          #centinela-app .lexon-clasification-list-container table {
            width: 99%;
            margin: 5px;
          }
          #centinela-app .lexon-clasification-list-container table thead {
            border-bottom: 1px solid #001978;
            color: #001978;
            font-size: 13px;
            font-weight: bold;
          }
          #centinela-app .lexon-clasification-list-container table tbody {
            height: 340px;
            display: block;
            width: 99%;
            margin: 5px;
          }
          #centinela-app .lexon-clasification-list-container table tbody tr {
            border-bottom: 1px solid #d2d2d2;
          }

          #centinela-app .lexon-clasification-list-container tr {
            display: table;
            width: 100%;
            box-sizing: border-box;
          }
          #centinela-app .lexon-clasification-list-container table th,
          .lexon-clasification-list-container table td {
            padding: 12px;
          }
          #centinela-app .lexon-clasification-list-container table tr th:nth-child(1),
          .lexon-clasification-list-container table tr td:nth-child(1) {
            width: 25%;
          }
          #centinela-app .lexon-clasification-list-container table tr th:nth-child(2),
          .lexon-clasification-list-container table tr td:nth-child(2) {
            width: 25%;
          }
          #centinela-app .lexon-clasification-list-container table tr th:nth-child(3),
          .lexon-clasification-list-container table tr td:nth-child(3) {
            width: 50%;
          }
          #centinela-app .lexon-clasification-list-container table td span {
            display: inline-block;
            width: 25px;
            height: 25px;
            padding: 6px;
            transition: background-color 0.3ms;
            border-radius: 50%;
            margin-right: 5px;
          }
          #centinela-app .lexon-clasification-list-container table tr.selected td span {
            color: #001978;
          }
          #centinela-app .lexon-clasification-list-container table tr.selected td span {
            background-color: #001978;
            color: #e5e8f1;
          }
          #centinela-app .lexon-clasification-list-container table tbody tr.selected,
          .lexon-clasification-list-container table tbody tr:hover {
            background-color: #e5e8f1;
            cursor: pointer;
            color: #001978;
          }
          .e-grid .e-rowcell {
            text-align: left;
          }
          .attachments {
            list-style: none;
          }
          
        `}</style>
      </div>
    );
  }
}

export default connector(AddonArchiveDocuments);

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
