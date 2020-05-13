import React, { Component } from 'react';
import i18n from 'i18next';
import { connect, ConnectedProps } from 'react-redux';
import { AppState } from '../../../store/store';
import { ApplicationActions } from '../../../store/application/actions';
import { bindActionCreators } from 'redux';

const mapStateToProps = (state: AppState) => {
  return {
    user: state.application.user,
    selectedMessages: state.messages.selected,
    showAttachModal: state.application.showAttachModal,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    ...bindActionCreators(
      {
        toggleAttachModal: ApplicationActions.toggleAttachModal,
      },
      dispatch
    ),
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type ReduxProps = ConnectedProps<typeof connector>;

interface Props extends ReduxProps {}

class ArchiveDocument extends Component<Props> {
  constructor(props: Props) {
    super(props);

    this._handleOnClick = this._handleOnClick.bind(this);
  }

  _handleOnClick() {
    const { toggleAttachModal } = this.props;
    toggleAttachModal();
  }

  render() {
    const { selectedMessages } = this.props;

    return (
      <a href='#/' className='add-more' onClick={this._handleOnClick}>
        <p className='add-more-container add-more'>
          <span className='lf-icon-add'></span>
          <strong>{i18n.t('modal-attach.save-copy')}</strong>
        </p>
      </a>
    );
  }
}

export default connector(ArchiveDocument);
3;
