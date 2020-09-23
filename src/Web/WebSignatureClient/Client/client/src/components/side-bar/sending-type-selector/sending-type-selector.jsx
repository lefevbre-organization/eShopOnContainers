import React from 'react';
import i18n from 'i18next';

const SendingTypeSelector = (props) => {
    return (
      <>
      <p>{i18n.t('sideBar.typeSending')}:</p>
       <div className="box-sending sending-signature" onClick={props.onNewMessage}>
            <p>
             {/* <span className='lf-icon-check-round icon-color'></span> */}
             {i18n.t('sideBar.signature')}
             <br />
             {i18n.t('sideBar.sendingTypeSignature')}
            </p>
            <div className="space-icon-right"><span className='lf-icon-angle-right'></span></div>
       </div>
        <div className="box-sending sending-email box-space" onClick={props.onNewEmailCertificate}>
            <p>
             {/* <span className='lf-icon-mail icon-color'></span> */}
             {i18n.t('sideBar.certifiedEmail')}
             <br/>
             {i18n.t('sideBar.sendingTypeEmail')}
            </p>
            <div className="space-icon-right"><span className='lf-icon-angle-right'></span></div>
        </div>
       <style jsx global>
        {` 
            .box-sending {
             border: 1px solid white;
             height: 70px;
             cursor: pointer;
            }

            .box-sending p {
             margin-top: 18px;
             margin-bottom: 1rem;
             margin-left: 10px;
             font-size: 15px;
            }

            .sending-signature:hover {
              background-color: white;
              color: #001978;
            }

            .sending-email:hover {
              background-color: white;
              color: #001978;
            }

            .box-space {
             margin-top: 10px;
            }

            // .icon-color {
            //  color: #001978;
            //  margin-right: 10px;
            // }

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
    )
}

export default SendingTypeSelector;