import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import "./select-action-header.css";
import { connect } from "react-redux";
import i18n from "i18next";
import ACTIONS from "../../../actions/selections";

import { PAGE_SELECT_COMPANY } from "../../../constants";

class SelectActionHeader extends Component {
  constructor(props) {
    super(props);

    this._handelOnClick = this._handelOnClick.bind(this);
  }

  componentDidUpdate(prevProps) {
    if(this.props.initialBBDD === null && prevProps.initialBBDD !== null) {
      this.props.changePage(PAGE_SELECT_COMPANY);
    }
  }

  _handelOnClick() {
    if(this.props.initialBBDD) {
      this.props.clearInitialBBDD();
    } else {
      this.props.changePage(PAGE_SELECT_COMPANY);
    }
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
          {i18n.t("select-action-header.messages-selected")}
          <br />
          <span className="badge badge-pill badge-light">
            {selectedMessages.length}
          </span>
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
    initialBBDD: state.selections.initialBBDD,
    companySelected: state.selections.companySelected
  };
};

const mapDispatchToProps = dispatch => ({
  clearInitialBBDD: () => dispatch(ACTIONS.clearInitialBBDD())
});

export default connect(mapStateToProps, mapDispatchToProps)(SelectActionHeader);
