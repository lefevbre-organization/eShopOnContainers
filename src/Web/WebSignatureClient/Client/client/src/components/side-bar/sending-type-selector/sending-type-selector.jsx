import React, { useState } from 'react';
import i18n from 'i18next';
import SendingType from './sending-type';
import { DialogComponent } from '@syncfusion/ej2-react-popups';

const SendingTypeSelector = props => {
  const [hideAlertDialog, setHideAlertDialog] = useState(false);

  const getConfirm = () => {
    setHideAlertDialog(true);
  };

  const dialogClose = () => {
    setHideAlertDialog(false);
  };

  const contenido = `
    <img border='0' src='assets/images/icon-warning.png'></img>
    <div style='text-align: justify; text-justify: inter-word; align-self: center;'>
      ${i18n.t("noServiceModal.text")}<br/>
      ${i18n.t("noServiceModal.text2")}
    </div>`;

  return (
    <>
      <SendingType
        title={i18n.t('sideBar.signature')}
        subTitle={i18n.t('sideBar.sendingTypeSignature')}
        getConfirm={getConfirm}
        onClick={props.onNewMessage}
        disable={ props.lefebvre.roles
                      && props.lefebvre.roles.includes('Firma Digital') ?
          true : false} />

      <SendingType
        title={i18n.t('sideBar.certifiedEmail')}
        subTitle={i18n.t('sideBar.sendingTypeEmail')}
        getConfirm={getConfirm}
        onClick={props.onNewEmailCertificate}
        disable={ props.lefebvre.roles
          && props.lefebvre.roles.includes('Email Certificado') ?
          true : false} />

      <SendingType
        title={i18n.t('sideBar.certifiedSms')}
        subTitle={i18n.t('sideBar.sendingTypeSms')}
        getConfirm={getConfirm}
        onClick={props.onNewSmsCertificate}
        disable={ props.lefebvre.roles
          && props.lefebvre.roles.includes('SMS certificado') ?
          false : true } />

        <SendingType
        title={i18n.t('sideBar.certifiedDocument')}
        subTitle={i18n.t('sideBar.sendingTypeDocument')}
        getConfirm={getConfirm}
        onClick={props.onNewDocumentCertificate}
        disable={ props.lefebvre.roles
          && props.lefebvre.roles.includes('SMS certificado') ?
          false : true } />

        <DialogComponent
          id="noServiceDialog"
          visible={hideAlertDialog}
          width='50%'
          showCloseIcon={true}
          content={contenido}
          close={dialogClose}
        />
      </>
  );
};

export default SendingTypeSelector;
