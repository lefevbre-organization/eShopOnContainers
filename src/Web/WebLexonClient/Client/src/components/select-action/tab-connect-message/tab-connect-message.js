import React, { Component, Fragment } from "react";
import "./tab-connect-message.css";
import PropTypes from "prop-types";
import SaveDocument from "../save-document/save-document";
import ListDocuments from "../list-documents/list-documents";
import i18n from "i18next";
import { connect } from "react-redux";
import { getClassifications } from "../../../services/services-lexon";
import ModalConnectingEmails from "../../modal-connecting-emails/modal-connecting-emails";
import ListClassifications from "../list-classifications/list-classifications";
import ConfirmRemoveClassification from "../../confirm-remove-classification/confirm-remove-classification";

class TabConnectMessage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showClassifications: false,
      showConfirmRemoveClassification: false,
    };
    this.toggleConfirmRemoveClassification = this.toggleConfirmRemoveClassification.bind(this);
    this.getClassifications = this.getClassifications.bind(this);

  }

  componentDidMount() {
    const { selectedMessages } = this.props;

    if (selectedMessages.length > 0) {
      this.setState({ showNewClassification: true });
    } else {
      this.setState({ showNewClassification: false });
    }

    if (selectedMessages.length === 1) {
      this.getClassifications(this.props.selectedMessages[0].id);
    } else {
      this.setState({ classifications: [], showClassifications: false });
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.selectedMessages !== prevProps.selectedMessages) {
      if (this.props.selectedMessages.length > 0) {
        this.setState({ showSaveDocument: true });
      } else {
        this.setState({ showSaveDocument: false });
      }

      if (this.props.selectedMessages.length === 1) {
        this.getClassifications(this.props.selectedMessages[0].id);
      } else {
        this.setState({ classifications: [], showClassifications: false });
      }
    }
  }

  toggleConfirmRemoveClassification(classification) {
    this.setState(state => ({
      showConfirmRemoveClassification: !state.showConfirmRemoveClassification,
      classificationToRemove: classification
    }));
  }

  getClassifications(mailId) {
    const { user, companySelected } = this.props;

    getClassifications(user, companySelected.idCompany, companySelected.bbdd, mailId)
      .then(result => {
        this.setState({
          classifications: result.classifications,
          showClassifications: true
        });
      })
      .catch(error => {
        console.log("error ->", error);
      });
  }

  renderShowClassifications() {
    const { user } = this.props;
    const { classifications, showClassifications } = this.state;

    if (showClassifications) {
      return (
        <ListClassifications
          user={user}
          updateClassifications={getClassifications}
          classifications={classifications}
          toggleConfirmRemoveClassification={
            this.toggleConfirmRemoveClassification
          }
        />
      );
    } else {
      return null;
    }
  }

  renderShowSaveDocument() {
    const { showSaveDocument } = this.state;
    const { user, selectedMessages } = this.props;

    if (selectedMessages.length > 0) {
      return (
        <SaveDocument
          user={user}
        />
      );
    } else {
      return <strong>{i18n.t("tab-connect.select-mail")}</strong>;
    }
  }

  render() {
    const { user, toggleNotification } = this.props;
    const {
      showConfirmRemoveClassification,
      classificationToRemove
    } = this.state;
    return (
      <Fragment>
        <ModalConnectingEmails 
          user={user} 
          updateClassifications={this.getClassifications}
          toggleNotification={toggleNotification}/>
        <ConfirmRemoveClassification
          user={user}
          initialModalState={showConfirmRemoveClassification}
          toggleConfirmRemoveClassification={
            this.toggleConfirmRemoveClassification
          }
          classification={classificationToRemove}
          updateClassifications={this.getClassifications}      
          toggleNotification={toggleNotification}
        />

        {this.renderShowSaveDocument()}
        {this.renderShowClassifications()}
      </Fragment>
    );
  }
}

TabConnectMessage.propTypes = {
  user: PropTypes.string.isRequired
};

const mapStateToProps = state => {
  return {
    selectedMessages: state.email.selectedMessages,
    companySelected: state.selections.companySelected
  };
};

export default connect(mapStateToProps)(TabConnectMessage);
