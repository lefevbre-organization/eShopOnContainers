import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import i18n from "i18next";
import { Button, Modal, Container } from "react-bootstrap";
import { connect } from "react-redux";
import { Base64 } from 'js-base64';
import { ConnectingEmailsStep1 } from './step1';
import { ConnectingEmailsStep2 } from './step2';
import { ConnectingEmailsStep3 } from './step3';
import { ConnectingEmailsStep4 } from './step4';
import { addClassification, uploadFile } from '../../services/services-lexon';
import ACTIONS from "../../actions/documentsAction";
import "react-perfect-scrollbar/dist/css/styles.css";

class ModalConnectingEmails extends Component {
  constructor() {
    super();

    this.state = {
      step: 1,
      step1Data: {
        actuation: false,
        copyDocuments: true,
        saveDocuments: false,
        entity: 0
      },
      step2Data: {
        id: -1,
        idType: -1
      },
      step3Data: {
        selected: -1
      },
      messages: []
    }

    this.changeSubject = this.changeSubject.bind(this)
  }

  componentDidMount() {
    this.setState({ messages: this.props.selectedMessages })
  }

  componentDidUpdate(prevProps) {
    if (JSON.stringify(prevProps.selectedMessages) !== JSON.stringify(this.props.selectedMessages)) {
      this.setState({ messages: this.props.selectedMessages })
    }
  }

  closeDialog() {
    setTimeout(() => {
      this.setState({
        step: 1,
        step1Data: {
          entity: 1,
          actuation: false,
          copyDocuments: false,
          saveDocuments: false
        },
        step2Data: {
          id: -1,
          idType: -1
        },
        step3Data: {
          selected: -1
        }
      })
    }, 1000)
    this.props.toggleModalDocuments && this.props.toggleModalDocuments();
  }

  nextStep() {
    if (this.state.step === 1) {
      this.setState({ step: 2 })
    } else if (this.state.step === 2) {
      if (this.state.step1Data.copyDocuments === false && this.state.step1Data.saveDocuments === false) {
        this.setState({ step: 4 })
      } else {
        this.setState({ step: 3 })
      }
    } else if (this.state.step === 3) {
      this.setState({ step: 4 });
    }
  }

  prevStep() {
    if (this.state.step === 2) {
      this.setState({ step: 1 })
    } else if (this.state.step === 3) {
      this.setState({ step: 2 })
    } else if (this.state.step === 4) {
      if (this.state.step1Data.copyDocuments === false && this.state.step1Data.saveDocuments === false) {
        this.setState({ step: 2 })
      } else {
        this.setState({ step: 3 })
      }
    }
  }

  changeStep1Data(data) {
    let step2Data = this.state.step2Data;
    if (this.state.step1Data.entity !== data.entity) {
      step2Data = {
        id: -1,
        idType: -1
      }
    }

    this.setState({ step1Data: data, step2Data })
  }

  changeStep2Data(data) {
    this.setState({ step2Data: { ...data } })
  }

  changeStep3Data(data) {
    this.setState({ step3Data: data })
  }

  changeSubject(id, subject) {
    const { messages } = this.state;
    for (let i = 0; i < messages.length; i++) {
      if (messages[i].id === id) {
        messages[i].subject = subject
      }
    }
  }


  saveDisabled() {
    if (this.state.step2Data.idType !== -1 && this.state.step2Data.id !== -1) {
      return false;
    }

    return true;
  }

  save3Disabled() {
    if (this.state.step3Data.selected !== -1) {
      return false;
    }

    return true;
  }

  onSave() {
    console.log("onSave")
    if (this.state.step === 2) {
      this.onSaveStep2()
    } else if (this.state.step === 4) {
      this.onSaveStep3()
    }
  }

  onSaveStep2() {
    const { step1Data, step2Data } = this.state;
    const {
      toggleNotification
    } = this.props;

    if (step2Data.id === -1 || step2Data.idType === -1) {
      toggleNotification(
        i18n.t("classify-emails.classification-selection-ko")
      );
      return;
    }

    if (step1Data.copyDocuments === false && step1Data.saveDocuments === false) {
      this.closeDialog();
      this.saveClassification();
    } else {
      this.nextStep();
    }
  }

