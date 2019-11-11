import React, { PureComponent } from "react";
import Checkbox from "../../../common/Checkbox";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
  toggleSelected,
  modifyMessages
} from "../actions/message-list.actions";
import Pager from "../pager-buttons/PagerButtons";
import ListActionButtons from "./ListActionButtons";

import { deleteListMessages, addListMessages } from "../actions/message-list.actions";

import { Button } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";

export class MessageToolbar extends PureComponent {
  constructor(props) {
    super(props);

    this.onSelectionChange = this.onSelectionChange.bind(this);
    this.navigateToNextPage = this.navigateToNextPage.bind(this);
    this.navigateToPrevPage = this.navigateToPrevPage.bind(this);
    this.modifyMessages = this.modifyMessages.bind(this);
      
    this.state = {
      selectedMessageIds: []
    };
  }

  onSelectionChange(evt) {
    const checked = evt.target.checked;

    const messageIds = this.props.messagesResult.messages.reduce((acc, el) => {
      acc.push(el.id);
      return acc;
    }, []);

    this.setState({
      selectedMessageIds: messageIds
    });

    this.props.toggleSelected(messageIds, checked);

    window.dispatchEvent(new CustomEvent("CheckAllclick", {
      detail: {
          listMessages: messageIds,
          chkselected : checked
      }         
    }));

    checked ? this.props.addListMessages(messageIds) : this.props.deleteListMessages(messageIds);
  }

  navigateToNextPage() {    
      this.props.messagesResult.paginatioDirectionSelected = "next";    
      this.props.getLabelMessages("", "", "")
  }

  navigateToPrevPage() {    
      this.props.messagesResult.paginatioDirectionSelected = "prev";
      this.props.getLabelMessages("", "", "");
  }

  modifyMessages(addLabelIds, removeLabelIds) {
    const ids = this.props.messagesResult.messages.filter(el => el.selected).map(el => el.id);
    const actionParams = {
      ...addLabelIds && {addLabelIds},
      ...removeLabelIds && {removeLabelIds}
    };
    this.props.modifyMessages({ ids, ...actionParams});
  }

  render() {

    const collapsed = this.props.sideBarCollapsed;

    let checked = false;
    let selectedMessages = [];

    if (this.props.messagesResult) {
      selectedMessages = this.props.messagesResult.messages.filter(el => el.selected);
      checked = this.props.messagesResult.messages.length > 0 &&  selectedMessages.length === this.props.messagesResult.messages.length;
    }

    return (
      <div className="msg-toolbar">
         <div className={collapsed ? "pl-2 py-2 pr-4 d-flex align-items-center bd-highlight" : "pl-2 py-2 pr-4 d-flex align-items-center bd-highlight margin-top-5"}>
          <div className="d-flex align-content-center align-items-center">
           <div className="padding-top-10">
                <span className={collapsed ? "" : "with-side-bar"}>
                   <Button
                      onClick={this.props.sideBarToggle}
                      className="btn-transparent margin-right-10 margin-bottom-10">
                      <FontAwesomeIcon icon={faBars} size="1x" />
                   </Button>
                </span>
                
              <Checkbox checked={checked} onChange={this.onSelectionChange} />
            </div>
            <div />

            <div className="ml-auto p-2 bd-highlight">
              <div>
                {selectedMessages.length ? (
                  <ListActionButtons onClick={this.modifyMessages} />
                ) : null}
              </div>
            </div>
          </div>

          <Pager
            nextToken={this.props.nextToken}
            prevToken={this.props.prevToken}
            navigateToPrevPage={this.navigateToPrevPage}
            navigateToNextPage={this.navigateToNextPage}
            getLabelMessages={this.getLabelMessages}

          />         
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  messagesResult: state.messagesResult,
  selectedMessages: state.messageList.selectedMessages
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MessageToolbar);