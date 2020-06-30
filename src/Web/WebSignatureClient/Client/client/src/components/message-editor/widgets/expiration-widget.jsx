import React from 'react';
import { RadioButtonComponent } from '@syncfusion/ej2-react-buttons';
import styles from './widgets.scss';
import mainCss from '../../../styles/main.scss';

export const ExpirationWidget = () => (
  <div className={styles.widget}>
    <div className={styles.p10}>
      <span
        className={`lf-icon-calendar-cross ${styles['title-icon']}`}></span>
      <span className={styles['generic-title']}>
        PLAZOS DE EXPIRACIÓN DE FIRMA
      </span>
      <form action='#'>
        <p className={styles.form}>
          <RadioButtonComponent label='Yes' />
          <RadioButtonComponent label='No' />
        </p>
      </form>
      <button
        className={`${mainCss['mdc-button']} ${mainCss['mdc-button--unelevated']} ${styles.right}`}>
        AÑADIR
      </button>
    </div>
    <div className='clearfix'></div>
  </div>
);
