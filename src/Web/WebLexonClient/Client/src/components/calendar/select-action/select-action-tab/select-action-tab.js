import React, { Component } from 'react';
import './select-action-tab.css';
import PropTypes from 'prop-types';
import { Tabs, Tab } from 'react-bootstrap';
import i18n from 'i18next';

import TabConnectMessage from '../tab-connect-message/tab-connect-message';
import TabAttachDocument from '../tab-attach-document/tab-attach-document';

class SelectActionTab extends Component {
  render() {
    const { user, toggleNotification, composerOpen = false } = this.props;

    return (
      <Tabs id='uncontrolled-tab-example' bsPrefix='menu-lexon-actions'>
        {composerOpen === false && (
          <Tab
            eventKey='connect'
            title={i18n.t('select-action.connect-messages')}>
            <TabConnectMessage
              user={user}
              toggleNotification={toggleNotification}
            />
          </Tab>
        )}
        {composerOpen === true && (
          <Tab
            eventKey='attach'
            title={i18n.t('select-action.attach-documents')}>
            <TabAttachDocument
              user={user}
              toggleNotification={toggleNotification}
            />
          </Tab>
        )}
      </Tabs>
    );
  }
}

SelectActionTab.propTypes = {
  user: PropTypes.string.isRequired,
  toggleNotification: PropTypes.func.isRequired
};

export default SelectActionTab;
