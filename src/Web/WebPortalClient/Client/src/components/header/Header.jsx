import React, { PureComponent } from 'react';
import logoHeader from '../../assets/img/LogoLefebvre.png';
import i18n from '../../services/i18n';

import './header.css';

export class Header extends PureComponent {
  render() {
    const { userName, showUser = true } = this.props;

    return (
      <header className='d-flex p-3 align-content-center align-items-center header '>
        <div className='header-left'>
          <img src={logoHeader} alt='logo' />
        </div>
        {showUser && (
          <div className='header-user'>
            <div>
              <span className='lf-icon-user'></span>
            </div>
            <div>
              <span className='user-name'>{userName}</span>
            </div>
          </div>
        )}
        {!showUser && (
          <div className='header-user'>
            <a
              href='https://www.efl.es/'
              target='_blank'
              rel='noopener noreferrer'>
              <span className='lf-icon-shop'>
                <span className='shop-text'>{i18n.t('header.shop')}</span>
              </span>
            </a>
          </div>
        )}
      </header>
    );
  }
}
