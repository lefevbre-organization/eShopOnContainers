import React, { Component, Fragment } from "react";
import "./tab-classify.css";
import PropTypes from "prop-types";

import NewClassification from "../new-classification/new-classification";

class TabClassify extends Component {
  render() {
    return (
      <Fragment>
        <NewClassification />
      </Fragment>
    );
  }
}

TabClassify.propTypes = {};

export default TabClassify;
