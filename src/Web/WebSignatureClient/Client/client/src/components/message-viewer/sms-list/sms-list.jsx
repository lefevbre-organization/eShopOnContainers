import React from 'react';
import PropTypes from "prop-types";
import i18n from 'i18next';
import HeaderList from './header-list';
import FooterList from './footer-list';
import {downloadAttachments2} from "../../../services/api-signaturit";

const SmsList = (props) => {

  const certificationType = (props.certificationType !== undefined) ? props.certificationType : 'open_every_document';
  const documentFilter = props.sms.certificates.filter(a => a.phone === props.signer.phone)
  var documentType = props.signer.events.find(x => x.type === 'documents_opened' || x.type === 'document_opened');
  var certificationCompleted = props.getEventStatus(props.signer, 'certification_completed');
  documentType = (documentType === undefined) ? '' : documentType.type;
   
  return( 
    <div className={props.styles['cont-info-firmantes']}>
      <HeaderList {...props} />
      <div className={`${props.styles.p15}  
        ${(certificationType) 
        && (certificationType === 'open_document' 
        || certificationType=== 'open_every_document'
        || certificationType === 'download_document'
        || certificationType === 'download_every_document') 
          ? props.styles['separador-email'] 
          : props.styles['separador']}`}
      >
        <div className={props.styles['tit-firmante']}>{i18n.t('signatureViewer.signerCard.body.title')}</div>
          <div className={`${props.styles['seguimiento-certification-individual']} ${((props.getEventStatus(props.signer, 'sms_processed') === false) ? props.styles['no-completado']: ``)}`}>
            <span className="lf-icon-mobile"></span>
              <div className={props.styles['cont-check-seguimiento']}>
                <span className={`${((props.getEventStatus(props.signer, 'sms_processed')) ? `lf-icon-check-round-full `: ``)} ${props.styles['check-seguimiento']}`}></span>
                <div className={`${props.styles.linea} ${props.styles['primer-estado']}`}></div>
                <div className={props.styles.info}>
                  <div className={props.styles.estado}> {i18n.t('signatureViewer.signerCard.body.emailSent')}</div>
                  {props.getEventDate(props.signer, 'sms_processed').split(' ')[0]}<br/>
                  {props.getEventDate(props.signer, 'sms_processed').split(' ')[1]}
                </div>
                <div className={props.styles.clearfix}></div>
              </div>
            <div className={props.styles.clearfix}></div>
          </div>
          <div className={`${props.styles['seguimiento-certification-individual']} ${((props.getEventStatus(props.signer, 'sms_delivered') === false) ? props.styles['no-completado']: ``)}`}>
            <span className={`lf-icon-sms`}></span>
            <div className={props.styles['cont-check-seguimiento']}>
              <span className={`${((props.getEventStatus(props.signer, 'sms_delivered')) ? `lf-icon-check-round-full `: ``)} ${props.styles['check-seguimiento']}`}></span>
              <div className={props.styles.linea}></div>
              <div className={props.styles.info}>
                <div className={props.styles.estado}> {i18n.t('signatureViewer.signerCard.body.emailDelivered')}</div>
                {props.getEventDate(props.signer, 'sms_delivered').split(' ')[0]}<br/>
                {props.getEventDate(props.signer, 'sms_delivered').split(' ')[1]}
              </div>
              <div className={props.styles.clearfix}></div>
            </div>
            <div className={props.styles.clearfix}></div>
          </div>
          {
            (certificationType) 
            && (certificationType === 'open_sms' 
            || certificationType === 'open_document' 
            || certificationType === 'open_every_document'
            || certificationType === 'download_document'
            || certificationType === 'download_every_document') 
              ? <div className={`
                  ${props.styles['seguimiento-certification-individual']} 
                  ${((props.getEventStatus(props.signer, 'sms_opened')) 
                  || (props.getEventStatus(props.signer, 'documents_opened')
                  || props.getEventStatus(props.signer, 'document_opened')) 
                    ? `` 
                    : props.styles['no-completado'])}`}
                >
                  <span className="lf-icon-sms-open"></span>
                  <div className={props.styles['cont-check-seguimiento']}>
                    <span className={`
                      ${((props.getEventStatus(props.signer, 'sms_opened')) 
                      || (props.getEventStatus(props.signer, 'documents_opened')
                      || props.getEventStatus(props.signer, 'document_opened')) 
                        ? `lf-icon-check-round-full `
                        : ``)} 
                      ${props.styles['check-seguimiento']}`}>
                    </span>
                    <div className={props.styles.linea}></div>
                    <div className={props.styles.info}>
                      <div className={props.styles.estado}>
                        {i18n.t('signatureViewer.signerCard.body.emailOpened')}
                      </div>
                      {props.getEventDate(props.signer, 'sms_opened').split(' ')[0]}<br/>
                      {props.getEventDate(props.signer, 'sms_opened').split(' ')[1]}
                    </div>
                    <div className={props.styles.clearfix}></div>
                  </div>
                  <div className={props.styles.clearfix}></div>
                </div> 
              : null}
          {
            (certificationType) 
            && (certificationType === 'open_document' 
            || certificationType === 'open_every_document'
            || certificationType === 'download_document'
            || certificationType === 'download_every_document') 
              ? <div className={`
                  ${props.styles['seguimiento-certification-individual']} 
                  ${(!certificationCompleted 
                    ? `${props.styles['no-completado']} ${props.styles['no-completado-doc']}` 
                    : ``
                    )}`}
                >
                  <span className="lf-icon-document"></span>
                  <div className={props.styles['cont-check-seguimiento']}>
                    <span className={`
                      ${(certificationCompleted 
                        ? `lf-icon-check-round-full `
                        : ``)} 
                      ${props.styles['check-seguimiento']}`}>
                    </span>
                    <div className={props.styles.linea}></div>
                    <div className={props.styles.info}>
                        <div className={props.styles.estado}>{i18n.t('signatureViewer.signerCard.body.docOpened')}</div>
                        <div>
                          <span className={props.styles['document-detail']}>
                            <b>
                              {props.getDocments(props.sms, documentFilter)}/{documentFilter.length}
                            </b>
                          </span>
                        </div>
                        {/* {documentFilter.length == 1 ?  
                        <div>
                          {props.getEventDate(props.signer, 'document_opened').split(' ')[0]}
                          <br/>
                          {props.getEventDate(props.signer, 'document_opened').split(' ')[1]}
                        </div> : 
                        <div >
                          <span className={props.styles['document-detail']}>
                            <b>
                            {props.signer.events.filter(x => x.type === 'document_opened').length}/{documentFilter.length}
                            </b>
                          </span>
                        </div>
                        }  */}
                    </div>
                    <div className={props.styles.clearfix}></div>
                  </div>
                </div> 
              : null}
          <div className={props.styles.clearfix}></div>
        </div>
        {
          (certificationType) 
          && (certificationType === 'open_document' 
          || certificationType === 'open_every_document'
          || certificationType === 'download_document'
          || certificationType === 'download_every_document')
            ? <div className={props.styles.p15}>
                <h2 className={props.styles['document-title']}>{i18n.t('emailViewer.attaches')}</h2>
                {documentFilter.map(certificate => 
                  <FooterList {...{...props, certificate, documentType}} />   
                )}
              </div> 
            : null
        }
    </div>
  )
}

SmsList.propTypes = {
  refreshMessageActiveRequests: PropTypes.number,
  selectedMessage: PropTypes.object,
  className: PropTypes.string
};

SmsList.defaultProps = {
  className: ''
};

export default SmsList;