import React, { Component } from "react";
import "./save-document.css";
import PropTypes from "prop-types";
import i18n from "i18next";
import { connect } from "react-redux";
import ACTIONS from "../../../../actions/documentsAction";

class SaveDocument extends Component {
  constructor(props) {
    super(props);

    this._handleOnClick = this._handleOnClick.bind(this);
  }

  _handleOnClick() {
    this.props.toggleModalDocuments();
  }

  render() {
    return (
        <React.Fragment>
      <p className="add-more-container">
        <a href="#/" className="add-more" onClick={this._handleOnClick}>
          <span className="lf-icon-add-round"></span>
          <strong>{i18n.t("save-copy.save-copy")}</strong>
        </a>
      </p>
    <style jsx>{`
          .add-more-container {
            position: absolute;
            top: 100px;
            left: calc(100% - 190px);
          }
        `}</style>
        </React.Fragment>
    );
  }
}

SaveDocument.propTypes = {
  user: PropTypes.string.isRequired
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