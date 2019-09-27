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
    const { companies } = this.props;
    return (
      <div className="container-fluid">
        <SelectActionHeader companies={companies} changePage={this.props.changePage} />
      </div>
    );
  }
}

SelectAction.propTypes = {
  user: PropTypes.string.isRequired,
  companies: PropTypes.array.isRequired,
  changePage: PropTypes.func.isRequired
};

export default SelectAction;
