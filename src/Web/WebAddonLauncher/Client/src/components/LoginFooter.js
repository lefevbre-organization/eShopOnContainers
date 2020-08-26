import React from 'react';
import i18n from 'i18next';

const LoginFooter = (children) => (
 <div className="login-footer">
    <div className="row">
        <div className="col-md-5 mt-5 compliance-footer__icon-logo pr-4">
         <img src={children.logoFooter} alt="logoFooter" className="mr-5" />
        </div>
        <div className="col-md-6 mt-5 pull-right">
          <img src={children.iconTwitter} alt="iconTwitter" 
           className="mr-3 compliance-footer__button-icon" 
           onClick={() => children.goToSocial('t')} />
  
           <img src={children.iconYoutube} alt="iconYoutube" 
           className="mr-3 compliance-footer__button-icon" 
           onClick={() => children.goToSocial('y')} />
  
            <img src={children.iconLinkedin} alt="iconLinkedin" 
           className="mr-3 compliance-footer__button-icon"  
           onClick={() => children.goToSocial('l')} />
  
           <img src={children.iconFacebook} alt="iconFacebook" 
           className="mr-3 compliance-footer__button-icon" 
           onClick={() => children.goToSocial('f')} />
        </div>
    </div>
    <div className="row"> 
      <div className="col-md-12 text-justify">
      <p className="rights-reserved-login my-lg-4"> 
         {i18n.t('footer.all-reserved-right')}
          <a href={window.TERMS_AND_CONDITIONS_URL} 
          className="compliance-footer__disclaimer-text--link" target="_blank">
            {i18n.t('footer.legal-warning')}
            </a> 
          <span className="compliance-footer__delimiter">|</span> 
          <a href={window.PRIVACY_POLICY_URL}
          className="compliance-footer__disclaimer-text--link" target="_blank">
            {i18n.t('footer.privacy-policy')}
            </a> 
          <span className="compliance-footer__delimiter">|</span> 
          <a href={window.COOKIES_POLICY_URL} 
          className="compliance-footer__disclaimer-text--link" target="_blank">
            {i18n.t('footer.cookies-policy')}
          </a>
        </p>
       </div>
    </div>
 </div>
)

export default LoginFooter