import React, { Component } from "react";
import "./notification.css";
import PropTypes from "prop-types";
import { Modal } from "react-bootstrap";

class Notification extends Component {
  render() {
    const { initialModalState, toggleNotification, message } = this.props;

    return (
      <Modal
        show={initialModalState}
        onHide={toggleNotification}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        dialogClassName="modal"
        animation={false}
      >
        <Modal.Header className="align-items-center" closeButton>
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
      </Modal>
    );
  }
}

Notification.propTypes = {
  initialModalState: PropTypes.bool.isRequired,
  toggleNotification: PropTypes.func.isRequired,
  message: PropTypes.string
};

export default Notification;
