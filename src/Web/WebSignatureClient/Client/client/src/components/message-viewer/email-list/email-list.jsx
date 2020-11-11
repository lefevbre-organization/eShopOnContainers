import React from 'react';
import PropTypes from "prop-types";
import i18n from 'i18next';
import {downloadAttachments2} from "../../../services/api-signaturit";

const EmailList = (props) => {

  const documentFilter = props.email.certificates.filter(a => a.email === props.signer.email)
  var documentType = props.signer.events.find(x => x.type === 'documents_opened' || x.type === 'document_opened');
  var certificationCompleted = props.getEventStatus(props.signer, 'certification_completed');
  documentType = (documentType === undefined) ? '' : documentType.type;
   
  return( 
    <div className={props.styles['cont-info-firmantes']}>
      <div className={`${props.styles.p15} ${props.styles.separador}`}>
        <span className={`${props.styles['certification-email']}`}>{i18n.t('signatureViewer.signerCard.title.signer')}</span>
        <span className={`${props.styles['certification-email']} ml-4`}>{props.signer.email}</span>
        <div className={`${props.styles['certification-email']} right ${props.styles['mt-n10']}`}>
          <span>
            <b className="mr-1">{i18n.t('emailViewer.certification')}</b> 
            {props.getReceiverEvent(props.certificationType ? props.certificationType.value : '')} 
          </span>
          <div className="text-right"> 
            {
              props.getEventStatus(props.signer, 'certification_completed') === true 
              ? <a href="#" onClick={() => props.downloadTrailDocument(props.emailId, props.signer.id, (props.signer.file ? props.signer.file.name : `${props.signer.name}.pdf`), props.auth)}> 
                  <span className="lf-icon-download mr-2"></span> 
                  {i18n.t('emailViewer.buttons.downloadTrail')}
                </a>
              : ''
            }
          </div>        
        </div>
      </div>
      <div className={`${props.styles.p15}  
        ${(props.certificationType) 
        && (props.certificationType.value === 'open_document' 
        || props.certificationType.value === 'open_every_document'
        || props.certificationType.value === 'download_document'
        || props.certificationType.value === 'download_every_document') 
          ? props.styles['separador-email'] 
          : props.styles['separador']}`}
      >
        <div className={props.styles['tit-firmante']}>{i18n.t('signatureViewer.signerCard.body.title')}</div>
          <div className={`${props.styles['seguimiento-certification-individual']} ${((props.getEventStatus(props.signer, 'email_processed') === false) ? props.styles['no-completado']: ``)}`}>
            <span className="lf-icon-send"></span>
              <div className={props.styles['cont-check-seguimiento']}>
                <span className={`${((props.getEventStatus(props.signer, 'email_processed')) ? `lf-icon-check-round-full `: ``)} ${props.styles['check-seguimiento']}`}></span>
                <div className={`${props.styles.linea} ${props.styles['primer-estado']}`}></div>
                <div className={props.styles.info}>
                  <div className={props.styles.estado}> {i18n.t('signatureViewer.signerCard.body.emailSent')}</div>
                  {props.getEventDate(props.signer, 'email_processed').split(' ')[0]}<br/>
                  {props.getEventDate(props.signer, 'email_processed').split(' ')[1]}
                </div>
                <div className={props.styles.clearfix}></div>
              </div>
            <div className={props.styles.clearfix}></div>
          </div>
          <div className={`${props.styles['seguimiento-certification-individual']} ${((props.getEventStatus(props.signer, 'email_delivered') === false) ? props.styles['no-completado']: ``)}`}>
            <span className={`lf-icon-mail`}></span>
            <div className={props.styles['cont-check-seguimiento']}>
              <span className={`${((props.getEventStatus(props.signer, 'email_delivered')) ? `lf-icon-check-round-full `: ``)} ${props.styles['check-seguimiento']}`}></span>
              <div className={props.styles.linea}></div>
              <div className={props.styles.info}>
                <div className={props.styles.estado}> {i18n.t('signatureViewer.signerCard.body.emailDelivered')}</div>
                {props.getEventDate(props.signer, 'email_delivered').split(' ')[0]}<br/>
                {props.getEventDate(props.signer, 'email_delivered').split(' ')[1]}
              </div>
              <div className={props.styles.clearfix}></div>
            </div>
            <div className={props.styles.clearfix}></div>
          </div>
          {
            (props.certificationType) 
            && (props.certificationType.value === 'open_email' 
            || props.certificationType.value === 'open_document' 
            || props.certificationType.value === 'open_every_document'
            || props.certificationType.value === 'download_document'
            || props.certificationType.value === 'download_every_document') 
              ? <div className={`
                  ${props.styles['seguimiento-certification-individual']} 
                  ${((props.getEventStatus(props.signer, 'email_opened')) 
                  || (props.getEventStatus(props.signer, 'documents_opened')
                  || props.getEventStatus(props.signer, 'document_opened')) 
                    ? `` 
                    : props.styles['no-completado'])}`}
                >
                  <span className="lf-icon-mail-open"></span>
                  <div className={props.styles['cont-check-seguimiento']}>
                    <span className={`
                      ${((props.getEventStatus(props.signer, 'email_opened')) 
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
                      {props.getEventDate(props.signer, 'email_opened').split(' ')[0]}<br/>
                      {props.getEventDate(props.signer, 'email_opened').split(' ')[1]}
                    </div>
                    <div className={props.styles.clearfix}></div>
                  </div>
                  <div className={props.styles.clearfix}></div>
                </div> 
              : null}
          {
            (props.certificationType) 
            && (props.certificationType.value === 'open_document' 
            || props.certificationType.value === 'open_every_document'
            || props.certificationType.value === 'download_document'
            || props.certificationType.value === 'download_every_document') 
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
                              {/* {props.signer.events.filter(x => x.type === 'documents_opened').length}/{documentFilter.length} */}
                              {props.getDocments(props.email, documentFilter)}/{documentFilter.length}
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
          (props.certificationType) 
          && (props.certificationType.value === 'open_document' 
          || props.certificationType.value === 'open_every_document'
          || props.certificationType.value === 'download_document'
          || props.certificationType.value === 'download_every_document')
            ? <div className={props.styles.p15}>
                <h2 className={props.styles['document-title']}>{i18n.t('emailViewer.attaches')}</h2>
                {documentFilter.map(certificate => 
                  <div>
                    {
                      (props.getEventStatus(certificate, "document_opened") === true)
                      || (props.getEventStatus(certificate, documentType) && certificationCompleted)  
                        ? <div className={props.styles['document-opened']}>
                            <div className={`${props.styles['certificate-document-title']} light-blue-text`}><b>{i18n.t('emailViewer.attachedDocOpened')}</b></div>
                            <div className={`${props.styles['certificate-document']} light-blue-text`}>
                              <span className="lf-icon-document-validate">{certificate.file.name}</span>
                            </div>
                            {
                              (props.certificationType.value === 'open_document')
                                ? <div>
                                    <span className="mr-4">{props.getEventDate(certificate, documentType).split(' ')[0]}</span>
                                    <span className="mr-4">{props.getEventDate(certificate, documentType).split(' ')[1]}</span>
                                  </div>
                                : <div>
                                    <span className="mr-4">{props.getEventDate(certificate, "document_opened").split(' ')[0]}</span>
                                    <span className="mr-4">{props.getEventDate(certificate, "document_opened").split(' ')[1]}</span>
                                  </div>
                            }
                          </div>
                        : <div className={props.styles['document-opened']}>
                            <div className={`${props.styles['certificate-pending']}`}><b>{i18n.t('emailViewer.pendingDoc')}</b></div>
                            <div>
                              <span className="lf-icon-document">{certificate.file.name}</span>
                            </div>
                          </div>
                    }
                  </div>    
                )}
              </div> 
            : null
        }
    </div>
  )
}

EmailList.propTypes = {
  refreshMessageActiveRequests: PropTypes.number,
  selectedMessage: PropTypes.object,
  className: PropTypes.string
};

EmailList.defaultProps = {
  className: ''
};

export default EmailList;