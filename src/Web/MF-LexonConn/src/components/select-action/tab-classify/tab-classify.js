import React, { Component, Fragment } from "react";
import "./tab-classify.css";
import PropTypes from "prop-types";

import NewClassification from "../new-classification/new-classification";
import ListClassifications from "../list-classifications/list-classifications";

class TabClassify extends Component {
  render() {
    const { user } = this.props;

    return (
      <Fragment>
        <NewClassification user={user} />
        <ListClassifications user={user} />
      </Fragment>
    );
  }
}

TabClassify.propTypes = {
  user: PropTypes.string.isRequired
};

export default TabClassify;
