import React from 'react'

const LoginComponents = (children) => (
    <div className="container box-space footer-space">
    <div className="row">
     <div className="col-md-7 offset-md-4">
       <div className="login-box">
         <div className="text-center login-title-space">
           <h2 className="login-title-lefebvre botton-title-space">LEFEBVRE</h2>
           <h2 className="login-title-lex-on botton-title-space">LEX-ON</h2>
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
                  placeholder="usuario@gmail.com" onChange={children.handleChange} />
                 </div>
               </div>
               <div className="ml-n4 mb-4">
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
               <div className="ml-n4 my-4">
                 <button onClick={children.handleEvent} className="btn btn-label btn-login"> INICIAR SESIÓN
                </button>
               </div>
                <p>{children.notClient} <a href="#"> 
                {children.requestInfo}</a></p>
             </div>
             </div>
            <div className="login-help">
             <p className="need-help pt-2">
               <a href="#" >{children.needHelp}</a>
             </p>
             <p className="client">{children.phoneNumber}
               <span className="separate"></span>
               <a href="#"> {children.client}</a>
            </p>
            </div>
          </div>
        </div>
      </div>
    </div>

)

export default LoginComponents