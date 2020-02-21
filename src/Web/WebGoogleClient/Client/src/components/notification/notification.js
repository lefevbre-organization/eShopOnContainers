import React, { Component } from "react";
import "./notification.css";
import PropTypes from "prop-types";
import { Modal } from "react-bootstrap";

export class Notification extends Component {
  render() {
    const { initialModalState, toggleNotification, message, error = false  } = this.props;

    return (
      <Modal
        show={initialModalState}
        onHide={toggleNotification}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        dialogClassName={`modal notification ${error?'error':''}`}
        animation={false}
      >
        <Modal.Header className="align-items-center" closeButton>
          <Modal.Title>
            <div className="modal-title h4">
              <h5
                className="modal-title d-flex align-items-center"
                id="clasificarNuevaclasificacionLabel"
              >
                { error === false && <span className="lf-icon-bookmarks"></span> }
                { error === true &&  <img
                      className="img-warning"
                      alt=""
                      src="/assets/img/icon-warning.png"
                    ></img>}
                {message}
              </h5>
            </div>
          </Modal.Title>
        </Modal.Header>
        <style jsx>{`
        .modal.error .modal-content .modal-header {
          background-color: #C43741 !important;
        }

        .modal.error .modal-content .modal-header .close span:first-child {
          color: transparent !important;
        }

        .notification .modal-header .modal-title {
          min-height: 150px;
        }

        .modal-header .close {
          position: absolute;
          top: 10px;
          right: 10px;
        }
        `}</style>
      </Modal>
    );
  }
}

Notification.propTypes = {
  initialModalState: PropTypes.bool.isRequired,
  toggleNotification: PropTypes.func.isRequired,
  message: PropTypes.string,
  error: PropTypes.bool
};
