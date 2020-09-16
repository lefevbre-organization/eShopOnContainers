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
import {TreeViewComponent} from "@syncfusion/ej2-react-navigations";

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
      showCheckbox: true
    };

    this.treeViewRef = createRef();
    this.onSelectionChange = this.onSelectionChange.bind(this);
    this.renderView = this.renderView.bind(this);
    this.renderMessages = this.renderMessages.bind(this);
    this.renderMessage = this.renderMessage.bind(this);
    this.getContentByHeader = this.getContentByHeader.bind(this);
    this.onDeletedMessages = this.onDeletedMessages.bind(this);
    this.showMessage = this.showMessage.bind(this);
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

    this.isSentFolder = this.props.parentLabel.id === 'SENT';
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      (prevProps.messagesResult.messages.length > 0 &&
      prevProps.messagesResult.messages.length !==
        this.props.messagesResult.messages.length) || (prevProps.selectedMessages.length > 0 &&
        prevProps.selectedMessages.length !==
        this.props.selectedMessages.length)
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
      window.dispatchEvent(new CustomEvent('LoadingMessage'));
      const msgRaw = await getMessage(msg.id, 'raw');
      message.raw = msgRaw.result;
      //this.props.addMessage(message);
    }

    window.dispatchEvent(
      new CustomEvent('Checkclick', {
        detail: message,
      })
    );

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

  nodeDragging(evt) {
    if(this.state.showCheckbox) {
      this.setState({showCheckbox: false});
    }
    evt.draggedNodeData.isMessage = true;

    if(evt.draggedNodeData.isFolder || !evt.droppedNode) {
      evt.dropIndicator = 'e-no-drop';
      return;
    }
    if (evt.droppedNode != null && evt.droppedNode.getElementsByClassName('message-row-item') && evt.droppedNode.getElementsByClassName('message-row-item').length > 0) {
      evt.dropIndicator = 'e-no-drop';
      return;
    }

    if(evt.droppedNodeData.text === this.props.t('sidebar.more')) {
      evt.dropIndicator = 'e-no-drop';
      return;
    }
  }

  onDropNode(evt) {
    if(evt.draggedNodeData.isFolder && evt.droppedNode.getElementsByClassName('message-row-item') && evt.droppedNode.getElementsByClassName('message-row-item').length > 0) {
        evt.cancel = true;
    }
  }

  nodeDragStop(evt) {
    this.setState({showCheckbox: true});

    if(evt.draggedNodeData.isFolder && evt.droppedNode.getElementsByClassName('message-row-item') && evt.droppedNode.getElementsByClassName('message-row-item').length > 0) {
      alert("Folder")
      evt.cancel = true;
      return;
    }

    if (evt.droppedNode != null && evt.droppedNode.getElementsByClassName('message-row-item') && evt.droppedNode.getElementsByClassName('message-row-item').length > 0) {
      evt.cancel = true;
      return;
    }

    if (evt.droppedNode != null && evt.droppedNode.getElementsByClassName('tree-folder-item') && evt.droppedNode.getElementsByClassName('tree-folder-item').length > 0) {
      setTimeout(()=>{
        const msgs = this.props.messagesResult.messages.filter( msg => msg.selected === true).map(msg => msg.id);
        if(msgs && msgs.length > 0) {
            const lbl = this.props.labels.find( lbl => lbl.name === this.props.selectedFolder);
            if(lbl) {
              // Check all selected messages
              this.moveMessages(msgs, evt.droppedNodeData.id, lbl.id)
            }
        }
      })
      evt.cancel = true;
    }
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

    return (<div className='message-list-tree'>
            <TreeViewComponent
                ref={this.treeViewRef}
                fields={fields}
                delayUpdate={true}
                showCheckBox={this.state.showCheckbox}
                fullRowSelected={true}
                dragArea={"body"}
                nodeDragging={this.nodeDragging.bind(this)}
                nodeDragStop={this.nodeDragStop.bind(this)}
                nodeDropped={this.onDropNode.bind(this)}
                nodeChecked={this.onSelectionChange}
                nodeSelected={this.showMessage}
                nodeTemplate={this.renderMessage}
                allowMultiSelection={true}
                allowDragAndDrop={true}
                cssClass={'message-list'}
            >
            </TreeViewComponent>
          </div>);
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
      this.onSelectionChange(false, messages[i]);
    }
  }

  render() {
    const { messagesResult } = this.props;
    const messagesTotal = messagesResult.label
      ? messagesResult.label.result.messagesTotal
      : 0;
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
        />
        <PerfectScrollbar className='container-fluid no-gutters px-0 message-list-container'>
          {this.renderView()}
        </PerfectScrollbar>
        <ListFooter messagesTotal={messagesTotal} />
      </React.Fragment>
    );
  }

  moveMessages(ids, destination, source) {
    this.modifyMessages(ids, destination, source);
    for(let i = 0; i < ids.length; i++) {
      this.props.removeMessageFromList(ids[i]);
    }
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
