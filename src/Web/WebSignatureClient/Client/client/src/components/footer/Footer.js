import React, { Component } from 'react';
import i18n from 'i18next';

import './Footer.css';

class Footer extends Component {
  render() {
    return (
      <footer className='footer'>
        <div className='row footer-row'>
          <div className='col-md-5 footer-logo'>
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
          <div className='col-md-6 pull-right footer-social'>
            <ul className='social-squares'>
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
        <div className='row compliance-footer'>
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
        <style jsx global>
          {` 
            .footer {
              width: 100%;
              height: 200px;
              display: block;
              overflow: hidden;
              background: #001978;
              float: left;
              position: static;
              bottom: 160px;
              width: 100%;
              padding: 43px 75px 21px 60px;
            }
            
            .footer-row {
              margin-right: -15px;
              margin-left: -15px;
            }
            
            .footer-logo {
              float: left;
              padding: 0;
              padding-left: 70px;
            }
            
            .footer-social {
              padding: 0;
            }
            
            .footer .social-squares {
              text-align: right;
              /* padding-bottom: 20px; */
            }
            
            .footer .social-squares li {
              display: inline-block;
              margin-left: 25px;
              border: none;
              background: none;
              color: #fff !important;
              font-size: 30px;
              margin: 0px 7px 0;
              outline: none;
            }
            
            .footer .social-squares li a {
              color: #fff !important;
              font-size: 30px;
              margin: 0px 7px 0;
              outline: none;
            }
            
            .footer .social-squares li a:hover {
              text-decoration: none !important;
            }
            
            .footer .social-squares li:first-child {
              margin-left: 0;
            }
            
            .col-md-6 {
              max-width: none !important;
            }
            
            .compliance-footer {
              margin-left: 50px;
              margin-top: 35px;
              font-size: 13.4px;
              color: #ffffff;
              font-family: MTTMilano;
              font-weight: 500;
              text-decoration: none;
            }
            
            .compliance-footer a {
              font-size: 13.4px;
              color: #ffffff;
              font-family: MTTMilano;
              margin: 35px 0 0;
              font-weight: 500;
              text-decoration: none;
            }
            .footer {
              width: 100%;
              height: 200px;
              display: block;
              overflow: hidden;
              background: #001978;
              float: left;
              position: static;
              bottom: 160px;
              width: 100%;
              padding: 43px 75px 21px 60px;
            }
            
            .footer-row {
              margin-right: -15px;
              margin-left: -15px;
            }
            
            .footer-logo {
              float: left;
              padding: 0;
              padding-left: 70px;
            }
            
            .footer-social {
              padding: 0;
            }
            
            .footer .social-squares {
              text-align: right;
              /* padding-bottom: 20px; */
            }
            
            .footer .social-squares li {
              display: inline-block;
              margin-left: 25px;
              border: none;
              background: none;
              color: #fff !important;
              font-size: 30px;
              margin: 0px 7px 0;
              outline: none;
            }
            
            .footer .social-squares li a {
              color: #fff !important;
              font-size: 30px;
              margin: 0px 7px 0;
              outline: none;
            }
            
            .footer .social-squares li a:hover {
              text-decoration: none !important;
            }
            
            .footer .social-squares li:first-child {
              margin-left: 0;
            }
            
            .col-md-6 {
              max-width: none !important;
            }
            
            .compliance-footer {
              margin-left: 50px;
              margin-top: 35px;
              font-size: 13.4px;
              color: #ffffff;
              font-family: MTTMilano;
              font-weight: 500;
              text-decoration: none;
            }
            
            .compliance-footer a {
              font-size: 13.4px;
              color: #ffffff;
              font-family: MTTMilano;
              margin: 35px 0 0;
              font-weight: 500;
              text-decoration: none;
            }
            
            @media (max-width: 595px) {
              .compliance-footer {
                margin-top: -10px;
              }
            }
            
          `}
        </style>
      </footer>
      // <footer className='row footer mt-auto'>
      //   <div className='row'>
      //     <div className='col-xs-12 col-md-6 footer-logo'>
      //       <a
      //         rel='noopener noreferrer'
      //         href='https://lefebvre.es'
      //         target='_blank'>
      //         <img
      //           alt='LEFEBVRE'
      //           src='https://assets.lefebvre.es/media/logos/web/comunes/lefebvre-ij-bl-160x57.png'
      //         />
      //       </a>
      //     </div>
      //     <ul className='col-xs-12 col-md-6 social-squares'>
      //       <li>
      //         <a
      //           rel='noopener noreferrer'
      //           href='https://www.facebook.com/Lefebvre.es'
      //           target='_blank'
      //           title='Facebook'>
      //           <span className='lf-icon-facebook-round'></span>
      //         </a>
      //       </li>
      //       <li>
      //         <a
      //           rel='noopener noreferrer'
      //           href='https://www.linkedin.com/company/lefebvre_es'
      //           target='_blank'
      //           title='Linkedin'>
      //           <span className='lf-icon-linkedin-round'></span>
      //         </a>
      //       </li>
      //       <li>
      //         <a
      //           rel='noopener noreferrer'
      //           href='https://www.youtube.com/channel/UCAxbOiNpUotcbZIRL3IxEDg'
      //           target='_blank'
      //           title='Youtube'>
      //           <span className='lf-icon-youtube-round'></span>
      //         </a>
      //       </li>
      //       <li>
      //         <a
      //           rel='noopener noreferrer'
      //           href='https://twitter.com/edicionesfl'
      //           target='_blank'
      //           title='Twitter'>
      //           <span className='lf-icon-twitter-round'></span>
      //         </a>
      //       </li>
      //     </ul>
      //   </div>
      //   <div className='row'>
      //     <p className='col-xs-12'>
      //       {i18n.t('footer.all-reserved-right')}
      //       <span>
      //         {window.LEGAL_WARNING_URL && window.LEGAL_WARNING_URL !== '' && (
      //           <span>
      //             &nbsp;
      //             <a
      //               rel='noopener noreferrer'
      //               href={window.LEGAL_WARNING_URL}
      //               target='_blank'
      //               title={i18n.t('footer.legal-warning')}>
      //               {i18n.t('footer.legal-warning')}
      //             </a>{' '}
      //           </span>
      //         )}
      //         {window.PRIVACY_POLICY_URL && window.PRIVACY_POLICY_URL !== '' && (
      //           <span>
      //             &nbsp;|&nbsp;
      //             <a
      //               rel='noopener noreferrer'
      //               href={window.PRIVACY_POLICY_URL}
      //               target='_blank'
      //               title={i18n.t('footer.privacy-policy')}>
      //               {i18n.t('footer.privacy-policy')}
      //             </a>{' '}
      //           </span>
      //         )}
      //         {window.COOKIES_POLICY_URL && window.COOKIES_POLICY_URL !== '' && (
      //           <span>
      //             &nbsp;|&nbsp;
      //             <a
      //               rel='noopener noreferrer'
      //               href={window.COOKIES_POLICY_URL}
      //               target='_blank'
      //               title={i18n.t('footer.cookies-policy')}>
      //               {i18n.t('footer.cookies-policy')}
      //             </a>
      //           </span>
      //         )}
      //         {window.TERMS_AND_CONDITIONS_URL &&
      //           window.TERMS_AND_CONDITIONS_URL !== '' && (
      //             <span>
      //               &nbsp;|&nbsp;
      //               <a
      //                 rel='noopener noreferrer'
      //                 href={window.TERMS_AND_CONDITIONS_URL}
      //                 target='_blank'
      //                 title={i18n.t('footer.terms-and-conditions')}>
      //                 {i18n.t('footer.terms-and-conditions')}
      //               </a>
      //             </span>
      //           )}
      //       </span>
      //     </p>
      //   </div>
      //   <p className='version'>
      //     {i18n.t('footer.version')}: {window.RELEASE}
      //   </p>
      // </footer>
    );
  }
}

export default Footer;
