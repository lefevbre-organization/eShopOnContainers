import React from 'react';
import i18n from 'i18next';

const FooterList = props => {

    return (
        <>
           {
                (props.getEventStatus(props.certificate, "document_opened") === true) 
                || (props.getEventStatus(props.certificate, props.documentType) && props.certificationCompleted)  
                 ? <div className={props.styles['document-opened']}>
                    <div className={`${props.styles['certificate-document-title']} light-blue-text`}><b>{i18n.t('emailViewer.attachedDocOpened')}</b></div>
                    <div className={`${props.styles['certificate-document']} light-blue-text`}>
                      <span className="lf-icon-document-validate"></span>
                      <span className="ml-2">{props.certificate.file.name}</span>
                    </div>
                    {
                      (props.certificationType.value === 'open_document')
                        ? <div>
                            <span className="mr-4">{props.getEventDate(props.certificate, props.documentType).split(' ')[0]}</span>
                            <span className="mr-4">{props.getEventDate(props.certificate, props.documentType).split(' ')[1]}</span>
                          </div>
                        : <div>
                            <span className="mr-4">{props.getEventDate(props.certificate, "document_opened").split(' ')[0]}</span>
                            <span className="mr-4">{props.getEventDate(props.certificate, "document_opened").split(' ')[1]}</span>
                          </div>
                    }
                  </div>
                : <div className={props.styles['document-opened']}>
                    <div className={`${props.styles['certificate-pending']}`}><b>{i18n.t('emailViewer.pendingDoc')}</b></div>
                    <div>
                      <span className="lf-icon-document"></span>
                      <span className="ml-2">{props.certificate.file.name}</span>
                    </div>
                    </div>
            }
        </>
    )

} 

export default FooterList;