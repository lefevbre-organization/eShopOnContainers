import React, { Component } from 'react';
import PropTypes from 'prop-types';
import MaterialTitlePanel from './material_title_panel';
import * as singleSpa from 'single-spa';
import { registerDatabaseApp } from './databaseconn-app';

const styles = {
  sidebar: {
    width: 319,
    height: '100%',
  },
  sidebarLink: {
    display: 'block',
    padding: '16px 0px',
    color: '#757575',
    textDecoration: 'none',
  },
  divider: {
    margin: '8px 0',
    height: 1,
    backgroundColor: '#757575',
  },
  content: {
    padding: 0,
    height: '100%',
    backgroundColor: '#fff',
    overflowY: 'hidden',
  },
};

export class DatabaseComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      style: this.props.style
        ? { ...styles.sidebar, ...this.props.style }
        : styles.sidebar,
    };
  }

  componentDidMount() {
    try {
      const status = singleSpa.getAppStatus('database-app');
      if (status === 'MOUNTED') {
        singleSpa.unloadApplication('database-app', false);
        singleSpa.start();
      } else {
        registerDatabaseApp();
        singleSpa.start();
      }
    } catch (error) {
      singleSpa.unloadApplication('database-app', false);
      console.error(error);
    }
  }

  render() {
    const { sidebarDocked } = this.props;
    const { style } = this.state;

    return (
      <MaterialTitlePanel
        title='DATABASE'
        style={style}
        sidebarDocked={sidebarDocked}>
        <div style={styles.content}>
          <div id='database-app'></div>
        </div>
      </MaterialTitlePanel>
    );
  }
}

DatabaseComponent.propTypes = {
  style: PropTypes.object,
};

export default DatabaseComponent;
