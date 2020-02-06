import React, { Component } from "react";
import { Button, Modal } from "react-bootstrap";
import i18n from "i18next";

import "./ConfirmRemoveAccout.css";

class ConfirmRemoveAccount extends Component {
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
    const { initialModalState, toggleConfirmRemoveAccount, email, provider } = this.props;

    return (
      <div>
        <Modal
          show={initialModalState}
          onHide={toggleConfirmRemoveAccount}
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
                    id="clasificarEliminarclasificacionLabel"
                  >
                    <img
                      className="img-question"
                      alt=""
                      src="/assets/imgs/icon-question.png"
                    ></img>
                    {i18n.t("confirm-remove-accounts.body")}
                  </h5>
                </div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              className="btn-primary"
              onClick={() => toggleConfirmRemoveAccount(false, email, provider)}
            >
              {i18n.t("confirm-remove-accounts.no")}
            </Button>
            <Button
              className="btn-secondary"
              onClick={() => toggleConfirmRemoveAccount(true, email, provider)}
            >
              {i18n.t("confirm-remove-accounts.yes")}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export default ConfirmRemoveAccount;
