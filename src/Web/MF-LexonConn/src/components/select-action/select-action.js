import React, { Component } from "react";
import "./select-action.css";
import PropTypes from "prop-types";

import SelectActionHeader from "../select-action/select-action-header/select-action-header"
import { PAGE_SELECT_COMPANY } from "../../constants";

class SelectAction extends Component {
  constructor(props) {
    super(props);

    this._handelOnClick = this._handelOnClick.bind(this);
  }

  _handelOnClick() {
      this.props.changePage(PAGE_SELECT_COMPANY);
  }

  render() {
    return (
      <div className="container-fluid">
        <SelectActionHeader changePage={this.props.changePage} />
      </div>
    );
  }
}

SelectAction.propTypes = {};

export default SelectAction;
