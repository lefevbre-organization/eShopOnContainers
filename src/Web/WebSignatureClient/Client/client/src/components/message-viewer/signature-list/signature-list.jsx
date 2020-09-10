import React from 'react';
import PropTypes from "prop-types";
import i18n from 'i18next';
import {downloadAttachments2} from "../../../services/api-signaturit";

function getRole(config){
  let rol;

  if (config === undefined || config === null){
    return i18n.t('signatureViewer.signerCard.title.signers');
  }

  switch (config[2]) {
    case 'signer':
      rol = i18n.t('signatureViewer.signerCard.title.signers');
      break;
    case 'validator':
      rol = i18n.t('signatureViewer.signerCard.title.validators');
      break;
    default:
      rol = '';
      break;
  }
  return rol;
}

function getType(config){
  let type;

  if (config === undefined || config === null){
    return  i18n.t('signatureViewer.signerCard.title.type.advanced');
  }

  if (config[2] === 'validator'){
    return 'N/A';
  }

  switch (config[3]) {
    case 'advanced':
      type = i18n.t('signatureViewer.signerCard.title.type.advanced');
      break;
    case 'certificate':
      type = i18n.t('signatureViewer.signerCard.title.type.certificate');
      break;
    default:
      type = '';
      break;
  }
  return type;
}

function getDoubleAuth(config){
  let type;

  if (config === undefined || config === null){
    return i18n.t('signatureViewer.signerCard.title.DoubleAuthentication.none');
  }

  switch (config[4]) {
    case 'sms':
      type = i18n.t('signatureViewer.signerCard.title.DoubleAuthentication.sms');
      break;
    case 'photo':
      type = i18n.t('signatureViewer.signerCard.title.DoubleAuthentication.photo');
      break;
    case 'none':
      type =  i18n.t('signatureViewer.signerCard.title.DoubleAuthentication.none');
      break;
    default:
      type = '';
      break;
  }
  return type;
}

function getDoubleAuthInfo(config){
  let info;

  if (config === undefined || config === null){
    return '';
  }

  switch (config[4]) {
    case 'photo':
      info = `${i18n.t('signatureViewer.signerCard.title.DoubleAuthentication.photoNumber').replace('__', config[5])}`;
      break;
    default:
      info = '';
      break;
  }
  return info;
}

const SignatureList = (props) => {
  let remindersSent = false;
  console.log('Props:');
  console.log(props);
  console.log('SignatureConfig:');
  console.log(props.signatureConfig);
  console.log('Status:');
  console.log(props.getEventStatus(props.signer, 'document_signed') === true || props.getEventStatus(props.signer, 'validated') === true);
    return( 
        <div className={props.styles['cont-info-firmantes']}>
          <div className={`${props.styles.p15} ${props.styles.separador}`}>
              <div className={`${props.styles['tit-firmante']} left`}>{getRole(props.signatureConfig)}</div>
                <span className={`${props.styles['name_firmante']} left`}>{props.signer.name}:</span>
                <span className={props.styles.email}>{props.signer.email}</span>
                <span className={`${props.styles['numero_firmante']} right`}>
                {i18n.t('signatureViewer.signerCard.title.signer')} {(props.index + 1)}
                </span>
                {/* <div className={`${props.styles['numero_firmante']} `}> */}
                  <ul>
                  {/* <li> {i18n.t('messageEditor.grid.role')}: {getRole(props.signatureConfig)}</li> */}
                  <li> 
                    <div className={`${props.styles['tit-firmante']} left`}>{i18n.t('messageEditor.grid.signatureType')}:</div>
                    <span className={`${props.styles['name_firmante']} left`}>{getType(props.signatureConfig)} </span><br/>
                  </li>
                  <li>
                    <div className={`${props.styles['tit-firmante']} left`}>
                      {i18n.t('messageEditor.grid.doubleAuthentication')}:
                    </div> 
                    <span className={`${props.styles['name_firmante']} left`}>
                      {`${getDoubleAuth(props.signatureConfig)} ${getDoubleAuthInfo(props.signatureConfig)}`}
                      {((props.getEventStatus(props.signer, 'document_signed') === true || props.getEventStatus(props.signer, 'validated') === true) && props.signatureConfig && props.signatureConfig.length > 4 && props.signatureConfig[4] === 'photo' )
                        ? <a href='#' onClick={() => downloadAttachments2(props.signatureId, props.signer.id, props.signer.file.name, props.auth)}> - Descargar</a>
                        : ''}  
                    </span> 
                  </li>
                  </ul>
                {/* </div> */}
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
                            {props.getEventStatus(props.signer, 'validated') ? i18n.t('signatureViewer.signerCard.body.docValidated') : i18n.t('signatureViewer.signerCard.body.docSigned')}
                          </div>
                            {/* {i18n.t('signatureViewer.signerCard.body.docSigned')}</div> */}
                            {props.getEventStatus(props.signer, 'validated') ? props.getEventDate(props.signer, 'validated').split(' ')[0] : props.getEventDate(props.signer, 'document_signed').split(' ')[0]} <br/>
                            {props.getEventStatus(props.signer, 'validated') ? props.getEventDate(props.signer, 'validated').split(' ')[1] : props.getEventDate(props.signer, 'document_signed').split(' ')[1]}                            
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