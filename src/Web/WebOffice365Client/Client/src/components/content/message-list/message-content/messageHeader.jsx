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
    if (headers) {
      if(name === 'To' && headers.toRecipients.length > 0) {
        let to = ''
        let firtsAddress = headers.toRecipients[0]
        headers.toRecipients.forEach(toRecipient => {
          if(firtsAddress.emailAddress.address === toRecipient.emailAddress.address) {
            to = toRecipient.emailAddress.address + ' ' + to;
          } else {
            to = toRecipient.emailAddress.address + ',  ' + to;
          }
        });
        return to
      }

      if(name === 'Cc' && headers.ccRecipients.length > 0) {
        let cc = ''
        let firtsAddress = headers.ccRecipients[0]
        headers.ccRecipients.forEach(ccRecipient => {
          if(firtsAddress.emailAddress.address === ccRecipient.emailAddress.address) {
            cc = ccRecipient.emailAddress.address + ' ' + cc;
          } else {
            cc = ccRecipient.emailAddress.address + ',  ' + cc;
          }
          
        });
        return cc
      }

      if(name === 'Bcc' && headers.bccRecipients.length > 0) {
        let bcc = ''
        let firtsAddress = headers.bccRecipients[0]
        headers.bccRecipients.forEach(bccRecipient => {
          if(firtsAddress.emailAddress.address === bccRecipient.emailAddress.address) {
            bcc = bccRecipient.emailAddress.address + ' ' + bcc;
          } else {
            bcc = bccRecipient.emailAddress.address + ',  ' + bcc;
          }
        });
        return bcc
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
              <span className="email">Desde: {from.address}</span>
              {this.getHeader("To") ? 
                <>
                  <br />
                  <span className="email">
                    Para: {this.getHeader("To")}
                  </span>
                </> 
              : null} 
              {this.getHeader("Cc") ? 
                <>
                  <br />
                  <span className="email">
                    Cc: {this.getHeader("Cc")}
                  </span>
                </> 
              : null} 
               {this.getHeader("Bcc") ? 
                <>
                  <br />
                  <span className="email">Bcc: {this.getHeader("Bcc")}</span>
                </> 
              : null} 
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
