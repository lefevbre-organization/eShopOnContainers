import React, { Component, Fragment, createRef } from 'react';
import i18n from 'i18next';
import { Button, Container } from 'react-bootstrap';
import { connect, ConnectedProps } from 'react-redux';
import 'react-perfect-scrollbar/dist/css/styles.css';
import { AppState } from '../../../store/store';
import { bindActionCreators } from 'redux';
import queryString from 'query-string';
import { ApplicationActions } from '../../../store/application/actions';
import { Step1 } from '../modal-attach-document/step1';
import { Step2 } from '../modal-attach-document/step2';
import { Step3 } from '../modal-attach-document/step3';
import { Step4 } from '../modal-attach-document/step4';
import { Step5 } from '../modal-attach-document/step5';
import {
  Evaluation,
  CentInstance,
  Document
} from '../../../services/services-centinela';
const parse = require('emailjs-mime-parser').default;
const base64js = require('base64-js');

const mapStateToProps = (state: AppState) => {
  return {
    showAttachDocuments: state.application.showAttachModal,
    selected: state.messages.selected,
    user: state.application.user
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    ...bindActionCreators(
      {
        toggleAttachModal: ApplicationActions.toggleAttachModal
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
  downloading: boolean;
  copyEmail: boolean;
  copyAttachments: boolean;
  instance?: CentInstance;
}

class AddonAttachDocuments extends Component<Props, State> {
  private lastStep:any = [];
  private step5Ref: any = null;
  private step3Ref: any;

  constructor(props: Props) {
    super(props);
    this.step3Ref = createRef();

    this.state = {
      complete: false,
      implantation: null,
      downloading: false,
      search: '',
      step: 1,
      entity: 0,
      messages: [],
      files: [],
      copyEmail: true,
      copyAttachments: true,
      instance: undefined
    };

    this.onInstanceSelected = this.onInstanceSelected.bind(this);
    this.onImplantation = this.onImplantation.bind(this);
    this.onDocumentSelected = this.onDocumentSelected.bind(this);
    this.downloadComplete = this.downloadComplete.bind(this);

    this.step5Ref = React.createRef();
  }

  componentDidMount() {
    console.log("ModalAttachDocuments: componentDidMount");

    this.initMessages();
  }

  componentDidUpdate(prevProps: Props) {
    console.log("ModalAttachDocuments: componentDidUpdate");

    if (prevProps.selected !== this.props.selected) {
      this.initMessages();
    }
  }

  downloadComplete() {
    this.setState({ downloading: false, complete: true });
  }

  initMessages() {
    const { selected } = this.props;
    const messages = [];

    // Parsing messages
    for (let i = 0; i < selected.length; i++) {
      const attchs = this.parseMessage(selected[i]);
      const nm = Object.assign({}, selected[i], { attachments: attchs });
      messages.push(nm);
    }

    this.setState({ messages });
  }

  parseMessage(message: any) {
    const attachments = [];
    if (message.raw) {
      let mime = null;
      try {
        //console.log(message.raw)
        mime = parse(message.raw);
      } catch (err) {
        console.log(err);
      }

      if (mime) {
        for (let j = 0; j < mime.childNodes.length; j++) {
          if (
            mime.childNodes[j].raw.indexOf('Content-Disposition: attachment;') >
            -1
          ) {
            const rawAttach = base64js.fromByteArray(
              mime.childNodes[j].content
            );
            const name = mime.childNodes[j].contentType.params.name;
            attachments.push({ name, checked: true });
          }
        }
      }
    }

    return attachments;
  }

  goBackAddon() {
    const values = queryString.parse((window as any).location.search);
    let redirect_uri = values.redirect_uri;
    (window as any).location.replace(
      `${redirect_uri}` + '?success=1'
      + '&state='
      + values.state
    );
  }

  closeCentinelaConnector() {
    const values = queryString.parse((window as any).location.search);
    let redirect_uri = values.redirect_uri;
    const files: any = [];
    this.state.files.forEach((file: any) => {
      files.push({
        documentId: file.documentObjectId,
        name: file.name
      });
    });

    (window as any).location.replace(
      `${redirect_uri}` + '?response_type='
      + values.response_type
      + '&state=' + values.state
      + '&files=' + JSON.stringify(files)
    );
  }

  nextStep() {
    const { step } = this.state;
    this.lastStep.push(step);
    if (step === 1) {
      this.setState({ step: 2 });
    } else if (step === 2) {
      this.setState({ step: 3 });
    } else if (step === 3) {
      this.setState({ step: 4 });
    } else if (step === 4) {
      this.setState({ step: 5 });
    }
  }

  prevStep() {
    const { step } = this.state;
    const ls = this.lastStep.pop();

    if (step === 2) {
      this.setState({ step: 1, instance: undefined });
    } else if (step === 3) {
      if (this.step3Ref.current.back() === true) {
        this.setState({ step: ls, instance: undefined });
      } else {
        if(this.lastStep[this.lastStep.lenngth -1] !== ls) {
          this.lastStep.push(ls);
        }
        this.setState({ instance: undefined });
      }
    } else if (step === 4) {
      this.setState({ step: ls, files: [], instance: undefined });
    } else if (step === 5) {
      this.setState({ step: ls, instance: undefined });
    }
  }

  saveDocuments() {
    const { toggleNotification } = this.props;
    toggleNotification(i18n.t('modal-attach.modal-save-ok'));
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
        return null;
      case 2:
        return (
          <Fragment>
            <Button
              bsPrefix="btn btn-outline-primary"
              onClick={() => {
                this.goBackAddon();
              }}
            >
              {i18n.t('modal-attach.cancel')}
            </Button>
            <Button
              bsPrefix="btn btn-outline-primary"
              onClick={() => {
                this.prevStep();
              }}
            >
              {i18n.t('modal-attach.back')}
            </Button>
            <Button
              disabled={this.saveDisabled()}
              bsPrefix="btn btn-primary"
              onClick={() => {
                this.nextStep();
              }}
            >
              {i18n.t('modal-attach.continue')}
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
              {i18n.t('modal-attach.cancel')}
            </Button>
            <Button
              bsPrefix="btn btn-outline-primary"
              onClick={() => {
                this.prevStep();
              }}
            >
              {i18n.t('modal-attach.back')}
            </Button>
            <Button
              disabled={this.saveDisabled()}
              bsPrefix="btn btn-primary"
              onClick={() => {
                this.nextStep();
              }}
            >
              {i18n.t('modal-attach.continue')}
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
              {i18n.t('modal-attach.cancel')}
            </Button>
            <Button
              bsPrefix="btn btn-outline-primary"
              onClick={() => {
                this.prevStep();
              }}
            >
              {i18n.t('modal-attach.back')}
            </Button>
            <Button
              disabled={files.length === 0}
              bsPrefix="btn btn-primary"
              onClick={() => {
                this.nextStep();
              }}
            >
              {i18n.t('modal-attach.continue')}
            </Button>
          </Fragment>
        );
      case 5:
        return (
          <Fragment>
            {complete === true && (
              <Button
                disabled={this.state.downloading === true}
                bsPrefix="btn btn-primary"
                onClick={() => {
                  this.closeCentinelaConnector();
                }}
              >
                {i18n.t('modal-attach.close')}
              </Button>
            )}
            {complete === false && (
              <>
                <Button
                  bsPrefix="btn btn-outline-primary"
                  disabled={this.state.downloading === true}
                  onClick={() => {
                    this.goBackAddon();
                  }}
                >
                  {i18n.t('modal-attach.cancel')}
                </Button>
                <Button
                  disabled={this.state.downloading === true}
                  bsPrefix="btn btn-outline-primary"
                  onClick={() => {
                    this.prevStep();
                  }}
                >
                  {i18n.t('modal-attach.back')}
                </Button>
                <Button
                  disabled={files.length === 0}
                  bsPrefix="btn btn-primary"
                  onClick={() => {
                    this.setState({ downloading: true }, () => {
                      this.step5Ref.current.StartDownload();
                    });
                  }}
                >
                  {i18n.t('modal-attach.attach')}
                </Button>
              </>
            )}
          </Fragment>
        );
      default:
        return null;
    }
  }

  onInstanceSelected(inst: CentInstance) {
    this.setState({ instance: inst });
  }

  onImplantation(imp: Evaluation) {
    const { implantation } = this.state;
    if (implantation?.evaluationId !== imp.evaluationId) {
      this.setState({ implantation: imp });
    }
  }

  onDocumentSelected({ data, checked }: any) {
    const { files } = this.state;

    if (checked === true) {
      this.setState({ files: [...files, data] });
    } else {
      const nf = files.filter(
        (f: Document) => f.documentObjectId !== data.documentObjectId
      );

      this.setState({ files: nf });
    }
  }

  render() {
    const { user, showAttachDocuments } = this.props;
    const { step, implantation, search, files, instance } = this.state;
    console.log(this.props.addonData);
    return (
      <div className="modal-connection-emails">

        <header className="addon-header">
          <h5
            className="title d-flex align-items-center"
            id="documentarGuardardocumentacionLabel"
          >
            <img
              className='imgproduct'
              alt='Centinela'
              style={{width:24, height:24}}
              src={`${(window as any).URL_MF_CENTINELA_BASE}/assets/img/icon-centinela.svg`}></img>
            <span className="title-space">
              {i18n.t('modal-attach.title')}
            </span>
          </h5>
        </header>
            <Container>
              <Fragment>
                <div
                  style={{
                    display: step === 1 ? 'block' : 'none'
                  }}
                >
                  <Step1
                    onClickSearch={(search: string) => {
                      this.lastStep = [1];
                      this.setState({ step: 4, search, instance: undefined });
                    }}
                    onClickExploreImplantations={() => {
                      this.lastStep = [1];
                      this.setState({
                        entity: 1,
                        step: 2,
                        search: '',
                        instance: undefined
                      });
                    }}
                  />
                </div>
                <div
                  style={{
                    display: step === 2 ? 'block' : 'none'
                  }}
                >
                  <Step2
                    user={user}
                    show={step === 2}
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
                    step={step}
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
                  <Step4
                    files={files}
                    user={user}
                    show={step === 4}
                    step={step}
                    instance={instance}
                    search={search}
                    onSearchChange={() => {}}
                    onChange={this.onDocumentSelected}
                  />
                </div>
                <div
                  style={{
                    display: this.state.step === 5 ? 'block' : 'none'
                  }}
                >
                  <Step5
                    ref={this.step5Ref}
                    files={files}
                    user={user}
                    show={step === 5}
                    downloadComplete={this.downloadComplete}
                  />
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

          .e-headercelldiv,
          .e-grid .e-gridheader .e-sortfilter .e-headercelldiv {
            text-overflow: unset !important;
          }
          .e-checkbox-wrapper .e-frame.e-check,
          .e-checkbox-wrapper .e-checkbox:focus + .e-frame.e-check,
          .e-checkbox-wrapper:hover .e-frame.e-check {
            background-color: #001978;
          }

          .btn-primary:hover {
            color: white;
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

          .container p {
            color: #001978;
          }

          .container {
            max-width: none !important;
            text-align: left;
            padding-top: 21px;
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

          strong {
            font-weight: 500;
            font-family: MTTMilano-Medium, Lato, Arial, sans-serif;
          }

          table {
            color: #7c868c;
          }

          .btn-primary {
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
          .btn-primary:disabled {
            background-color: #001978 !important;
            border-color: #001978 !important;
            color: white !important;
          }
          ol > li.index-3::before {
            display: none;
          }
          .step2-container {
            margin: 25px;
            padding-top: 1px;
          }
          .fpdropdown-body ul {
            list-style: none;
          }
          .e-content {
            height: 317px !important;
          }

          .step3-container .substep0 .e-content {
            height: 411px !important;
          }
          ol > li.index-4::before {
            display: none;
          }
          .step3-container {
            margin: 22px;
            padding-top: 1px;
          }
        `}</style>
      </div>
    );
  }
}

export default connector(AddonAttachDocuments);