  async onSaveStep3() {
    const { step1Data, step2Data, step3Data } = this.state;
    const { selectedMessages } = this.props;
    this.closeDialog()

    if (step1Data.actuation === true) {
      const sc = this.saveClassification();
    }

    if (step1Data.copyDocuments === true) {
      // Save email as eml format
      for (let i = 0; i < selectedMessages.length; i++) {
        const raw = Base64.encode(selectedMessages[i].raw)
        const subject = selectedMessages[i].subject
        const upl = await uploadFile(step3Data.selected, step2Data.id, step2Data.idType, this.props.companySelected.bbdd, this.props.user.idUser, subject + ".eml", raw)
      }
    } if (step1Data.saveDocuments === true) {
      // Save attachments
    }
  }

  saveClassification() {
    const { step1Data, step2Data } = this.state;
    const {
      user,
      companySelected,
      selectedMessages,
      toggleNotification
    } = this.props;

    addClassification(
      user,
      companySelected,
      selectedMessages,
      step2Data.id,
      step2Data.idType
    )
      .then(() => {
        if (selectedMessages.length === 1) {
          this.props.updateClassifications && this.props.updateClassifications(selectedMessages[0].id);
        }
        toggleNotification(i18n.t("classify-emails.classification-saved-ok"));
      })
      .catch(error => {
        toggleNotification(i18n.t("classify-emails.classification-saved-ko"), true);
      });
  }

  renderButtons() {
    const { step } = this.state;

    switch (step) {
      case 1:
        return <Fragment>
          <Button
            bsPrefix="btn btn-outline-primary"
            onClick={() => { this.closeDialog() }}>
            {i18n.t("classify-emails.cancel")}
          </Button>
          <Button
            bsPrefix="btn btn-primary"
            onClick={() => { this.nextStep() }}>
            {i18n.t("classify-emails.continue")}
          </Button>
        </Fragment>
      case 2:
        return <Fragment>
          <Button
            bsPrefix="btn btn-outline-primary"
            onClick={() => { this.closeDialog() }}>
            {i18n.t("classify-emails.cancel")}
          </Button>
          <Button
            bsPrefix="btn btn-outline-primary"
            onClick={() => { this.prevStep() }}>
            {i18n.t("classify-emails.back")}
          </Button>
          <Button
            disabled={this.saveDisabled()}
            bsPrefix="btn btn-primary"
            onClick={() => { this.nextStep() }} >
            {i18n.t("classify-emails.continue")}
          </Button>
        </Fragment>
      case 3:
        return <Fragment>
          <Button
            bsPrefix="btn btn-outline-primary"
            onClick={() => { this.closeDialog() }}>
            {i18n.t("classify-emails.cancel")}
          </Button>
          <Button
            bsPrefix="btn btn-outline-primary"
            onClick={() => { this.prevStep() }}>
            {i18n.t("classify-emails.back")}
          </Button>
          <Button
            disabled={this.save3Disabled()}
            bsPrefix="btn btn-primary"
            onClick={() => { this.nextStep() }} >
            {i18n.t("classify-emails.continue")}
          </Button>
        </Fragment>
      case 4:
        return <Fragment>
          <Button
            bsPrefix="btn btn-outline-primary"
            onClick={() => { this.closeDialog() }}>
            {i18n.t("classify-emails.cancel")}
          </Button>
          <Button
            bsPrefix="btn btn-outline-primary"
            onClick={() => { this.prevStep() }}>
            {i18n.t("classify-emails.back")}
          </Button>
          <Button
            bsPrefix="btn btn-primary"
            onClick={() => { this.onSave() }} >
            {i18n.t("classify-emails.save")}
          </Button>
        </Fragment>
    }
  }

