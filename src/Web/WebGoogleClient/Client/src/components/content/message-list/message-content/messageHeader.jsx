import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { bindActionCreators, compose } from "redux";
import { getEmailHeaderMessage } from "../actions/message-list.actions";
import "./messageHeader.scss";
import i18n from "i18next";

class MessageHeader extends Component {
  constructor(props) {
    super(props);

    this.onFolderClick = this.onFolderClick.bind(this);
  }

  componentDidMount() {
    const messageId = this.props.match.params.id;
    this.props.getEmailHeaderMessage(messageId);

    console.log(
      "emailHeaderMessageResult.headers ->",
      this.props.emailHeaderMessageResult.headers
    );
    console.log("labelsResult ->", this.props.labelsResult);
  }

  onFolderClick(folder) {
    this.props.history.goBack();
  }

  getHeader(name) {
    const { headers } = this.props.emailHeaderMessageResult;

    if (Array.isArray(headers)) {
      for (var i = 0; i < headers.length; i++) {
        if (headers[i].name === name) {
          return headers[i].value;
        }
      }
    } else {
      return null;
    }
    return null;
  }

  getLabelSelected() {
    const { labels } = this.props.labelsResult;

    for (var i = 0; i < labels.length; i++) {
      if (labels[i].selected === true) {
        return labels[i].name;
      }
    }
    return null;
  }

  getTraductionLabel(label) {
    switch (label) {
      case "INBOX":
        return i18n.t("sidebar.inbox");
      case "SENT":
        return i18n.t("sidebar.sent");
      case "TRASH":
        return i18n.t("sidebar.trash");
      case "SPAM":
        return i18n.t("sidebar.spam");

      default:
        return label;
    }
  }

  render() {
    return (
      <div className="messageViewer">
        <div className="header">
          <h1 className="subject">
            {this.getHeader("Subject")}
            <div
              className="folder"
              onClick={() => this.onFolderClick("folder")}
            >
              <div> {this.getTraductionLabel(this.getLabelSelected())} </div>
            </div>
          </h1>
          <div className="fromDate">
            <div className="from">
              <span className="fromName">{this.getHeader("From")}</span>
              <span className="email">{this.getHeader("To")}</span>
            </div>
            <div className="date">
              {new Date(this.getHeader("Date")).toLocaleString(
                navigator.language,
                {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit"
                }
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  emailHeaderMessageResult: state.emailHeaderMessageResult,
  labelsResult: state.labelsResult
});

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      getEmailHeaderMessage
    },
    dispatch
  );

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(MessageHeader);
