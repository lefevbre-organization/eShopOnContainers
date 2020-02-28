import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { translate } from "react-i18next";
import PropTypes from "prop-types";
import { AutoSizer, List } from "react-virtualized";
import Checkbox from "../form/checkbox/checkbox";
import Spinner from "../spinner/spinner";
import ClearFolderListItem from "./clear-folder-list-item";
import { DroppablePayloadTypes } from "../folders/folder-list";
import { getCredentials } from "../../selectors/application";
import { getSelectedFolder } from "../../selectors/folders";
import { getSelectedFolderMessageList } from "../../selectors/messages";
import { prettyDate, prettySize } from "../../services/prettify";
import { selectMessage } from "../../actions/application";
import { setSelected } from "../../actions/messages";
import { preloadMessages, setMessageFlagged } from "../../services/message";
import { readMessage } from "../../services/message-read";
import PerfectScrollbar from "react-perfect-scrollbar";
import "react-perfect-scrollbar/dist/css/styles.css";
import mainCss from "../../styles/main.scss";
import styles from "./message-list.scss";

function parseFrom(from) {
  const firstFrom = from && from.length > 0 ? from[0] : "";
  const formattedFrom = firstFrom.match(/^\"(.*)\"/);
  return formattedFrom !== null ? formattedFrom[1] : firstFrom;
}

function parseTo(recipients) {
  let to = "";

  if(recipients && recipients.length && recipients.length > 0) {
    const rec = recipients[0];
    to = rec.address || "";
  }

  return to;
}

function _dragImage(t, messages, x, y) {
  const imageNode = document.createElement("span");
  imageNode.draggable = true;
  imageNode.style.opacity = "1";
  imageNode.style.position = "absolute";
  imageNode.style.top = `${Math.max(0, y)}px`;
  imageNode.style.left = `${Math.max(0, x)}px`;
  imageNode.style.pointerEvents = "none";
  imageNode.style.padding = "6px";
  imageNode.style.backgroundColor = "white";
  imageNode.innerHTML = t("messageList.moveEmails", {
    emailCount: messages.length
  });
  return imageNode;
}

class MessageList extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className={`${styles.messageList} ${this.props.className}`}>
        <Spinner
          visible={
            this.props.activeRequests > 0 && this.props.messages.length === 0
          }
        />
        {this.props.messages.length === 0 ? null : (
          <Fragment>
            <ClearFolderListItem />
            <PerfectScrollbar>
              <ul className={`${mainCss["mdc-list"]} ${styles.list}`}>
                <AutoSizer defaultHeight={100}>
                  {({ height, width }) => (
                    <List
                      className={styles.virtualList}
                      height={height}
                      width={width}
                      rowRenderer={this.renderItem.bind(this)}
                      rowCount={this.props.messages.length}
                      rowHeight={52}
                    />
                  )}
                </AutoSizer>
              </ul>
            </PerfectScrollbar>
          </Fragment>
        )}
        {this.props.activeRequests > 0 && this.props.messages.length > 0 ? (
          <Spinner
            className={styles.listSpinner}
            canvasClassName={styles.listSpinnerCanvas}
          />
        ) : null}
      </div>
    );
  }

  componentDidMount() {
    this.preloadMessages({ messages: [] });
  }

  componentDidUpdate(previousProps) {
    this.preloadMessages(previousProps);
  }

  renderItem({ index, key, style }) {
    const folder = this.props.selectedFolder;
    const message = this.props.messages[index];
    const selected = this.props.selectedMessages.indexOf(message.messageId) > -1;
    return (
      <li
        key={key}
        style={style}
        draggable={true}
        onDragStart={event => this.onDragStart(event, folder, message)}
        className={`${mainCss["mdc-list-item"]}
                ${styles.item}
                ${message.seen ? styles.seen : ""}
                ${message.deleted ? styles.deleted : ""}`}
      >
        <Checkbox
          id={message.messageId}
          onChange={event => this.selectMessage(event, message)}
          checked={selected}
        />
        <span
          className={styles.itemDetails}
          onClick={() => this.props.messageClicked(message)}
          draggable={true}
          onDragStart={event => this.onDragStart(event, folder, message)}
        >
          { folder.type.attribute !== '\\Sent' && <span className={styles.from}>{parseFrom(message.from)}</span>}
          { folder.type.attribute === '\\Sent' && <span className={styles.from}>{parseTo(message.recipients)}</span>}
          <span
            className={`material-icons ${styles.flag} ${message.flagged &&
              styles.flagged}`}
            onClick={event => {
              event.stopPropagation();
              this.props.toggleMessageFlagged(message);
            }}
          >
            {"outlined_flag"}
          </span>
          <span className={styles.subject}>{message.subject}</span>
          <span className={styles.receivedDate}>
            {prettyDate(message.receivedDate)}
          </span>
          <span className={styles.size}>{prettySize(message.size)}</span>
        </span>
      </li>
    );
  }

  onDragStart(event, fromFolder, message) {
    event.stopPropagation();
    const payload = { type: DroppablePayloadTypes.MESSAGES, fromFolder };
    if (this.props.selectedMessages.length > 0) {
      // Prevent dragging single messages when there is a selection and message is not part of the selection
      if (this.props.selectedMessages.indexOf(message.messageId) < 0) {
        event.preventDefault();
        return;
      }
      const messages = this.props.messages.filter(
        m => this.props.selectedMessages.indexOf(m.messageId) > -1
      );
      if (event.dataTransfer.setDragImage) {
        const image = _dragImage(
          this.props.t,
          messages,
          event.pageX,
          event.pageY
        );
        const appendedImage = document.body.appendChild(image);
        setTimeout(() => document.body.removeChild(appendedImage));
        event.dataTransfer.setDragImage(image, -8, -16);
      }
      payload.messages = messages;
    } else {
      payload.messages = [message];
    }
    event.dataTransfer.setData("application/json", JSON.stringify(payload));
  }

  /**
   * Select/unselects the message for which the checkbox is changed.
   *
   * If the shift key is pressed, and it's a select operation, a range of messages will be selected. The range will be
   * the one consisting in the last selected message and the current message in any direction.
   *
   * @param event
   * @param message
   */
  selectMessage(event, message) {
    event.stopPropagation();
    const checked = event.target.checked;
    if (
      checked &&
      event.nativeEvent &&
      event.nativeEvent.shiftKey &&
      this.props.selectedMessages.length > 0
    ) {
      // Range selection
      const messagesToSelect = [];
      const lastSelectedMessageUid = this.props.selectedMessages[
        this.props.selectedMessages.length - 1
      ];
      let selecting = false;
      this.props.messages.forEach(m => {
        if (m.messageId === message.messageId || m.messageId === lastSelectedMessageUid) {
          selecting = !selecting;
          messagesToSelect.push(m);
        } else if (selecting) {
          messagesToSelect.push(m);
        }
      });
      this.props.messageSelected(messagesToSelect, checked, this.props.selectedFolder.fullName);

      for(let i = 0; i < messagesToSelect.length; i++) {
        const message = messagesToSelect[i];
        window.dispatchEvent(
          new CustomEvent("Checkclick", {
            detail: {
              id: message.messageId,
              extMessageId: message.messageId,
              subject: message.subject,
              sentDateTime: message.receivedDate,
              chkselected: checked,
              account: this.props.all.login.formValues.user,
              folder: this.props.selectedFolder.fullName,
              provider: "IMAP"
            }
          })
        );
      }
    } else {
      // Single selection
      this.props.messageSelected([message], checked, this.props.selectedFolder.fullName);
      // Send message to connectors
      window.dispatchEvent(
        new CustomEvent("Checkclick", {
          detail: {
            id: message.messageId,
            extMessageId: message.messageId,
            subject: message.subject,
            sentDateTime: message.receivedDate,
            chkselected: checked,
            account: this.props.all.login.formValues.user,
            folder: this.props.selectedFolder.fullName,
            provider: "IMAP"
          }
        })
      );
      console.log("Checkclick:" + message.messageId + " Folder:" + this.props.selectedFolder.fullName + " Account:" + this.props.all.login.formValues.user );
    }
  }

  /**
   * Preloads latest received messages whenever <b>new</b> messages are loaded in the list
   */
  preloadMessages(previousProps) {
    const messagesToPreload = 15;
    const previousIds = previousProps.messages
      .slice(0, messagesToPreload)
      .map(m => m.messageId);
    const currentIds = this.props.messages
      .slice(0, messagesToPreload)
      .map(m => m.messageId);
    if (currentIds.some(id => !previousIds.includes(id))) {
      const latestMessagesUids = this.props.messages
        .slice(0, messagesToPreload)
        .filter(
          m => !Object.keys(this.props.downloadedMessages).includes(m.messageId)
        )
        .map(m => m.messageId);
      console.log(this.props.all);
      this.props.preloadMessages(this.props.selectedFolder, latestMessagesUids);
    }
  }
}

