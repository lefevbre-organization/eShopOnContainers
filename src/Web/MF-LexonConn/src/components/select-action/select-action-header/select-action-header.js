import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import "./select-action-header.css";
import { connect } from "react-redux";

import { PAGE_SELECT_COMPANY } from "../../../constants";

class SelectActionHeader extends Component {
  constructor(props) {
    super(props);

    this._handelOnClick = this._handelOnClick.bind(this);
  }

  _handelOnClick() {
    this.props.changePage(PAGE_SELECT_COMPANY);
  }

  render() {
    const { selectedMessages } = this.props;    
    
    return (
      <Fragment>
        <p className="selected-messages">
          <span className="badge badge-pill badge-light">{selectedMessages.length}</span>
          <br />
          mensajes seleccionados
        </p>
        <p className="company-id">
          Empresa identificada:
          <br />
          <strong>Abogados de Atocha, S.L.</strong>
          <a href="#" title="Cambiar de empresa">
            <strong className="sr-only sr-only-focusable">
              Seleccionar una empresa diferente
            </strong>
            <span
              className="lf-icon-arrow-exchange"
              onClick={this._handelOnClick}
            ></span>
          </a>
        </p>
      </Fragment>
    );
  }
}

SelectActionHeader.propTypes = {};

const mapStateToProps = state => {
  return {
    selectedMessages: state.email.selectedMessages
  };
};

export default connect(mapStateToProps)(SelectActionHeader);
