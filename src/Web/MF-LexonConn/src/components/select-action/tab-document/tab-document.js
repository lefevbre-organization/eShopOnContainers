import React, { Component } from "react";
import "./tab-document.css";
import PropTypes from "prop-types";

class TabDocument extends Component {
  render() {
    return <div>Documentar</div>;
  }
}

TabDocument.propTypes = {
  user: PropTypes.string.isRequired
};

export default TabDocument;
