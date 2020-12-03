import React from 'react';
import PropTypes from "prop-types";
import i18n from 'i18next';
import { DropDownButtonComponent } from '@syncfusion/ej2-react-splitbuttons';

const Details = (props) => {
 return (
    <table className={props.styles['resumen-firma']}>
        <tbody>
          <tr>
            <th>{i18n.t('signatureViewer.grid.document')}</th>
            <th>{i18n.t('signatureViewer.grid.subject')}</th>
            {props.service == 'signature' ? 
            <th>{i18n.t('signatureViewer.grid.signers')}</th> 
            : <th>{i18n.t('signatureViewer.grid.recipients')}</th>
            }
            <th>{i18n.t('signatureViewer.grid.date')}</th>
            <th>{i18n.t('signatureViewer.grid.status')}</th>
          </tr>            
          <tr>
          {/* props.detail.certificates[0].file.name  */}
              <td >
              {
               props.service == 'signature' ?  
               props.detail.documents[0].file.name
               : 
               props.detail.certificates[0].file ?
              //  <span>{props.detail.certificates[0].file.name}</span>
              <div>
                <span>{props.detail.certificates[0].file.name}</span>
                <span>
                 {/* {props.getFiles(props.detail).length } */}
                 {/* beforeItemRender={this.recipientRender.bind(this)} cssClass='e-caret-hide test' items={fileList} */}
                 <DropDownButtonComponent cssClass={`${props.styles['bola-firmantes']} ${props.styles['gray']}`}  items={props.getFiles(props.detail)}>{props.getFiles(props.detail).length}</DropDownButtonComponent>
                </span>
              </div>
              
                : ''
              }</td>
              <td>
                {
                  props.service === 'sms'
                    ? (props.detail.data.find(x => x.key === "body"))
                        ? props.detail.data.find(x => x.key === "body").value 
                        : "Sin asunto"
                    : (props.detail.data.find(x => x.key === "subject")) 
                      ? props.detail.data.find(x => x.key === "subject").value 
                      : "Sin asunto"
                } 
              </td>
              <td>
                  {/* <ul className={props.styles['tooltip-firmantes']}>
                      <li>Maria cruces <span className={props.styles.email}>margia-cruces@gmail.com</span></li>
                      <li>Maria cruces <span className={props.styles.email}>m.lopez@gsel.com</span></li>
                  </ul> */}
                  <span>
                  <DropDownButtonComponent className={`${props.styles['bola-firmantes']} ${props.styles[props.status_style]}`} items={props.getSigners(props.detail)}>{props.getSigners(props.detail).length}</DropDownButtonComponent>
                  </span>
              </td>
                <td>
                  {new Date(props.detail.created_at).toLocaleString(navigator.language, {
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

export default Details;