  render() {
    const { user, companySelected, showModalDocuments, toggleNotification } = this.props;
    const { messages, step1Data } = this.state;

    return (
      <div className="modal-connection-emails">
        <Modal
          show={showModalDocuments}
          onHide={() => { this.closeDialog() }}
          size="lg"
          aria-labelledby="contained-modal-title-vcenter"
          centered
          dialogClassName="modal"
        >
          <Modal.Header className="align-items-center" closeButton>
            <h5
              className="modal-title d-flex align-items-center"
              id="documentarGuardardocumentacionLabel">
              <img class="imgproduct" border="0" alt="Lex-On" src={`${window.URL_MF_LEXON_BASE}/assets/img/icon-lexon.png`}></img>
              <span>{i18n.t("modal-conecting-emails.save-copy")}</span>
            </h5>
          </Modal.Header>
          <Modal.Body className="mimodal">
            <Container>
              <div style={{ display: this.state.step === 1 ? 'block' : 'none' }}><ConnectingEmailsStep1 show={this.state.step === 1} onChange={(data) => { this.changeStep1Data(data) }}></ConnectingEmailsStep1></div>
              <div style={{ display: this.state.step === 2 ? 'block' : 'none' }}><ConnectingEmailsStep2 show={this.state.step === 2} user={user} bbdd={companySelected} entity={this.state.step1Data.entity} toggleNotification={toggleNotification} onSelectedEntity={(data) => this.changeStep2Data(data)}></ConnectingEmailsStep2></div>
              <div style={{ display: this.state.step === 3 ? 'block' : 'none' }}><ConnectingEmailsStep3 show={this.state.step === 3} user={user} bbdd={companySelected} entity={this.state.step2Data} toggleNotification={toggleNotification} onSelectedDirectory={(data) => this.changeStep3Data(data)}></ConnectingEmailsStep3></div>
              <div style={{ display: this.state.step === 4 ? 'block' : 'none' }}><ConnectingEmailsStep4 show={this.state.step === 4} step={(step1Data.copyDocuments === false && step1Data.saveDocuments === false) ? 4 : 5} messages={messages} onChange={this.changeSubject}></ConnectingEmailsStep4></div>
            </Container>
          </Modal.Body>
          <Modal.Footer>
            {this.renderButtons()}

          </Modal.Footer>
        </Modal>

        <style jsx>{`
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

        .e-checkbox-wrapper .e-check, .e-css.e-checkbox-wrapper .e-check {
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

        .e-checkbox-wrapper .e-frame, .e-css.e-checkbox-wrapper:hover .e-frame,
        .e-checkbox-wrapper:hover .e-frame, .e-css.e-checkbox-wrapper:hover .e-frame {
          border-color: #001978;	
        }

        .e-radio:checked + .e-success::after { /* csslint allow: adjoining-classes */
          background-color: #001978;
          border-color: #001978;
        }

        ol>li:before {
          padding-top: 4px;
        }

        .e-radio:checked + label::before,
        .e-radio:checked:focus + label::before,
        .e-radio:checked + .e-success::before,
        .e-radio:checked:focus + .e-success::before, .e-radio:checked + .e-success:hover::before,
        .e-radio +.e-success:hover::before,
        .e-radio:checked + label:hover::before {
          border-color: #001978;
        }

        .e-radio:checked + label::after {
          color:  #001978;
        }


        .e-radio:checked:focus + label::after,
        .e-radio:checked + label:hover::after,
        .e-radio:checked + label:hover::before {
          background-color: #001978 !important;
        }
        
        .e-radio:checked:focus + .e-success::after, .e-radio:checked + .e-success:hover::after {
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

        input[type="radio"] + label:before {
          width: 24px;
          height: 24px;
        }

        input[type="radio"]:checked + label:after {
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
              content: "\\e938";
              color: #fff;
              font-family: "lf-font" !important;
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
            
            .modal-body.info .content [class^="lf-icon"] {
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
              // background-color: #e5e8f1 !important;
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

ModalConnectingEmails.propTypes = {};

const mapStateToProps = state => {
  return {
    showModalDocuments: state.documentsReducer.showModalDocuments,
    companySelected: state.selections.companySelected,
    selectedMessages: state.email.selectedMessages
  };
};

const mapDispatchToProps = dispatch => ({
  toggleModalDocuments: () => dispatch(ACTIONS.toggleModalDocuments())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ModalConnectingEmails);


// const downloadEML = (data, filename, type) => {
//   var file = new Blob([data], { type: type });
//   if (window.navigator.msSaveOrOpenBlob) // IE10+
//     window.navigator.msSaveOrOpenBlob(file, filename);
//   else { // Others
//     var a = document.createElement("a"),
//       url = URL.createObjectURL(file);
//     a.href = url;
//     a.download = filename;
//     document.body.appendChild(a);
//     a.click();
//     setTimeout(function () {
//       document.body.removeChild(a);
//       window.URL.revokeObjectURL(url);
//     }, 0);
//   }
// }
