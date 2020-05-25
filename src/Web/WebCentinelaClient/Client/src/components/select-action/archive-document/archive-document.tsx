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
    showArchiveModal: state.application.showArchiveModal
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    ...bindActionCreators(
      {
        toggleArchiveModal: ApplicationActions.toggleArchiveModal
      },
      dispatch
    )
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
    const { toggleArchiveModal } = this.props;
    toggleArchiveModal();
  }

  render() {
    const { selectedMessages } = this.props;

    if (selectedMessages.length === 0) {
      return (
        <p className="add-more-container add-more">
          <span className="lf-icon-add-round"></span>
          <strong>{i18n.t('save-copy.save-copy')}</strong>
        </p>
      );
    }

    return (
      <p className="add-more-container">
        <a href="#/" className="add-more" onClick={this._handleOnClick}>
          <span className="lf-icon-add-round"></span>
          <strong>{i18n.t('tab-archive.new-archive-location')}</strong>
        </a>
      </p>
    );
  }
}

export default connector(ArchiveDocument);
