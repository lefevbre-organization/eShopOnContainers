import React, { Component, Fragment } from "react";
import "./tab-document.css";
import PropTypes from "prop-types";
import SaveDocument from "../save-document/save-document";
import i18n from "i18next";
import { connect } from "react-redux";
import ModalDocumentsEmails from "../../../modal-documents-emails/modal-documents-emails";

class TabDocument extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showSaveDocument: false,
      showDocuments: false
    };
  }

  componentDidMount() {
    const { selectedMessages } = this.props;

    if (selectedMessages.length > 0) {
      this.setState({ showSaveDocument: true });
    } else {
      this.setState({ showSaveDocument: false });
    }

    if (selectedMessages.length === 1) {
      this.setState({ showDocuments: true });
      this.getDocuments(this.props.selectedMessages[0]);
    } else {
      this.setState({ showDocuments: false });
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.selectedMessages !== prevProps.selectedMessages) {
      if (this.props.selectedMessages.length > 0) {
        this.setState({ showSaveDocument: true });
      } else {
        this.setState({ showSaveDocument: false });
      }

      if (this.props.selectedMessages.length === 1) {
        this.getDocuments(this.props.selectedMessages[0]);
      } else {
        this.setState({ classifications: [], showDocuments: false });
      }
    }
  }

  getDocuments(mailId) {
    this.setState({ showDocuments: true });
  }

  renderShowSaveDocument() {
    const { showSaveDocument } = this.state;
    const { user } = this.props;

    if (showSaveDocument) {
      return (
        <SaveDocument
          user={user}
        />
      );
    } else {
      return <strong>{i18n.t("tab-document.select-mail")}</strong>;
    }
  }

  render() {
    return (
      <Fragment>
        <ModalDocumentsEmails />
        {this.renderShowDocuments()}
      </Fragment>
    );
  }
}

TabDocument.propTypes = {
  user: PropTypes.string.isRequired
};

const mapStateToProps = state => {
  return {
    selectedMessages: state.email.selectedMessages,
    companySelected: state.selections.companySelected
  };
};

export default connect(mapStateToProps)(TabDocument);
