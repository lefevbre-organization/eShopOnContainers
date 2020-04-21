import React, { Component, Fragment } from 'react';
import { bindActionCreators } from 'redux';
import { connect, ConnectedProps } from 'react-redux';
import i18n from 'i18next';
import PerfectScrollbar from 'react-perfect-scrollbar';
import './select-action-header.css';
import MessageCounter from './message-counter';
import { MessagesActions } from '../../../store/messages/actions';
import SelectedMessage from './selected-message';
import { Message } from '../../../store/messages/types';

const mapStateToProps = (state: any) => {
  const { selected } = state.messages;
  return {
    selected: selected
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    ...bindActionCreators(
      {
        deleteMessage: MessagesActions.deleteMessage
      },
      dispatch
    )
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type ReduxProps = ConnectedProps<typeof connector>;

interface Props extends ReduxProps {
  changePage: (page: string) => void;
  onChange: (showDocuments: boolean) => void;
}

interface State {
  showDocuments: boolean;
}

class SelectActionHeader extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      showDocuments: true
    };
    this._handleOnClick = this._handleOnClick.bind(this);
    this.onShowDocuments = this.onShowDocuments.bind(this);
    this.onDeleteMessage = this.onDeleteMessage.bind(this);
  }

  componentDidUpdate(prevProps: Props) {}

  onShowDocuments(show: boolean) {
    this.setState({ showDocuments: show }, () => {
      const { onChange } = this.props;
      onChange && onChange(show);
    });
  }

  // TODO: Check msg type
  onDeleteMessage(msg: any) {
    debugger;
    const { deleteMessage } = this.props;
    deleteMessage(msg);
  }

  _handleOnClick() {}

  render() {
    const { showDocuments } = this.state;
    const { selected } = this.props;

    return (
      <Fragment>
        <p className="selected-messages">
          {i18n.t('select-action-header.messages-selected')}
          <br />
          <MessageCounter onChange={this.onShowDocuments}>
            {selected.length}
          </MessageCounter>
        </p>

        {/* {showDocuments && (
          <p className='company-id'>
            {i18n.t('select-action-header.company-selected')}
            <br />
            <strong>{companySelected.name}</strong>
            <a href='#/' title={i18n.t('select-action-header.change-company')}>
              <strong className='sr-only sr-only-focusable'>
                {i18n.t('select-action-header.select-another-company')}
              </strong>
              {this.renderArrowChangePage()}
            </a>
          </p>
        )}
        */}
        {showDocuments === false && (
          <div className="messages-list-container">
            <PerfectScrollbar>
              {selected.map((sm: Message) => (
                <SelectedMessage
                  message={sm}
                  onDeleteMessage={this.onDeleteMessage}
                ></SelectedMessage>
              ))}
            </PerfectScrollbar>
          </div>
        )}
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

export default connector(SelectActionHeader);
