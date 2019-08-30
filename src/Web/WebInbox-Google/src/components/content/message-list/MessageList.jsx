import React, { PureComponent } from "react";
import PerfectScrollbar from "react-perfect-scrollbar";
import { withTranslation } from 'react-i18next';

import { bindActionCreators, compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";

import MessageRow from "./message-row/MessageRow";

import { addMessage, deleteMessage } from "./actions/message-list.actions";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import ListToolbar from "./list-toolbar/ListToolbar";
import ListFooter from "./list-footer/ListFooter";
import "./messageList.scss";
import { checked } from "glamor";

const ViewMode = {
  LIST: 1,
  CONTENT: 2,
  EDIT: 3
};

export class MessageList extends PureComponent {
  
  constructor(props) {
    super(props);

    this.state = {
      viewMode: ViewMode.LIST,
      contentMessageId: undefined,
      currentLabel: ""
    };

    this.onSelectionChange = this.onSelectionChange.bind(this);
    this.renderView = this.renderView.bind(this);
    this.renderMessages = this.renderMessages.bind(this);
  }

  componentDidMount() {
    const searchParam = this.props.location.search;
    const token = searchParam.indexOf("?") === 0 ? searchParam.slice(1) : null;

    if (token && this.props.messagesResult.pageTokens.length === 0) {
      this.props.addInitialPageToken(token);
    }

    const labelIds = this.props.searchQuery === "" ? [this.props.parentLabel.id] : undefined;

    this.props.getLabelMessages({
      ...labelIds && {labelIds},
      pageToken: token
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.location.search !== this.props.location.search) {
      const searchParam = this.props.location.search;
      const token = searchParam.indexOf("?") === 0 ? searchParam.slice(1) : null;

      const labelIds = this.props.searchQuery === "" ? [this.props.parentLabel.id] : undefined;

      this.props.getLabelMessages({
        ...labelIds && {labelIds},
        pageToken: token
      });
    }
  }


  onSelectionChange(selected, msgId) {
      this.props.toggleSelected([msgId], selected);
      //e.emit('received', { text: "Id: " + msgId + " selected: " + selected })
      window.dispatchEvent(new CustomEvent("Checkclick", {
          detail: {
              name: msgId,
              chkselected : selected
          }         
      }));
      
      selected ? this.props.addMessage(msgId) : this.props.deleteMessage(msgId);
  }
  

  renderSpinner() {
    return (
      <div className="d-flex h-100 justify-content-center align-items-center  ">
        <FontAwesomeIcon icon={faSpinner} spin size="3x" />
      </div>
    );
  }

  renderMessages() {   
    const { t } = this.props;

    if (this.props.messagesResult.loading) {
      return this.renderSpinner();
    } else if (this.props.messagesResult.messages.length === 0) {
      return (
        <div className="p-4 text-center">        
            {t('message-list.no-message')}
        </div>
      );
    }

    return this.props.messagesResult.messages.map(el => {
      if (this.props.selectedMessages.find(x => x.id === el.id)) {
        el.selected = true;
      }

      return (
        <MessageRow
          data={el}
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
      return { nextToken: null, prevToken: null }
    }
    const { messagesResult, location } = this.props;
    const pathname = location.pathname;
    let prevToken;
    let nextToken = messagesResult.nextPageToken;
    const searchParam = location.search;
    const currentToken = searchParam.indexOf("?") === 0 ? searchParam.slice(1) : null;
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
      }
      else {
        prevToken = pathname;
      }
    }
    nextToken = nextToken ? `${pathname}?${nextToken}` : null;
    return { nextToken, prevToken };
  }

  render() {
    const { messagesResult } = this.props;
    const messagesTotal = messagesResult.label ? messagesResult.label.result.messagesTotal : 0;
    const { nextToken, prevToken } = this.getPageTokens();
          
    return (
      <React.Fragment>       
        <ListToolbar
          nextToken={nextToken}
          prevToken={prevToken}
          navigateToNextPage={this.props.navigateToNextPage}
          navigateToPrevPage={this.props.navigateToPrevPage}
        />
        <PerfectScrollbar className="container-fluid no-gutters px-0 message-list-container">
          {this.renderView()}
        </PerfectScrollbar>
        <ListFooter messagesTotal={messagesTotal} />
      </React.Fragment>
    );
  }  
}

const mapStateToProps = (state) => {
  return {
      selectedMessages: state.messageList.selectedMessages
  }    
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
  connect(
      mapStateToProps,
      mapDispatchToProps
  )
)(MessageList);
