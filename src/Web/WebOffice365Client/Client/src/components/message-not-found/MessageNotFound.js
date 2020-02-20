import React, { Component } from "react";
import { Button, Modal } from "react-bootstrap";
import i18n from "i18next";

import "./MessageNotFound.css";

class MessageNotFound extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modal: props.initialModalState
    };
  }

  toggle() {
    this.setState({
      modal: !this.state.modal
    });
  }

  render() {
    const { initialModalState, toggleShowMessageNotFound } = this.props;

    return (
      <div>
        <Modal
          show={initialModalState}
          onHide={toggleShowMessageNotFound}
          size="lg"
          aria-labelledby="contained-modal-title-vcenter"
          centered
        >
          <Modal.Header closeButton>
            {/* <Modal.Title>Modal heading</Modal.Title> */}
          </Modal.Header>
          <Modal.Body>
            <div className="container-fluid content">
              <div className="row d-flex justify-content-center">
                <div className="col col-12">
                  <h5
                    className="modal-title d-flex align-items-center"
                    id="messageNotFound"
                  >
                    <img
                      className="img-warning"
                      alt=""
                      src="/assets/img/icon-warning.png"
                    ></img>
                    {i18n.t("message-not-found.body")}
                  </h5>
                </div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            {/* <Button
              className="btn-primary"
              onClick={() => toggleShowMessageNotFound(false)}
            >
              {i18n.t("message-not-found.ok")}
            </Button> */}
            {/* <Button
              className="btn-secondary"
              onClick={() => toggleShowMessageNotFound()}
            >
              {i18n.t("message-not-found.ok")}
            </Button> */}
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export default MessageNotFound;
