import React from 'react';

 const LoginHeader = (children) => (

   <div className="login-header">
    <div className="row">
      <div className="col-8 ml-5 mt-3">
       <img src={children.logoHeader} alt="logo" />
      </div>
      <div className="col-2 mt-3 ml-5">
        <div className="row">
         <div className="col-2">
          <img src={children.shopHeader} alt="shop" />
         </div>
         <div className="col-2 mt-1">
          <span className="login-shop">{children.shopTitle}</span>
         </div>
        </div>
      </div>
    </div> 
  </div>
 )

export default LoginHeader
