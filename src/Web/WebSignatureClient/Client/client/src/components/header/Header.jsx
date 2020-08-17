import React, { PureComponent } from 'react';
//import logoHeader from '../../../assets/images/LogoLefebvre.png';
import i18n from '../../services/i18n';

//import './header.css';

export class Header extends PureComponent {
  render() {
    const { userName, showUser = true } = this.props;

    return (
      <div>
      <header className='login-header'>
        <div className='front-login__header-login row'>
          <a
            className='front-login__go-home col-md-5'
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
              <i className='lf-icon-shop front-login__go-shop-icon'></i>
              <span data-translate='front-login.shop' className='ng-scope'>
                TIENDA
              </span>
            </a>
          )}
        </div>
      </header>
      <style jsx global>
        {` 
        
        .login-header {
          height: 60px;
          width: 100%;
          display: block;
          overflow: hidden;
          background-color: #001978;
        }

        .front-login__header {
          position: relative;
          display: block;
          margin-right: -15px;
          margin-left: -15px;
          width: 100%;
        }
        
        .front-login__go-home {
          margin-top: 14px;
          float: left;
          margin-left: 100px;
          position: absolute;
        }
        .front-login__go-shop:hover {
          text-decoration: none;
          color: #fff;
        }
        
        .front-login__go-shop {
          font-family: MTTMilano;
          font-size: 16px;
          font-weight: bold;
          text-transform: uppercase;
          margin-top: 13px;
          margin-left: 87%;
          letter-spacing: 1px;
          color: #fff;
          position: absolute;
        }
        
        .front-login__go-shop-icon {
          font-size: 27px;
          position: relative;
          top: 5px;
          padding-right: 11px;
        }
        
        .user-name {
          margin-left: 20px;
        }
        
        `}
      </style>
      </div>
      

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
