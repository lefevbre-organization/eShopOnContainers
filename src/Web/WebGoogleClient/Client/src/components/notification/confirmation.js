import React, { Component } from "react";
import "./notification.css";
import i18n from "i18next";
import PropTypes from "prop-types";
import { Modal } from "react-bootstrap";
import { Button } from 'reactstrap';

export class Confirmation extends Component {
  render() {
    const { initialModalState, onAccept, onCancel, message } = this.props;

    return (
      <Modal
        show={initialModalState}
        onAccept={onAccept}
        onCancel={onCancel}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        dialogClassName="modal"
        animation={false}
      >
        <Modal.Header className="align-items-center">
          <Modal.Title>
            <div className="modal-title h4">
              <h5
                className="modal-title d-flex align-items-center"
                id="clasificarNuevaclasificacionLabel"
              >
                <span className="lf-icon-bookmarks"></span>
                {message}
              </h5>
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Footer>
        <Button
                className="mr-left font-weight-bold ok-button"
                color="primary"
                onClick={() => {
                  this.props.onAccept && this.props.onAccept();  
                }}
                title={i18n.t("confirmation.ok")}
              >
                {i18n.t("confirmation.ok")}
              </Button>
              <Button
                className="mr-left font-weight-bold btn-outline-primary"
                title={i18n.t("confirmation.cancel")}
                color="secondary"
                onClick={() => {
                  this.props.onCancel && this.props.onCancel();  
                }}
              >
                {i18n.t("confirmation.cancel")}
              </Button>

        </Modal.Footer>
      </Modal>
    );
  }
}

Confirmation.propTypes = {
  initialModalState: PropTypes.bool.isRequired,
  onAccept: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  message: PropTypes.string
};
