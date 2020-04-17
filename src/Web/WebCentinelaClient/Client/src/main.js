import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';

import APPLICATION_ACTIONS from './actions/applicationAction';
import './main.css';
import i18n from 'i18next';

// import Header from "./components/header/header";
import Routing from './components/routing/routing';
import Spinner from './components/spinner/spinner';
import Notification from './components/notification/notification';

class Main extends Component {
  constructor(props) {
    super(props);

    this.state = {
      user: null,
      isLoading: true,
      showNotification: false,
      messageNotification: null,
      errorNotification: false
    };

    this.toggleNotification = this.toggleNotification.bind(this);
  }

  componentDidMount() {}

  componentWillUnmount() {}

  toggleNotification(message, error = false) {
    this.setState(state => ({
      showNotification: !state.showNotification,
      messageNotification: message,
      errorNotification: error
    }));
  }

  renderErrors() {
    const { errors } = this.props;
    let bbddError = false;
    if (errors.length > 0) {
      for (let i = 0; i < errors.length; i++) {
        if (errors[i].indexOf('"code":"2003"') > -1) {
          bbddError = true;
          break;
        }
      }

      return (
        <p className='connexion-status connexion-status-ko'>
          {bbddError === true
            ? i18n.t('main.bbdd_error')
            : i18n.t('main.error_connection')}
          <span className='lf-icon-warning'></span>
        </p>
      );
    }
  }

  render() {
    const {
      isLoading,
      showNotification,
      messageNotification,
      errorNotification
    } = this.state;
    const { errors } = this.props;

    if (isLoading) {
      return <Spinner />;
    }

    return (
      <Fragment>
        {errors && errors.length > 0 && this.renderErrors()}
        <Notification
          initialModalState={showNotification}
          toggleNotification={this.toggleNotification}
          message={messageNotification}
          error={errorNotification}
        />
      </Fragment>
    );
  }
}

const mapStateToProps = state => {
  return {
    selectedMessages: state.email.selectedMessages,
    errors: state.applicationReducer.errors
  };
};

const mapDispatchToProps = dispatch => ({
  addError: error => dispatch(APPLICATION_ACTIONS.addError(error))
});

export default connect(mapStateToProps, mapDispatchToProps)(Main);
