import React, { Component } from "react";
import "./modal-documents-emails.css";
import PropTypes from "prop-types";
import i18n from "i18next";
import { Button, Modal, Container } from "react-bootstrap";
import { connect } from "react-redux";
import ACTIONS from "../../actions/documentsAction";

class ModalDocumentsEmails extends Component {
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
          <Modal.Header className="align-items-center" closeButton>
            <h5
              class="modal-title d-flex align-items-center"
              id="documentarGuardardocumentacionLabel"
            >
              <span class="lf-icon-documentation"></span>
              Guardar copia en Documentación
            </h5>
          </Modal.Header>
          <Modal.Body>
            <Container>
              <p>
                <strong>Documentos</strong>
              </p>
            </Container>
          </Modal.Body>
          <Modal.Footer>
            <Button
              bsPrefix="btn btn-outline-primary"
              onClick={() => this._handleOnClick(false)}
            >
              {i18n.t("classify-emails.cancel")}
            </Button>
            <Button
              bsPrefix="btn btn-primary"
              onClick={() => this._handleOnClick(true)}
            >
              {i18n.t("classify-emails.save")}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

ModalDocumentsEmails.propTypes = {};

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
)(ModalDocumentsEmails);
