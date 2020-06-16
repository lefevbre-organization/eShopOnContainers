import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ConfirmDeleteFromTrashDialog from './confirm-delete-from-trash-dialog';
import TopBarMessageList from './top-bar-message-list';
import TopBarMessageViewer from './top-bar-message-viewer';
import TopBarMessageEditor from './top-bar-message-editor';
import { getSelectedFolder } from '../../selectors/folders';
import { getCredentials } from '../../selectors/application';
import { findTrashFolder, FolderTypes } from '../../services/folder';
import {
  forwardMessage,
  replyMessage,
  clearSelectedMessage,
} from '../../services/application';
import {
  deleteMessages,
  moveMessages,
  setMessagesSeen,
} from '../../services/message';
import styles from './top-bar.scss';
import mainCss from '../../styles/main.scss';

export class TopBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      deletingFromTrash: false,
      deletingFromTrashConfirm: () => {},
    };

    this.onForwardMessage = this.onForwardMessage.bind(this);
    this.onReplyMessage = this.onReplyMessage.bind(this);
  }

  onReplyMessage() {
    this.props.replyMessage(this.props.lexon.sign);
  }

  onForwardMessage() {
    this.props.forwardMessage(this.props.lexon.sign);
  }

  render() {
    const props = this.props;
    const {
      sideBarToggle,
      selectedMessages,
      selectedMessagesAllUnread,
      outbox,
      toggleMessageSeen,
    } = props;
    const collapsed = props.sideBarCollapsed;
    const isEditing =
      props.newMessage && Object.keys(props.newMessage).length > 0;
    const isMessageViewer =
      props.selectedMessage && Object.keys(props.selectedMessage).length > 0;
    let title = props.title;
    if (
      props.selectedFolder &&
      props.selectedFolder.name &&
      props.selectedFolder.type !== FolderTypes.INBOX
    ) {
      //title = `${props.selectedFolder.name} - ${title}`;
      title = `${props.selectedFolder.name}`;
    }
    return (
      <header
        className={`${styles.topBar}  }
      ${collapsed ? '' : styles['with-side-bar']}
      ${mainCss['mdc-top-app-bar']} ${mainCss['mdc-top-app-bar--fixed']} ${
          styles.divheader
        }`}>
        {!isEditing && !isMessageViewer && (
          <TopBarMessageList
            title={title}
            collapsed={collapsed}
            sideBarToggle={sideBarToggle}
            selectedMessages={selectedMessages}
            onDeleteClick={() => this.onDelete(props.deleteMessages)}
            selectedMessagesAllUnread={selectedMessagesAllUnread}
            onMarkReadClick={() => props.setMessagesSeen(true)}
            onMarkUnreadClick={() => props.setMessagesSeen(false)}
          />
        )}
        {!isEditing && isMessageViewer && (
          <TopBarMessageViewer
            collapsed={collapsed}
            sideBarToggle={sideBarToggle}
            clearSelectedMessage={props.clearSelectedMessage}
            outboxEmpty={outbox === null}
            onReplyMessageClick={this.onReplyMessage}
            onForwardMessageClick={this.onForwardMessage}
            onDeleteClick={() => this.onDelete(props.deleteMessage)}
            onMarkUnreadClick={toggleMessageSeen}
          />
        )}
        {isEditing && (
          <TopBarMessageEditor
            title={title}
            collapsed={collapsed}
            sideBarToggle={sideBarToggle}
          />
        )}
        <ConfirmDeleteFromTrashDialog
          visible={this.state.deletingFromTrash}
          deleteAction={this.state.deletingFromTrashConfirm}
          cancelAction={() => this.setState({ deletingFromTrash: false })}
        />
      </header>
    );
  }

  onDelete(action) {
    if (this.props.selectedFolder.tsype === FolderTypes.TRASH) {
      this.setState({
        deletingFromTrash: true,
        deletingFromTrashConfirm: () => {
          action();
          this.setState({ deletingFromTrash: false });
        },
      });
    } else {
      // Uncheck messages from Lexon
      for (let i = 0; i < this.props.selectedMessages.length; i++) {
        window.dispatchEvent(
          new CustomEvent('RemoveSelectedDocument', {
            detail: {
              ...this.props.selectedMessages[i],
              id: this.props.selectedMessages[i].messageId,
            },
          })
        );
      }

      action();
    }
  }
}

