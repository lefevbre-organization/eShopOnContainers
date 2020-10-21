import React from 'react';


const SendingType = props => (
  <>
   {
     props.disable ?
       <div className="box-sending sending-email box-space" onClick={props.onClick}>
         <p>
           <b>{props.title}</b>
           <br/>
           {props.subTitle}
         </p>
         <div className="space-icon-right"><span className='lf-icon-angle-right'></span></div>
       </div>
       : <div className="box-sending sending-email box-space disable" onClick={props.getConfirm}>
         <p>
           <b>{props.title}</b>
           <br/>
           {props.subTitle}
         </p>
         <div className="space-icon-right"><span className='lf-icon-angle-right'></span></div>
       </div>}


       <style jsx global>
         {` 
            .box-sending {
             border: 1px solid #001978;
             height: 70px;
             cursor: pointer;
             color: #001978;
             width: 90%;
             margin-left: 22px;
            }

            .box-sending p {
             margin-top: 18px;
             margin-bottom: 1rem;
             margin-left: 10px;
             font-size: 15px;
            }

            .sending-signature:hover {
              background-color: #001978 ;
              color: white;
            }

            .sending-email:hover {
              background-color: #001978 ;
              color: white;
            }

            .box-space {
             margin-top: 10px;
            }

            .disable {
              background: #9c9c9c;
              border: 1px solid #9c9c9c;
              color: #fff;
            }

            .disable:hover {
              background-color: #9c9c9c ;
              color: white;
            }
           
            .space-icon-right {
              text-align: right;
              position: relative;
              top: -45px;
              right: 5px;
              font-size: 20px;
            }
           
        `}
       </style>

  </>
);

export default SendingType;
