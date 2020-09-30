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
      <React.Fragment>
        <Tabs id='uncontrolled-tab-example' bsPrefix='menu-lexon-actions'>
            <Tab
              eventKey='connect'
              title={i18n.t('select-action.connect-messages')}>
              <TabConnectMessage
                user={user}
                toggleNotification={toggleNotification}
              />
            </Tab>
        </Tabs>
        <style jsx>{`
          .menu-lexon-actions.menu-lexon-actions-tabs {
            padding-bottom: 4px;
          }
          
          .menu-lexon-actions a {
          padding: 13px 50px 7px 8px;
          }
        `}</style>
      </React.Fragment>
    );
  }
}

SelectActionTab.propTypes = {
  user: PropTypes.object.isRequired,
  toggleNotification: PropTypes.func.isRequired
};

export default SelectActionTab;
