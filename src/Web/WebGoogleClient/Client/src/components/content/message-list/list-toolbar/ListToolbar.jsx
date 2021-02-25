import React, { PureComponent } from 'react';
import Checkbox from '../../../common/Checkbox';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  toggleSelected,
  modifyMessages,
  deleteMessages
} from '../actions/message-list.actions';
import Pager from '../pager-buttons/PagerButtons';
import Synkbutton from '../synk-buttons/SynkButtons';
import ListActionButtons from './ListActionButtons';
import {
  deleteListMessages,
  addListMessages,
} from '../actions/message-list.actions';
import { Button } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { getMessage } from '../../../../api';
import i18n from 'i18next';
import {MessagesFilter} from "../filter/filter";

export class MessageToolbar extends PureComponent {
  constructor(props) {
    super(props);

    this.onSelectionChange = this.onSelectionChange.bind(this);
    this.navigateToNextPage = this.navigateToNextPage.bind(this);
    this.navigateToPrevPage = this.navigateToPrevPage.bind(this);
    this.modifyMessages = this.modifyMessages.bind(this);
    this.emptyTrash = this.emptyTrash.bind(this);
    this.getContentByHeader = this.getContentByHeader.bind(this);
    this.getLabelMessagesSynk = this.getLabelMessagesSynk.bind(this);
    this.markAsRead = this.markAsRead.bind(this);
    this.markAsUnread = this.markAsUnread.bind(this);
    this.askEmptyTrash = this.askEmptyTrash.bind(this);

    this.state = {
      selectedMessageIds: [],
      showEmptyTrashConfirmation: false
    };
  }

