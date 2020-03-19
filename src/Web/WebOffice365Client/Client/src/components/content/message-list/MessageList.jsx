import React, { Component } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { withTranslation } from 'react-i18next';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import MessageRow from './message-row/MessageRow';
import { addMessage, deleteMessage } from './actions/message-list.actions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import ListToolbar from './list-toolbar/ListToolbar';
import ListFooter from './list-footer/ListFooter';
import './messageList.scss';
import { getMessage, getLabelSentItems } from '../../../api_graph';

const ViewMode = {
  LIST: 1,
  CONTENT: 2,
  EDIT: 3
};

export class MessageList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      firstPage: false,
      viewMode: ViewMode.LIST,
      contentMessageId: undefined,
      currentLabel: ''
    };

    this.onSelectionChange = this.onSelectionChange.bind(this);
    this.renderView = this.renderView.bind(this);
    this.renderMessages = this.renderMessages.bind(this);
    this.isSentFolder = false;
  }

  async componentDidMount() {
    const searchParam = this.props.location.search;
    const token = searchParam.indexOf('?') === 0 ? searchParam.slice(1) : null;

    if (token && this.props.messagesResult.pageTokens.length === 0) {
      this.props.addInitialPageToken(token);
    }

    const labelIds =
      this.props.searchQuery === '' ? [this.props.parentLabel.id] : undefined;

    this.props.getLabelMessages({
      ...(labelIds && { labelIds }),
      pageToken: token
    });

    const response = await getLabelSentItems();
    if (response) {
      this.isSentFolder = response.id === this.props.parentLabel.id;
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevProps.messagesResult.messages.length > 0 &&
      prevProps.messagesResult.messages.length !==
        this.props.messagesResult.messages.length
    ) {
      this.props.refresh();
    }

    if (prevProps.location.search !== this.props.location.search) {
      const searchParam = this.props.location.search;
      const token =
        searchParam.indexOf('?') === 0 ? searchParam.slice(1) : null;

      const labelIds =
        this.props.searchQuery === '' ? [this.props.parentLabel.id] : undefined;

      this.props.getLabelMessages({
        ...(labelIds && { labelIds }),
        pageToken: token
      });
    }
  }

  async onSelectionChange(selected, msg) {
    this.props.toggleSelected([msg.id], selected);

    const extMessageId = msg.internetMessageId;
    const message = {
      id: msg.id,
      extMessageId,
      subject: msg.subject,
      sentDateTime: msg.sentDateTime,
      folder: this.props.selectedFolder,
      provider: 'OUTLOOK',
      account: this.props.lexon.account,
      chkselected: selected,
      raw: null
    };

    selected
      ? this.props.addMessage(message)
      : this.props.deleteMessage(message.extMessageId);

    if (selected === true) {
      window.dispatchEvent(new CustomEvent('LoadingMessage'));
      const msgRaw = await getMessage(msg.id, 'raw');
      message.raw = msgRaw;
    }

    window.dispatchEvent(
      new CustomEvent('Checkclick', {
        detail: message
      })
    );

    window.dispatchEvent(new CustomEvent('LoadedMessage'));
  }

  renderSpinner() {
    return (
      <div className='d-flex h-100 justify-content-center align-items-center  '>
        <FontAwesomeIcon icon={faSpinner} spin size='3x' />
      </div>
    );
  }

  renderMessages() {
    const { t } = this.props;
    const _this = this;

    if (this.props.messagesResult.loading) {
      return this.renderSpinner();
    } else if (this.props.messagesResult.messages.length === 0) {
      return (
        <div className='p-4 text-center'>{t('message-list.no-message')}</div>
      );
    }

    return this.props.messagesResult.messages.map(el => {
      if (_this.props.selectedMessages.find(x => x.id === el.id)) {
        el.selected = true;
      } else {
        el.selected = false;
      }

      return (
        <MessageRow
          data={el}
          isSent={this.isSentFolder}
          key={el.id}
          onSelectionChange={this.onSelectionChange}
          onClick={this.getMessage}
        />
      );
    });
  }

  renderView() {
    const { viewMode } = this.state;

    switch (viewMode) {
      case ViewMode.EDIT:
        return this.renderEditView();

      default:
        return this.renderMessages();
    }
  }

  getPageTokens() {
    if (this.props.messagesResult.loading) {
      return { nextToken: false, prevToken: false };
    }

    let nextToken = false;
    let prevToken = false;

    if (
      this.props.pageTokens.nextPageToken &&
      this.props.pageTokens.nextPageToken.length > 0
    ) {
      nextToken = true;
    }

    if (
      this.props.pageTokens.prevPageToken &&
      this.props.pageTokens.prevPageToken.length > 0
    ) {
      prevToken = true;
    }

    return { nextToken, prevToken };
  }

  render() {
    const collapsed = this.props.sideBarCollapsed;
    const { messagesResult } = this.props;
    const messagesTotal = this.props.totalmessages
      ? this.props.totalmessages
      : 0;
    const { nextToken, prevToken } = this.getPageTokens();

    return (
      <React.Fragment>
        <ListToolbar
          sideBarCollapsed={collapsed}
          sideBarToggle={this.props.sideBarToggle}
          nextToken={nextToken}
          prevToken={prevToken}
          navigateToNextPage={this.props.navigateToNextPage}
          navigateToPrevPage={this.props.navigateToPrevPage}
          getLabelMessages={this.props.getLabelMessages}
          getPageTokens={this.props.getPageTokens}
          loadLabelMessageSingle={this.props.loadLabelMessageSingle}
        />
        <PerfectScrollbar className='container-fluid no-gutters px-0 message-list-container'>
          {this.renderView()}
        </PerfectScrollbar>
        <ListFooter messagesTotal={messagesTotal} />
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => {
  return {
    selectedMessages: state.messageList.selectedMessages,
    selectedFolder:
      state.messagesResult && state.labelsResult.labels
        ? getSelectedFolder(state.labelsResult.labels)
        : '',
    lexon: state.lexon
  };
};

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      addMessage,
      deleteMessage
    },
    dispatch
  );

export default compose(
  withRouter,
  withTranslation(),
  connect(mapStateToProps, mapDispatchToProps)
)(MessageList);

function getSelectedFolder(labels) {
  const lbl = labels.filter(lbl => lbl.selected === true);
  if (lbl.length > 0) {
    return lbl[0].displayName;
  }

  return '';
}
