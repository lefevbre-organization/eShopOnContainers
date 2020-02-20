import React, {Component} from 'react';
import {connect} from 'react-redux';
import Snackbar from '../snackbar/snackbar';
import {translate} from 'react-i18next';

export class NotFoundSnackbar extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {error, t} = this.props;
    let message;
    if (error === null) {
      message = '';
    } else {
      message =  t(`msgNotFoundSnackbar.error`);// t(`Authentication.errors.${error}`);
    }
    return (
      <Snackbar show={error !== null && error !== undefined} message={message}/>
    );
  }
}
const mapStateToProps = state => ({
  //error: state.application.errors.authentication
  error: state.application.errors.messageNotFound
});

export default connect(mapStateToProps)(translate()(NotFoundSnackbar));
