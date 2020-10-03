import React from 'react';
import i18n from '../../services/i18n';

const LoginComponents = (children) => {
  const verificationLogin = children.errorsMessage.login ? (
    <div className='errorsMessage'>{children.errorsMessage.login}</div>
  ) : null;

  const verificationEmail = children.errorsMessage.email ? (
    <div className='errorsMessage'>{children.errorsMessage.email}</div>
  ) : null;

  const verificationPassword = children.errorsMessage.password ? (
    <div className='errorsMessage'>{children.errorsMessage.password}</div>
  ) : null;

  const verificationAuth = children.errorsMessage.auth ? (
    <div className='errorsMessageAuth'>{children.errorsMessage.auth}</div>
  ) : null;

  return (
    <div className='main-box'>
      <div className='row'>
        <div
          className='login-box'
          style={{
            paddingTop: 30,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <div className='text-center login-title-space'>
            <img className='logo-firma' src={"/assets/images/LogoLefebvreFirma.png"} />  
            {/* <p className='lefebvre-mail-service'>FIRMA</p> */}
          </div>
          <div className='row' style={{ flexDirection: 'column' }}>
            <div className='input-group login-input-group'>
              <div className='input-group-prepend'>
                <span className='input-group-text' id='inputGroupPrepend'>
                  <img src={"/assets/images/icon-user-login.png"} />
                </span>
              </div>
              <input
                type='text'
                name='login'
                className='form-control login-input'
                placeholder={i18n.t('login.user')}
                onChange={children.handleChange}
                onKeyUp={children.keyUpHandler}
              />
              {verificationLogin || verificationEmail ? (
                <i className='lf-icon-close-round-full front-login__input-error-icon'></i>
              ) : null}
            </div>
            {verificationLogin}
            {verificationEmail}
          </div>
          <div className='row' style={{ flexDirection: 'column' }}>
            <div className='input-group login-input-group'>
              <div className='input-group-prepend'>
                <span className='input-group-text' id='inputGroupPrepend'>
                  <img src='/assets/images/icon-lock.png' />
                </span>
              </div>
              <input
                type='password'
                name='password'
                className='form-control login-input'
                onChange={children.handleChange}
                placeholder={i18n.t('login.password')}
                onKeyUp={children.keyUpHandler}
              />
              {verificationPassword ? (
                <i className='lf-icon-close-round-full front-login__input-error-icon'></i>
              ) : null}
            </div>
            {verificationPassword}
          </div>
          <div className='row' style={{ flexDirection: 'column' }}>
          {!children.isloading ?
            <button
              onClick={children.handleEventLogin}
              className='btn btn-label btn-login'>
              {i18n.t('login.login')}
            </button> 
            : 
            <button 
              onClick={children.handleEventLogin} 
              className="btn btn-label btn-loading"> 
              {i18n.t('login.load')}
            </button> }  
            {verificationAuth}
          </div>
          <div className='row'>
            <p className='mt-3 front-login__info-block'>
              {i18n.t('login.notClient')}{' '}
              <a
                className='front-login__info-block-link'
                target='_blank'
                rel='noopener noreferrer'
                href='https://espaciolefebvre.lefebvre.es/solicitar-informacion'>
                {' '}
                {i18n.t('login.requestInfo')}{' '}
              </a>
            </p>
          </div>
          <div className='row'>
            <div className='login-help'>
              <p className='pt-3 need-help mb-4'>{i18n.t('login.needHelp')}</p>
              <p className='client mt-n3'>
                {i18n.t('login.phoneNumber')}
                <a
                  className='front-login__information-contact-email'
                  href={`mailto:${children.client}`}>
                  {' '}
                  {i18n.t('login.client')}
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
      <style jsx global>
        {` 
        
        .wrapper {
          display: table;
          height: 969px;
          width: 100%;
        }
        
        .main-box {
          overflow: hidden;
          display: flex;
          height: 85vh;
          background-color: #fff;
          justify-content: center;
          align-items: center;
          padding-top: 70px;
        }

        .login-box {
          margin: -80px auto 49px;
          display: block;
          width: 450px;
          min-height: 502px;
          border: 1px solid #2e3c8d;
          background-color: #ffffff;
        }
                             
        .input-group-text {
          border-radius: inherit !important;
          background-color: #e5e8f0 !important;
          border: 1px solid #e5e8f0 !important;
          height: 84%;
        }
        
        .login-input-group {
          width: 340px !important;
        }
        
        .input-group {
          flex-wrap: nowrap;
        }
        
        .login-input {
          height: 40px !important;
          border: 1px solid #ced4da !important;
          padding-left: 10px !important;
        }
      
        .btn-login {
          width: 340px !important;
          height: 42px;
          background-color: #001978 !important;
          border-radius: inherit !important;
        }
        
        .btn-label {
          border: none;
          /* text-transform: uppercase; */
          color: #ffffff !important;
          font-size: 13px !important;
          letter-spacing: 0px;
          margin-bottom: 14px;
        }
        
        .btn-label:hover {
          color: #ffffff;
        }
                
        .front-login__info-block {
          color: #333333;
          font-family: 'MTTMilano';
          font-weight: 500;
          font-size: 16px;
        }
        
        .front-login__info-block-link {
          color: #001978 !important;
          font-weight: 600;
          text-decoration: none;
          font-size: 15px;
          letter-spacing: 1px;
        }
        
        .login-help {
          height: 95px;
          width: 448px;
          border: 0 solid #000000;
          background-color: #e5e8f1;
          margin-bottom: -20px;
        }
        
        .need-help {
          color: #001978 !important;
          font-family: 'MTTMilano';
          margin: 0 0 4px;
          font-size: 20px;
          font-weight: 600;
          letter-spacing: 1px;
          text-align: center;
        }
        
        .client {
          color: #6675ae;
          font-family: MTTMilano-Medium, Lato, Arial, sans-serif;
          font-size: 18px;
          font-weight: 400 !important;
          text-align: center;
        }
        
        .front-login__information-contact-email {
          color: #001978 !important;
        }
                     
        .rights-reserved-login {
          font-size: 13.4px;
          color: #ffffff;
          font-family: 'MTTMilano';
          margin: 35px 0 0;
          font-weight: 500;
          text-decoration: none;
          margin-left: 4rem !important;
        }
        
        .errorsMessage {
          font-family: 'MTTMilano';
          font-size: 14px;
          border: 0;
          font-weight: 600;
          background-color: transparent;
          color: #d81f2a;
          margin-left: 1px;
          margin-top: -5px;
          text-align: start;
          margin-top: 1px;
        }
        
        .errorsMessageAuth {
          font-family: 'MTTMilano';
          font-size: 14px;
          border: 0;
          font-weight: 600;
          background-color: transparent;
          color: #d81f2a;
          margin-left: 1px;
          margin-top: -5px;
          text-align: center;
          margin-top: 1px;
        }
        
        .front-login__input-error-icon {
          position: absolute;
          left: 93%;
          color: #d81f2a;
          top: 11px;
          font-size: 16px;
        }
        
        .login-title-space {
          margin-top: 20px !important;
        }
        
        @media (min-width: 400px) {
          .ml-sm-5 {
            margin-left: 3rem !important;
          }
        }
        
        @media (max-width: 645px) {
          .rights-reserved-login {
            margin-top: -4rem !important;
            font-size: 11px;
          }
          .login-box {
            margin: 0 auto 49px;
          }
        
          .login-title-space {
            margin-bottom: -17px !important;
          }
        }
        
        .lefebvre-mail-service {
          color: #001978;
          font-size: 52px;
          font-family: 'MTTMilano';
          font-weight: bold;
          line-height: 19px;
        }

        .btn-loading {
          width: 340px !important;
          height: 42px;
          background-color: #7b7b7d !important;
          border-radius: inherit !important;
        }

        .logo-firma{
          width: 45%;
          padding-bottom: 15px;
        }
            
        `}
      </style>
    </div>
  );
};

export default LoginComponents;
