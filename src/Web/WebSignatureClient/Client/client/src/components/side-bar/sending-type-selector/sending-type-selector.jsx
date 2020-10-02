import React from 'react';
import i18n from 'i18next';

const SendingTypeSelector = (props) => {
    return (
      <>
        { 
          props.lefebvre.roles && props.lefebvre.roles.includes('Firma Digital') ? 
          <div className="box-sending sending-signature" onClick={props.onNewMessage}>
            <p>
             {/* <span className='lf-icon-check-round icon-color'></span> */}
             <b>{i18n.t('sideBar.signature')}</b>
             <br />
             {i18n.t('sideBar.sendingTypeSignature')}
            </p>
            <div className="space-icon-right"><span className='lf-icon-angle-right'></span></div>
           </div>
          : null}
        { 
          props.lefebvre.roles && props.lefebvre.roles.includes('Email Certificado') ?
          <div className="box-sending sending-email box-space" onClick={props.onNewEmailCertificate}>
              <p>
               {/* <span className='lf-icon-mail icon-color'></span> */}
               <b>{i18n.t('sideBar.certifiedEmail')}</b>
               <br/>
               {i18n.t('sideBar.sendingTypeEmail')}
              </p>
              <div className="space-icon-right"><span className='lf-icon-angle-right'></span></div>
          </div>
        : null}
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