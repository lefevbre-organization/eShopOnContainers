import React, { Component } from "react";
import "./new-classification.css";
import PropTypes from "prop-types";
import i18n from "i18next";

class NewClassification extends Component {
  constructor(props) {
    super(props);

    this._handleOnClick = this._handleOnClick.bind(this);
  }

  _handleOnClick() {
    const { toggleClassifyEmails } = this.props;

    toggleClassifyEmails();
  }

  render() {
    return (
      <p className="add-more-container">
        <a href="#/" className="add-more" onClick={this._handleOnClick}>
          <span className="lf-icon-add-round"></span>
          <strong>{i18n.t("new-classification.new-classification")}</strong>
        </a>
      </p>
    );
  }
}

NewClassification.propTypes = {
  user: PropTypes.string.isRequired,
  toggleClassifyEmails: PropTypes.func.isRequired
};

export default NewClassification;
