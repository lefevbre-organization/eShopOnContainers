import React from "react";
import "./unauthorized.css";

export const Unauthorized = () => {
  return (
    <div className="d-flex w-100 h-100 flex-column justify-content-center align-items-center vertical-center">
      <div className="h1">401 ERROR</div>
      <div>You don't have permission to access this product.</div>
      <div><a target="_self" href="https://www.efl.es/atencion-al-cliente">Contact Customer Support</a></div>
      <p></p>
      <p></p>
      <div class="content">
        <p class="title text-center">¿Necesitas ayuda?</p>
        <div class="inner text-center">
            <span>
              <div class="img"> 
                <img src="/assets/images/necesitas-ayuda-footer.png" alt="Necesitas ayuda" class="mr-3" /> 
              </div>
              <div class="txt">
                <p class="tlf"> <a href="tel:+34902443355">902 443 355</a><br/> <a href="tel:+34912108000">912 108 000</a> </p>
              </div>
            </span>
        </div>
        <p class="horario text-center">8:30-19:00 (L-V)</p>
        <p class="email text-center"><a href="mailto:clientes@lefebvre.es">clientes@lefebvre.es</a></p>
      </div>
    </div>
  );
};
