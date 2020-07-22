import React, { Component, Fragment } from 'react';
import i18n from 'i18next';
import { connect, ConnectedProps } from 'react-redux';
import { AppState } from '../../../store/store';
import ArchiveDocument from '../archive-document/archive-document';
import ModalArchiveDocuments from '../modal-archive-document/modal-archive-documents';

const mapStateToProps = (state: AppState) => {
  return {
    user: state.application.user,
    selectedMessages: state.messages.selected,
    showArchiveModal: state.application.showArchiveModal,
  };
};

const connector = connect(mapStateToProps);
type ReduxProps = ConnectedProps<typeof connector>;

interface Props extends ReduxProps {
  toggleNotification: any;
}

interface State {
  showClassifications: boolean;
  showConfirmRemoveClassification: boolean;
}

class TabArchiveMessage extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      showClassifications: false,
      showConfirmRemoveClassification: false
    };
    this.toggleConfirmRemoveClassification = this.toggleConfirmRemoveClassification.bind(
      this
    );
  }

  componentDidMount() {}

  componentWillUnmount() {}

  componentDidUpdate(prevProps: Props) {}

  toggleConfirmRemoveClassification(classification: any) {
    // this.setState((state) => ({
    //   showConfirmRemoveClassification: !state.showConfirmRemoveClassification,
    //   classificationToRemove: classification
    // }));
  }

  renderShowArchiveDocument() {
    const { selectedMessages, user } = this.props;

    if (selectedMessages.length > 0) {
      return <ArchiveDocument />;
    } else {
      return (
        <p className="select-message">{i18n.t('tab-archive.select-mail')}</p>
      );
    }
  }

  render() {
    const { toggleNotification } = this.props;

    return (
      <Fragment>
        {this.props.showArchiveModal && <ModalArchiveDocuments toggleNotification={toggleNotification} />
        {/*
        <ConfirmRemoveClassification
          user={user}
          initialModalState={showConfirmRemoveClassification}
          toggleConfirmRemoveClassification={
            this.toggleConfirmRemoveClassification
          }
          classification={classificationToRemove}
          updateClassifications={this.getClassifications}
          toggleNotification={toggleNotification}
        />
        */}

        {this.renderShowArchiveDocument()}
        <style jsx>{`
          .select-message {
            font-family: MTTMilano, Lato, Arial, sans-serif;
            font-size: 14px !important;
            line-height: 18px;
          }
        `}</style>
      </Fragment>
    );
  }
}

export default connector(TabArchiveMessage);
