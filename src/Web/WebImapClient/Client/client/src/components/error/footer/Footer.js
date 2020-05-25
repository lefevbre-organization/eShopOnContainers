import React, { Component } from 'react';
import i18n from 'i18next';

class Footer extends Component {
  render() {
    return (
      <>
        <footer className='row footer mt-auto'>
          <div className='container'>
            <div className='row'>
              <div className='col-xs-12 col-md-6 footer-logo'>
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
              <ul className='col-xs-12 col-md-6 social-squares'>
                <li>
                  <a
                    rel='noopener noreferrer'
                    href='https://www.facebook.com/lefebvreelderecho'
                    target='_blank'
                    title='Facebook'>
                    <span className='lf-icon lf-icon-facebook-round'></span>
                  </a>
                </li>
                <li>
                  <a
                    rel='noopener noreferrer'
                    href='https://www.linkedin.com/company/lefebvre-elderecho'
                    target='_blank'
                    title='Linkedin'>
                    <span className='lf-icon lf-icon-linkedin-round'></span>
                  </a>
                </li>
                <li>
                  <a
                    rel='noopener noreferrer'
                    href='https://www.youtube.com/channel/UCAxbOiNpUotcbZIRL3IxEDg'
                    target='_blank'
                    title='Youtube'>
                    <span className='lf-icon lf-icon-youtube-round'></span>
                  </a>
                </li>
                <li>
                  <a
                    rel='noopener noreferrer'
                    href='https://twitter.com/edicionesfl'
                    target='_blank'
                    title='Twitter'>
                    <span className='lf-icon lf-icon-twitter-round'></span>
                  </a>
                </li>
              </ul>
            </div>
            <div className='row'>
              <p className='col-xs-12'>
                ©2019 Lefebvre. {i18n.t('footer.all-reserved-right')}
                <span>
                  <a
                    rel='noopener noreferrer'
                    href='https://lefebvre.es/aviso-legal'
                    target='_blank'
                    title={i18n.t('footer.legal-warning')}>
                    {i18n.t('footer.legal-warning')}
                  </a>{' '}
                  &nbsp;|&nbsp;
                  <a
                    rel='noopener noreferrer'
                    href='https://lefebvre.es/politica-privacidad'
                    target='_blank'
                    title={i18n.t('footer.privacy-policy')}>
                    {i18n.t('footer.privacy-policy')}
                  </a>{' '}
                  &nbsp;|&nbsp;
                  <a
                    rel='noopener noreferrer'
                    href='https://lefebvre.es/politica-cookies'
                    target='_blank'
                    title={i18n.t('footer.cookies-policy')}>
                    {i18n.t('footer.cookies-policy')}
                  </a>
                </span>
              </p>
            </div>
            {/* <p className='version'>
              {i18n.t('footer.version')}: {window.RELEASE}
            </p> */}
          </div>
        </footer>
        <style jsx>{`
          #borrar {
            height: 100vh !important;
          }

          .corp-menu {
            padding: 2em 0 0;
          }

          .corp-menu.bg-f4,
          .corp-menu .bg-f4 {
            background: #f4f4f4;
          }

          .corp-menu ul {
            margin-bottom: 0;
            padding-left: 15px;
            list-style: none;
          }

          .corp-menu ul li {
            font-weight: 600;
            margin-bottom: 2em;
            list-style-type: none;
          }

          .corp-menu ul li ul {
            padding-left: 0;
          }

          .corp-menu ul li ul li {
            margin-bottom: 0;
          }

          .footer [class^='lf-icon lf-icon'] {
            color: #fff;
            font-size: 30px;
            font-family: 'lf-font' !important;
            speak: none;
            font-style: normal;
            font-weight: normal;
            font-variant: normal;
            text-transform: none;
            line-height: 1;
            -webkit-font-smoothing: antialiased;
          }

          .corp-menu a {
            word-wrap: break-word;
            color: #001978;
          }

          .footer {
            background: #001978;
            padding: 40px 0;
            flex: 0;
            /*overflow: hidden;*/
          }
          .footer .container-fluid {
            padding-right: 0;
            padding-left: 0;
          }

          .footer .social-squares {
            text-align: center;
            padding-bottom: 20px;
          }

          .footer .social-squares li {
            display: inline-block;
            margin-left: 25px;
          }

          .footer .social-squares li:first-child {
            margin-left: 0;
          }

          .footer p {
            text-align: center;
          }

          .footer a,
          .footer a:hover {
            text-decoration: none;
          }

          .footer p a {
            font-weight: 400;
            font-size: 1em;
          }

          .footer p span {
            width: 100%;
            display: block;
            margin-top: 15px;
          }

          .footer p,
          .footer p a {
            color: #fff;
            font-family: MTTMilano, Lato, Arial, sans-serif;
            font-size: 0.9em;
          }

          .footer-logo {
            text-align: center;
            padding-bottom: 2em;
            border-bottom: 2px solid #fff;
            margin-bottom: 2em;
          }

          .footer .lf-icon {
            color: #fff;
            font-size: 30px;
          }

          .version {
            position: absolute;
            right: 10px;
            color: #949191 !important;
            font-family: MTTMilano, Lato, Arial, sans-serif;
            font-size: 0.7em !important;
            padding-top: 20px;
          }
          @media (min-width: 992px) {
            .footer .social-squares {
              text-align: right;
            }
            .footer-logo {
              padding-bottom: 0;
              text-align: left;
              border-bottom: none;
            }
            .footer .container-fluid {
              padding-right: 15px;
              padding-left: 15px;
            }
            .footer p {
              text-align: left;
            }
            .footer p span {
              display: inline;
              margin-top: 0;
            }
          }
        `}</style>
      </>
    );
  }
}

export default Footer;
