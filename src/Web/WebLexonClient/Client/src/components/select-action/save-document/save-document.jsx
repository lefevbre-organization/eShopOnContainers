import React, { Component } from "react";
import "./save-document.css";
import PropTypes from "prop-types";
import i18n from "i18next";
import { connect } from "react-redux";
import ACTIONS from "../../../actions/documentsAction";

class SaveDocument extends Component {
  constructor(props) {
    super(props);

    this._handleOnClick = this._handleOnClick.bind(this);
  }

  _handleOnClick(e) {
    this.props.toggleModalDocuments();
  }

  render() {
    const { selectedMessages } = this.props;

    if (selectedMessages.length === 0) {
      return (
        <p className="add-more-container add-more">
          <span className="lf-icon-add-round"></span>
          <strong>{i18n.t("save-copy.save-copy")}</strong>
        </p>
      );
    }

    return (
      <p className="add-more-container">
        <span className="add-more" onClick={this._handleOnClick}>
          <span className="lf-icon-add-round"></span>
          <strong>{i18n.t("save-copy.save-copy")}</strong>
        </span>
        <style jsx>{`
          .add-more {
            cursor: pointer;
          }
        `}</style>
      </p>
    );
  }
}

SaveDocument.propTypes = {
  user: PropTypes.any.isRequired
};

const mapStateToProps = state => {
  return {
    selectedMessages: state.email.selectedMessages,
    showModalDocuments: state.documentsReducer.showModalDocuments
  };
};

const mapDispatchToProps = dispatch => ({
  toggleModalDocuments: () => dispatch(ACTIONS.toggleModalDocuments())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SaveDocument);
