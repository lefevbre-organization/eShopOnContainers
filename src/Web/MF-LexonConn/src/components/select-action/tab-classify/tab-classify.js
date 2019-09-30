import React, { Component, Fragment } from "react";
import "./tab-classify.css";
import PropTypes from "prop-types";

import NewClassification from "../new-classification/new-classification";
import ListClassifications from "../list-classifications/list-classifications";

class TabClassify extends Component {
  render() {
    const { user, toggleClassifyEmails } = this.props;

    return (
      <Fragment>
        <NewClassification
          user={user}
          toggleClassifyEmails={toggleClassifyEmails}
        />
        <ListClassifications user={user} />
      </Fragment>
    );
  }
}

TabClassify.propTypes = {
  user: PropTypes.string.isRequired,
  toggleClassifyEmails: PropTypes.func.isRequired
};

export default TabClassify;
