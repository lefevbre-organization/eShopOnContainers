import React, { Component } from "react";
import { connect } from 'react-redux';
import styles from "./completed.scss";
import materialize from '../../styles/signature/materialize.scss';
import { translate } from 'react-i18next';


class Completed extends Component{
  constructor(props) {
    super(props);
  }

  render(){
    const { t } = this.props;
    document.body.style.background = "white"; //Hides spinner
    return (
      <div className={styles['container']}>
        <div className={`${materialize['row']}`}>
          <div className={`${materialize['col']} ${materialize['l4']} ${materialize['center-align']} ${styles['cont-confirmacion']}`}>
            <div className={`${styles['cont-outline']}`}>
              <img src="/assets/images/logo-lefebvre.jpg"/>
              <span className={`lf-icon-check-round ${styles['icono-confirmacion']}`} />
              <p className={styles['text-confirmacion']}>
                {t('completedPage.title')}
                <span>
                 {t('completedPage.subtitle')}
                </span>
              </p>
              <div className={styles['end-confirmacion']}>
                {t('completedPage.footer')}<br/>
                <a href="tel:+34912108000">91 210 80 00</a> - <a href="tel:902443355">902 44 33 55 </a> | <a href="mailto:clientes@lefebvre.es" className={styles['mail']}>clientes@lefebvre.es</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  all: state.all
})


export default connect(
  mapStateToProps
)(translate()(Completed));




// export const Completed = () => {
//   document.body.style.background = "white"; //Hides spinner
//   return (
//     <div className={styles['container']}>
//       <div className={`${materialize['row']}`}>
//         <div className={`${materialize['col']} ${materialize['l4']} ${materialize['center-align']} ${styles['cont-confirmacion']}`}>
//           <div className={`${styles['cont-outline']}`}>
//             <img src="/assets/images/logo-lefebvre.jpg"/>
//             <span className={`lf-icon-check-round ${styles['icono-confirmacion']}`} />
//             <p className={styles['text-confirmacion']}>
//               El documento se ha firmado correctamente.
//               <span>Te hemos enviado una copia a tu dirección de email.</span>
//             </p>
//             <div className={styles['end-confirmacion']}>
//               ¿Necesitas ayuda?<br/>
//               <a href="tel:+34912108000">91 210 80 00</a> - <a href="tel:902443355">902 44 33 55 </a> | <a href="mailto:clientes@lefebvre.es" className={styles['mail']}>clientes@lefebvre.es</a>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
//   // return (
//   //   <div className={styles['container']}>
//   //     <div className={`${materialize['row']}`}>
//   //       <div className={`${materialize['col']} ${materialize['l4']} ${materialize['center-align']} ${styles['cont-confirmacion']}`}>
//   //         <div className={`${styles['cont-outline']}`}>
//   //           <img src="/assets/images/logo-lefebvre.jpg"/>
//   //           <span className={`lf-icon-check-round ${styles['icono-confirmacion']}`} />
//   //           <p className={styles['text-confirmacion']}>
//   //             {i18n.t('completedPage.title')}
//   //             <span>{i18n.t('completedPage.subtitle')}</span>
//   //           </p>
//   //           <div className={styles['end-confirmacion']}>
//   //             {i18n.t('completedPage.footer')}<br/>
//   //             <a href="tel:+34912108000">91 210 80 00</a> - <a href="tel:902443355">902 44 33 55 </a> | <a href="mailto:clientes@lefebvre.es" className={styles['mail']}>clientes@lefebvre.es</a>
//   //           </div>
//   //         </div>
//   //       </div>
//   //     </div>
//   //   </div>
//   // );    
// }
