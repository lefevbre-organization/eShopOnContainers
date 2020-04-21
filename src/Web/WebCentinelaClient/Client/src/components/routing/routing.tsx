import React, { Component } from 'react';
import {
  PAGE_SELECT_COMPANY,
  PAGE_SELECT_ACTION,
  PAGE_CONFIGURATION,
  PAGE_ARCHIVEFILE
} from '../../constants';
import { connect } from 'react-redux';
import SelectAction from '../select-action/select-action';
import { AppState } from '../../store/store';

interface State {
  actualPage: string;
}

interface Props {
  toggleNotification: () => void;
}

class Routing extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    let actualPage = PAGE_SELECT_ACTION;

    this.state = {
      actualPage: actualPage
    };

    this.changePage = this.changePage.bind(this);
  }

  changePage(page: string) {
    this.setState({ actualPage: page });
  }

  renderPage() {
    const { actualPage } = this.state;
    const { toggleNotification } = this.props;

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
          />
        );
      case PAGE_CONFIGURATION:
        return <div>PAGE_CONFIGURATION</div>;
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
    errors: state.application.errors
    //composerOpen: state.applicationReducer.isComposerOpen
  };
};

export default connect(mapStateToProps)(Routing);
