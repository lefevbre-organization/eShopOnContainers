import React, { Component } from "react";
import PropTypes from "prop-types";
import "./entity.css";

class Entity extends Component {
  constructor(props) {
    super(props);

    this._handleOnClick = this._handleOnClick.bind(this);
  }

  _handleOnClick() {
    const { type, closeTypes } = this.props;

    closeTypes(type);
  }

  render() {
    const { idEntity, name } = this.props.type;
    const { selectedType } = this.props;

    if (idEntity === 13 || idEntity === 14) {
      return null;
    }

    const classSelected = idEntity === selectedType.idEntity ? "selected" : "";

    return (
      <li onClick={() => this._handleOnClick()} className={classSelected}>
        <span className="lf-icon-check"></span>
        <span className="type-name">{name}</span>
      </li>
    );
  }
}

Entity.propTypes = {
  type: PropTypes.object.isRequired,
  closeTypes: PropTypes.func.isRequired,
  selectedType: PropTypes.object.isRequired
};

export default Entity;
