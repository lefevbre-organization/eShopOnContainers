import React, { PureComponent } from 'react';
import logoHeader from '../../assets/img/LogoLefebvre.png';
import i18n from '../../services/i18n';

import './header.css';

export class Header extends PureComponent {
  render() {
    const { userName, showUser = true } = this.props;

    return (
      <header className='login-header'>
        <div className='front-login__header-login row'>
          <a
            class='front-login__go-home col-md-5'
            href='https://lefbvre.es'
            rel='noopener noreferrer'
            target='_blank'>
            <img
              src='https://assets.lefebvre.es/media/logos/web/comunes/lefebvre-bl-120x24.png'
              alt='LEFEBVRE'
              className='front-login__logo-lefebvre'
            />
          </a>
          {showUser && (
            <div className='front-login__go-shop'>
              <span className='lf-icon-user'></span>
              <span className='user-name'>{userName}</span>
            </div>
          )}
          {!showUser && (
            <a
              className='front-login__go-shop'
              rel='noopener noreferrer'
              href='https://www.efl.es/'
              target='_blank'>
              <i class='lf-icon-shop front-login__go-shop-icon'></i>
              <span data-translate='front-login.shop' class='ng-scope'>
                TIENDA
              </span>
            </a>
          )}
        </div>
      </header>

      // <header className='d-flex p-3 align-content-center align-items-center header'>
      //   <div className='col-xs-12 col-md-5 header-logo'>
      //     <a
      //       rel='noopener noreferrer'
      //       href='https://lefebvre.es'
      //       target='_blank'>
      //       <img src={logoHeader} alt='LEFEVBRE' />
      //     </a>
      //   </div>
      //   <div className='col-xs-12 col-md-5 header-logo'>
      //     {showUser && (
      //       <div>
      //         <span className='lf-icon-user'></span>
      //         <span className='user-name'>{userName}</span>
      //       </div>
      //     )}
      //     {!showUser && (
      //       <a
      //         href='https://www.efl.es/'
      //         target='_blank'
      //         rel='noopener noreferrer'>
      //         <span className='lf-icon-shop'>
      //           <span className='shop-text'>{i18n.t('header.shop')}</span>
      //         </span>
      //       </a>
      //     )}
      //   </div>
      /* <img src={logoHeader} alt='logo' />
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
            )} */
    );
  }
}
