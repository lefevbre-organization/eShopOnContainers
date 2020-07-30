import React, { Component, Fragment } from 'react';
import i18n from 'i18next';
import { Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import { downloadFile } from '../../services/services-lexon';
import queryString from 'query-string';
import { AttachDocumentsStep1 } from '../modal-attach-documents/step1';
import { AttachDocumentsStep1b } from '../modal-attach-documents/step1b';
import { AttachDocumentsStep2 } from '../modal-attach-documents/step2';
import { AttachDocumentsStep3 } from '../modal-attach-documents/step3';
import { AttachDocumentsStep4 } from '../modal-attach-documents/step4';
import { AttachDocumentsStep5 } from '../modal-attach-documents/step5';
import ACTIONS from '../../actions/documentsAction';
import 'react-perfect-scrollbar/dist/css/styles.css';
import Spinner from '../spinner/spinner';

class AddonAttachDocuments extends Component {
  constructor() {
    super();

    this.state = {
      showSpinner: false,
      complete: false,
      search: '',
      step: 1,
      entity: 0,
      step2Data: {
        id: -1,
        idType: -1,
      },
      step3Data: {
        selected: -1,
      },
      messages: [],
      files: [],
    };

    this.onSelectedFiles = this.onSelectedFiles.bind(this);
    this.changeStep1Data = this.changeStep1Data.bind(this);
    this.downloadComplete = this.downloadComplete.bind(this);
    this.step5Ref = React.createRef();
    this.step1Ref = React.createRef();
  }

  componentDidMount() {
    this.setState({ messages: this.props.selectedMessages });
  }

  componentDidUpdate(prevProps) {}

  downloadComplete() {
    this.setState({ downloading: false, complete: true });
  }

  goBackAddon() {
    const values = queryString.parse(window.location.search);
    let redirect_uri = values.redirect_uri;
    window.location.replace(
      `${redirect_uri}` + '?success=1' 
      + '&state=' 
      + values.state
    );
  }


  closeLexonConnector() {
    const values = queryString.parse(window.location.search);
    let redirect_uri = values.redirect_uri;
    const files = [];
    this.state.files.forEach(file => {
      files.push({
        idRelated: file.idRelated, 
        code: file.code
      });
    });
 
    window.location.replace(
      `${redirect_uri}` + '?response_type=' 
      + values.response_type 
      + '&state=' + values.state 
      + '&files=' + JSON.stringify(files)
    );
  }

  nextStep() {
    const { step } = this.state;
    if (step === 1 || step === 11) {
      this.setState({ step: 2 });
    } else if (step === 3) {
      this.setState({ step: 5 });
    } else {
      this.setState({ step: step + 1 });
    }
  }

  prevStep() {
    const { step, entity, search } = this.state;
    if (step === 2 || step === 11) {
      if (step === 2 && entity !== 1) {
        this.setState({ step: 11 });
      } else {
        this.setState({ step: 1 });
      }
      this.setState({ step2Data: { ...this.state.step2Data, id: -1 } });
    } else if (step === 3) {
      this.setState({ step: 2 });
    } else if (step === 4) {
      this.setState({ step: 1 });
    } else if (step === 5) {
      if (search.trim() === '') {
        this.setState({ step: 3 });
      } else {
        this.setState({ step: 4 });
      }
    }
  }

  changeStep1Data(entity) {
    if (this.state.entity !== entity) {
      this.setState({ entity, search: '' });
    }
  }

  changeStep2Data(data) {
    this.setState({ step2Data: { ...data } });
  }

  changeStep3Data(data) {
    this.setState({ step3Data: data });
  }

  saveDisabled() {
    if (this.state.step === 11) {
      return false;
    }
    if (this.state.step2Data.idType !== -1 && this.state.step2Data.id !== -1) {
      return false;
    }

    return true;
  }

  save3Disabled() {
    const { files } = this.state;
    return files.length === 0;
  }

  onSelectedFiles(fileSelected) {
    const { files } = this.state;
    let nf = [];

    if (fileSelected.checked === true) {
      nf = [
        ...files.filter((f) => f.idRelated !== fileSelected.idRelated),
        fileSelected,
      ];
    } else {
      nf = [...files.filter((f) => f.idRelated !== fileSelected.idRelated)];
    }

    this.setState({ files: nf });
  }

  renderButtons() {
    const { step, complete, files } = this.state;

    switch (step) {
      case 1:
        return <Fragment></Fragment>;
      case 11:
      case 2:
        return (
          <Fragment>
            <Button
              bsPrefix='btn btn-outline-primary'
              onClick={() => {
                this.goBackAddon();
              }}>
              {i18n.t('classify-emails.cancel')}
            </Button>
            <Button
              bsPrefix='btn btn-outline-primary'
              onClick={() => {
                this.prevStep();
              }}>
              {i18n.t('classify-emails.back')}
            </Button>
            <Button
              disabled={this.saveDisabled()}
              bsPrefix='btn btn-primary'
              onClick={() => {
                this.nextStep();
              }}>
              {i18n.t('classify-emails.continue')}
            </Button>
          </Fragment>
        );
      case 3:
        return (
          <Fragment>
            <Button
              bsPrefix='btn btn-outline-primary'
              onClick={() => {
                this.goBackAddon();
              }}>
              {i18n.t('classify-emails.cancel')}
            </Button>
            <Button
              bsPrefix='btn btn-outline-primary'
              onClick={() => {
                this.prevStep();
              }}>
              {i18n.t('classify-emails.back')}
            </Button>
            <Button
              disabled={this.save3Disabled()}
              bsPrefix='btn btn-primary'
              onClick={() => {
                this.nextStep();
              }}>
              {i18n.t('classify-emails.continue')}
            </Button>
          </Fragment>
        );
      case 4:
        return (
          <Fragment>
            <Button
              bsPrefix='btn btn-outline-primary'
              onClick={() => {
                this.goBackAddon();
              }}>
              {i18n.t('classify-emails.cancel')}
            </Button>
            <Button
              bsPrefix='btn btn-outline-primary'
              onClick={() => {
                this.prevStep();
              }}>
              {i18n.t('classify-emails.back')}
            </Button>
            <Button
              disabled={files.length === 0}
              bsPrefix='btn btn-primary'
              onClick={() => {
                this.nextStep();
              }}>
              {i18n.t('classify-emails.continue')}
            </Button>
          </Fragment>
        );
      case 5:
        return (
          <Fragment>
            {complete === true && (
              <Button
                disabled={this.state.downloading === true}
                bsPrefix='btn btn-primary'
                onClick={() => {
                  this.closeLexonConnector();
                }}>
                {i18n.t('classify-emails.close')}
              </Button>
            )}
            {complete === false && (
              <Fragment>
                <Button
                  disabled={this.state.downloading === true}
                  bsPrefix='btn btn-outline-primary'
                  onClick={() => {
                    this.goBackAddon();
                  }}>
                  {i18n.t('classify-emails.cancel')}
                </Button>
                <Button
                  disabled={this.state.downloading === true}
                  bsPrefix='btn btn-outline-primary'
                  onClick={() => {
                    this.prevStep();
                  }}>
                  {i18n.t('classify-emails.back')}
                </Button>
                <Button
                  disabled={this.state.downloading === true}
                  bsPrefix='btn btn-primary'
                  onClick={() => {
                    this.setState({ downloading: true }, () => {
                      this.step5Ref.current.StartDownload();
                    });
                  }}>
                  {i18n.t('classify-emails.attach')}
                </Button>
              </Fragment>
            )}
          </Fragment>
        );
      default:
        return null;
    }
  }

  render() {
    const {
      user,
      bbddAddon,
      addonData,
      companySelected,
      showAttachDocuments,
      toggleNotification,
    } = this.props;

    const { showSpinner, step, search } = this.state;
    console.log('addonData -->',addonData);
    return (
      <div className='modal-connection-emails'>
        <header className='addon-header'>
          <h5
            className='title d-flex align-items-center'
            id='documentarGuardardocumentacionLabel'>
            <img
              className='imgproduct'
              border='0'
              alt='Lex-On'
              src={`${window.URL_MF_LEXON_BASE}/assets/img/icon-lexon.svg`}></img>
            <span className="title-space">{i18n.t('modal-attach-documents.title')}</span>
            {/* <span>{this.state.step}</span> */}
          </h5>
         </header>
          <div className="addon-container">
            {showSpinner === true && <Spinner />}
            {showSpinner === false && (
              <Fragment>
                <div
                  style={{
                    display: this.state.step === 1 ? 'block' : 'none',
                  }}>
                  <AttachDocumentsStep1
                    ref={this.step1Ref}
                    show={this.state.step === 1}
                    onClickSearch={(search) => {
                      this.setState({ step: 4, search, entity: 14 });
                    }}
                    onClickCasefiles={() => {
                      this.setState({ entity: 1, step: 2, search: '' });
                    }}
                    onClickContacts={() => {
                      this.setState({ entity: 2, step: 11, search: '' });
                    }}></AttachDocumentsStep1>
                </div>
                <div
                  style={{
                    display: this.state.step === 11 ? 'block' : 'none',
                  }}>
                  <AttachDocumentsStep1b
                    show={this.state.step === 1}
                    onChange={this.changeStep1Data}></AttachDocumentsStep1b>
                </div>
                <div
                  style={{
                    display: this.state.step === 2 ? 'block' : 'none',
                  }}>
                  <AttachDocumentsStep2
                    show={this.state.step === 2}
                    user={user}
                    bbdd={bbddAddon}
                    entity={this.state.entity}
                    toggleNotification={toggleNotification}
                    onSelectedEntity={(data) =>
                      this.changeStep2Data(data)
                    }></AttachDocumentsStep2>
                </div>
                <div
                  style={{
                    display: this.state.step === 3 ? 'block' : 'none',
                  }}>
                  <AttachDocumentsStep3
                    show={this.state.step === 3}
                    user={user}
                    bbdd={bbddAddon}
                    entity={this.state.step2Data}
                    toggleNotification={toggleNotification}
                    onChange={this.onSelectedFiles}
                    onSelectedDirectory={(data) => {}}></AttachDocumentsStep3>
                </div>
                <div
                  style={{
                    display: this.state.step === 4 ? 'block' : 'none',
                  }}>
                  <AttachDocumentsStep4
                    show={this.state.step === 4}
                    user={user}
                    bbdd={bbddAddon}
                    files={this.state.files}
                    search={this.state.search}
                    onSearchChange={(search) => {
                      this.setState({ search }, () => {
                        this.step1Ref.current.setSearch(this.state.search);
                      });
                    }}
                    entity={this.state.entity}
                    toggleNotification={toggleNotification}
                    onChange={this.onSelectedFiles}></AttachDocumentsStep4>
                </div>
                <div
                  style={{
                    display: this.state.step === 5 ? 'block' : 'none',
                  }}>
                  <AttachDocumentsStep5
                    user={user}
                    bbdd={bbddAddon}
                    addonData={addonData}
                    ref={this.step5Ref}
                    show={this.state.step === 5}
                    files={this.state.files}
                    downloadComplete={
                      this.downloadComplete
                    }></AttachDocumentsStep5>
                </div>
              </Fragment>
            )}
          </div>
    
          <div>{this.renderButtons()}</div>

        <style jsx global>{`
         #lexon-app .e-checkbox-wrapper .e-frame.e-check,
          .e-checkbox-wrapper .e-checkbox:focus + .e-frame.e-check,
          .e-checkbox-wrapper:hover .e-frame.e-check {
            background-color: #001978;
          }

          #lexon-app .e-checkbox-wrapper:hover .e-frame.e-check, 
          #lexon-app .e-css.e-checkbox-wrapper:hover 
          .e-frame.e-check {
            background-color: #001978;
          }

          #lexon-app .e-checkbox-wrapper .e-checkbox:focus+.e-frame.e-check, 
          #lexon-app .e-css.e-checkbox-wrapper 
          .e-checkbox:focus+.e-frame.e-check {
            background-color: #001978;
          }

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
              width: 24px;
              height: 24px;
              cursor: pointer;
          }
          
          .addon-header .title {
            margin-left: 20px;
            font-size: 22px;
            margin-top: 12px;
          }

          .title-space {
            margin-left: 20px;
          }

          .two-columns {
            list-style: none;
            width: 78%;
           }

          .add-more {
            cursor: pointer;
           }

          .panel-right-top {
             padding-top: 10px;
           }

           .e-content {
             height: 350px !important;
           }

          #lexon-app .e-checkbox-wrapper .e-check,
          .e-css.e-checkbox-wrapper .e-check {
            font-size: 16px;
          }

          #lexon-app .e-checkbox-wrapper .e-frame {
            width: 25px;
            height: 25px;
            line-height: 16px;
          }

          #lexon-app .e-checkbox-wrapper .e-frame + .e-label {
            height: 13px;
            color: #001978;
            font-family: MTTMilano-Medium;
            font-size: 16px !important;
            font-weight: 500;
            line-height: 16px;
          }

          #lexon-app .e-checkbox-wrapper .e-frame,
          .e-css.e-checkbox-wrapper:hover .e-frame,
          .e-checkbox-wrapper:hover .e-frame,
          .e-css.e-checkbox-wrapper:hover .e-frame {
            border-color: #001978;
          }

          #lexon-app .e-radio:checked + .e-success::after {
            /* csslint allow: adjoining-classes */
            background-color: #001978;
            border-color: #001978;
          }

          #lexon-app ol > li:before {
            padding-top: 4px;
          }

          #lexon-app .e-radio:checked + label::before,
          .e-radio:checked:focus + label::before,
          .e-radio:checked + .e-success::before,
          .e-radio:checked:focus + .e-success::before,
          .e-radio:checked + .e-success:hover::before,
          .e-radio + .e-success:hover::before,
          .e-radio:checked + label:hover::before {
            border-color: #001978;
          }

          #lexon-app  .e-radio:checked + label::after {
            color: #001978;
          }

          #lexon-app .e-radio:checked:focus + label::after,
          .e-radio:checked + label:hover::after,
          .e-radio:checked + label:hover::before {
            background-color: #001978 !important;
          }

          #lexon-app .e-radio:checked:focus+label:before {
            border-color: #001978;
          }

          #lexon-app .e-radio:checked:focus + .e-success::after,
          .e-radio:checked + .e-success:hover::after {
            background-color: #001978;
            border-color: #001978;
          }

          #lexon-app .e-radio + label .e-label {
            height: 15px;
            color: #001978;
            font-family: MTTMilano-Medium, Lato, Arial, sans-serif;
            font-size: 16px;
            font-weight: 500;
          }

          #lexon-app .e-radio:checked+label:after {
            background-color: #001978;
            color: #001978;
         }

         #lexon-app .e-radio:checked+label:hover:before {
            border-color: #001978;
         }

          #lexon-app input[type='radio'] + label:before {
            width: 24px;
            height: 24px;
          }

          #lexon-app input[type='radio']:checked + label:after {
            width: 14px;
            height: 14px;
          }

          #lexon-app .e-radio + label .e-label {
            margin-left: 10px;
          }

          #lexon-app .e-radio-wrapper {
            display: inline-block;
            line-height: 2;
          }

          #lexon-app .container p {
            color: #001978;
          }

          #lexon-app .btn-secundary {
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

          #lexon-app .btn-secundary:focus {
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

       
          #lexon-app .btn-primary {
            margin-left: 10px;
            background-color: #001978 !important;
            border-color: #001978 !important;
          }

          #lexon-app .form-group .requerido {
            color: #d81f2a;
            font-size: 20px;
            text-align: start;
          }

          #lexon-app .lexon-select-like-custom-trigger {
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
          #lexon-app .lexon-select-like-custom-trigger:focus {
            outline: none;
          }
          #lexon-app .lexon-select-like-custom-trigger span {
            font-size: 20px;
            position: absolute;
            top: 10px;
            right: 10px;
            color: #001978;
            transition: all 0.5s ease;
          }
          #lexon-app .lexon-select-like-custom-trigger.opened span {
            -moz-transform: rotate(180deg);
            -webkit-transform: rotate(180deg);
            -o-transform: rotate(180deg);
            -ms-transform: rotate(180deg);
            transform: rotate(180deg);
          }
          #lexon-app .lexon-select-like-custom-list-container {
            transition: all 0.5s ease;
            height: 0;
            width: 350px;
            position: absolute;
            z-index: 2;
            overflow: hidden;
          }
          #lexon-app .lexon-select-like-custom-list-container.opened {
            height: 230px;
            overflow: visible;
          }
          #lexon-app .lexon-select-like-custom-list {
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
          #lexon-app .lexon-select-like-custom-list li {
            border-bottom: solid 1px #001978;
            height: 43px;
            color: #7c868c;
            font-size: 15px;
            line-height: 43px;
            padding: 0 10px;
            margin: 0 2px;
          }
          #lexon-app .lexon-select-like-custom-list li:last-child {
            border-bottom: none;
          }
          #lexon-app .lexon-select-like-custom-list li span {
            color: #7c868c;
          }
          #lexon-app .lexon-select-like-custom-list li.selected,
          .lexon-select-like-custom-list li:hover {
            background-color: #e5e8f1;
            color: #001978;
            cursor: pointer;
          }
          #lexon-app .lexon-select-like-custom-list li.selected span,
          .lexon-select-like-custom-list li:hover span {
            color: #001978;
          }

          #lexon-app .lexon-clasification-list-container {
            border: 1px solid #d2d2d2;
            position: relative;
            z-index: 1;
          }
          #lexon-app .lexon-clasification-list-container label {
            line-height: 45px;
          }
          #lexon-app .lexon-clasification-list-search {
            position: absolute;
            top: 0;
            right: -1px;
            display: inline-block;
          }
          #lexon-app .lexon-clasification-list-search .lexon-clasification-list-results {
            position: relative;
            height: 45px;
            width: 190px;
            float: left;
            padding-top: 5px;
          }
          #lexon-app .lexon-clasification-list-search p {
            color: #001978;
            font-size: 10px;
            display: inline-block;
            padding: 5px 10px;
            margin-bottom: 0;
          }
          #lexon-app .lexon-clasification-list-search p strong {
            font-size: 13px;
          }
          #lexon-app .lexon-clasification-list-search a.search-trigger-show {
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
          #lexon-app .lexon-clasification-list-search a.search-trigger:hover {
            background-color: #001978;
            color: #e5e8f1;
          }
          #lexon-app .lexon-clasification-list-searcher {
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
          #lexon-app .lexon-clasification-list-searcher.opened {
            width: 317px;
          }
          #lexon-app .lexon-clasification-list-searcher label {
            float: left;
            font-size: 20px;
            margin: 8px 10px 0 10px;
            line-height: inherit;
          }
          #lexon-app .lexon-clasification-list-searcher input {
            float: left;
            width: 235px;
            background-color: transparent;
            border: none;
            color: #001978;
            font-weight: bold;
            margin-top: 5px;
          }
          #lexon-app .lexon-clasification-list-searcher a {
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
          #lexon-app .lexon-clasification-list-searcher a:hover {
            background-color: #001978;
            color: #e5e8f1;
          }
          #lexon-app .lexon-clasification-list-container table {
            width: 99%;
            margin: 5px;
          }
          #lexon-app .lexon-clasification-list-container table thead {
            border-bottom: 1px solid #001978;
            color: #001978;
            font-size: 13px;
            font-weight: bold;
          }
          #lexon-app .lexon-clasification-list-container table tbody {
            height: 340px;
            display: block;
            width: 99%;
            margin: 5px;
          }
          #lexon-app .lexon-clasification-list-container table tbody tr {
            border-bottom: 1px solid #d2d2d2;
          }

          #lexon-app .lexon-clasification-list-container tr {
            display: table;
            width: 100%;
            box-sizing: border-box;
          }
          #lexon-app .lexon-clasification-list-container table th,
          .lexon-clasification-list-container table td {
            padding: 12px;
          }
          #lexon-app .lexon-clasification-list-container table tr th:nth-child(1),
          .lexon-clasification-list-container table tr td:nth-child(1) {
            width: 25%;
          }
          #lexon-app .lexon-clasification-list-container table tr th:nth-child(2),
          .lexon-clasification-list-container table tr td:nth-child(2) {
            width: 25%;
          }
          #lexon-app .lexon-clasification-list-container table tr th:nth-child(3),
          .lexon-clasification-list-container table tr td:nth-child(3) {
            width: 50%;
          }
          #lexon-app .lexon-clasification-list-container table td span {
            display: inline-block;
            width: 25px;
            height: 25px;
            padding: 6px;
            transition: background-color 0.3ms;
            border-radius: 50%;
            margin-right: 5px;
          }
          #lexon-app .lexon-clasification-list-container table tr.selected td span {
            color: #001978;
          }
          #lexon-app .lexon-clasification-list-container table tr.selected td span {
            background-color: #001978;
            color: #e5e8f1;
          }
          #lexon-app .lexon-clasification-list-container table tbody tr.selected,
          .lexon-clasification-list-container table tbody tr:hover {
            background-color: #e5e8f1;
            cursor: pointer;
            color: #001978;
          }
          .lx-progress-label-percent {
            line-height: 22px;
          }
        `}</style>
      </div>
    );
  }
}

AddonAttachDocuments.propTypes = {};

const mapStateToProps = (state) => {
  return {
    showAttachDocuments: state.documentsReducer.showAttachDocuments,
    companySelected: state.selections.companySelected,
    selectedMessages: state.email.selectedMessages,
  };
};

const mapDispatchToProps = (dispatch) => ({
  toggleModalAttachDocuments: () =>
    dispatch(ACTIONS.toggleModalAttachDocuments()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AddonAttachDocuments);
