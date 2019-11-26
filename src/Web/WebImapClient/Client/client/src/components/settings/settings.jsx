import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Redirect, withRouter} from 'react-router-dom';
import { translate } from 'react-i18next';
import MainBar from '../main-bar/main-bar';
import mainCss from '../../styles/main.scss';
import styles from './settings.scss';


export class Settings extends Component {
  constructor(props) {
    super(props);
   
  }

  render() {  
      return (
          <div> 
              <MainBar /> 
              <div className={styles['fullsize']}>
                     <span className={styles['title']}>Selecciona una cuenta para conectar a Lex-on</span>
                  <p className={styles['subtitle']}>(Podras conectar mas cuentas despues.)</p>
                 <a href="#">
                      <img border="0" alt="" src="assets/images/settings.png"></img>
                 </a>
              </div>              
          </div> 
    );
  } 
}

export default Settings;
