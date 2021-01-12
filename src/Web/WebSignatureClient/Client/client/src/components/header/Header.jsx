import React, { PureComponent } from 'react';

import i18n from '../../services/i18n';

import styles from './header.scss';

export class Header extends PureComponent {
  render() {
    const { userName, showUser = true } = this.props;

    return (
      <div>
      <header className={styles['login-header']}>
        <div className={`${styles['front-login__header']} row`}>
          <a
            className={`${styles['front-login__go-home']} col-md-5`}
            href='https://lefebvre.es'
            rel='noopener noreferrer'
            target='_blank'>
            <img
              src='https://assets.lefebvre.es/media/logos/web/comunes/lefebvre-bl-120x24.png'
              alt='LEFEBVRE'
              className='front-login__logo-lefebvre'
            />
          </a>
          {showUser && (
            <div className={styles['front-login__go-shop']}>
              <span className='lf-icon-user'></span>
              <span className={styles['user-name']}>{userName}</span>
            </div>
          )}
          {!showUser && (
            <a
              className={styles['front-login__go-shop']}
              rel='noopener noreferrer'
              href='https://www.efl.es/'
              target='_blank'>
              <i className={`lf-icon-shop ${styles['front-login__go-shop-icon']}`}></i>
              <span data-translate='front-login.shop' className='ng-scope'>
                TIENDA
              </span>
            </a>
          )}
        </div>
      </header>
      </div>
    );
  }
}
