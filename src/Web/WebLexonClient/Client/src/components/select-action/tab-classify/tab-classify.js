import React, { Component, Fragment } from "react";
import "./tab-classify.css";
import PropTypes from "prop-types";
import { getClassifications } from "../../../services/services-lexon";
import i18n from "i18next";
import { connect } from "react-redux";

import ClassifyEmails from "../../classify-emails/classify-emails";
import ConfirmRemoveClassification from "../../confirm-remove-classification/confirm-remove-classification";
import NewClassification from "../new-classification/new-classification";
import ListClassifications from "../list-classifications/list-classifications";

class TabClassify extends Component {
  constructor(props) {
    super(props);

    this.state = {
      classifications: [],
      showNewClassification: false,
      showClassifications: false,
      showClassifyEmails: false,
      showConfirmRemoveClassification: false,
      classificationToRemove: null
    };

    this.toggleClassifyEmails = this.toggleClassifyEmails.bind(this);
    this.toggleConfirmRemoveClassification = this.toggleConfirmRemoveClassification.bind(
      this
    );

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
      this.getClassifications(this.props.selectedMessages[0]);
    } else {
      this.setState({ classifications: [], showClassifications: false });
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.selectedMessages !== prevProps.selectedMessages) {
      if (this.props.selectedMessages.length > 0) {
        this.setState({ showNewClassification: true });
      } else {
        this.setState({ showNewClassification: false });
      }

      if (this.props.selectedMessages.length === 1) {
        this.getClassifications(this.props.selectedMessages[0]);
      } else {
        this.setState({ classifications: [], showClassifications: false });
      }
      this.setState({ classificationToRemove: null });
    }
  }

  getClassifications(mailId) {
    const { user, companySelected } = this.props;

    getClassifications(user, companySelected.idCompany, mailId)
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

  toggleClassifyEmails() {
    this.setState(state => ({
      showClassifyEmails: !state.showClassifyEmails
    }));
  }

  toggleConfirmRemoveClassification(classification) {
    this.setState(state => ({
      showConfirmRemoveClassification: !state.showConfirmRemoveClassification,
      classificationToRemove: classification
    }));
  }

  renderShowNewClassification() {
    const { showNewClassification } = this.state;
    const { user } = this.props;

    if (showNewClassification) {
      return (
        <NewClassification
          user={user}
          toggleClassifyEmails={this.toggleClassifyEmails}
        />
      );
    } else {
      return <p className="lexon-description"><strong>{i18n.t("tab-classify.select-mail")}</strong></p>;
    }
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

  render() {
    const {
      showClassifyEmails,
      showConfirmRemoveClassification,
      classificationToRemove
    } = this.state;
    const { user, toggleNotification } = this.props;
    return (
      <Fragment>
        <ClassifyEmails
          user={user}
          initialModalState={showClassifyEmails}
          toggleClassifyEmails={this.toggleClassifyEmails}
          updateClassifications={this.getClassifications}
          toggleNotification={toggleNotification}
        />

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

        {this.renderShowNewClassification()}
        {this.renderShowClassifications()}
      </Fragment>
    );
  }
}

TabClassify.propTypes = {
  user: PropTypes.string.isRequired,
  toggleNotification: PropTypes.func.isRequired
};

const mapStateToProps = state => {
  return {
    selectedMessages: state.email.selectedMessages,
    companySelected: state.selections.companySelected  
  };
};

export default connect(mapStateToProps)(TabClassify);
