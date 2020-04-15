import React, { Component } from "react";
import "./confirm-remove-classification.css";
import PropTypes from "prop-types";
import i18n from "i18next";
import { Button, Modal } from "react-bootstrap";
import { removeClassification } from "../../services/services-lexon";
import { connect } from "react-redux";

class ConfirmRemoveClassification extends Component {
  constructor(props) {
    super(props);

    this.state = {
      modal: props.initialModalState
    };

    this._handleOnClick = this._handleOnClick.bind(this);
  }

  _handleOnClick(remove) {
    const { toggleConfirmRemoveClassification, classification } = this.props;

    toggleConfirmRemoveClassification();
    if (remove) {
      this.removeClassification(classification);
    }
  }

  removeClassification(classification) {
    const {
      user,
      companySelected,
      updateClassifications,
      toggleNotification
    } = this.props;
    const { idMail, entityIdType, idRelated } = classification;
    removeClassification(
      idMail,
      entityIdType,
      companySelected.bbdd,
      user,
      idRelated,
      companySelected.idCompany,
    )
      .then(data => {
        if (data.results >= 1) {
          toggleNotification(i18n.t("classify-emails.classification-removed-ok"));
          updateClassifications(idMail);
        }
      })
      .catch(error => {
        toggleNotification(i18n.t("classify-emails.classification-removed-ko"), true);
        console.log("error ->", error);
      });
  }

  render() {
    const { initialModalState, toggleConfirmRemoveClassification } = this.props;

    return (
      <div>
        <Modal
          show={initialModalState}
          onHide={toggleConfirmRemoveClassification}
          size="lg"
          aria-labelledby="contained-modal-title-vcenter"
          centered
          dialogClassName="modal"
        >
          <Modal.Header
            className="align-items-center"
            closeButton
          ></Modal.Header>
          <Modal.Body bsPrefix="modal-body info">
            <div className="container-fluid content">
              <div className="row d-flex justify-content-center">
                <div className="col col-12 p-0">
                  <h5
                    className="modal-title d-flex align-items-center"
                    id="clasificarEliminarclasificacionLabel"
                  >
                    <span className="lf-icon-question"></span>
                    <span className="modal-confirm-text">
                      {i18n.t(
                        "confirm-remove-classification.text-confirm-remove"
                      )}
                    </span>
                  </h5>
                </div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer bsPrefix="modal-footer info">
            <Button
              variant="outline-secondary-white"
              onClick={() => this._handleOnClick(false)}
            >
              {i18n.t("confirm-remove-classification.no")}
            </Button>
            <Button
              variant="primary-white"
              onClick={() => this._handleOnClick(true)}
            >
              {i18n.t("confirm-remove-classification.yes")}
            </Button>
          </Modal.Footer>
        </Modal>
        <style jsx>{`
          .modal-body {
            height: auto;
          }
        `}></style>
      </div>
    );
  }
}

ConfirmRemoveClassification.propTypes = {
  user: PropTypes.string.isRequired,
  initialModalState: PropTypes.bool.isRequired,
  toggleConfirmRemoveClassification: PropTypes.func.isRequired,
  classification: PropTypes.object,
  updateClassifications: PropTypes.func.isRequired,
  toggleNotification: PropTypes.func.isRequired
};

const mapStateToProps = state => {
  return {
    companySelected: state.selections.companySelected
  };
};

export default connect(mapStateToProps)(ConfirmRemoveClassification);
