import React, { Component } from "react";
import "./confirmation.css";
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
        onHide={onCancel}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        dialogClassName="modal"
        animation={false}>
          <Modal.Header closeButton>
          </Modal.Header>
          <Modal.Body>
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
          <Modal.Footer>
          <Button
              className="modal-primary"
              onClick={() => {
                this.props.onCancel && this.props.onCancel();  
              }}
          >
                {i18n.t("confirmation.cancel")}
            </Button>
            <Button
              className="modal-secondary"
              onClick={() => {
                this.props.onAccept && this.props.onAccept();  
              }}
          >
                {i18n.t("confirmation.ok")}
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
