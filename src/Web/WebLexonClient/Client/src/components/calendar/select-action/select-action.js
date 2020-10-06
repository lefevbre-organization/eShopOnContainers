import React, { Component } from 'react';
import './select-action.css';
import PropTypes from 'prop-types';

import CalendarSelectActionHeader from './select-action-header/select-action-header';
import SelectActionTab from './select-action-tab/select-action-tab';
import { PAGE_SELECT_COMPANY } from '../../../constants';
import {connect} from "react-redux";
import ModalConnectingEvents from "../modal-connecting-events/modal-connecting-events";

class CalendarSelectAction extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showDocuments: true
    };

    this._handelOnClick = this._handelOnClick.bind(this);
    this.onShowDocuments = this.onShowDocuments.bind(this);
  }

  _handelOnClick() {
    this.props.changePage(PAGE_SELECT_COMPANY);
  }

  onShowDocuments(show) {
    this.setState({ showDocuments: show });
  }

  render() {
    const {
      user,
      companies,
      toggleNotification,
      composerOpen = false
    } = this.props;
    const { showDocuments } = this.state;

    if(this.props.showModalDocuments === true) {
      return <ModalConnectingEvents
          user={user}
          updateClassifications={this.geEventClassification}
          toggleNotification={toggleNotification}
      />
    }

    return (
      <div className='container-fluid'>
        <CalendarSelectActionHeader
          companies={companies}
          changePage={this.props.changePage}
        />
        {/*{showDocuments === true && (*/}
          <SelectActionTab
            composerOpen={composerOpen}
            user={user}
            toggleNotification={toggleNotification}
          />
        {/*)}*/}
      </div>
    );
  }
}

CalendarSelectAction.propTypes = {
  user: PropTypes.object.isRequired,
  companies: PropTypes.array.isRequired,
  changePage: PropTypes.func.isRequired,
  toggleNotification: PropTypes.func.isRequired
};

const mapStateToProps = (state) => {
  return {
    showModalDocuments: state.documentsReducer.showModalDocuments,
  };
};

export default connect(mapStateToProps)(CalendarSelectAction);

