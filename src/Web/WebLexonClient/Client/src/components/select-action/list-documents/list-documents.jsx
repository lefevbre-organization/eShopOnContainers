import React, { Component, Fragment } from "react";
import "./list-documents.css";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import PerfectScrollbar from "react-perfect-scrollbar";
import "react-perfect-scrollbar/dist/css/styles.css";
import i18n from "i18next";

class ListDocuments extends Component {
  render() {
    const {
      user,
      selectedMessages,
      classifications,
      updateClassifications,
      toggleConfirmRemoveClassification,
      toggleDocuments
    } = this.props;
    const mail = selectedMessages[0];

    return (
      <Fragment>
        <h2 className="lexon-title-list">
          {i18n.t("list-documents.documented-copies")}
        </h2>
        <PerfectScrollbar>
          <ul className="row lexon-document-list">
            <li></li>
          </ul>
        </PerfectScrollbar>
      </Fragment>
    );
  }
}

ListDocuments.propTypes = {
  user: PropTypes.string.isRequired
};

const mapStateToProps = state => {
  return {
    selectedMessages: state.email.selectedMessages,
    companySelected: state.selections.companySelected
  };
};

export default connect(mapStateToProps)(ListDocuments);
