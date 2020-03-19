import React from 'react'

const LoginFooter = (children) => (
 <div className="login-footer">
     <div className="row">
        <div className="col-9 ml-5 mt-5">
        <img src={children.logoFooter} alt="logoFooter" />
        <p className="rights-reserved-login my-4">©2019 Lefebvre. Todos los derechos reservados. Aviso legal 
            | Política de privacidad | Política de Cookies</p>
        </div>
        <div className="col-2 mt-5 ml-5">
         <img src={children.iconFacebook} alt="iconFacebook" className="mr-3" />
         <img src={children.iconLinkedin} alt="iconLinkedin" className="mr-3" />
         <img src={children.iconYoutube} alt="iconYoutube" className="mr-3" />
         <img src={children.iconTwitter} alt="iconTwitter" className="mr-3" />
        </div>
     </div>

 </div>
)

export default LoginFooter