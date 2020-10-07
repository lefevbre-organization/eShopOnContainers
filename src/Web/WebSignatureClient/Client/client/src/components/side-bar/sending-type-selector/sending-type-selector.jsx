import React, { useState } from 'react';
import i18n from 'i18next';
import { DialogComponent } from '@syncfusion/ej2-react-popups';

const SendingTypeSelector = (props) => {
    const [hideAlertDialog, setHideAlertDialog] = useState(false);

    const getConfirm = () => {
      setHideAlertDialog(true)
    }

   const dialogClose = () => {
     setHideAlertDialog(false)
    }

    const contenido = `
    <img border='0' src='assets/images/icon-warning.png'></img>
    <div style='text-align: justify; text-justify: inter-word; align-self: center;'>
      Lo sentimos. No tienes contratado este servicio de certifiación. 
      Si lo deseas, puedes contactar con nuestro departamento de atención a cliente en el teléfono 911231231 o pinchando <a href='https://www.efl.es/atencion-al-cliente' style='color: white'><u>aquí</u></a>
    </div>`;

    return (
      <>
        { 
          props.lefebvre.roles && props.lefebvre.roles.includes('Firma Digital') ? 
          <div className="box-sending sending-signature" onClick={props.onNewMessage}>
            <p>
             <b>{i18n.t('sideBar.signature')}</b>
             <br />
             {i18n.t('sideBar.sendingTypeSignature')}
            </p>
            <div className="space-icon-right"><span className='lf-icon-angle-right'></span></div>
           </div>
          : <div className="box-sending sending-signature disable" onClick={getConfirm}>
          <p>
           <b>{i18n.t('sideBar.signature')}</b>
           <br />
           {i18n.t('sideBar.sendingTypeSignature')}
          </p>
          <div className="space-icon-right"><span className='lf-icon-angle-right'></span></div>
         </div>}
        { 
          props.lefebvre.roles && props.lefebvre.roles.includes('Email Certificado') ?
          <div className="box-sending sending-email box-space" onClick={props.onNewEmailCertificate}>
              <p>
               <b>{i18n.t('sideBar.certifiedEmail')}</b>
               <br/>
               {i18n.t('sideBar.sendingTypeEmail')}
              </p>
              <div className="space-icon-right"><span className='lf-icon-angle-right'></span></div>
          </div>
        : <div className="box-sending sending-email box-space disable" onClick={getConfirm}>
        <p>
         <b>{i18n.t('sideBar.certifiedEmail')}</b>
         <br/>
         {i18n.t('sideBar.sendingTypeEmail')}
        </p>
        <div className="space-icon-right"><span className='lf-icon-angle-right'></span></div>
    </div>}
      <DialogComponent 
           id="noServiceDialog" 
           visible={hideAlertDialog} 
           width='50%' 
           showCloseIcon={true} 
           content={contenido}
           close={dialogClose}
          />
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
    )
}

export default SendingTypeSelector;