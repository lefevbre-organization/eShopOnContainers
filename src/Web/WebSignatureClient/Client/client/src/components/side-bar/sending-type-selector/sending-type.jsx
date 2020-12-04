import React from 'react';

import styles from './sending-type.scss';

const SendingType = props => (
  <>
   {
     props.disable ?
       <div className={`
       ${styles['box-sending']} 
       ${styles['sending-email']}  
       ${styles['box-space']}`} 
       onClick={props.onClick} >
         <p>
           <b>{props.title}</b>
           <br/>
           {props.subTitle}
         </p>
         <div className={styles['space-icon-right']}><span className='lf-icon-angle-right'></span></div>
       </div>
       : <div className={`
       ${styles['box-sending']} 
       ${styles['sending-email']}  
       ${styles['box-space']}
       ${styles['disable']}`} 
       onClick={props.getConfirm}>
         <p>
           <b>{props.title}</b>
           <br/>
           {props.subTitle}
         </p>
         <div className={styles['space-icon-right']}><span className='lf-icon-angle-right'></span></div>
       </div>}
  </>
);

export default SendingType;
