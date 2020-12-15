import React, {Component, createRef} from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { withTranslation } from 'react-i18next';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import MessageRow from './message-row/MessageRow';
import {addMessage, deleteMessage, modifyMessages, removeMessageFromList} from './actions/message-list.actions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import ListToolbar from './list-toolbar/ListToolbar';
import ListFooter from './list-footer/ListFooter';
import './messageList.scss';
import {getMessage, getLabelSentItems, moveMessages} from '../../../api_graph';

const ViewMode = {
  LIST: 1,
  CONTENT: 2,
  EDIT: 3,
};

export class MessageList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      firstPage: false,
      viewMode: ViewMode.LIST,
      contentMessageId: undefined,
      currentLabel: '',
      activeFilter: ''
    };

    this.onSelectionChange = this.onSelectionChange.bind(this);
    this.renderView = this.renderView.bind(this);
    this.renderMessages = this.renderMessages.bind(this);
    this.onDeletedMessages = this.onDeletedMessages.bind(this);
    this.renderMessage = this.renderMessage.bind(this);
    this.showMessage = this.showMessage.bind(this);
    this.onChangeFilter = this.onChangeFilter.bind(this);
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
      pageToken: token,
    });

    const response = await getLabelSentItems();
    if (response) {
      this.isSentFolder = response.id === this.props.parentLabel.id;
    }
  }

  componentWillUnmount() {
    this.props.setSearchQuery("");
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
        pageToken: token,
      });
    }
  }

  async onSelectionChange(data) {
    const selected = data.action === 'check';
    let msg;
    if(data && data.data && data.data.length >= 1) {
      const { id } = data.data[0];
      console.log(this.props.messagesResult.messages);
      msg = this.props.messagesResult.messages.find( m => m.id === id);
    }

    if(!msg) return;
    if(msg.selected !== selected) {
      this.props.toggleSelected([msg.id], selected);
    }
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
      raw: null,
    };

    selected
      ? this.props.addMessage(message)
      : this.props.deleteMessage(message.extMessageId);

    if (selected === true) {
      window.dispatchEvent(new CustomEvent('LoadingMessage'));
      const msgRaw = await getMessage(msg.id, 'raw');
      message.raw = msgRaw;
      //this.props.addMessage(message);
    }

    window.dispatchEvent(
      new CustomEvent('Checkclick', {
        detail: message,
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

  renderMessage(msg) {
    if (this.props.selectedMessages.find((x) => x.id === msg.id)) {
      msg.selected = true;
    } else {
      msg.selected = false;
    }
    return (
        <MessageRow
            data={msg}
            isSent={this.isSentFolder}
            key={msg.id}
            onSelectionChange={this.onSelectionChange}
            onClick={this.getMessage}
            showCheckbox={this.state.showCheckbox}
        />
    );
  }

  showMessage(evt) {
    const { nodeData } = evt;
    this.props.history.push(`/${nodeData.id}`);
  }

  renderMessages() {
    const { t } = this.props;
    const _this = this;
    const aux = [...this.props.messagesResult.messages.map( m => ({...m, selected: false }))]
    for(let i = 0; i < this.props.selectedMessages.length;i++) {
      const m = aux.find( m => m.id === this.props.selectedMessages[i].id);
      if(m) {
        m.selected = true;
      }
    }
    const fields = { dataSource: aux,  isChecked: 'selected', selected: 'selected'};

    if (this.props.messagesResult.loading) {
      return this.renderSpinner();
    } else if (
      this.props.messagesResult &&
      this.props.messagesResult.messages &&
      this.props.messagesResult.messages.length === 0
    ) {
      return (
        <div className='p-4 text-center'>{t('message-list.no-message')}</div>
      );
    }

    let filteredMessages;
    if(this.state.activeFilter === '') {
      filteredMessages = this.props.messagesResult.messages;
    } else if(this.state.activeFilter === 'read') {
      filteredMessages = this.props.messagesResult.messages.filter( (msg)=> {
        return msg.isRead;
      });
    } else if(this.state.activeFilter === 'unread') {
      filteredMessages = this.props.messagesResult.messages.filter( (msg)=> {
        return !msg.isRead;
      });
    }

    return filteredMessages.map((el) => {
      if (_this.props.selectedMessages.find((x) => x.id === el.id)) {
        el.selected = true;
      } else {
        el.selected = false;
      }

      return (
          <MessageRow
              onStart={this.onStart}
              onDrag={this.onDrag}
              onStop={this.onStop}
              data={el}
              isSent={this.isSentFolder}
              key={el.id}
              onSelectionChange={this.onSelectionChange}
              onClick={()=> {
                this.getMessage(); } }
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

    console.log(
      'this.props.pageTokens.nextPageToken: ' +
        this.props.pageTokens.nextPageToken
    );
    console.log(
      'this.props.pageTokens.prevPageToken: ' +
        this.props.pageTokens.prevPageToken
    );

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

  onDeletedMessages(messages) {
    for (let i = 0; i < messages.length; i++) {
      this.onSelectionChange({
        action: "uncheck",
        data: [{
          id: messages[i].id
        }]
      });
    }
  }

  onChangeFilter(filter) {
    this.setState({activeFilter: filter}, ()=>{
      const { activeFilter } = this.state;
      if(activeFilter === 'unread') {
        this.props.setSearchQuery("$filter=isRead ne true");
        this.props.getLabelMessages({labelIds: this.props.parentLabel.id, q: "$filter=isRead ne true"});
      } else if(activeFilter === 'read') {
        this.props.setSearchQuery("$filter=isRead ne false");
        this.props.getLabelMessages({labelIds: this.props.parentLabel.id, q: "$filter=isRead ne false"});
      } else {
        this.props.setSearchQuery("");
        this.props.getLabelMessages({labelIds: this.props.parentLabel.id, q: ''});
      }
    })
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
          onDeletedMessages={this.onDeletedMessages}
          onChangeFilter={this.onChangeFilter}
        />
        <PerfectScrollbar className='container-fluid no-gutters px-0 message-list-container'>
          {this.renderView()}
        </PerfectScrollbar>
        <ListFooter messagesTotal={messagesTotal} />
      </React.Fragment>
    );
  }

  moveMessages(ids, destination, source) {
    for(let i = 0; i < ids.length; i++) {
      this.onSelectionChange({
        action: 'uncheck',
        data: [{
          id: ids[i]
        }]
      });
      this.props.removeMessageFromList(ids[i]);
    }
    moveMessages({ ids, destination})
  }

}

const mapStateToProps = (state) => {
  return {
    selectedMessages: state.messageList.selectedMessages,
    selectedFolder:
      state.messagesResult && state.labelsResult.labels
        ? getSelectedFolder(state.labelsResult.labels)
        : '',
    lexon: state.lexon,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      addMessage,
      deleteMessage,
      modifyMessages,
      removeMessageFromList,
    },
    dispatch
  );

export default compose(
  withRouter,
  withTranslation(),
  connect(mapStateToProps, mapDispatchToProps)
)(MessageList);

function getSelectedFolder(labels) {
  const lbl = labels.filter((lbl) => lbl.selected === true);
  if (lbl.length > 0) {
    return lbl[0].displayName;
  }

  return '';
}
