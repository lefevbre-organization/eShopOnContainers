import React, { Component } from "react";
import "./select-action-tab.css";
import PropTypes from "prop-types";
import { Tabs, Tab } from "react-bootstrap";
import i18n from "i18next";

import TabClassify from "../tab-classify/tab-classify";
import TabDocument from "../tab-document/tab-document";
import TabConnectMessage from "../tab-connect-message/tab-connect-message";

class SelectActionTab extends Component {
  render() {
    const { user, toggleNotification } = this.props;

    return (
      <Tabs
        defaultActiveKey="classify"
        id="uncontrolled-tab-example"
        bsPrefix="menu-lexon-actions"
      >
        <Tab eventKey="classify" title={i18n.t("select-action.connect-messages")}>
          <TabConnectMessage userNavision={user} />
        </Tab>

        {/* <Tab eventKey="classify" title="Clasificar">
          <TabClassify
            user={user}
            toggleNotification={toggleNotification}
          />
        </Tab>
        <Tab eventKey="document" title="Documentar">
          <TabDocument userNavision={user} />
        </Tab> */}
      </Tabs>
    );
  }
}

SelectActionTab.propTypes = {
  user: PropTypes.string.isRequired,
  toggleNotification: PropTypes.func.isRequired
};

export default SelectActionTab;
