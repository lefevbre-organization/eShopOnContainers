import React from 'react';
import PropTypes from "prop-types";
import i18n from 'i18next';
import HeaderContent from './header-content';
import {
    RichTextEditorComponent
  } from '@syncfusion/ej2-react-richtexteditor';
  
const EmailContent = (props) => {

   
  return( 
    <div className={props.styles['cont-info-firmantes']}>
      <HeaderContent {...props} />
      <div className={`${props.styles.p15}  
        ${(props.certificationType) 
        && (props.certificationType.value === 'open_document' 
        || props.certificationType.value === 'open_every_document'
        || props.certificationType.value === 'download_document'
        || props.certificationType.value === 'download_every_document') 
          ? props.styles['separador-email'] 
          : props.styles['separador']}`}
      >
        <div className={props.styles['tit-firmante']}>
          {i18n.t('signatureViewer.contentCard.subject.title')}
          <span className={`${props.styles['certification-subject']}`}> {props.subject}</span>
        </div>
        <div className={props.styles['tit-firmante']}>{i18n.t('signatureViewer.contentCard.body.title')}</div>
        <iframe
            title='Message contents'
            id='message-iframe'
            srcDoc={props.content}
            className={`${props.styles['email-content']}`}
        />
        <div className={props.styles.clearfix}></div>
      </div>
    </div>
  )
}

EmailContent.propTypes = {
  refreshMessageActiveRequests: PropTypes.number,
  selectedMessage: PropTypes.object,
  className: PropTypes.string
};

EmailContent.defaultProps = {
  className: ''
};

export default EmailContent;