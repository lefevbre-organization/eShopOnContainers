import React, { PureComponent } from "react";
import { withTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getNameEmail } from "../../../../utils";
import moment from "moment";
import { Button } from "reactstrap";
import { faBars, faReply, faShare } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
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

    replyTo = messageHeaders.from ? messageHeaders.from.emailAddress.address : "";

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

    const replyHeader = `<p>${t("composemessage-toobar.on")} ${parsedDate.format(
      "MMMM Do YYYY, h:mm:ss a"
    )} < ${nameEmail ? nameEmail.email : ""} > ${t("composemessage-toobar.wrote")}:</p>`;

    const composeProps = {
      subject: `Re: ${subject}`,
      to: nameEmail ? nameEmail.email : "",
      content: `<p>&nbsp;</p>
          <p>&nbsp;</p>
          <p>&nbsp;</p>
          ${replyHeader}
          <blockquote>${this.props.messageResult.body.content}</blockquote>`,
      ...(cc && { cc: cc.value })
    };


    const forwardHeader = `<p>${t("composemessage-toobar.on")} ${parsedDate.format(
      "MMMM Do YYYY, h:mm:ss a"
    )} < ${nameEmail.email} > ${t("composemessage-toobar.wrote")}:</p>`;

    const composePropsFwd = {
      ...composeProps,
      subject: `Fwd: ${subject}`,
      to: ""
    };

    const collapsed = this.props.sideBarCollapsed;

    return (
      <div className="d-flex justify-content-center align-items-center message-toolbar">
        <div className="action-btns">
          <span
            className={
              collapsed ? "action-btn mr-2" : "action-btn mr-2 with-side-bar"
            }
          >
            <Button
              onClick={this.props.sideBarToggle}
              className="btn-transparent"
            >
              <FontAwesomeIcon icon={faBars} size="1x" />
            </Button>
          </span>
          <div className="action-btn mr-2">
            <Link
              to={{
                pathname: "/compose",
                search: "",
                sideBarCollapsed: this.props.sideBarCollapsed,
                sideBarToggle: this.props.sideBarToggle,
                state: { composeProps }
              }}
            >
              <FontAwesomeIcon
                title={t("message-toolbar.reply")}
                icon={faReply}
                size="lg"
              />
            </Link>
          </div>
          <div className="action-btn mr-2">
            <Link
              to={{
                pathname: "/compose",
                search: "",
                sideBarCollapsed: this.props.sideBarCollapsed,
                sideBarToggle: this.props.sideBarToggle,
                state: { composeProps: composePropsFwd }
              }}
            >
              <FontAwesomeIcon
                title={t("message-toolbar.resend")}
                icon={faShare}
                size="lg"
              />
            </Link>
          </div>
        </div>
      </div>
    );
  }
}

export default withTranslation()(MessageToolbar);
