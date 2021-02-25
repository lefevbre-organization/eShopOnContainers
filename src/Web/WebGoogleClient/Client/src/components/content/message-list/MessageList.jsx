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
import { getMessage } from '../../../api';

const ViewMode = {
  LIST: 1,
  CONTENT: 2,
  EDIT: 3,
};

const months = {
  Jan: '01',
  Feb: '02',
  Mar: '03',
  Apr: '04',
  May: '05',
  Jun: '06',
  Jul: '07',
  Aug: '08',
  Sep: '09',
  Oct: '10',
  Nov: '11',
  Dec: '12',
};

export class MessageList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      viewMode: ViewMode.LIST,
      contentMessageId: undefined,
      currentLabel: '',
      activeFilter: ''
    };

    this.onSelectionChange = this.onSelectionChange.bind(this);
    this.renderView = this.renderView.bind(this);
    this.renderMessages = this.renderMessages.bind(this);
    this.getContentByHeader = this.getContentByHeader.bind(this);
    this.onDeletedMessages = this.onDeletedMessages.bind(this);
    this.showMessage = this.showMessage.bind(this);
    this.onChangeFilter = this.onChangeFilter.bind(this);
    this.isSentFolder = false;
  }

  async componentDidMount() {
    console.log('MessageList componenDidMount');
    const searchParam = this.props.location.search;
    const token = searchParam.indexOf('?') === 0 ? searchParam.slice(1) : null;

    if (token && this.props.messagesResult.pageTokens.length === 0) {
      this.props.addInitialPageToken(token);
    }

    const labelIds = this.props.searchQuery === '' ? [this.props.parentLabel.id] : undefined;

    this.props.getLabelMessages({
      ...(labelIds && { labelIds }),
      pageToken: token,
    });

    this.isSentFolder = this.props.parentLabel.id === 'SENT';
  }

  componentWillUnmount() {
    console.log('MessageList componentWillUnmount');
    this.props.setSearchQuery("");
  }

  componentDidUpdate(prevProps, prevState) {
    console.log('MessageList componentDidUpdate');
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
    const extMessageId = this.getContentByHeader(msg, 'Message-Id');
    console.log('MessageId:' + extMessageId);
    const message = {
      id: msg.id,
      extMessageId,
      subject: this.getContentByHeader(msg, 'Subject'),
      sentDateTime: this.getContentByHeader(msg, 'Date'),
      folder: getFolderName(this.props.t, this.props.selectedFolder),
      provider: 'GOOGLE',
      account: this.props.lexon.account,
      chkselected: selected,
      raw: null,
    };

    selected
      ? this.props.addMessage(message)
      : this.props.deleteMessage(message.extMessageId);

    if (selected === true) {
      console.log('SE EJECUTA EL DE MESSAGELIST');
      window.dispatchEvent(new CustomEvent('LoadingMessage', {detail: extMessageId}));
      const msgRaw = await getMessage(msg.id, 'raw');
      message.raw = msgRaw.result.raw;
      message.attach = msgRaw.result.attach;
      //this.props.addMessage(message);
    }

    window.dispatchEvent(
      new CustomEvent('Checkclick', {
        detail: message,
      })
    );
    message.raw = null;

    window.dispatchEvent(new CustomEvent('LoadedMessage'));
  }

  getContentByHeader(message, header) {
    for (let i = 0; i < message.payload.headers.length; i++) {
      if (
        message.payload.headers[i].name.toUpperCase() === header.toUpperCase()
      ) {
        return message.payload.headers[i].value;
      }
    }
  }

  renderSpinner() {
    return (
      <div className='d-flex h-100 justify-content-center align-items-center  '>
        <FontAwesomeIcon icon={faSpinner} spin size='3x' />
      </div>
    );
  }

  showMessage(evt) {
    const { nodeData } = evt;
    this.props.history.push(`/${nodeData.id}`);
  }

  modifyMessage(id, addLabelIds, removeLabelIds) {
    this.props.modifyMessages({ ids: [id], addLabelIds: [addLabelIds], removeLabelIds: [removeLabelIds] });
  }

  modifyMessages(ids, addLabelIds, removeLabelIds) {
    this.props.modifyMessages({ ids, addLabelIds: [addLabelIds], removeLabelIds: [removeLabelIds] });
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
    } else if (this.props.messagesResult.messages.length === 0) {
      return (
        <div className='p-4 text-center'>{t('message-list.no-message')}</div>
      );
    }

     return this.props.messagesResult.messages.map((el) => {
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
      return { nextToken: null, prevToken: null };
    }
    const { messagesResult, location } = this.props;
    const pathname = location.pathname;
    let prevToken;
    let nextToken = messagesResult.nextPageToken;
    const searchParam = location.search;
    const currentToken =
      searchParam.indexOf('?') === 0 ? searchParam.slice(1) : null;
    if (currentToken) {
      const tokenIndex = messagesResult.pageTokens.indexOf(currentToken);
      if (tokenIndex > -1) {
        nextToken = messagesResult.pageTokens[tokenIndex + 1];
        prevToken = messagesResult.pageTokens[tokenIndex - 1];
        if (!prevToken) {
          if (tokenIndex > 0) {
          }
        }
        prevToken = prevToken ? `${pathname}?${prevToken}` : pathname;
      } else {
        prevToken = pathname;
      }
    }
    nextToken = nextToken ? `${pathname}?${nextToken}` : null;
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
        this.props.setSearchQuery("is:unread");
        this.props.getLabelMessages({labelIds: [this.props.parentLabel.id], q: "is:unread"});
      } else if(activeFilter === 'read') {
        this.props.setSearchQuery("is:read");
        this.props.getLabelMessages({labelIds: [this.props.parentLabel.id], q: "is:unread"});
      } else {
        this.props.setSearchQuery("");
        this.props.getLabelMessages({labelIds: [this.props.parentLabel.id], q: ''});
      }
    })
  }

  render() {
    const { messagesResult } = this.props;
    const messagesTotal = messagesResult.messages.length;
    const { nextToken, prevToken } = this.getPageTokens();

    const collapsed = this.props.sideBarCollapsed;

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
    // uncheck messages
    for(let i = 0; i < ids.length; i++) {
      this.onSelectionChange({
        action: 'uncheck',
        data: [{
          id: ids[i]
        }]
      });
      this.props.removeMessageFromList(ids[i]);
    }

    this.modifyMessages(ids, destination, source);
  }
}

const mapStateToProps = (state) => {
  return {
    labels: state.labelsResult.labels,
    selectedMessages: state.messageList.selectedMessages,
    selectedFolder: state.messagesResult.label
      ? state.messagesResult.label.result.name
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
      removeMessageFromList
    },
    dispatch
  );

export default compose(
  withRouter,
  withTranslation(),
  connect(mapStateToProps, mapDispatchToProps)
)(MessageList);

function getFolderName(t, folder) {
  switch (folder) {
    case 'INBOX':
      return t('sidebar.inbox');
    case 'SENT':
      return t('sidebar.sent');
    case 'TRASH':
      return t('sidebar.trash');
    case 'SPAM':
      return t('sidebar.spam');
    default:
      return folder;
  }
}
