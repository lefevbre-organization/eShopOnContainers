import React from 'react';
import i18n from 'i18next';

const HeaderContent = props => {
    return (
        <div className={`${props.styles.p15} ${props.styles.separador}`}>
        <span className={`${props.styles['certification-email']}`}>{i18n.t('signatureViewer.contentCard.title.title')}</span>
        {/* <span className={`${props.styles['certification-email']} ml-4`}>{props.subject}</span> */}
      </div>
    )
}

export default HeaderContent;