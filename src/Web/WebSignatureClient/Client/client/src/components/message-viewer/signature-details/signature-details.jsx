import React from 'react';
import PropTypes from "prop-types";
import i18n from 'i18next';

const SignatureDetails = (props) => {
 return (
    <table className={props.styles['resumen-firma']}>
        <tbody>
          <tr>
            <th>{i18n.t('signatureViewer.grid.document')}</th>
            <th>{i18n.t('signatureViewer.grid.subject')}</th>
            <th>{i18n.t('signatureViewer.grid.signers')}</th>
            <th>{i18n.t('signatureViewer.grid.date')}</th>
            <th>{i18n.t('signatureViewer.grid.status')}</th>
          </tr>            
          <tr>
              <td className={props.styles.documento}>{props.signature.documents[0].file.name}</td>
              <td>{(props.signature.data.find(x => x.key === "subject")) ? 
              props.signature.data.find(x => x.key === "subject").value : "Sin asunto"} </td>
              <td>
                  {/* <ul className={props.styles['tooltip-firmantes']}>
                      <li>Maria cruces <span className={props.styles.email}>margia-cruces@gmail.com</span></li>
                      <li>Maria cruces <span className={props.styles.email}>m.lopez@gsel.com</span></li>
                  </ul> */}
                  <span className={`${props.styles['bola-firmantes']} ${props.styles[props.status_style]}`}>
                      {props.getSigners(props.signature).length}
                  </span>
              </td>
                <td>
                  {new Date(props.signature.created_at).toLocaleString(navigator.language, {
                  year: 'numeric', month: '2-digit', day: '2-digit',
                  hour: '2-digit', minute: '2-digit', second: '2-digit'
                  })}
                </td>
              <td className={props.styles[props.status_style]}>{props.status}</td>
          </tr>
         </tbody>
    </table>
 )
}

export default SignatureDetails;