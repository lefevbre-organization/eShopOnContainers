import React, { Component, Fragment } from "react";
import "./notification.css";
import PropTypes from "prop-types";
import { Modal } from "react-bootstrap";

export class Notification extends Component {
  render() {
    const { initialModalState, toggleNotification, message } = this.props;

    return (
      <Fragment>
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
                style={{color: '#ffffff', fontSize: '20px'}}
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
      <style jsx>{`
        h5 {
          color: #ffffff !important;
          font-size: 20px !important;
        }

        .modal-header .close:before {
          content: "\\E938";
          color: #fff;
          font-family: 'lf-font' !important;
          speak: none;
          font-style: normal;
          font-weight: normal;
          font-feature-settings: normal;
          font-variant: normal;
          text-transform: none;
          line-height: 1;
          -webkit-font-smoothing: antialiased;
        }

        .modal-header .close span:first-child:before {
         display: none;
        }

        .ok-button {
          margin-right: 0 !important;
      }
      `}</style>
      </Fragment>
    );
  }
}

Notification.propTypes = {
  initialModalState: PropTypes.bool.isRequired,
  toggleNotification: PropTypes.func.isRequired,
  message: PropTypes.string
};
