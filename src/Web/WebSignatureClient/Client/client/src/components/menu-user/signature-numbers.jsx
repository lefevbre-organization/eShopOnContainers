import React from 'react';

const SignatureNumbers = props => (
  <div className="container">
    <div className="signature-summary">
      <span className={props.type === "signature"
        ? "lf-icon-signature"
        : "lf-icon-mail"}> {props.title}</span>
    </div>
    <div className="container-summary">
      <div className="signature-available">
        <span>{props.available}</span>
      </div>
      <div className="available-number box-number">
        <span>{props.availablenumber}</span>
      </div>
    </div>
    <div className="container-summary">
      <div className="signature-consumed">
        <span>{props.consumed}</span>
      </div>
      <div className="consumed-number box-number">
        <span>{props.signatureConsumed}</span>
      </div>
    </div>
    <style jsx>{`
            .container {
              margin-top: 20px;  
            }

            .signature-summary {
              margin-bottom: 15px;
            }
  
            .container-summary {
              display: fex;
              margin-bottom: 10px
            }
  
            .signature-available {
              flex: 0 0 81%;
              border-bottom: 1px solid;
            }
  
            .signature-consumed {
              flex: 0 0 81%;
              border-bottom: 1px solid #96979C;
              color: #96979C
            }
  
            .box-number {
              width: 70px;
              height: 30px;
              text-align: center;
              padding-top: 4px;
              color: white;
            }
  
            .available-number { 
             background: #001978;
            }
            
            .consumed-number {
              background: #96979C;
            }
        `}</style>
  </div>
);

export default SignatureNumbers;
