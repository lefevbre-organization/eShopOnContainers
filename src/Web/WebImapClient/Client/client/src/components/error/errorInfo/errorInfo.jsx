/* eslint-disable no-nested-ternary */
import React from 'react';
import i18n from 'i18next';

export const ErrorInfo = ({ code, token, userId }) => (
  <>
    <div className='error-wrapper'>
      <div className='error-info'>
        <div className='title-wrapper'>
          <h1>
            {code}
            <span
              className={
                code === '404'
                  ? 'lf-icon-zoom-out'
                  : code === '403'
                  ? 'lf-icon-lock'
                  : 'lf-icon-danger'
              }></span>
          </h1>
          <h2>{i18n.t(`error.${code}-title`)}</h2>
        </div>
        <div className='info-wrapper'>
          <p>{i18n.t(`error.${code}-info1`)}</p>
          <p>{i18n.t(`error.${code}-info2`)}</p>
          <button
            className='primary'
            onClick={() => {
              const urlRedirect = token
                ? `${window.URL_SELECT_ACCOUNT}/access/${token}/`
                : `${window.URL_SELECT_ACCOUNT}/user/${userId}/encrypt/0`;
              window.open(urlRedirect, '_self');
            }}>
            {i18n.t('error.back')}
          </button>
        </div>
        <div className='help-wrapper'>
          <p className='help-text'>{i18n.t(`error.help`)}</p>
          <p>
            <span className='phone'>91 210 80 00 - 902 44 33 55 |</span>
            <span className='email'>clientes@lefebvre.es</span>
          </p>
        </div>
      </div>
    </div>
    <style jsx>{`
      .error-wrapper {
        width: 100%;
        height: 100%;
        text-align: center;
        display: flex;
        justify-content: center;
        padding: 43px;
      }

      .title-wrapper {
        margin-top: 25px;
      }
      .error-info {
        width: 450px;
        height: 524px;
        border: 1px solid #7f8cbb;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        background-color: white;
      }

      .help-text {
        color: #001978;
        font-family: MTTMilano, Lato, Arial, sans-serif;
        font-size: 21px;
        font-weight: 500;
        line-height: 30px;
        text-align: center;
        margin: 0;
      }

      .info-wrapper {
        margin-top: 75px;
        margin-bottom: 35px;
        padding: 0 30px;
      }

      .info-wrapper p {
        font-family: MTTMilano, Lato, Arial, sans-serif;
        margin: 0;
        font-size: 16px;
      }

      .info-wrapper button {
        margin-top: 22px;
      }

      .help-wrapper {
        padding: 25px 0;
        box-sizing: border-box;
        height: 95px;
        width: 448px;
        border: 0 solid #000000;
        background-color: #e5e8f1;
      }

      span.phone {
        color: #6675ae;
        font-family: MTTMilano, Lato, Arial, sans-serif;
        font-size: 18px;
        font-weight: 500;
        line-height: 30px;
        text-align: center;
      }

      span.email {
        color: #001978;
        font-family: MTTMilano, Lato, Arial, sans-serif;
        font-size: 18px;
        font-weight: 500;
        line-height: 30px;
        text-align: center;
      }

      h1,
      h2 {
        color: #001978;
        font-family: Lato, Arial, sans-serif;
        font-weight: bold;
      }
      h1 {
        font-size: 120px;
      }

      h1 span {
        font-size: 30px;
        position: absolute;
        margin-top: 30px;
      }
      h2 {
        font-size: 16px;
        text-transform: uppercase;
      }

      button.primary {
        background-color: #001978;
        border: 2px solid #001978;
        color: white;
        outline: none;
        cursor: pointer;
        text-transform: uppercase;
        width: 352px;
        height: 42px;
        font-family: MTTMilano, Lato, Arial, sans-serif;
        font-weight: bold;
      }

      button.primary:hover {
        background-color: white;
        border: 2px solid #001978;
        color: #001978;
      }
    `}</style>
  </>
);
