import React, { Component } from "react";
import "./classification-type.css";
import i18n from "i18next";
import { getTypes } from "../../../services/services-lexon";
import Entity from "../entity/entity";
import PropTypes from "prop-types";

class ClassificationType extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showTypes: false,
      types: [],
      selectedType: {
        id: 0,
        name: i18n.t("classification-type.select")
      }
    };

    this._handleOnClick = this._handleOnClick.bind(this);
    this.getTypes = this.getTypes.bind(this);
  }

  componentDidMount() {
    this.getTypes();
  }

  getTypes() {
    getTypes()
      .then(result => {
        this.setState({
          types: result.types
        });
      })
      .catch(error => {
        console.log("error ->", error);
      });
  }

  _handleOnClick(type) {
    this.setState({
      showTypes: !this.state.showTypes,
      selectedType: type ? {
        id: type.id,
        name: type.name
      } : this.state.selectedType
    });

    if (type) {
      const { searchResultsByType } = this.props;
      searchResultsByType(type.id, 'null');  
    }
  }

  render() {
    const { showTypes, types, selectedType } = this.state;

    const classShowTypesButton = showTypes
      ? "lexon-select-like-custom-trigger opened"
      : "lexon-select-like-custom-trigger";
    const classShowTypesDiv = showTypes
      ? "lexon-select-like-custom-list-container opened"
      : "lexon-select-like-custom-list-container";

    return (
      <div className="form-group">
        <label>
          {i18n.t("classification-type.type")}
          <span className="requerido">*</span>
        </label>
        <br />
        <button
          className={classShowTypesButton}
          onClick={() => this._handleOnClick()}
        >
          {selectedType.name}
          <span className="lf-icon-angle-down"></span>
        </button>
        <div className={classShowTypesDiv}>
          <ul className="lexon-select-like-custom-list">
            {types.map(type => {
              return (
                <Entity
                  type={type}
                  key={type.id}
                  closeTypes={this._handleOnClick}
                ></Entity>
              );
            })}
          </ul>
        </div>
      </div>
    );
  }
}

ClassificationType.propTypes = {
  searchResultsByType: PropTypes.func.isRequired
};

export default ClassificationType;
