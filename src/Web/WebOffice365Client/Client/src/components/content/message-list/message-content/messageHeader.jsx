import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { bindActionCreators, compose } from "redux";
import { getEmailHeaderMessage } from "../actions/message-list.actions";
import "./messageHeader.scss";

class MessageHeader extends Component {
  constructor(props) {
    super(props);

    this.onFolderClick = this.onFolderClick.bind(this);
  }

  componentDidMount() {
    const messageId = this.props.match.params.id;
    this.props.getEmailHeaderMessage(messageId);
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
        return labels[i].displayName;
      }
    }
    return null;
  }

  render() {
    const { headers } = this.props.emailHeaderMessageResult;
    let from = { name: "", address: ""};
    if(headers && headers.from && headers.from.emailAddress) {
      from.name = headers.from.emailAddress.name;
      from.address = headers.from.emailAddress.address;
    }

    return (
      <div className="messageViewer">
        <div className="header">
          <h1 className="subject">
            {headers !== null ? headers.subject : null}
            <div
              className="folder"
              onClick={() => this.onFolderClick("folder")}
            >
              <div> {this.getLabelSelected()} </div>
            </div>
          </h1>
          <div className="fromDate">
            <div className="from">
              <span className="fromName">{from.name}</span>
              <span className="email">{from.address}</span>
            </div>
            <div className="date">
              {new Date((headers !== null ? headers.sentDateTime : null)).toLocaleString(
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
