import React from 'react';
import i18n from '../../services/i18n';
import styles from './login.scss';

const LoginComponents = (children) => {
  const verificationLogin = children.errorsMessage.login ? (
    <div className={styles['errorsMessage']}>{children.errorsMessage.login}</div>
  ) : null;

  const verificationEmail = children.errorsMessage.email ? (
    <div className={styles['errorsMessage']}>{children.errorsMessage.email}</div>
  ) : null;

  const verificationPassword = children.errorsMessage.password ? (
    <div className={styles['errorsMessage']}>{children.errorsMessage.password}</div>
  ) : null;

  const verificationAuth = children.errorsMessage.auth ? (
    <div className={styles['errorsMessageAuth']}>{children.errorsMessage.auth}</div>
  ) : null;

  return (
    <div className={styles['main-box']}>
      <div className='row'>
        <div
          className={styles['login-box']}
          style={{
            paddingTop: 30,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <div className={`text-center ${styles['login-title-space']}`}>
            <img className={styles['logo-firma']} src={"/assets/images/LogoLefebvreFirma.png"} />  
            {/* <p className='lefebvre-mail-service'>FIRMA</p> */}
          </div>
          <div className='row' style={{ flexDirection: 'column' }}>
            <div className={`${styles['login-input-group']} ${styles['input-group']} input-group`}>
              <div className='input-group-prepend'>
                <span className={`${styles['input-group-text']} input-group-text`} id='inputGroupPrepend'>
                  <img src={"/assets/images/icon-user-login.png"} />
                </span>
              </div>
              <input
                type='text'
                name='login'
                className={`form-control ${styles['login-input']}`}
                placeholder={i18n.t('login.user')}
                onChange={children.handleChange}
                onKeyUp={children.keyUpHandler}
              />
              {verificationLogin || verificationEmail ? (
                <i className={`lf-icon-close-round-full ${styles['front-login__input-error-icon']}`}></i>
              ) : null}
            </div>
            {verificationLogin}
            {verificationEmail}
          </div>
          <div className='row' style={{ flexDirection: 'column' }}>
            <div className={`${styles['login-input-group']} ${styles['input-group']} input-group`}>
              <div className='input-group-prepend'>
                <span className={`${styles['input-group-text']} input-group-text`} id='inputGroupPrepend'>
                  <img src='/assets/images/icon-lock.png' />
                </span>
              </div>
              <input
                type='password'
                name='password'
                className={`form-control ${styles['login-input']}`}
                onChange={children.handleChange}
                placeholder={i18n.t('login.password')}
                onKeyUp={children.keyUpHandler}
              />
              {verificationPassword ? (
                <i className={`lf-icon-close-round-full ${styles['front-login__input-error-icon']}`}></i>
              ) : null}
            </div>
            {verificationPassword}
          </div>
          <div className='row' style={{ flexDirection: 'column' }}>
          {!children.isloading ?
            <button
              onClick={children.handleEventLogin}
              className={`${styles['btn-label']} ${styles['btn-login']}`}>
              {i18n.t('login.login')}
            </button> 
            : 
            <button 
              onClick={children.handleEventLogin} 
              className={`${styles['btn-label']} ${styles['btn-loading']}`}> 
              {i18n.t('login.load')}
            </button> }  
            {verificationAuth}
          </div>
          <div className='row'>
            <p className={`mt-3 ${styles['front-login__info-block']}`}>
              {i18n.t('login.notClient')}{' '}
              <a
                className={`${styles['front-login__info-block-link']}`}
                target='_blank'
                rel='noopener noreferrer'
                href='https://espaciolefebvre.lefebvre.es/solicitar-informacion'>
                {' '}
                {i18n.t('login.requestInfo')}{' '}
              </a>
            </p>
          </div>
          <div className='row'>
            <div className={styles['login-help']}>
              <p className={`pt-3 ${styles['need-help']} mb-4`}>{i18n.t('login.needHelp')}</p>
              <p className={`${styles['client']} mt-n3`}>
                {i18n.t('login.phoneNumber')}
                <a
                  className={styles['front-login__information-contact-email']}
                  href={`mailto:${children.client}`}>
                  {' '}
                  {i18n.t('login.client')}
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginComponents;
