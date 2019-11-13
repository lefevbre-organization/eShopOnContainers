import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import "./select-action-header.css";
import { connect } from "react-redux";
import i18n from "i18next";

import { PAGE_SELECT_COMPANY } from "../../../constants";

class SelectActionHeader extends Component {
  constructor(props) {
    super(props);

    this._handelOnClick = this._handelOnClick.bind(this);
  }

  _handelOnClick() {
    this.props.changePage(PAGE_SELECT_COMPANY);
  }

  renderArrowChangePage() {
    const { companies } = this.props;
    if (companies.length > 1) {
      return (
        <span
          className="lf-icon-arrow-exchange"
          onClick={this._handelOnClick}
        ></span>
      );
    } else {
      return null;
    }
  }

  render() {
    const { selectedMessages, companySelected } = this.props;

    return (
      <Fragment>
        <p className="selected-messages">
          <span className="badge badge-pill badge-light">
            {selectedMessages.length}
          </span>
          <br />
          {i18n.t("select-action-header.messages-selected")}
        </p>
        <p className="company-id">
          {i18n.t("select-action-header.company-selected")}
          <br />
          <strong>{companySelected.name}</strong>
          <a href="#/" title={i18n.t("select-action-header.change-company")}>
            <strong className="sr-only sr-only-focusable">
              {i18n.t("select-action-header.select-another-company")}
            </strong>
            {this.renderArrowChangePage()}
          </a>
        </p>
      </Fragment>
    );
  }
}

SelectActionHeader.propTypes = {
  companies: PropTypes.array.isRequired,
  changePage: PropTypes.func.isRequired
};

const mapStateToProps = state => {
  return {
    selectedMessages: state.email.selectedMessages,
    companySelected: state.selections.companySelected
  };
};

export default connect(mapStateToProps)(SelectActionHeader);
