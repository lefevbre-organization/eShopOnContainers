import React, { Component } from 'react';
import {
  PAGE_SELECT_COMPANY,
  PAGE_SELECT_ACTION,
  PAGE_CONFIGURATION,
  PAGE_ARCHIVEFILE,
  PAGE_ARCHIVE_DOCUMENT_ADDON,
  PAGE_ATTACH_DOCUMENT_ADDON
} from '../../constants';
import { connect } from 'react-redux';
import SelectAction from '../select-action/select-action';
import AddonArchiveDocument from '../select-action/addon-archive-document/addon-archive-document';
import AddonAttachDocuments from '../select-action/addon-attach-document/addon-attach-documents';
import { AppState } from '../../store/store';

interface State {
  actualPage: string;
}

interface Props {
  composerOpen: boolean;
  toggleNotification: () => void;
  addonType?: string;
  addonData?: any;
}

class Routing extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    
    let actualPage = PAGE_SELECT_ACTION;

    this.state = {
      actualPage: actualPage,
    };
    this.changePage = this.changePage.bind(this);
  }

  componentDidUpdate(prevProps: Props) {
    if(prevProps.addonType !== this.props.addonType) {
     let page = this.props.addonType == 'MessageCompose' 
     ? PAGE_ATTACH_DOCUMENT_ADDON : 
     PAGE_ARCHIVE_DOCUMENT_ADDON;
      this.changePage(page);
    }
  }

  changePage(page: string) {
    this.setState({ actualPage: page });
  }

  renderPage() {
    const { actualPage } = this.state;
    const { 
      toggleNotification, 
      composerOpen, 
      addonData 
    } = this.props;

    switch (actualPage) {
      case PAGE_SELECT_COMPANY:
        return <div>PAGE_SELECT_COMPANY</div>;

      case PAGE_ARCHIVEFILE:
        return <div>PAGE_SELECT_COMPANY</div>;

      case PAGE_SELECT_ACTION:
        return (
          <SelectAction
            changePage={this.changePage}
            toggleNotification={toggleNotification}
            composerOpen={composerOpen}
          />
        );

      case PAGE_CONFIGURATION:
        return <div>PAGE_CONFIGURATION</div>;

      case PAGE_ARCHIVE_DOCUMENT_ADDON: 
      return (
        <AddonArchiveDocument 
          toggleNotification={toggleNotification}
          addonData={addonData}
        />
      );

      case PAGE_ATTACH_DOCUMENT_ADDON: 
      return (
        <AddonAttachDocuments 
          toggleNotification={toggleNotification}
          addonData={addonData}
        />
      );

      default:
        return <div>default</div>;
    }
  }

  render() {
    return (
      <React.Fragment>
        {/* {this.state.actualPage === PAGE_SELECT_ACTION && (
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
        )} */}
        {this.renderPage()}
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state: AppState) => {
  return {
    errors: state.application.errors,
    composerOpen: state.application.composerStatus === 'open',
  };
};

export default connect(mapStateToProps)(Routing);
