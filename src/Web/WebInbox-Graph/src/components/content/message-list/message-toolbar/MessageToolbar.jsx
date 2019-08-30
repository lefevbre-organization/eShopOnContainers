import React, { PureComponent } from "react";
import { withTranslation } from 'react-i18next';

import ComposeMessage from "../../../compose-message/ComposeMessage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faReply } from "@fortawesome/free-solid-svg-icons";
import { getNameEmail } from "../../../../utils";
import moment from "moment";
import "./messageToolbar.scss";

export class MessageToolbar extends PureComponent {
  constructor(props) {
    super(props);
    this.trashHandler = this.getClickHandler(["TRASH"]);
  }

  getClickHandler(action) {
    return evt => {
      this.props.onClick(action);
    };
  }

  render() {
    const { t } = this.props;

    if (!this.props.messageResult.result) {
      return null;
    }

    const message = this.props.messageResult.result;
    const { messageHeaders } = message;

    let replyTo, cc, subject;
    subject = messageHeaders.subject;    

    replyTo = messageHeaders.from.emailAddress.address;      

    for (let i = 0; i < messageHeaders.ccRecipients.length; i++) {
        cc = messageHeaders.ccRecipients[i].emailAddress.address;
    }

    const nameEmail = getNameEmail(replyTo);    
    let parsedDate = moment(messageHeaders.receivedDateTime);

    if (!parsedDate.isValid()) {
      parsedDate = moment(
        parseInt(this.props.messageResult.result.internalDate)
      );
    }
    const replyHeader = `<p>On ${parsedDate.format("MMMM Do YYYY, h:mm:ss a")} < ${nameEmail.email} > wrote:</p>`;

    const composeProps = {
      subject: `Re: ${subject}`,
      to: nameEmail.email,
      content: `<p>&nbsp;</p>
          <p>&nbsp;</p>
          <p>&nbsp;</p>
          ${replyHeader}
          <blockquote>${this.props.messageResult.body.content}</blockquote>`,
      ...(cc && { cc: cc.value })
    };

    return (
      <div className="d-flex justify-content-center align-items-center message-toolbar">
        <div className="action-btns">
          <div className="action-btn mr-2">
            <button className="btn" onClick={this.trashHandler}>
              <FontAwesomeIcon
                title={t('message-toolbar.move-to-trash')}               
                icon={faTrash}
                size="lg"
              />
            </button>
          </div>
          <div className="action-btn mr-2">
            <ComposeMessage {...composeProps}>
              <button className="btn">
                <FontAwesomeIcon
                  title={t('message-toolbar.reply')}
                  icon={faReply}
                  size="lg"
                />
              </button>
            </ComposeMessage>
          </div>
        </div>
      </div>
    );
  }
}

export default withTranslation()(MessageToolbar);
