import React, { useState } from 'react';
import styles from './widgets.scss';
import i18n from 'i18next';
import Checkbox from "../../form/checkbox/checkbox";

const CertificatesWidget = ({onChange}) => {

    const [certificates, setCertificates] = useState([
        {name: 'El receptor ha recibido el mail', checked: true, disable: true, option: 1, id: 'delivery'},
        {name: 'El receptor ha abierto el mail', checked: false, disable: false, option: 2, id: 'open_email'},
        {name: 'El receptor ha visto los documentos', checked: false, disable: false, option: 3, id: 'open_document'},
        {name: 'El receptor ha abierto todos los documentos', checked: false, disable: false, option: 4, id: 'open_every_document'}
        //,
        // {name: 'El receptor se ha descargado el documento', checked: false, disable: false, option: 5, id: "download_document"},
        // {name: 'El receptor se ha descargado todos los documentos', checked: false, disable: false, option: 6, id: "download_every_document"},
    ]);

    const handleChecked = (e) => {
        let isCheck = !e.target.checked ? false : true;
        let index = e.target.value;
        certificates[index].checked = isCheck;
        if (isCheck){
          for (let i = 0; i < index; i++) {
            certificates[i].disable = true;
            certificates[i].checked = true;
          }
        } else {
          if (index-1 > 0) { //La primera opción siempre debe de estar seleccionada por defecto.
            certificates[index-1].disable = false;
          }
        }
        setCertificates([...certificates]);
        onChange(certificates);
    }

    return (
      <div className={styles.widget}>
        <div className={styles.p10}>
          <span className={`lf-icon-certificate ${styles['title-icon']}`}></span>
          <span className={styles['generic-title']}>{i18n.t('certificatesWidget.title')}</span>
          <ul className={`my-3 ${styles['certificate']}`}> 
              { certificates.map((certificate, i) => 
                <li key={i}> 
                <label>        
                  <input 
                   type="checkbox"  
                   name="checked"
                   checked={certificate.checked} 
                   disabled={certificate.disable}
                   onChange={handleChecked}
                   value={i}
                   />
                    <Checkbox
                    checked={certificate.checked} 
                    onChange={handleChecked}
                    name="checked"
                    id={'check' + i}
                    value={i}
                    disabled={certificate.disable}
                 />
                  <span >{certificate.name}</span>
                   </label> 
               </li>
              )} 
          </ul>
        </div>
    </div>
    )
};

export default CertificatesWidget;