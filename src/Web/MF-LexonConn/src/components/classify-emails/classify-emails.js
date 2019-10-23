import React, { Component } from "react";
import { Button, Modal, Container } from "react-bootstrap";
import i18n from "i18next";
import "./classify-emails.css";
import ClassificationType from "./classification-type/classification-type";
import ClassificationList from "./classification-list/classification-list";
import PropTypes from "prop-types";
import { getResults, addClassification } from "../../services/services-lexon";
import { connect } from "react-redux";

class ClassifyEmails extends Component {
  constructor(props) {
    super(props);

    this.state = {
      modal: props.initialModalState,
      listResultsByType: [],
      resultsSelected: [],
      type: null,
      search: "",
      forceUpdate: null
    };

    this._handleOnClick = this._handleOnClick.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      this.state.type &&
      (prevState.type !== this.state.type ||
        prevState.forceUpdate !== this.state.forceUpdate ||
        prevState.search !== this.state.search)
    ) {
      this.getListResultsByType();
    }

    if (
      prevProps.initialModalState !== this.props.initialModalState &&
      this.props.initialModalState === false
    ) {
      this.setState({ listResultsByType: [], resultsSelected: [] });
      this.showMessageInTitle();
    }
  }

  _handleOnClick(fromSave) {
    const _this = this;

    const { type, resultsSelected } = this.state;
    const {
      user,
      companySelected,
      toggleClassifyEmails,
      selectedMessages,
      toggleNotification
    } = this.props;

    toggleClassifyEmails();

    if (fromSave === true) {
      for (
        let indexSelectedMessages = 0;
        indexSelectedMessages < selectedMessages.length;
        indexSelectedMessages++
      ) {
        for (
          let indexResultsSelected = 0;
          indexResultsSelected < resultsSelected.length;
          indexResultsSelected++
        ) {
          addClassification(
            user,
            companySelected.idCompany,
            selectedMessages[indexSelectedMessages],
            resultsSelected[indexResultsSelected],
            type
          )
            .then(() => {
              if (selectedMessages.length === 1) {
                _this.updateResultsSelected(selectedMessages[0]);
              }              
              toggleNotification(i18n.t("classify-emails.classification-saved-ok"));
            })
            .catch(error => {
              toggleNotification(i18n.t("classify-emails.classification-saved-ko"));
              console.log("error ->", error);
            });
        }
      }
    }
  }

  showMessageInTitle(title) {
    if (title) {
      this.setState({ onlyHeader: true, titleInHeader: title });
    } else {
      this.setState({ onlyHeader: false, titleInHeader: "" });
    }
  }

  getListResultsByType() {
    const { type, search } = this.state;
    const { user, companySelected } = this.props;

    if (type == null) {
      return;
    }

    getResults(user, companySelected.idCompany, type, search)
      .then(result => {
        this.setState({
          listResultsByType: result.results
        });
      })
      .catch(error => {
        console.log("error ->", error);
        this.setState({
          listResultsByType: []
        });
      });
  }

  searchResultsByType(type, search) {
    if (type) {
      if (this.state.type === type) {
        const uuidv1 = require("uuid/v1");
        this.setState({
          forceUpdate: uuidv1()
        });
      } else {
        this.setState({
          type: type
        });
      }
    }

    if (search != null) {
      this.setState({
        search: search
      });
    }
  }

  updateResultsSelected(item) {
    const { resultsSelected } = { ...this.state };

    var findElement = resultsSelected.indexOf(item);
    if (findElement === -1) {
      resultsSelected.push(item);
    } else {
      resultsSelected.splice(findElement, 1);
    }

    this.setState({ resultsSelected: resultsSelected });
  }

  render() {
    const { listResultsByType, resultsSelected } = this.state;
    const { initialModalState, toggleClassifyEmails } = this.props;

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
              <ClassificationType
                searchResultsByType={(type, search) => {
                  this.searchResultsByType(type, search);
                }}
              />
              <ClassificationList
                resultsSelected={resultsSelected}
                listResultsByType={listResultsByType}
                searchResultsByType={(type, search) => {
                  this.searchResultsByType(type, search);
                }}
                updateResultsSelected={item => {
                  this.updateResultsSelected(item);
                }}
              />
            </Container>
          </Modal.Body>
          <Modal.Footer>
            <Button
              bsPrefix="btn btn-outline-primary"
              onClick={() => this._handleOnClick(false)}
            >
              {i18n.t("classify-emails.cancel")}
            </Button>
            <Button
              bsPrefix="btn btn-primary"
              onClick={() => this._handleOnClick(true)}
            >
              {i18n.t("classify-emails.save")}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

ClassifyEmails.propTypes = {
  user: PropTypes.string.isRequired,
  initialModalState: PropTypes.bool.isRequired,
  toggleClassifyEmails: PropTypes.func.isRequired,
  updateClassifications: PropTypes.func.isRequired,
  toggleNotification: PropTypes.func.isRequired
};

const mapStateToProps = state => {
  return {
    companySelected: state.selections.companySelected,
    selectedMessages: state.email.selectedMessages
  };
};

export default connect(mapStateToProps)(ClassifyEmails);
