import React, { Component } from "react";
import "./classification.css";
import PropTypes from "prop-types";
import i18n from "i18next";
import { connect } from "react-redux";

import { removeClassification } from "../../../services/services-lexon";

class Classification extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: null
    }
    this._handleOnclick = this._handleOnclick.bind(this);

    this.getClassificationData();
  }

  async getClassificationData() {
    const url = `${window.API_GATEWAY}/api/v1/lex/Lexon/entities/getbyid`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        "Content-Type":"application/json"
      },
      body: JSON.stringify({
        idType: this.props.classification.entityIdType,
        idEntity: this.props.classification.idRelated,
        bbdd: this.props.companySelected.bbdd,
        idUser: this.props.user.idUser
      })
    });
    const data = await response.json();
    this.setState({data: data.data})
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
      .then(response => {
        updateClassifications(mail);
      })
      .catch(error => {
        console.log("error ->", error);
      });
  }

 renderCaseFile() {
   const { name, description, idType, intervening} = this.state.data
    return (
      <li className="col-xl-12 lexon-item">
        <p>
          <strong>{i18n.t(`classification.${idType}`)}: </strong> 
          <span>{name}</span>
        </p>
        <p>
        {description}
        </p>
        <p>
        {intervening}
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

  renderPerson() {
    const { description, idType} = this.state.data

    return <li className="col-xl-12 lexon-item">
      <p>
        <strong>{i18n.t(`classification.${idType}`)}: </strong> 
        <span>{description}</span>
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
  }

  render() {
    const { name, entityIdType } = this.props.classification;
    if(!this.state.data) {
      return null;
    }

    if(this.state.data.idType === 1) {
      return this.renderCaseFile();
    } else {
      return this.renderPerson();
    }
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
