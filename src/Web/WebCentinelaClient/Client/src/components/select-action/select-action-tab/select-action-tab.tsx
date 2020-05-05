import React, { Component } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import i18n from 'i18next';
import TabArchiveMessage from '../tab-archive-message/tab-archive-message';

interface Props {
  user?: string;
  toggleNotification: () => void;
  composerOpen?: boolean;
}

class SelectActionTab extends Component<Props> {
  render() {
    const { user, toggleNotification, composerOpen = false } = this.props;

    return (
      <>
        <Tabs id="uncontrolled-tab-example" bsPrefix="menu-lexon-actions">
          {composerOpen === false && (
            <Tab
              eventKey="connect"
              title={i18n.t('select-action.archive-messages')}
            >
              <TabArchiveMessage
                toggleNotification={toggleNotification}
              ></TabArchiveMessage>
            </Tab>
          )}
          {composerOpen === true && (
            <Tab
              eventKey="attach"
              title={i18n.t('select-action.attach-documents')}
            ></Tab>
          )}
        </Tabs>
        <style jsx>{`
          .menu-lexon-actions a.active:after {
            border-top: 32px solid #ffffff;
          }

          .menu-lexon-actions a {
            padding: 9px 50px 9px 8px;
          }

          .menu-lexon-actions {
            margin-top: 30px;
          }
        `}</style>
      </>
    );
  }
}

export default SelectActionTab;
