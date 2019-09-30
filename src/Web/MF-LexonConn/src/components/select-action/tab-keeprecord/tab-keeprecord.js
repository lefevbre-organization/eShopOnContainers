import React, { Component } from "react";
import "./tab-keeprecord.css";
import PropTypes from "prop-types";

class TabKeepRecord extends Component {
  render() {
    return <div>Documentar</div>;
  }
}

TabKeepRecord.propTypes = {
  user: PropTypes.string.isRequired
};

export default TabKeepRecord;
