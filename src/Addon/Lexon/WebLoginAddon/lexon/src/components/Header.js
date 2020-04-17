import React from 'react';
import iconLexon from '../assets/img/icon-lexon.png'
import '../assets/styles/components/header.sass';
 
 const Header = () => (
    <div className="header">
       <div className="row">
          <div className="col-1 pt-3 ml-5">
           <img src={iconLexon} alt="Icon" />
          </div>

          <div className="col-10 ml-n5">
          <h2 className="title-header pt-3">Classify messages on Lex-on</h2>
          </div>
       </div>
      
      
    </div>
 )

 export default Header