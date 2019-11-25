import React, { Component } from "react";
import { connect } from "react-redux";
import TopBarMessageList from "./top-bar-message-list";
import styles from "./main-bar.scss";
import mainCss from "../../styles/main.scss";

export class TopBar extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const props = this.props;
    const {
      sideBarToggle,
      selectedMessages,
      selectedMessagesAllUnread,
      outbox,
      toggleMessageSeen
    } = props;
    const collapsed = props.sideBarCollapsed;
    let title = props.title;
    if (
      props.selectedFolder &&
      props.selectedFolder.name &&
      props.selectedFolder.type !== FolderTypes.INBOX
    ) {
      //title = `${props.selectedFolder.name} - ${title}`;
      //title = `${props.selectedFolder.name}`;
    }
    return (
      <header
        className={`${styles.topBar}  }
      ${collapsed ? "" : styles["with-side-bar"]}
      ${mainCss["mdc-top-app-bar"]} ${mainCss["mdc-top-app-bar--fixed"]} ${
          styles.divheader
        }`}
      >
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
      </header>
    );
  }
}

export default connect()(TopBar);
