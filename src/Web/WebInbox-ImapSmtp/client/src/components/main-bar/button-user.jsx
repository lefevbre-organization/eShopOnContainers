import React from 'react';
import {connect} from 'react-redux';
import {translate} from 'react-i18next';
import TopBarUserButton from './top-bar-user-button';
import FilterDialogUser from './filter-dialog-user';
import MessageFilters, {getFromKey} from '../../services/message-filters';
import mainCss from '../../styles/main.scss';
import styles from './button-user.scss';



export class ButtonFilter extends React.Component {
    
  constructor(props) {
    super(props);
    this.state = {
      dialogVisible: false
    };
    this.handleOnToggleDialog = this.onToggleDialog.bind(this);
    this.handleOnCloseDialog = this.onCloseDialog.bind(this);
    }
  
    render() {
    
    const {t, activeMessageFilter} = this.props;
    const {dialogVisible} = this.state;
    const active = activeMessageFilter.key !== MessageFilters.ALL.key;
    return <span
      className={`${styles['button-filter']} ${styles['icon-user-space']} ${mainCss['mdc-menu-surface--anchor']}`}
      isotip={t('mainBar.quickUser')} isotip-position='bottom-end' isotip-size='small'
      isotip-hidden={dialogVisible.toString()}>
       
      <TopBarUserButton       
        onClick={this.handleOnToggleDialog}>person</TopBarUserButton>
        <FilterDialogUser visible={dialogVisible} />

        
    </span>;
  }

  componentDidMount() {
    window.addEventListener('click', this.handleOnCloseDialog);
  }

  componentWillUnmount() {
    window.removeEventListener('click', this.handleOnCloseDialog);
  }

  onToggleDialog(event) {
    this.setState({dialogVisible: !this.state.dialogVisible});
    event.stopPropagation();
  }

  onCloseDialog() {
    this.setState({dialogVisible: false});
  }
}

const mapStateToProps = state => ({
  activeMessageFilter: getFromKey(state.application.messageFilterKey)
});

export default connect(mapStateToProps)(translate()(ButtonFilter));
