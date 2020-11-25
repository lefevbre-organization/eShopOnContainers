import React, {Component, createRef, Fragment} from 'react';
import i18n from 'i18next';
import { Button, Modal } from 'react-bootstrap';
import { connect } from 'react-redux';

import { Step1 } from './step1';
import { Step2 } from './step2';
import { Step3 } from './step3';
import { Step4 } from './step4';
import ACTIONS from '../../actions/documentsAction';
import 'react-perfect-scrollbar/dist/css/styles.css';
import Spinner from '../spinner/spinner';

class ModalImportEvents extends Component {
  constructor() {
    super();

    this.state = {
      showSpinner: false,
      progress: -1,
      step: 0,
      contacts: [],
      errors: [],
      numContacts: 0
    };

    this.progresRef = createRef();

    this.setLoading = this.setLoading.bind(this);
    this.setProgress = this.setProgress.bind(this);
    this.onContacts = this.onContacts.bind(this);
    this.showErrors = this.showErrors.bind(this);
    this.uploadCompleted = this.uploadCompleted.bind(this);
  }

  componentDidMount() {
    this.setState({step: 1})
  }

  showErrors() {
    this.setState({step: 3});
  }

  closeDialog() {
    if(this.state.step === 2) {
      this.setState({step: 1})
      return;
    }
    this.props.toggleImportContacts && this.props.toggleImportContacts();
  }

  nextStep() {}

  prevStep() {}

  setLoading(loading) {
    this.setState({ showSpinner: loading });
  }

  setProgress(progress) {
    this.setState({ progress });
  }

  onContacts(contacts, errors) {
    this.setState({contacts: [...contacts], errors: [...errors], numContacts: contacts.length });
  }

  uploadCompleted() {
    if(this.state.errors.length > 0) {
      this.setState({step: 4})
    } else {
      this.setState({ step: 1}, ()=>{
        this.closeDialog();
        this.props.toggleNotification(i18n.t('modal-import-contacts.ok'), false);
      });
    }
  }

  renderButtons() {
    const { step } = this.state;
    return (
      <Fragment>
        {step < 3 &&
        <Button
          bsPrefix='btn btn-outline-primary'
          onClick={() => {
            this.setState({ step: 1 }, ()=>{
              this.closeDialog();
            });
          }}>
          {i18n.t('classify-emails.cancel')}
        </Button> }
        {step === 1 && <Button
            disabled={this.state.showSpinner === true}
            bsPrefix='btn btn-primary'
          onClick={() => {
            this.setState({ step: 2 });
          }}>
          {i18n.t('modal-import-contacts.import')}
        </Button> }
        {step === 3 && <Button
            disabled={this.state.showSpinner === true}
            bsPrefix='btn btn-primary'
            onClick={() => {
              this.setState({ step: 1 });
            }}>
          {i18n.t('modal-import-contacts.back')}
        </Button> }
        {step === 4 && <Button
            disabled={this.state.showSpinner === true}
            bsPrefix='btn btn-primary'
            onClick={() => {
              this.setState({ step: 1 }, ()=>{
                this.closeDialog();
              });
            }}>
          {i18n.t('modal-import-contacts.accept')}
        </Button> }
      </Fragment>
    );
  }

  render() {
    const { showSpinner, step, contacts, errors, numContacts } = this.state;
    const { showImportContacts, user, bbdd } = this.props;

    return (
      <div className='modal-import-contacts'>
        <Modal
          show={showImportContacts}
          onHide={() => {
            this.closeDialog();
          }}
          size='lg'
          aria-labelledby='contained-modal-title-vcenter'
          centered
          dialogClassName='modal'>
          <Modal.Header className='align-items-center' closeButton>
            <h5
              className='d-flex align-items-center modal-title'
              id='documentarGuardardocumentacionLabel'>
              <img
                className='imgproduct'
                border='0'
                alt='Lex-On'
                src={`${window.URL_MF_LEXON_BASE}/assets/img/icon-lexon.svg`}></img>
                <span>{i18n.t('modal-import-contacts.title')}</span>
            </h5>
          </Modal.Header>
          <Modal.Body className='mimodal'>
            <div>{showSpinner === true && <Spinner />}</div>
            <div style={{opacity: showSpinner?0:1}}>
              <div>
                { step !== 4 && <h2 className='modal-subtitle'>{i18n.t('modal-import-contacts.info')}</h2> }
                { step === 4 && <h2 className='modal-subtitle'>{i18n.t('modal-import-contacts.info-result')}</h2> }
              </div>
              {step === 1 && <Step1 onLoading={this.setLoading} onContacts={this.onContacts} onShowErrors={this.showErrors} user={user} bbdd={bbdd}/>}
              {step === 2 && <Step2 onSetProgress={this.setProgress} contacts={contacts} onUploadCompleted={this.uploadCompleted}/>}
              {step === 3 && <Step3 errors={errors}/>}
              {step===4 && <Step4 errors={errors} valids={numContacts}></Step4>}
            </div>
          </Modal.Body>
          <Modal.Footer>{this.renderButtons()}</Modal.Footer>
        </Modal>

        <style jsx global>{`
          .modal-open .modal {
          overflow-y: auto;
          }
        
          .e-checkbox-wrapper .e-frame.e-check,
          .e-checkbox-wrapper .e-checkbox:focus + .e-frame.e-check,
          .e-checkbox-wrapper:hover .e-frame.e-check {
            background-color: #001978;
          }

          .modal-subtitle {
            margin-top: 20px;
            text-align: center;
            width: 100%;
            height: 14px;
            color: #7f8cbb;
            font-family: MTTMilano-Medium;
            font-size: 18px;
            font-weight: 500;
            letter-spacing: 0;
            line-height: 24px;
          }

          

          .modal-footer .btn-primary:hover {
            color: white;
          }

          .modal-header h5 span {
            font-family: MTTMilano-Medium;
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
            font-size: 16px !important;
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

ModalImportEvents.propTypes = {};
const mapStateToProps = (state) => {
  return {
    showImportContacts: state.documentsReducer.showImportContacts,
    companySelected: state.selections.companySelected,
    selectedMessages: state.email.selectedMessages,
    bbdd: state.selections.companySelected.bbdd,
    user: state.selections.user
  };
};

const mapDispatchToProps = (dispatch) => ({
  toggleImportContacts: () => dispatch(ACTIONS.toggleModalImportContacts()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ModalImportEvents);
