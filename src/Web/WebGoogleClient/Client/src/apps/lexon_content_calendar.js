import React, { Component } from 'react';
import PropTypes from 'prop-types';
import MaterialTitlePanel from './material_title_panel';
import * as singleSpa from 'single-spa';
import { registerLexonApp } from './lexonconn-app';

const styles = {
  sidebar: {
    width: 319,
    height: '100%'
  },
  sidebarLink: {
    display: 'block',
    padding: '16px 0px',
    color: '#757575',
    textDecoration: 'none'
  },
  divider: {
    margin: '8px 0',
    height: 1,
    backgroundColor: '#757575'
  },
  content: {
    padding: 0,
    height: '100%',
    backgroundColor: '#fff',
    overflowY: 'hidden'
  }
};

export class LexonComponentCalendar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      style: this.props.style
        ? { ...styles.sidebar, ...this.props.style }
        : styles.sidebar
    };
  }

  componentDidMount() {
    try {
      const status = singleSpa.getAppStatus('lexon-app');
      if (status === 'MOUNTED') {
        singleSpa.unloadApplication('lexon-app', false);
        singleSpa.start();
      } else {
        registerLexonApp();
        singleSpa.start();
      }
    } catch (error) {
      singleSpa.unloadApplication('lexon-app', false);
      console.error(error);
    }
  }

  render() {
    const { sidebarDocked } = this.props;
    const { style } = this.state;

      return ( 
          <div>             
             <div id='lexon-app'></div>   
          </div>
    );
  }
}

LexonComponentCalendar.propTypes = {
  style: PropTypes.object
};

export default LexonComponentCalendar;
