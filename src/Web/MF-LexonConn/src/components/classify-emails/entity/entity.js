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
    const { name } = this.props.type;

    return (
      <li onClick={() => this._handleOnClick()}>
        <span className="lf-icon-check"></span>
        <span className="type-name">{name}</span>        
      </li>
    );
  }
}

Entity.propTypes = {
  type: PropTypes.object.isRequired,
  closeTypes: PropTypes.func.isRequired
};

export default Entity;
