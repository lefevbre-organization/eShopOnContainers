import React from 'react';

 const LoginHeader = (children) => (

   <div className="login-header">
    <div className="row">
      <div className="front-login__go-home">
       <img src={children.logoHeader} alt="logo" />
      </div>
      <div className="front-login__go-shop">
        <div className="row">
         <div className="front-login__go-shop-icon">
          <img src={children.shopHeader} alt="shop" />
         </div>
         <div className="mt-1">
          <span className="login-shop">{children.shopTitle}</span>
         </div>
        </div>
      </div>
    </div> 
  </div>
 )

export default LoginHeader