MessageList.propTypes = {
  className: PropTypes.string,
  selectedMessages: PropTypes.array
};

MessageList.defaultProps = {
  className: "",
  selectedMessages: []
};

const mapStateToProps = state => ({
  credentials: getCredentials(state),
  selectedFolder: getSelectedFolder(state) || {},
  activeRequests: state.messages.activeRequests,
  messages: getSelectedFolderMessageList(state),
  selectedMessages: state.messages.selected,
  downloadedMessages: state.application.downloadedMessages,
  all: state
});

const mapDispatchToProps = dispatch => ({
  messageClicked: (credentials, downloadedMessages, folder, message) => {
    dispatch(selectMessage(message));
    readMessage(dispatch, credentials, downloadedMessages, folder, message);
  },
  messageSelected: (messages, selected, folderName) =>
    dispatch(setSelected(messages, selected, folderName)),
  preloadMessages: (credentials, folder, messageUids) =>
    preloadMessages(dispatch, credentials, folder, messageUids),
  toggleMessageFlagged: (credentials, folder, message) =>
    setMessageFlagged(dispatch, credentials, folder, message, !message.flagged)
});

const mergeProps = (stateProps, dispatchProps, ownProps) =>
  Object.assign({}, stateProps, dispatchProps, ownProps, {
    messageClicked: message =>
      dispatchProps.messageClicked(
        stateProps.credentials,
        stateProps.downloadedMessages,
        stateProps.selectedFolder,
        message
      ),
    preloadMessages: (folder, messageUids) =>
      dispatchProps.preloadMessages(
        stateProps.credentials,
        folder,
        messageUids
      ),
    toggleMessageFlagged: message =>
      dispatchProps.toggleMessageFlagged(
        stateProps.credentials,
        stateProps.selectedFolder,
        message
      )
  });

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(translate()(MessageList));