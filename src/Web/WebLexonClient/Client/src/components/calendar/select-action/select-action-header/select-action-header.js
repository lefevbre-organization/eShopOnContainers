import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import "./select-action-header.css";
import { connect } from "react-redux";
import i18n from "i18next";
import ACTIONS from "../../../../actions/selections";
import ACTIONS_EMAIL from "../../../../actions/email";
import MessageCounter from './message-counter';
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
    this.onShowDocuments = this.onShowDocuments.bind(this);
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
    const { selectedMessages, companySelected } = this.props;
    const { showDocuments } = this.state;

    return (
      <Fragment>


        <div className="messages-list-container">
          <PerfectScrollbar>{
              this.props.selectedMessages.map( (sm) => <SelectedMessage message={sm} onDeleteMessage={this.onDeleteMessage}></SelectedMessage>)
          }</PerfectScrollbar>
        </div>

        <style jsx>{`
          .messages-list-container {
            padding-right: 15px;
            position: absolute;
            height: calc(100% - 160px);
            width: calc(100% - 15px);
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
