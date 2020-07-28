import React, { Component } from "react";
import { connect } from 'react-redux';
import styles from "./expired.scss";
import materialize from '../../styles/signature/materialize.scss';
import { translate } from 'react-i18next';


class Expired extends Component{
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
              <span className={`lf-icon-hourglass ${styles['icono-confirmacion']}`} />
              <p className={styles['text-confirmacion']}>
                {t('expiredPage.title')}
                <span>{t('expiredPage.subtitle')}</span>
              </p>
              <div className={styles['end-confirmacion']}>
                {t('expiredPage.footer')}<br/>
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
)(translate()(Expired));