  async onSelectionChange(evt) {
    const checked = evt.target.checked;

    const messages = this.props.messagesResult.messages.map((msg) => {
      const extMessageId = this.getContentByHeader(msg, 'message-id');
      const subject = this.getContentByHeader(msg, 'subject');
      const sentDateTime = this.getContentByHeader(msg, 'date');

      return {
        id: msg.id,
        subject,
        sentDateTime,
        extMessageId,
        raw: null,
      };
    });

    this.setState({
      selectedMessageIds: messages.map((msg) => msg.id),
    });

    this.props.toggleSelected(messages.map( m => m.id), checked);
    checked
      ? this.props.addListMessages(messages)
      : this.props.deleteListMessages(messages.map((msg) => msg.extMessageId));

    if (checked === true) {
      window.dispatchEvent(new CustomEvent('LoadingMessage'));
      for (let i = 0; i < messages.length; i++) {
        const msgRaw = await getMessage(messages[i].id, 'raw');
        messages[i].raw = msgRaw.result.raw;
        messages[i].attach = msgRaw.result.attach;
      }
    }

    window.dispatchEvent(
      new CustomEvent('CheckAllclick', {
        detail: {
          listMessages: messages.map((msg) => ({
            ...msg,
            id: msg.extMessageId,
            account: this.props.lexon.account,
            folder: getFolderName(i18n.t, this.props.selectedFolder),
            provider: 'GOOGLE',
          })),
          chkselected: checked,
        },
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

  getLabelMessagesSynk() {
    this.props.loadLabelMessageSingle();
  }
  navigateToNextPage() {
    this.props.navigateToNextPage(this.props.nextToken);
  }

  navigateToPrevPage() {
    this.props.navigateToPrevPage(this.props.prevToken);
  }

  markAsRead() {
    this.modifyMessages([], ['UNREAD']);
  }
  markAsUnread() {
    this.modifyMessages(['UNREAD'], []);
  }

  askEmptyTrash() {
    this.setState({showEmptyTrashConfirmation: true});
  }

  emptyTrash() {
    this.setState({showEmptyTrashConfirmation: false}, ()=>{
      const ids = this.props.messagesResult.messages
          .map((el) => el.id);
      this.props.onDeletedMessages(
          this.props.messagesResult.messages.filter((el) => el.selected)
      );
      this.props.deleteMessages({ ids });    })
  }

  modifyMessages(addLabelIds, removeLabelIds) {
    const ids = this.props.messagesResult.messages
        .filter((el) => el.selected)
        .map((el) => el.id);

    if(this.props.selectedFolderId === "TRASH" && addLabelIds[0] === "TRASH") {
      if (this.props.onDeletedMessages && addLabelIds.indexOf('TRASH') > -1) {
        this.props.onDeletedMessages(
            this.props.messagesResult.messages.filter((el) => el.selected)
        );
      }
      this.props.deleteMessages({ ids });
      return;
    }

    const actionParams = {
      ...(addLabelIds && { addLabelIds }),
      ...(removeLabelIds && { removeLabelIds }),
    };

    // Unmark deleted messages
    if (this.props.onDeletedMessages && addLabelIds.indexOf('TRASH') > -1) {
      this.props.onDeletedMessages(
        this.props.messagesResult.messages.filter((el) => el.selected)
      );
    }
    this.props.modifyMessages({ ids, ...actionParams });
  }

  render() {
    const collapsed = this.props.sideBarCollapsed;
    let showUnread = false;
    let showRead = false;

    let checked = false;
    let selectedMessages = [];

    if (this.props.messagesResult) {
      selectedMessages = this.props.messagesResult.messages.filter(
        (el) => el.selected
      );
      checked =
        this.props.messagesResult.messages.length > 0 &&
        selectedMessages.length === this.props.messagesResult.messages.length;
    }

    if (selectedMessages.length > 0) {
      const unread = selectedMessages.filter(
        (msg) => msg.labelIds.indexOf('UNREAD') > -1
      );
      const read = selectedMessages.filter(
        (msg) => msg.labelIds.indexOf('UNREAD') === -1
      );

      showRead = unread.length > 0;
      showUnread = read.length > 0;
    }

    const showEmptyTrash = false;
    // const emptyTrashMessage = i18n.t('message-list.empty-trash-confirmation').replace('%d', this.props.messagesResult.messages.length);
    return (
      <>
        {/*<Confirmation initialModalState={this.state.showEmptyTrashConfirmation}*/}
        {/*              onAccept={this.emptyTrash}*/}
        {/*                        onCancel={() => {*/}
        {/*                          this.setState({showEmptyTrashConfirmation: false})*/}
        {/*                        }}*/}
        {/*                        message={emptyTrashMessage}*/}
        {/*></Confirmation>*/}
        <div className='msg-toolbar'>
          <div className='pl-2 py-2 pr-4 d-flex align-items-center bd-highlight  align-center '>
            <div className='d-flex align-content-center align-items-center '>
              <div className='padding-top-10'>
                <span className={collapsed ? '' : 'with-side-bar'}>
                  <Button
                    onClick={this.props.sideBarToggle}
                    className='btn-transparent margin-right-10 margin-bottom-10'>
                    <FontAwesomeIcon icon={faBars} size='1x' />
                  </Button>
                </span>

                <Checkbox checked={checked} onChange={this.onSelectionChange} />
              </div>
              <div />

              <div className='ml-auto p-2 bd-highlight'>
                <div>
                  {selectedMessages.length ? (
                    <ListActionButtons onClick={this.modifyMessages} folder={this.props.selectedFolderId}/>
                  ) : showEmptyTrash? <div>
                    <div className="action-btn" style={{width: 180, color: '#001978'}} onClick={this.askEmptyTrash}>
                      <span>{i18n.t('message-list.empty-trash')}</span>
                    </div>
                  </div> : ''
                  }
                </div>
              </div>

              {showRead && (
                <div
                  onClick={this.markAsRead}
                  className='action-btn mr-2'
                  title={i18n.t('message-toolbar.read')}>
                  <i style={{}} className='lf-icon lf-icon-mail-open'></i>
                </div>
              )}
              {showUnread && (
                <div
                  style={{ marginLeft: 30 }}
                  onClick={this.markAsUnread}
                  className='action-btn mr-2'
                  title={i18n.t('message-toolbar.unread')}>
                  <i style={{}} className='lf-icon lf-icon-mail'></i>
                </div>
              )}
            </div>

            <div className='right-buttons'>
              <Pager
                nextToken={this.props.nextToken}
                prevToken={this.props.prevToken}
                navigateToPrevPage={this.navigateToPrevPage}
                navigateToNextPage={this.navigateToNextPage}
              />
              <Synkbutton getLabelMessagesSynk={this.getLabelMessagesSynk} />
              <MessagesFilter onChangeFilter={this.props.onChangeFilter}></MessagesFilter>
            </div>
          </div>
        </div>
        <style jsx>{`
          .action-btn > i {
            font-size: 20px;
            font-weight: bold;
            position: absolute;
            top: 22px;
            color: #001978;
          }

          .action-btn:hover > i {
            color: #0056b3;
          }
        `}</style>
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    messagesResult: state.messagesResult,
    selectedMessages: state.messageList.selectedMessages,
    selectedFolderId: state.messagesResult.label ? state.messagesResult.label.result.id : '',
    selectedFolder: state.messagesResult.label
      ? state.messagesResult.label.result.name
      : '',
    lexon: state.lexon,
  }
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      toggleSelected,
      modifyMessages,
      deleteMessages,
      deleteListMessages,
      addListMessages,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(MessageToolbar);

function getFolderName(t, folder) {
  switch (folder) {
    case 'INBOX':
      return i18n.t('sidebar.inbox');
    case 'SENT':
      return i18n.t('sidebar.sent');
    case 'TRASH':
      return i18n.t('sidebar.trash');
    case 'SPAM':
      return i18n.t('sidebar.spam');
    default:
      return folder;
  }
}
