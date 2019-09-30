import React, { Component } from "react";
import "./classification.css";
import PropTypes from "prop-types";
import i18n from "i18next";

class Classification extends Component {
  render() {
    const { Description, Type } = this.props.classification;
    return (
      <li class="col-xl-12 lexon-item">
        <p>
          <strong>{i18n.t("classification.type")}</strong> {Type}
        </p>
        <p>
          <strong>{i18n.t("classification.assigned")}</strong> {Description}
        </p>
        <p class="text-right tools-bar">
          <a href="#/" title={i18n.t("classification.remove-document")}>
            <strong class="sr-only sr-only-focusable">
              {i18n.t("classification.remove-document")}
            </strong>
            <span class="lf-icon-trash"></span>
          </a>
        </p>
      </li>
    );
  }
}

Classification.propTypes = {
  classification: PropTypes.object.isRequired
};

export default Classification;