TopBar.propTypes = {
  title: PropTypes.string,
  newMessage: PropTypes.object,
  selectedFolder: PropTypes.object,
  selectedMessagesIds: PropTypes.array,
  selectedMessages: PropTypes.array,
  selectedMessage: PropTypes.object,
  selectedMessagesAllUnread: PropTypes.bool,
  clearSelectedMessage: PropTypes.func,
  sideBarToggle: PropTypes.func.isRequired,
  sideBarCollapsed: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => {
  const selectedMessagesIds = state.messages.selected;
  const messages =
    state.application.selectedFolderId &&
    state.messages.cache[state.application.selectedFolderId]
      ? Array.from(
          state.messages.cache[state.application.selectedFolderId].values()
        )
      : [];
  const selectedMessages = messages.filter(
    (m) => selectedMessagesIds.indexOf(m.messageId) > -1
  );
  const selectedMessagesAllUnread =
    selectedMessages.filter((m) => m.seen === true).length === 0;
  return {
    title: state.application.title,
    newMessage: state.application.newMessage,
    outbox: state.application.outbox,
    selectedFolder: getSelectedFolder(state) || null,
    selectedMessagesIds: selectedMessagesIds,
    selectedMessages: selectedMessages,
    selectedMessage: state.application.selectedMessage,
    selectedMessagesAllUnread: selectedMessagesAllUnread,
    credentials: getCredentials(state),
    folders: state.folders,
    lexon: state.lexon,
    messages: messages,
  };
};

const mapDispatchToProps = (dispatch) => ({
  clearSelectedMessage: () => clearSelectedMessage(dispatch),
  replyMessage: (selectedMessaage, sign) =>
    replyMessage(dispatch, selectedMessaage, sign),
  forwardMessage: (selectedMessaage, sign) =>
    forwardMessage(dispatch, selectedMessaage, sign),
  deleteMessage: (credentials, folders, selectedFolder, selectedMessage) => {
    const trashFolder = findTrashFolder(folders);
    if (selectedMessage && selectedFolder && trashFolder) {
      if (selectedFolder === trashFolder) {
        deleteMessages(dispatch, credentials, selectedFolder, [
          selectedMessage,
        ]);
      } else {
        moveMessages(dispatch, credentials, selectedFolder, trashFolder, [
          selectedMessage,
        ]);
      }
      clearSelectedMessage(dispatch);
    }
  },
  toggleMessageSeen: (credentials, selectedFolder, selectedMessage) => {
    setMessagesSeen(
      dispatch,
      credentials,
      selectedFolder,
      [selectedMessage],
      !selectedMessage.seen
    );
    clearSelectedMessage(dispatch);
  },
  deleteMessages: (credentials, folders, selectedFolder, selectedMessages) => {
    const trashFolder = findTrashFolder(folders);
    if (selectedMessages.length > 0 && selectedFolder && trashFolder) {
      if (selectedFolder === trashFolder) {
        deleteMessages(dispatch, credentials, selectedFolder, selectedMessages);
      } else {
        moveMessages(
          dispatch,
          credentials,
          selectedFolder,
          trashFolder,
          selectedMessages
        );
      }
    }
  },
  setMessagesSeen: (credentials, selectedFolder, selectedMessages, seen) => {
    if (selectedMessages.length > 0 && selectedFolder) {
      setMessagesSeen(
        dispatch,
        credentials,
        selectedFolder,
        selectedMessages,
        seen
      );
    }
  },
});

const mergeProps = (stateProps, dispatchProps, ownProps) =>
  Object.assign({}, stateProps, dispatchProps, ownProps, {
    replyMessage: (sign) =>
      dispatchProps.replyMessage(stateProps.selectedMessage, sign),
    forwardMessage: (sign) =>
      dispatchProps.forwardMessage(stateProps.selectedMessage, sign),
    deleteMessage: () =>
      dispatchProps.deleteMessage(
        stateProps.credentials,
        stateProps.folders,
        stateProps.selectedFolder,
        stateProps.selectedMessage
      ),
    toggleMessageSeen: () =>
      dispatchProps.toggleMessageSeen(
        stateProps.credentials,
        stateProps.selectedFolder,
        stateProps.selectedMessage
      ),
    deleteMessages: () =>
      dispatchProps.deleteMessages(
        stateProps.credentials,
        stateProps.folders,
        stateProps.selectedFolder,
        stateProps.selectedMessages
      ),
    setMessagesSeen: (seen) =>
      dispatchProps.setMessagesSeen(
        stateProps.credentials,
        stateProps.selectedFolder,
        stateProps.selectedMessages,
        seen
      ),
  });

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(TopBar);
