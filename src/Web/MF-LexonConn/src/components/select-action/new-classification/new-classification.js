import React, { Component } from "react";
import "./new-classification.css";
import PropTypes from "prop-types";
import i18n from "i18next";

class NewClassification extends Component {
  render() {
    return (
      <p className="add-more-container">
        <a href="#/" className="add-more">
          <span className="lf-icon-add-round"></span>
          <strong>{i18n.t("new-classification.new-classification")}</strong>
        </a>
      </p>
    );
  }
}

NewClassification.propTypes = {};

export default NewClassification;
