import React from 'react'

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
        <p className="rights-reserved-login my-lg-4">©2020 Lefebvre. Todos los derechos reservados. 
         <a href="https://lefebvre.es/aviso-legal" 
         className="compliance-footer__disclaimer-text--link" target="_blank">Aviso legal</a> 
         <span className="compliance-footer__delimiter">|</span> 
         <a href="https://lefebvre.es/politica-privacidad" 
         className="compliance-footer__disclaimer-text--link" target="_blank">Política de privacidad</a> 
         <span className="compliance-footer__delimiter">|</span> 
         <a href="https://lefebvre.es/politica-cookies" 
         className="compliance-footer__disclaimer-text--link" target="_blank">Política de Cookies</a></p>
       </div>
    </div>
 </div>
)

export default LoginFooter