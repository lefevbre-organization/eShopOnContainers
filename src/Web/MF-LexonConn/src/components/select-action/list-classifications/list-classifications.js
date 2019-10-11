import React, { Component, Fragment } from "react";
import "./list-classifications.css";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import PerfectScrollbar from "react-perfect-scrollbar";
import 'react-perfect-scrollbar/dist/css/styles.css';
import Classification from "../classification/classification";

class ListClassifications extends Component {
  render() {
    const {
      user,
      selectedMessages,
      classifications,
      updateClassifications
    } = this.props;
    const mail = selectedMessages[0];

    return (
      <Fragment>
        <h2 className="lexon-title-list">Clasificaciones:</h2>
        <PerfectScrollbar>
          <ul className="row lexon-document-list">
            {classifications.map(classification => {
              return (
                <Classification
                  classification={classification}
                  key={classification.Name}
                  user={user}
                  mail={mail}
                  updateClassifications={updateClassifications}
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
  user: PropTypes.string.isRequired
};

const mapStateToProps = state => {
  return {
    selectedMessages: state.email.selectedMessages,
    companySelected: state.selections.companySelected
  };
};

export default connect(mapStateToProps)(ListClassifications);
