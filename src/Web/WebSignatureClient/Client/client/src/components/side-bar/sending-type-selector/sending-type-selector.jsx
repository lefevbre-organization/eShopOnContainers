import React from 'react';

const SendingTypeSelector = (props) => {
    return (
      <>
       <div className="box-sending-sending" onClick={props.onNewMessage}>
            <p>
             <span className='lf-icon-check-round icon-color'></span>
             Firma
            </p>
            <div className="space-icon-right"><span className='lf-icon-angle-right'></span></div>
           
       </div>
        <div className="box-sending-sending box-space">
            <p>
             <span className='lf-icon-mail icon-color'></span>
             Email certificado
            </p>
            <div className="space-icon-right"><span className='lf-icon-angle-right'></span></div>
        </div>
       <style jsx global>
        {` 
            .box-sending-sending {
             border: 1px solid darkgrey;
             height: 55px;
             cursor: pointer;
            }

            .box-sending-sending p {
             margin-top: 18px;
             margin-bottom: 1rem;
             margin-left: 10px;
             font-size: 15px;
            }

            .box-space {
             margin-top: 10px;
            }

            .icon-color {
             color: #001978;
             margin-right: 10px;
            }

            .space-icon-right {
             text-align: right;
             position: relative;
             top: -30px;
             right: 5px;
            }
        `}
       </style>
     </>
    )
}

export default SendingTypeSelector;