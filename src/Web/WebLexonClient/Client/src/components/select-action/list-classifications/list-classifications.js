import React, { Component, Fragment } from "react";
import "./list-classifications.css";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import PerfectScrollbar from "react-perfect-scrollbar";
import "react-perfect-scrollbar/dist/css/styles.css";
import Classification from "../classification/classification";
import i18n from "i18next";

class ListClassifications extends Component {
  render() {
    const {
      user,
      selectedMessages,
      classifications,
      updateClassifications,
      toggleConfirmRemoveClassification
    } = this.props;
    const mail = selectedMessages[0];

    const uuidv1 = require("uuid/v1");

    return (
      <Fragment>
        <h2 className="lexon-title-list">{i18n.t("list-classifications.classifications")}</h2>
        <PerfectScrollbar>
          <ul className="row lexon-document-list">
            {classifications.map(classification => {
              return (
                <Classification
                  classification={classification}
                  key={uuidv1()}
                  user={user}
                  mail={mail}
                  updateClassifications={updateClassifications}
                  toggleConfirmRemoveClassification={
                    toggleConfirmRemoveClassification
                  }
                />
              );
            })}
          </ul>
        </PerfectScrollbar>
      </Fragment>
    );
  }
}

ListClassifications.propTypes = {
  user: PropTypes.string.isRequired,
  toggleConfirmRemoveClassification: PropTypes.func.isRequired
};

const mapStateToProps = state => {
  return {
    selectedMessages: state.email.selectedMessages,
    companySelected: state.selections.companySelected
  };
};

export default connect(mapStateToProps)(ListClassifications);
