import React, { Component } from "react";
import "./select-action-tab.css";
import PropTypes from "prop-types";
import { Tabs, Tab } from "react-bootstrap";

import TabClassify from "../tab-classify/tab-classify";
import TabKeepRecord from "../tab-keeprecord/tab-keeprecord";

class SelectActionTab extends Component {
  render() {
    return (
      <Tabs defaultActiveKey="classify" id="uncontrolled-tab-example">
        <Tab eventKey="classify" title="Clasificar">
          <TabClassify />
        </Tab>
        <Tab eventKey="keeprecord" title="Documentar">
          <TabKeepRecord />
        </Tab>
      </Tabs>
    );
  }
}

SelectActionTab.propTypes = {};

export default SelectActionTab;
