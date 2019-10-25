import React, { Component } from "react";
import "./select-action-tab.css";
import PropTypes from "prop-types";
import { Tabs, Tab } from "react-bootstrap";

import TabClassify from "../tab-classify/tab-classify";
import TabKeepRecord from "../tab-keeprecord/tab-keeprecord";

class SelectActionTab extends Component {
  render() {
    const { user, toggleNotification } = this.props;

    return (
      <Tabs
        defaultActiveKey="classify"
        id="uncontrolled-tab-example"
        bsPrefix="menu-lexon-actions"
      >
        <Tab eventKey="classify" title="Clasificar">
          <TabClassify 
            user={user}
            toggleNotification={toggleNotification}
          />
        </Tab>
        <Tab eventKey="keeprecord" title="Documentar">
          <TabKeepRecord user={user} />
        </Tab>
      </Tabs>
    );
  }
}

SelectActionTab.propTypes = {
  user: PropTypes.string.isRequired,
  toggleNotification: PropTypes.func.isRequired
};

export default SelectActionTab;
