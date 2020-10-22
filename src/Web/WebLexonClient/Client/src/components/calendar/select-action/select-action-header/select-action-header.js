import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import "./select-action-header.css";
import { connect } from "react-redux";
import i18n from "i18next";
import ACTIONS from "../../../../actions/selections";
import ACTIONS_EMAIL from "../../../../actions/email";
import SelectedMessage from './selected-message';
import PerfectScrollbar from "react-perfect-scrollbar";

import { PAGE_SELECT_COMPANY } from "../../../../constants";

class CalendarSelectActionHeader extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showDocuments: true
    }
    this._handelOnClick = this._handelOnClick.bind(this);
    this.onDeleteMessage = this.onDeleteMessage.bind(this);
  }

  componentDidUpdate(prevProps) {
    if(this.props.initialBBDD === null && prevProps.initialBBDD !== null) {
      this.props.changePage(PAGE_SELECT_COMPANY);
    }
  }

  onDeleteMessage(msg) {
    this.props.deleteMessage(msg);
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
    const {  companySelected } = this.props;

    return (
      <Fragment>
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


        <style jsx>{`
          .messages-list-container {
            padding-right: 15px;
            position: absolute;
            height: calc(100% - 160px);
            width: calc(100% - 15px);
          }
          
          .company-id {
            border-left: 10px solid #E5E8F1;
            font-size: 14px;
            position: relative;
            line-height: 21px;
            margin-bottom: 30px;
            font-family: MTTMilano, Lato, Arial, sans-serif;
            padding: 10px;
          }
          
          .company-id:before {
            background-color: unset;
            
          }
        `}</style>
      </Fragment>
    );
  }
}

CalendarSelectActionHeader.propTypes = {
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
  clearInitialBBDD: () => dispatch(ACTIONS.clearInitialBBDD()),
  deleteMessage: (msg) => dispatch(ACTIONS_EMAIL.deleteMessage(msg))
});

export default connect(mapStateToProps, mapDispatchToProps)(CalendarSelectActionHeader);
