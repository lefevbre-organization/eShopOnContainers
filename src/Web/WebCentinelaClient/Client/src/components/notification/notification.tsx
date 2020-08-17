import React, { Component } from 'react';
import './notification.css';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';

interface Props {
  initialModalState: boolean;
  toggleNotification: (message?: string, error?: boolean) => void;
  message?: string;
  error?: boolean;
}

class Notification extends Component<Props> {
  render() {
    const {
      initialModalState,
      toggleNotification,
      message,
      error = false
    } = this.props;

    return (
      <Modal
        show={initialModalState}
        onHide={toggleNotification}
        size='lg'
        aria-labelledby='contained-modal-title-vcenter'
        centered
        dialogClassName={`modal notification ${error ? 'error' : ''}`}
        animation={false}>
        <Modal.Header className='align-items-center' closeButton>
          <Modal.Title>
            <div className='modal-title h4'>
              <h5
                style={{color: 'white', fontSize: 22 }}
                className='modal-title d-flex align-items-center'
                id='clasificarNuevaclasificacionLabel'>
                {error === false && <span style={{fontSize: 28, marginRight: 15}} className='lf-icon-bookmarks'></span>}
                {error === true && (
                  <span style={{ fontSize: 28, marginRight: 15 }} className='lf-icon-warning'></span>
                )}
                {message}
              </h5>
            </div>
          </Modal.Title>
        </Modal.Header>
        <style jsx>{`
          .modal.error .modal-content .modal-header {
            background-color: #c43741 !important;
          }

          .modal.error .modal-content .modal-header .close span:first-child {
            color: transparent !important;
          }

          .notification .modal-header .modal-title {
            min-height: 150px;
          }

          .notificacion .lf-icon-bookmarks,
          .notification .lf-icon-warning {
            font-size: 48px !important;
          }

          .modal-header .close {
            position: relative;
            top: -50px;
          }
        `}</style>
      </Modal>
    );
  }
}

export default Notification;
