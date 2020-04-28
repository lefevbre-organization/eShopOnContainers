import React from 'react'

const LoginComponents = (children) => (
    <div className="container box-space footer-space">
    <div className="row">
     <div className="offset-md-3 col-md-6">
       <div className="login-box">
         <div className="text-center login-title-space">
         <img className="logo-lexon" src={children.logoLexon} alt="logo" />
         </div>
           <div className="row">
             <div className="col-md-8 offset-md-2 mb-5">
               <div className="ml-n4 mb-4">
                 <div className="input-group login-input-group">
                  <div className="input-group-prepend">
                    <span className="input-group-text" id="inputGroupPrepend">
                      <img src={children.iconUser}/>
                    </span>
                  </div>
                 <input type="text" name="login" className="form-control login-input" 
                  placeholder="Usuario" onChange={children.handleChange} />
                 </div>
               </div>
               <div className="ml-n4 mb-4 pt-1">
                 <div className="input-group login-input-group">
                  <div className="input-group-prepend">
                    <span className="input-group-text" id="inputGroupPrepend">
                      <img src={children.iconLock}/>
                    </span>
                  </div>
                   <input type="password" name="password" className="form-control login-input" 
                    onChange={children.handleChange} placeholder="Contraseña" />
                 </div>
               </div>
               <div className="ml-n4 pt-4">
                 <button onClick={children.handleEvent} className="btn btn-label btn-login"> INICIAR SESIÓN
                </button>
               </div>
                <p className="mt-3 front-login__info-block">{children.notClient} <a className="front-login__info-block-link" 
                href="https://espaciolefebvre.lefebvre.es/solicitar-informacion"> {children.requestInfo} </a></p>
             </div>
             </div>
            <div className="login-help">
             <p className="pt-2 need-help mb-3">
              {children.needHelp}
             </p>
             <p className="client mt-n3">{children.phoneNumber}
               {/* <span className="separate"></span> */}
               <a className="front-login__information-contact-email"> {children.client}</a>
            </p>
            </div>
          </div>
        </div>
      </div>
    </div>

)

export default LoginComponents