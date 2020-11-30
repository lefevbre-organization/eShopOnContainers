import React from 'react';
import styles from './menu-user.scss';

const SignatureNumbers = props => (
  <div className={styles['container']}>
    <div className={styles['signature-summary']}>
      <span className={props.icon}></span> 
      <span className="ml-2">{props.title}</span>
    </div>
    <div className={styles['container-summary']}>
      <div className={styles['signature-available']}>
        <span>{props.available}</span>
      </div>
      <div className={`${styles['available-number']} ${styles['box-number']}`}>
        <span>{props.availablenumber}</span>
      </div>
    </div>
    <div className={styles['container-summary']}>
      <div className={styles['signature-consumed']}>
        <span>{props.consumed}</span>
      </div>
      <div className={ `${styles['consumed-number']} ${styles['box-number']}`}>
        <span>{props.signatureConsumed}</span>
      </div>
    </div>
  </div>
);

export default SignatureNumbers;
