import React, { Component, Fragment } from "react";
import "./tab-classify.css";
import PropTypes from "prop-types";
import { getClassifications } from "../../../services/services-lexon";
import i18n from "i18next";
import { connect } from "react-redux";

import NewClassification from "../new-classification/new-classification";
import ListClassifications from "../list-classifications/list-classifications";

class TabClassify extends Component {
  constructor(props) {
    super(props);

    this.state = {
      classifications: [],
      showNewClassification: false,
      showClassifications: false
    };

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
    }
  }

  getClassifications(mailId) {
    const { user, companySelected } = this.props;

    getClassifications(user, companySelected.idCompany, mailId)
      .then(result => {
        this.setState({
          classifications: result.classifications.Classifications.List,
          showClassifications: true
        });
      })
      .catch(error => {
        console.log("error ->", error);
      });
  }

  renderShowNewClassification() {
    const { showNewClassification } = this.state;
    const { user, toggleClassifyEmails } = this.props;

    if (showNewClassification) {
      return (
        <NewClassification
          user={user}
          toggleClassifyEmails={toggleClassifyEmails}
        />
      );
    } else {
      return <strong>{i18n.t("tab-classify.select-mail")}</strong>;
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
        />
      );
    } else {
      return null;
    }
  }

  render() {
    return (
      <Fragment>
        {this.renderShowNewClassification()}
        {this.renderShowClassifications()}
      </Fragment>
    );
  }
}

TabClassify.propTypes = {
  user: PropTypes.string.isRequired,
  toggleClassifyEmails: PropTypes.func.isRequired
};

const mapStateToProps = state => {
  return {
    selectedMessages: state.email.selectedMessages,
    companySelected: state.selections.companySelected
  };
};

export default connect(mapStateToProps)(TabClassify);
