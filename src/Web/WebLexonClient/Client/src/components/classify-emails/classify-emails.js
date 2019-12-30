import React, { Fragment, Component } from "react";
import { Button, Modal, Container } from "react-bootstrap";
import i18n from "i18next";
import "./classify-emails.css";
import ClassificationType from "./classification-type/classification-type";
import ClassificationList from "./classification-list/classification-list";
import PropTypes from "prop-types";
import { getResults, addClassification } from "../../services/services-lexon";
import { connect } from "react-redux";
import APPLICATION_ACTIONS from "../../actions/applicationAction";
import Spinner from "../../components/spinner/spinner";

class ClassifyEmails extends Component {
  constructor(props) {
    super(props);

    this.state = {
      modal: props.initialModalState,
      listResultsByType: [],
      resultsSelected: [],
      type: null,
      search: "",
      forceUpdate: null,
      isLoading: false
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
      addClassification(
        user,
        companySelected,
        selectedMessages,
        resultsSelected[0],
        type
      )
        .then(() => {
          if (selectedMessages.length === 1) {
            _this.updateResultsSelected(selectedMessages[0].id);
          }
          toggleNotification(i18n.t("classify-emails.classification-saved-ok"));
        })
        .catch(error => {
          toggleNotification(i18n.t("classify-emails.classification-saved-ko"));
          console.log("error ->", error);
        });
    }
  }

  getListResultsByType() {
    const { type, search } = this.state;
    const { user, companySelected } = this.props;

    if (type == null) {
      return;
    }

    this.setState({ isLoading: true });
    getResults(user, companySelected, type, search)
      .then(result => {
        this.setState({
          listResultsByType: result.results.data
        });

        if (result.errors !== undefined && Array.isArray(result.errors)) {
          result.errors.forEach(error =>
            this.props.addError(JSON.stringify(error))
          );
        }
        this.setState({ isLoading: false });
      })
      .catch(errors => {
        if (Array.isArray(errors)) {
          errors.forEach(error => this.props.addError(JSON.stringify(error)));
        } else {
          this.props.addError(JSON.stringify(errors));
        }
        console.log("error ->", errors);
        this.setState({
          listResultsByType: []
        });
        this.setState({ isLoading: false });
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
    // const { resultsSelected } = { ...this.state };

    // var findElement = resultsSelected.indexOf(item);
    // if (findElement === -1) {
    //   resultsSelected.push(item);
    // } else {
    //   resultsSelected.splice(findElement, 1);
    // }

    // this.setState({ resultsSelected: resultsSelected });

    const { updateClassifications } = this.props;
    let resultsSelected = [];
    resultsSelected.push(item);

    this.setState({ resultsSelected: resultsSelected });
    updateClassifications(item);
  }

  renderSpinner() {
    const { isLoading } = this.state;
    if (isLoading) {
      return <Spinner />;
    }
  }

  render() {
    const { listResultsByType, resultsSelected } = this.state;
    const { initialModalState, toggleClassifyEmails } = this.props;

    return (
      <Fragment>
        {this.renderSpinner()}
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
      </Fragment>
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

const mapDispatchToProps = dispatch => ({
  addError: error => dispatch(APPLICATION_ACTIONS.addError(error))
});

export default connect(mapStateToProps, mapDispatchToProps)(ClassifyEmails);
