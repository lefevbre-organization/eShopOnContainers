import React from 'react'

const LoginFooter = (children) => (
 <div className="login-footer">
    <div className="row">
        <div className="col-md-5 mt-5 compliance-footer__icon-logo pr-4">
         <img src={children.logoFooter} alt="logoFooter" className="mr-5" />
        </div>
        <div className="col-md-6 mt-5 pull-right">
          <img src={children.iconTwitter} alt="iconTwitter" 
           className="mr-3 compliance-footer__button-icon" />
  
           <img src={children.iconYoutube} alt="iconYoutube" 
           className="mr-3 compliance-footer__button-icon" />
  
            <img src={children.iconLinkedin} alt="iconLinkedin" 
           className="mr-3 compliance-footer__button-icon" />
  
           <img src={children.iconFacebook} alt="iconFacebook" 
           className="mr-3 compliance-footer__button-icon" />
        </div>
    </div>
    <div className="row"> 
      <div className="col-md-12 text-justify">
        <p className="rights-reserved-login my-lg-4">©2019 Lefebvre. Todos los derechos reservados. Aviso legal 
        | Política de privacidad | Política de Cookies</p>
       </div>
    </div>
 </div>
)

export default LoginFooter