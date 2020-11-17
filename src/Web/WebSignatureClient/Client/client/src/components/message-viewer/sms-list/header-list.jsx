import React from 'react';
import i18n from 'i18next';

const HeaderList = props => {
    return (
        <div className={`${props.styles.p15} ${props.styles.separador}`}>
        <span className={`${props.styles['certification-email']}`}>{i18n.t('signatureViewer.signerCard.title.signer')}</span>
        <span className={`${props.styles['certification-email']} ml-4`}>{props.signer.phone}</span>
        <div className={`${props.styles['certification-email']} right ${props.styles['mt-n10']}`}>
          <span>
            <b className="mr-1">{i18n.t('emailViewer.certification')}</b> 
            {props.getReceiverEvent(props.certificationType ? props.certificationType.value : '')} 
          </span>
          <div className="text-right"> 
            {
              props.getEventStatus(props.signer, 'certification_completed') === true 
              ? <a href="#" onClick={() => props.downloadTrailDocument(props.smsId, props.signer.id, (props.signer.file ? props.signer.file.name : `${props.signer.name}.pdf`), props.auth)}> 
                  <span className="lf-icon-download mr-2"></span> 
                  {i18n.t('emailViewer.buttons.downloadTrail')}
                </a>
              : ''
            }
          </div>        
        </div>
      </div>
    )
}

export default HeaderList;