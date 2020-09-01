import React from 'react';
import PropTypes from "prop-types";
import i18n from 'i18next';

const SignatureList = (props) => {
  let remindersSent = false;
    return( 
        <div className={props.styles['cont-info-firmantes']}>
          <div className={`${props.styles.p15} ${props.styles.separador}`}>
              <div className={`${props.styles['tit-firmante']} left`}>{i18n.t('signatureViewer.signerCard.title.signers')} {(props.index + 1)}</div>
                <span className={`${props.styles['name_firmante']} left`}>{props.signer.name}:</span>
                <span className={props.styles.email}>{props.signer.email}</span>
                <div className={`${props.styles['numero_firmante']} `}>
                <ul>
                 <li> {i18n.t('messageEditor.grid.role')}: Firmante</li>
                 <li> {i18n.t('messageEditor.grid.signatureType')}: Certificado electrónico</li>
                 <li> {i18n.t('messageEditor.grid.doubleAuthentication')}: Foto (3 fotos adjuntas)</li>
                </ul>
                </div>
              </div>
              <div className={`${props.styles.p15} ${props.styles.separador}`}>
                <div className={props.styles['tit-firmante']}>{i18n.t('signatureViewer.signerCard.body.title')}</div>
                <div className={`${props.styles['seguimiento-firmante-individual']} ${((props.getEventStatus(props.signer, 'email_processed') === false) ? props.styles['no-completado']: ``)}`}>
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
                <div className={`${props.styles['seguimiento-firmante-individual']} ${((props.getEventStatus(props.signer, 'email_delivered') === false) ? props.styles['no-completado']: ``)}`}>
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
                <div className={`${props.styles['seguimiento-firmante-individual']} ${((props.getEventStatus(props.signer, 'email_opened')) || 
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
                <div className={`${props.styles['seguimiento-firmante-individual']} ${((props.getEventStatus(props.signer, 'document_opened') === false) ? props.styles['no-completado']: ``)}`}>
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
                {/* <div className={`${props.styles['seguimiento-firmante-individual']} ${props.styles['no-completado']}`}> */}
                <div className={`${props.styles['seguimiento-firmante-individual']} ${((props.getEventStatus(props.signer, 'document_signed') === false) && (props.getEventStatus(props.signer, 'validated') === false) ? props.styles['no-completado']: ``)}`}>
                  <span className='lf-icon-document-validate'></span>
                  <div className={props.styles['cont-check-seguimiento']}>
                      <span className={`${((props.getEventStatus(props.signer, 'document_signed') === true || props.getEventStatus(props.signer, 'validated') === true) ? `lf-icon-check-round-full `: ``)} ${props.styles['check-seguimiento']}`}></span>
                      <div className={props.styles.linea}></div>
                      <div className={props.styles.info}>
                          <div className={props.styles.estado}>
                            {props.getEventStatus(props.signer, 'validated') ? `Documento validado` : i18n.t('signatureViewer.signerCard.body.docSigned')}
                          </div>
                            {/* {i18n.t('signatureViewer.signerCard.body.docSigned')}</div> */}
                            {props.getEventDate(props.signer, 'document_signed').split(' ')[0]}<br/>
                            {props.getEventDate(props.signer, 'document_signed').split(' ')[1]}

                      </div>
                  </div>
                  <div className={props.styles.clearfix}></div>
                </div>
                <div className={props.styles.clearfix}></div>
              </div>
              <div className={props.styles.p15}>
                <div className={props.styles['tit-firmante']}>{i18n.t('signatureViewer.signerCard.footer.title')}</div>
                <p>
                  {
                    props.signer.events.map(event => 
                      { 
                        if (event.type === 'reminder_email_processed'){
                          remindersSent = true;
                          return (
                            <span className={props.styles.fecha}>
                              {`${props.getSingleEventDate(event, 'reminder_email_processed')}`}<br/>
                            </span>
                          )
                        }
                      }
                    )
                  }
                  {(remindersSent ? null : i18n.t('signatureViewer.signerCard.footer.subtitle'))}
                </p>
              </div>
          </div>
        )
}

SignatureList.propTypes = {
  refreshMessageActiveRequests: PropTypes.number,
  selectedMessage: PropTypes.object,
  className: PropTypes.string
};

SignatureList.defaultProps = {
  className: ''
};

export default SignatureList;