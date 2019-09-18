import React, { Component } from "react";
import { Button, Modal, Container, Col, Row } from "react-bootstrap";
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
    const { initialModalState, toggleConfirmRemoveAccount, email } = this.props;

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
            <Container>
              <Row>
                <Col xs={2} md={2}>
                  <img
                    className='img-question'
                    alt=""
                    src="/assets/imgs/icon-question.png"
                  ></img>
                </Col>
                <Col xs={10} md={10}>
                  {i18n.t("confirm-remove-accounts.body")}
                </Col>
              </Row>
            </Container>
          </Modal.Body>
          <Modal.Footer>
            <Button className='btn-primary' onClick={() => toggleConfirmRemoveAccount(false, email)}>
              {i18n.t("confirm-remove-accounts.no")}
            </Button>
            <Button className='btn-secondary' onClick={() => toggleConfirmRemoveAccount(true, email)}>
              {i18n.t("confirm-remove-accounts.yes")}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export default ConfirmRemoveAccount;
