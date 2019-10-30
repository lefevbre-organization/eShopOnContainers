import React, { Component } from "react";
import "./documents-emails.css";
import PropTypes from "prop-types";
import i18n from "i18next";
import { Button, Modal } from "react-bootstrap";
import { connect } from "react-redux";
import ACTIONS from "../../actions/documentsAction";

class DocumentsEmails extends Component {
  render() {
    const { showModalDocuments, toggleModalDocuments } = this.props;

    return (
      <div>
        <Modal
          show={showModalDocuments}
          onHide={toggleModalDocuments}
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
      </div>
    );
  }
}

DocumentsEmails.propTypes = {};

const mapStateToProps = state => {
  return {
    showModalDocuments: state.documentsReducer.showModalDocuments
  };
};

const mapDispatchToProps = dispatch => ({
  toggleModalDocuments: () => dispatch(ACTIONS.toggleModalDocuments())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DocumentsEmails);
