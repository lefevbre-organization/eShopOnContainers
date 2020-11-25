import React from 'react';
import i18n from 'i18next';

const HeaderList = props => {
  const additionalInfo = props.sms.data.find(x => x.key == 'additional_info');
  const emails = additionalInfo ? additionalInfo.value.split(':')[3] : '';
  const email = emails.split('=')[1]  !== '|' ? emails.split('=')[1] : '';
  const name = props.signer.name;
    return (
        <div className={`${props.styles.p15} ${props.styles.separador} ${props.styles['container-header-list']}`}>
        <div>
          <div>
            <span className={`${props.styles['certification-email']}`}>{i18n.t('signatureViewer.signerCard.title.signer')}</span>
            <span className={`${props.styles['certification-email']} ml-4`}>{name ? name : email}: {props.signer.phone}</span>
          </div>
          <div className="text-center"> 
            <span>
             {name ? email : ''}
           </span>
          </div>
        </div>
        <div className={`${props.styles['certification-email']} text-right ${props.styles['mt-n10']}`}>
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