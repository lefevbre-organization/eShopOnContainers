import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styles from './top-bar.scss';
import i18n from '../../services/i18n';


export class TopBar extends Component {
  constructor(props) {
    console.log('Entra en el top-bar');
    super(props);
  }

  render() {
    console.log(this.props.appTitle);
    const props = this.props;
    const {
      appTitle
    } = props;
    const collapsed = props.sideBarCollapsed;
    let title = props.title;
    if (
      props.selectedFolder &&
      props.selectedFolder.name
    ) {
      title = `${props.selectedFolder.name}`;
    }
    return (
        <div className={ 
          `${ !collapsed ? 
           styles['pasos-firma'] : 
           styles['firma-without-side-bar']}`} >
          <span className={styles['producto-procedente']}></span> { !appTitle ? i18n.t('topBar.app') : appTitle} 
          <span className={styles.miga}>{title}</span>
        </div>
    );
  }
}

TopBar.propTypes = {
  title: PropTypes.string,
  appTitle: PropTypes.string
};

const mapStateToProps = state => {
  
  return {
    title: state.application.title,
    appTitle: state.application.appTitle,
    newMessage: state.application.newMessage,
    folders: state.folders,
    lefebvre: state.lefebvre
  };
};

export default connect(mapStateToProps)(TopBar);