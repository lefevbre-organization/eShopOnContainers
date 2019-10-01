import React, { Component } from "react";
import { Button, Modal, Container, Col, Row } from "react-bootstrap";
import i18n from "i18next";
import "./classify-emails.css";
import ClassificationType from "./classification-type/classification-type";

class ClassifyEmails extends Component {
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
    const { initialModalState, toggleClassifyEmails, email } = this.props;

    return (
      <div>
        <Modal
          show={initialModalState}
          onHide={toggleClassifyEmails}
          size="lg"
          aria-labelledby="contained-modal-title-vcenter"
          centered
          dialogClassName="modal"
        >
          <Modal.Header className="align-items-center" closeButton>
            <Modal.Title>
              <div className="modal-title h4">
                <h5
                  className="modal-title d-flex align-items-center"
                  id="clasificarNuevaclasificacionLabel"
                >
                  <span className="lf-icon-bookmarks"></span>
                  {i18n.t("classify-emails.title")}
                </h5>
              </div>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Container>
              <p>
                <strong>{i18n.t("classify-emails.body")}</strong>
              </p>
              <ClassificationType />
            </Container>
          </Modal.Body>
          <Modal.Footer>
            <Button
              className="btn-primary"
              onClick={() => toggleClassifyEmails(false, email)}
            >
              {i18n.t("classify-emails.cancel")}
            </Button>
            <Button
              className="btn-secondary"
              onClick={() => toggleClassifyEmails(true, email)}
            >
              {i18n.t("classify-emails.save")}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

ClassifyEmails.propTypes = {};

export default ClassifyEmails;
