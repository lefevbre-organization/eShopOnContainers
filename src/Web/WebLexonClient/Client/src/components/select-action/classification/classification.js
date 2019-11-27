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
    const { toggleConfirmRemoveClassification } = this.props;

    toggleConfirmRemoveClassification(classification);
  }

  removeClassification(classification) {
    const { user, mail, companySelected, updateClassifications } = this.props;

    removeClassification(
      mail,
      classification.idMail,
      classification.bbdd,
      user,
      classification.idRelated,
      companySelected.companyId
    )
      .then(updateClassifications(mail))
      .catch(error => {
        console.log("error ->", error);
      });
  }

  render() {
    const { description, entityType } = this.props.classification;

    return (
      <li className="col-xl-12 lexon-item">
        <p>
          <strong>{i18n.t("classification.type")}</strong> {entityType}
        </p>
        <p>
          <strong>{i18n.t("classification.assigned")}</strong> {description}
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
  updateClassifications: PropTypes.func.isRequired,
  toggleConfirmRemoveClassification: PropTypes.func.isRequired
};

const mapStateToProps = state => {
  return {
    companySelected: state.selections.companySelected
  };
};

export default connect(mapStateToProps)(Classification);
