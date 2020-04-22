import React, { Component } from 'react';

import SelectActionHeader from './select-action-header/select-action-header';
import { PAGE_SELECT_COMPANY } from '../../constants';
import SelectActionTab from './select-action-tab/select-action-tab';

interface Props {
  changePage: (page: string) => void;
  toggleNotification: (message?: string, error?: boolean) => void;
}

interface State {
  showDocuments: boolean;
}

class SelectAction extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      showDocuments: true
    };

    this._handleOnClick = this._handleOnClick.bind(this);
    this.onShowDocuments = this.onShowDocuments.bind(this);
  }

  _handleOnClick() {
    this.props.changePage(PAGE_SELECT_COMPANY);
  }

  onShowDocuments(show: boolean) {
    this.setState({ showDocuments: show });
  }

  render() {
    const { toggleNotification } = this.props;
    const { showDocuments } = this.state;
    return (
      <div className="container-fluid">
        <SelectActionHeader
          changePage={this.props.changePage}
          onChange={this.onShowDocuments}
        />
        {showDocuments === true && (
          <SelectActionTab toggleNotification={toggleNotification} />
        )}
      </div>
    );
  }
}

export default SelectAction;
