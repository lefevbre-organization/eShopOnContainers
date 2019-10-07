import React, { Component } from "react";
import "./classification.css";
import PropTypes from "prop-types";
import i18n from "i18next";
import { connect } from "react-redux";

import { removeClassification } from "../../../services/services-lexon";

class Classification extends Component {
  constructor(props) {
    super(props);

    this._handleOnclick = this._handleOnclick.bind(this);
  }

  _handleOnclick(classification) {
    this.removeClassification(classification);
  }

  removeClassification(classification) {
    const { user, mail, companySelected, updateClassifications } = this.props;
    const idType = 1;
    const idRelated = 2;

    console.log("this.props ->", this.props);

    removeClassification(
      user,
      companySelected.idCompany,
      mail,
      idType,
      idRelated
    )
      .then(updateClassifications(mail))
      .catch(error => {
        console.log("error ->", error);
      });
  }

  render() {
    const { Description, Type } = this.props.classification;

    return (
      <li className="col-xl-12 lexon-item">
        <p>
          <strong>{i18n.t("classification.type")}</strong> {Type}
        </p>
        <p>
          <strong>{i18n.t("classification.assigned")}</strong> {Description}
        </p>
        <p className="text-right tools-bar">
          <a
            href="#/"
            title={i18n.t("classification.remove-document")}
            onClick={() => this._handleOnclick(this.props.classification)}
          >
            <strong className="sr-only sr-only-focusable">
              {i18n.t("classification.remove-document")}
            </strong>
            <span className="lf-icon-trash"></span>
          </a>
        </p>
      </li>
    );
  }
}

Classification.propTypes = {
  user: PropTypes.string.isRequired,
  mail: PropTypes.string.isRequired,
  classification: PropTypes.object.isRequired,
  updateClassifications: PropTypes.func.isRequired
};

const mapStateToProps = state => {
  return {
    companySelected: state.selections.companySelected
  };
};

export default connect(mapStateToProps)(Classification);
