import React, { Component } from "react";
import Styles from "./confirmation.scss";
import i18n from "i18next";
import PropTypes from "prop-types";
import { Modal } from "react-bootstrap";
import { Button } from 'reactstrap';

export class Confirmation extends Component {
  render() {
    const { 
      initialModalState, 
      onAccept, 
      onCancel, 
      message, 
      titleAccept, 
      titleCancel 
    } = this.props;

    return (
      <Modal
        show={initialModalState}
        onAccept={onAccept}
        onCancel={onCancel}
        onHide={onCancel}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        dialogClassName="modal"
        animation={false}>
          <Modal.Header closeButton className={Styles['modal-header']}>
          </Modal.Header>
          <Modal.Body className={Styles['modal-body']}>
            <div className="container-fluid content">
              <div className="row d-flex justify-content-center">
                <div className="col col-12">
                  <h5
                    className="modal-title d-flex align-items-center"
                    id="clasificarEliminarclasificacionLabel"
                  >
                    <img
                      className="img-question"
                      alt=""
                      src="/assets/img/icon-question.png"
                    ></img>
                     {message}
                  </h5>
                </div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer className={Styles['modal-footer']}>
          <Button
              className={Styles['modal-primary']}
              onClick={() => {
                this.props.onCancel && this.props.onCancel();  
              }}
          >
                {titleCancel}
            </Button>
            <Button
              className={Styles['modal-secondary']}
              onClick={() => {
                this.props.onAccept && this.props.onAccept();  
              }}
          >
                {titleAccept}
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
