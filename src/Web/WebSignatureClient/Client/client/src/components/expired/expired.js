import React from "react";
import styles from "./expired.scss";
import materialize from '../../styles/signature/materialize.scss';
import i18n from '../../services/i18n';

export const Expired = () => {
  document.body.style.background = "white"; //Hides spinner
  // return (
  //   <div className={styles['container']}>
  //     <div className={`${materialize['row']}`}>
  //       <div className={`${materialize['col']} ${materialize['l4']} ${materialize['center-align']} ${styles['cont-confirmacion']}`}>
  //         <div className={`${styles['cont-outline']}`}>
  //           <img src="/assets/images/logo-lefebvre.jpg"/>
  //           <span className={`lf-icon-hourglass ${styles['icono-confirmacion']}`} />
  //           <p className={styles['text-confirmacion']}>
  //             Su sesión ha expirado.
  //             <span>Por favor inice sesión nuevamente.</span>
  //           </p>
  //           <div className={styles['end-confirmacion']}>
  //             ¿Necesitas ayuda?<br/>
  //             <a href="tel:+34912108000">91 210 80 00</a> - <a href="tel:902443355">902 44 33 55 </a> | <a href="mailto:clientes@lefebvre.es" className={styles['mail']}>clientes@lefebvre.es</a>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // );  
  return (
    <div className={styles['container']}>
      <div className={`${materialize['row']}`}>
        <div className={`${materialize['col']} ${materialize['l4']} ${materialize['center-align']} ${styles['cont-confirmacion']}`}>
          <div className={`${styles['cont-outline']}`}>
            <img src="/assets/images/logo-lefebvre.jpg"/>
            <span className={`lf-icon-hourglass ${styles['icono-confirmacion']}`} />
            <p className={styles['text-confirmacion']}>
              {i18n.t('expiredPage.title')}
              <span>{i18n.t('expiredPage.subtitle')}</span>
            </p>
            <div className={styles['end-confirmacion']}>
              {i18n.t('expiredPage.footer')}<br/>
              <a href="tel:+34912108000">91 210 80 00</a> - <a href="tel:902443355">902 44 33 55 </a> | <a href="mailto:clientes@lefebvre.es" className={styles['mail']}>clientes@lefebvre.es</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );  
}