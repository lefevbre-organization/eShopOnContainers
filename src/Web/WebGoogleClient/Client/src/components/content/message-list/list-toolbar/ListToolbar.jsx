import React, { PureComponent } from 'react';
import Checkbox from '../../../common/Checkbox';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  toggleSelected,
  modifyMessages
} from '../actions/message-list.actions';
import Pager from '../pager-buttons/PagerButtons';
import Synkbutton from '../synk-buttons/SynkButtons';
import ListActionButtons from './ListActionButtons';
import {
  deleteListMessages,
  addListMessages
} from '../actions/message-list.actions';
import { Button } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { getMessage } from '../../../../api';
import i18n from 'i18next';

export class MessageToolbar extends PureComponent {
  constructor(props) {
    super(props);

    this.onSelectionChange = this.onSelectionChange.bind(this);
    this.navigateToNextPage = this.navigateToNextPage.bind(this);
    this.navigateToPrevPage = this.navigateToPrevPage.bind(this);
    this.modifyMessages = this.modifyMessages.bind(this);
    this.getContentByHeader = this.getContentByHeader.bind(this);
    this.getLabelMessagesSynk = this.getLabelMessagesSynk.bind(this);

    this.state = {
      selectedMessageIds: []
    };
  }

  async onSelectionChange(evt) {
    const checked = evt.target.checked;

    const messages = this.props.messagesResult.messages.map(msg => {
      const extMessageId = this.getContentByHeader(msg, 'message-id');
      const subject = this.getContentByHeader(msg, 'subject');
      const sentDateTime = this.getContentByHeader(msg, 'date');

      return {
        id: msg.id,
        subject,
        sentDateTime,
        extMessageId,
        raw: null
      };
    });

    this.setState({
      selectedMessageIds: messages.map(msg => msg.id)
    });

    this.props.toggleSelected(messages, checked);
    checked
      ? this.props.addListMessages(messages)
      : this.props.deleteListMessages(messages.map(msg => msg.extMessageId));

    if (checked === true) {
      window.dispatchEvent(new CustomEvent('LoadingMessage'));
      for (let i = 0; i < messages.length; i++) {
        const msgRaw = await getMessage(messages[i].id, 'raw');
        messages[i].raw = msgRaw.result;
      }
    }

    window.dispatchEvent(
      new CustomEvent('CheckAllclick', {
        detail: {
          listMessages: messages.map(msg => ({
            ...msg,
            id: msg.extMessageId,
            account: this.props.lexon.account,
            folder: getFolderName(i18n.t, this.props.selectedFolder),
            provider: 'GOOGLE'
          })),
          chkselected: checked
        }
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

  modifyMessages(addLabelIds, removeLabelIds) {
    const ids = this.props.messagesResult.messages
      .filter(el => el.selected)
      .map(el => el.id);
    const actionParams = {
      ...(addLabelIds && { addLabelIds }),
      ...(removeLabelIds && { removeLabelIds })
    };
    this.props.modifyMessages({ ids, ...actionParams });
  }

  render() {
    const collapsed = this.props.sideBarCollapsed;

    let checked = false;
    let selectedMessages = [];

    if (this.props.messagesResult) {
      selectedMessages = this.props.messagesResult.messages.filter(
        el => el.selected
      );
      checked =
        this.props.messagesResult.messages.length > 0 &&
        selectedMessages.length === this.props.messagesResult.messages.length;
    }

    return (
      <div className='msg-toolbar'>
        <div className='pl-2 py-2 pr-4 d-flex align-items-center bd-highlight  align-center '>
          <div className='d-flex align-content-center align-items-center '>
            <div className='padding-top-10'>
              <span className={collapsed ? '' : 'with-side-bar'}>
                <Button
                  onClick={this.props.sideBarToggle}
                  className='btn-transparent margin-right-10 margin-bottom-10'
                >
                  <FontAwesomeIcon icon={faBars} size='1x' />
                </Button>
              </span>

              <Checkbox checked={checked} onChange={this.onSelectionChange} />
            </div>
            <div />

            <div className='ml-auto p-2 bd-highlight'>
              <div>
                {selectedMessages.length ? (
                  <ListActionButtons onClick={this.modifyMessages} />
                ) : null}
              </div>
            </div>
          </div>

          <div className='right-buttons'>
            <Pager
              nextToken={this.props.nextToken}
              prevToken={this.props.prevToken}
              navigateToPrevPage={this.navigateToPrevPage}
              navigateToNextPage={this.navigateToNextPage}
            />
            <Synkbutton getLabelMessagesSynk={this.getLabelMessagesSynk} />
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  messagesResult: state.messagesResult,
  selectedMessages: state.messageList.selectedMessages,
  selectedFolder: state.messagesResult.label
    ? state.messagesResult.label.result.name
    : '',
  lexon: state.lexon
});

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      toggleSelected,
      modifyMessages,
      deleteListMessages,
      addListMessages
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
