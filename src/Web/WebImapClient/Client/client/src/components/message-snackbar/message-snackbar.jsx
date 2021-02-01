import React, {Component} from 'react';
import {connect} from 'react-redux';
import Snackbar from '../snackbar/snackbar';
import {translate} from 'react-i18next';
import {outboxMessageProcessed} from '../../actions/application';
import {editMessageAsNew} from '../../services/application';

export class MessageSnackbar extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {outbox, retry, t} = this.props;
    let message;
    let buttonLabel = '';
    if (outbox === null) {
      message = '';
    } else if (outbox.sent) {
      message = t('messageSnackbar.messageSent');
    } else if (!outbox.sent && outbox.error) {
      message = t('messageSnackbar.messageError');
      buttonLabel = t('messageSnackbar.retry');
    } else {
      if(isNaN(outbox.progress)) {
        message = '';
      } else {
        message = t('messageSnackbar.sendingMessage', {progress: outbox.progress * 100});
      }
    }
    return message && message !== '' ?(
       <Snackbar
        show={outbox !== null} alignStart={true} message={message}
        buttonAction={retry} buttonLabel={buttonLabel}/>
    ): null;
  }
}

const mapStateToProps = state => ({
  outbox: state.application.outbox,
  draft: state.application.draft
});

const mapDispatchToProps = dispatch => ({
  retry: outbox => {
    editMessageAsNew(dispatch, outbox.message);
    dispatch(outboxMessageProcessed());
  }
});

const mergeProps = (stateProps, dispatchProps, ownProps) => (Object.assign({}, stateProps, dispatchProps, ownProps, {
  retry: () => dispatchProps.retry(stateProps.outbox)
}));

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(translate()(MessageSnackbar));
