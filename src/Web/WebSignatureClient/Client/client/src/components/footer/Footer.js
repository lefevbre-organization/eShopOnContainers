import React, { Component } from 'react';
import i18n from 'i18next';
import styles from './footer.scss'

class Footer extends Component {
  render() {
    return (
      <footer className={styles['footer']}>
        <div className={`row ${styles['footer-row']}`}>
          <div className={`col-md-5 ${styles['footer-logo']}`}>
            <a
              rel='noopener noreferrer'
              href='https://lefebvre.es'
              target='_blank'>
              <img
                alt='LEFEBVRE'
                src='https://assets.lefebvre.es/media/logos/web/comunes/lefebvre-ij-bl-160x57.png'
              />
            </a>
          </div>
          <div className={`${styles['col-md-6']} ${styles['footer-social']} col-md-6`}>
            <ul className={styles['social-squares']}>
              <li>
                <a
                  rel='noopener noreferrer'
                  href='https://www.facebook.com/Lefebvre.es'
                  target='_blank'
                  title='Facebook'>
                  <span className='lf-icon-facebook-round'></span>
                </a>
              </li>
              <li>
                <a
                  rel='noopener noreferrer'
                  href='https://www.linkedin.com/company/lefebvre_es'
                  target='_blank'
                  title='Linkedin'>
                  <span className='lf-icon-linkedin-round'></span>
                </a>
              </li>
              <li>
                <a
                  rel='noopener noreferrer'
                  href='https://www.youtube.com/channel/UCAxbOiNpUotcbZIRL3IxEDg'
                  target='_blank'
                  title='Youtube'>
                  <span className='lf-icon-youtube-round'></span>
                </a>
              </li>
              <li style={{ marginRight: 0 }}>
                <a
                  rel='noopener noreferrer'
                  href='https://twitter.com/edicionesfl'
                  target='_blank'
                  title='Twitter'>
                  <span className='lf-icon-twitter-round'></span>
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className={`row ${styles['compliance-footer']}`}>
          <p className='col-xs-12'>
            {i18n.t('footer.all-reserved-right')}
            <span>
              {window.LEGAL_WARNING_URL && window.LEGAL_WARNING_URL !== '' && (
                <span>
                  &nbsp;
                  <a
                    rel='noopener noreferrer'
                    href={window.LEGAL_WARNING_URL}
                    target='_blank'
                    title={i18n.t('footer.legal-warning')}>
                    {i18n.t('footer.legal-warning')}
                  </a>{' '}
                </span>
              )}
              {window.PRIVACY_POLICY_URL && window.PRIVACY_POLICY_URL !== '' && (
                <span>
                  &nbsp;|&nbsp;
                  <a
                    rel='noopener noreferrer'
                    href={window.PRIVACY_POLICY_URL}
                    target='_blank'
                    title={i18n.t('footer.privacy-policy')}>
                    {i18n.t('footer.privacy-policy')}
                  </a>{' '}
                </span>
              )}
              {window.COOKIES_POLICY_URL && window.COOKIES_POLICY_URL !== '' && (
                <span>
                  &nbsp;|&nbsp;
                  <a
                    rel='noopener noreferrer'
                    href={window.COOKIES_POLICY_URL}
                    target='_blank'
                    title={i18n.t('footer.cookies-policy')}>
                    {i18n.t('footer.cookies-policy')}
                  </a>
                </span>
              )}
              {window.TERMS_AND_CONDITIONS_URL &&
                window.TERMS_AND_CONDITIONS_URL !== '' && (
                  <span>
                    &nbsp;|&nbsp;
                    <a
                      rel='noopener noreferrer'
                      href={window.TERMS_AND_CONDITIONS_URL}
                      target='_blank'
                      title={i18n.t('footer.terms-and-conditions')}>
                      {i18n.t('footer.terms-and-conditions')}
                    </a>
                  </span>
                )}
            </span>
          </p>
        </div>
      </footer>
    );
  }
}

export default Footer;
