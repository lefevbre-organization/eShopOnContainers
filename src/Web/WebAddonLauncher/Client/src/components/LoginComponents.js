import React from 'react';

 const LoginComponents = (children) =>  {
   const verificationLogin = children.errorsMessage.login ? (
     <div className="errorsMessage">{children.errorsMessage.login}</div>
      ) : null;

    const verificationEmail = children.errorsMessage.email ? (
      <div className="errorsMessage">{children.errorsMessage.email}</div>
    ) : null;

   const verificationPassword = children.errorsMessage.password ? (
      <div className="errorsMessage">{children.errorsMessage.password}</div>
    ) : null;
        
   const verificationAuth = children.errorsMessage.auth ? (
     <div className="errorsMessageAuth">{children.errorsMessage.auth}</div>
    ) : null;

   return (
    <div className="main-box">
    <div className="row">
     <div className="offset-md-3 col-md-6">
       <div className="login-box">
         <div className="text-center login-title-space">
         <img className="logo-lexon" src={children.logoLexon} alt="logo" />
         </div>
           <div className="row">
             <div className="col-md-8 offset-md-2 mb-5">
               <div className="ml-md-n4 mb-4 ml-sm-5">
                 <div className="input-group login-input-group">
                  <div className="input-group-prepend">
                    <span className="input-group-text" id="inputGroupPrepend">
                      <img src={children.iconUser}/>
                    </span>
                  </div>
                 <input type="text" name="login" className="form-control login-input" 
                  placeholder="Usuario" onChange={children.handleChange} />
                  {verificationLogin || verificationEmail ? <i className="lf-icon-close-round-full front-login__input-error-icon"></i> 
                   : null} 
                 </div>
                 { verificationLogin }
                 { verificationEmail }
               </div>
               <div className="ml-md-n4 mb-4 ml-sm-5 pt-1">
                 <div className="input-group login-input-group">
                  <div className="input-group-prepend">
                    <span className="input-group-text" id="inputGroupPrepend">
                      <img src={children.iconLock}/>
                    </span>
                  </div>
                   <input type="password" name="password" className="form-control login-input" 
                    onChange={children.handleChange} placeholder="Contraseña" />
                   {verificationPassword ?  <i className="lf-icon-close-round-full front-login__input-error-icon"></i> 
                   : null} 
                 </div>
                 { verificationPassword }
               </div>
               <div className="ml-n4 pt-4">
                 <button onClick={children.handleEventAddon} className="btn btn-label btn-login"> INICIAR SESIÓN
                </button>
                { verificationAuth }
               </div>
                <p className="mt-3 front-login__info-block">{children.notClient} <a className="front-login__info-block-link" 
                href="https://espaciolefebvre.lefebvre.es/solicitar-informacion"> {children.requestInfo} </a></p>
             </div>
             </div>
            <div className="login-help">
             <p className="pt-3 need-help mb-4">
              {children.needHelp}
             </p>
             <p className="client mt-n3">{children.phoneNumber}
               <a className="front-login__information-contact-email"> {children.client}</a>
            </p>
            </div>
          </div>
        </div>
      </div>
    </div>

  )}

export default LoginComponents