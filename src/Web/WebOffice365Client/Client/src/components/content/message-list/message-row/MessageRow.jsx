import React, { PureComponent } from "react";
import { withRouter } from "react-router-dom";
import moment from "moment";
import MesssageCheckbox from "./MessageCheckbox";

import NameSubjectFields from "./NameSubjectFields";
import AttachmentDateFields from "./AttachmentDateFields";
import { getNameEmail } from "../../../../utils";

export class MessageItem extends PureComponent {
  constructor(props) {
    super(props);

    this.onSelectionChange = this.onSelectionChange.bind(this);
    this.getMessage = this.getMessage.bind(this);
  }

  onSelectionChange(evt) {
    this.props.onSelectionChange(evt.target.checked, this.props.data.id);
  }

  getMessage(evt) {
    const EncodeIdMessage = encodeURI(this.props.data.id);
    this.props.history.push(`/${EncodeIdMessage}`);
  }

  getFromName(from) {
    const nameEmail = getNameEmail(from);
    return nameEmail.name;
  }

  getFormattedDate(date, fallbackDateObj) {
    let messageDate = moment(date);
    if (!messageDate.isValid()) {
      messageDate = moment(fallbackDateObj.parserFn(fallbackDateObj.date));
    }
    const nowDate = moment(new Date());
    const isMessageFromToday =
      messageDate.format("YYYYMMDD") === nowDate.format("YYYYMMDD");
    let formattedDate;
    if (isMessageFromToday) {
      formattedDate = messageDate.format("h:mm A");
    } else {
      if (messageDate.year() !== nowDate.year()) {
        formattedDate = messageDate.format("YYYY/MM/DD");
      } else {
        formattedDate = messageDate.format("MMM D");
      }
    }
    return formattedDate;
  }

  render() {
    const date = this.props.data.receivedDateTime;
    let formattedDate = this.getFormattedDate(date, {
      date: this.props.data.internalDate,
      parserFn: parseInt
    });
    const unread = this.props.data.isRead === false ? " font-weight-bold" : "";
    const selected = "";
    const subject = this.props.data.subject;
    let fromName = "";

    //For unusual cases taht the data.from.emailAddress not exist -  to-do Alberto
    //(ask for undefined object)
    try {
      // const fromHeader =
      //   this.props.data.from.emailAddress.name.toUpperCase() +
      //   " " +
      //   this.props.data.from.emailAddress.address;
      if(this.props.isSent === false) {
        fromName = this.props.data.from.emailAddress.name;
      } else {
        fromName = this.props.data.toRecipients[0].emailAddress.name;
      }

    } catch {
      // const fromHeader = "";
    }

    return (
      <div className={`d-flex table-row-wrapper${selected}`}>
        <MesssageCheckbox
          selected={this.props.data.selected}
          onChange={this.onSelectionChange}
        />
        <div
          onClick={this.getMessage}
          className={`table-row px-2 py-3${unread}`}
        >
          <NameSubjectFields fromName={fromName} subject={subject} />
          <AttachmentDateFields
            formattedDate={formattedDate}
            hasAttachment={
              //this.props.data.payload.mimeType === "multipart/mixed"
              this.props.data.hasAttachments
            }
          />
        </div>
      </div>
    );
  }
}

export default withRouter(MessageItem);
