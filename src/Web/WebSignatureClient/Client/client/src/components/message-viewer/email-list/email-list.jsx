import React from 'react';
import PropTypes from "prop-types";
import i18n from 'i18next';
import {downloadAttachments2} from "../../../services/api-signaturit";

const EmailList = (props) => {
    return( 
        <div className={props.styles['cont-info-firmantes']}>
            <div className={`${props.styles.p15} ${props.styles.separador}`}>
              <span className={`${props.styles['certification-email']}`}>{i18n.t('signatureViewer.signerCard.title.signer')}</span>
              <span className={`${props.styles['certification-email']} ml-4`}>Maria Cruces: maria.cruces@g2.com</span>
              <div className={`${props.styles['certification-email']} right ${props.styles['mt-n10']}`}>
               <span><b>Certificación:</b> el receptor ha abierto el mail</span>
               <div className="text-right"> 
               <a href="#"> 
                <span className="lf-icon-download mr-2"></span> 
                {i18n.t('emailViewer.buttons.downloadTrail')}
               </a>
               </div>
              
            </div>
            </div>
              <div className={`${props.styles.p15} ${props.styles.separador}`}>
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
                <div className={`${props.styles['seguimiento-certification-individual']} ${((props.getEventStatus(props.signer, 'email_opened')) || 
                (props.getEventStatus(props.signer, 'document_opened'))   ? `` :  props.styles['no-completado'])}`}>
                  <span className="lf-icon-mail-open"></span>
                  <div className={props.styles['cont-check-seguimiento']}>
                      <span className={`${((props.getEventStatus(props.signer, 'email_opened')) || 
                      (props.getEventStatus(props.signer, 'document_opened')) ? `lf-icon-check-round-full `: ``)} ${props.styles['check-seguimiento']}`}></span>
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
                <div className={`${props.styles['seguimiento-certification-individual']} ${((props.getEventStatus(props.signer, 'document_opened') === false) ? props.styles['no-completado']: ``)}`}>
                  <span className="lf-icon-document"></span>
                  <div className={props.styles['cont-check-seguimiento']}>
                      <span className={`${((props.getEventStatus(props.signer, 'document_opened')) ? `lf-icon-check-round-full `: ``)} ${props.styles['check-seguimiento']}`}></span>
                      <div className={props.styles.linea}></div>
                        <div className={props.styles.info}>
                              <div className={props.styles.estado}>{i18n.t('signatureViewer.signerCard.body.docOpened')}</div>
                                {props.getEventDate(props.signer, 'document_opened').split(' ')[0]}<br/>
                                {props.getEventDate(props.signer, 'document_opened').split(' ')[1]}
                        </div>
                      <div className={props.styles.clearfix}></div>
                  </div>
                </div>
                <div className={props.styles.clearfix}></div>
              </div>
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