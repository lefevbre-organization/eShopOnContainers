import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  PAGE_SELECT_COMPANY,
  PAGE_SELECT_ACTION,
  PAGE_CASEFILE,
  PAGE_CONFIGURATION,
  PAGE_MESSAGE_CLASSIFICATIONS,
  PAGE_DOCUMENT_ATTACHED, PAGE_IMPORT_EVENTS
} from '../../constants';
import SelectCompany from '../select-company/select-company';
import CaseFile from '../case-file/case-file';
import SelectAction from '../select-action/select-action';
import Configuration from '../configuration/configuration';
import MessageClassifications from '../addon-conecting-emails/addon-conecting-emails';
import AddonAttachDocument from '../addon-attach-documents/addon-attach-documents';
import { connect } from 'react-redux';
import CalendarSelectAction from "../calendar/select-action/select-action";
import ModalImportEvents from "../calendar/modal-import-events/modal-import-events";

class Routing extends Component {
  constructor(props) {
    super(props);
    let actualPage = PAGE_SELECT_COMPANY;

    if (props.app === 'calendar:import') {
      actualPage = PAGE_IMPORT_EVENTS;
    } else {
      if (props.casefile !== null && props.casefile !== undefined) {
        actualPage = PAGE_CASEFILE;
      } else if (props.addonData &&
          props.addonData.addonType === "MessageRead") {
        actualPage = PAGE_MESSAGE_CLASSIFICATIONS;
      } else if (props.addonData &&
          props.addonData.addonType === "MessageCompose") {
        actualPage = PAGE_DOCUMENT_ATTACHED;
      }
    }

    this.state = {
      actualPage: actualPage
    };

    this.changePage = this.changePage.bind(this);
  }

  changePage(page) {
    this.setState({actualPage: page});
  }

  renderPage() {
    const { actualPage } = this.state;
    const {
      addonData,
      user,
      companies,
      toggleNotification,
      casefile,
      bbdd,
      company,
      composerOpen
    } = this.props;

    switch (actualPage) {
      case PAGE_SELECT_COMPANY:
        return (
          <SelectCompany
            user={user}
            companies={companies}
            changePage={this.changePage}
          />
        );
      case PAGE_CASEFILE:
        return (
          <CaseFile
            user={user}
            changePage={this.changePage}
            idCaseFile={casefile}
            bbdd={bbdd}
            idCompany={company}
          />
        );
      case PAGE_SELECT_ACTION:
        return (
          <SelectAction
            composerOpen={composerOpen}
            user={user}
            companies={companies}
            changePage={this.changePage}
            toggleNotification={toggleNotification}
          />
        );
      case PAGE_CONFIGURATION:
        return (
          <Configuration
            user={user}
            companies={companies}
            changePage={this.changePage}
            toggleNotification={toggleNotification}
          />
        );

      case PAGE_MESSAGE_CLASSIFICATIONS:
        return (
          <MessageClassifications 
            user={user} 
            bbddAddon={bbdd}
            addonData={addonData}
            toggleNotification={toggleNotification}
          />
        );

      case PAGE_DOCUMENT_ATTACHED: 
        return (
          <AddonAttachDocument 
           user={user} 
           bbddAddon={bbdd}
           addonData={addonData}
           toggleNotification={toggleNotification}
          />
        );
      case PAGE_IMPORT_EVENTS:
        return (
            <ModalImportEvents
                user={user}
                bbddAddon={bbdd}
                addonData={addonData}
                toggleNotification={toggleNotification}
            />
        );

      default:
        return <SelectCompany changePage={this.changePage} />;
    }
  }


  renderCalendarPage() {
    const { actualPage } = this.state;
    const {
      addonData,
      user,
      companies,
      toggleNotification,
      casefile,
      bbdd,
      company,
      composerOpen
    } = this.props;

    switch (actualPage) {
      case PAGE_SELECT_COMPANY:
        return (
            <SelectCompany
                user={user}
                companies={companies}
                changePage={this.changePage}
            />
        );
      case PAGE_CASEFILE:
        return (
            <CaseFile
                user={user}
                changePage={this.changePage}
                idCaseFile={casefile}
                bbdd={bbdd}
                idCompany={company}
            />
        );
      case PAGE_SELECT_ACTION:
        return (
            <CalendarSelectAction
                composerOpen={composerOpen}
                user={user}
                companies={companies}
                changePage={this.changePage}
                toggleNotification={toggleNotification}
            />
        );
      case PAGE_CONFIGURATION:
        return (
            <Configuration
                user={user}
                companies={companies}
                changePage={this.changePage}
                toggleNotification={toggleNotification}
            />
        );

      case PAGE_MESSAGE_CLASSIFICATIONS:
        return (
            <MessageClassifications
                user={user}
                bbddAddon={bbdd}
                addonData={addonData}
                toggleNotification={toggleNotification}
            />
        );

      case PAGE_DOCUMENT_ATTACHED:
        return (
            <AddonAttachDocument
                user={user}
                bbddAddon={bbdd}
                addonData={addonData}
                toggleNotification={toggleNotification}
            />
        );

      default:
        return <SelectCompany changePage={this.changePage} />;
    }
  }


  render() {
    if(this.props.app === 'calendar') {
      return <React.Fragment>
        {this.renderCalendarPage()}
      </React.Fragment>
    }

    return (
      <React.Fragment>
        {this.state.actualPage === PAGE_SELECT_ACTION && (
          <div
            className='lex-on-configuration'
            onClick={() => {
              this.changePage(PAGE_CONFIGURATION);
            }}>
            <a href='#/' className='lex-on-configuration-trigger'>
              <strong className='sr-only sr-only-focusable'>
                Opciones de configuración
              </strong>
              <span className='lf-icon-configuration'></span>
            </a>
          </div>
        )}
        {this.renderPage()}
      </React.Fragment>
    );
  }
}

Routing.propTypes = {
  user: PropTypes.string.isRequired,
  companies: PropTypes.array.isRequired,
  toggleNotification: PropTypes.func.isRequired
};

const mapStateToProps = state => {
  return {
    app: state.selections.app,
    errors: state.applicationReducer.errors,
    composerOpen: state.applicationReducer.isComposerOpen
  };
};

export default connect(mapStateToProps)(Routing);
