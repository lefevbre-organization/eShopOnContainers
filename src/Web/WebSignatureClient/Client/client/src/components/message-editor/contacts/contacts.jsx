import React, { useState, useEffect } from "react";
import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';
import i18n from 'i18next';
import style from './contacts.scss';

const Contacts = (props) => {
  
   const [result, setResult] = useState([{
    "name": "María Cruces",
    "email": "mariacruces@gmail.com",
    "checked": false
   },
   {
    "name": "Emilio Lopez",
    "email": "emil@gmail.com",
    "checked": false
   },
   {
    "name": "Aleberto María Garrido",
    "email": "gesssasa@esgl.com",
    "checked": false
   }]);

   const [contactValue, setContact] = useState('lexon');

   const [sum, setSum] = useState(0);

   const [filter, setFilter] = useState('');

   const selectContact = [
        { 'Id': 'lexon', 'SelectContact': i18n.t('contacts.lexon') }, 
        { 'Id': 'centinela', 'SelectContact': i18n.t('contacts.centinela') }
    ];

    const contactFields = { text: 'SelectContact', value: 'Id' };

     useEffect(() => {
     const numberCheckeds = result.filter(conatct => conatct.checked == true);
     setSum(numberCheckeds.length);
    });

    const filterContact = (e) => {
      setFilter(e.target.value);
    }

    const handleChecked = (e) => {
      const isCheck = !e.target.checked ? false : true;
      result[e.target.value].checked = isCheck;
      setResult([...result]);
     
    }

    const getContactsInfo = () => {
      result.forEach(contact => {
          if(contact.checked) {
            setTimeout(() => props.onAddressAdd(props.id, contact.email));
          }
      });
      props.dialogClose();
    }

    return (
        <div className={style['main-contact']}>
            <div className="contact row">
                <div className="input-field col s7 left">
                    <input 
                    name='search'
                    type='text'
                    placeholder={i18n.t('contacts.search')} 
                    className={style['serch-contacts']} 
                    onChange={filterContact}  
                    ref={input => input && input.focus()}
                     />
                    <span className="lf-icon-search position-icon"></span>
                </div>
                <div className="input-field col s5 right">
                <DropDownListComponent 
                  id="select-contact"
                  className={style['select-contact']} 
                  dataSource={selectContact} 
                  fields={contactFields} 
                  change={ event => {
                    setContact(event.value)
                  }}  
                  value={contactValue} 
                  popupHeight="220px" />
                </div>
            </div>
            <hr className="clearfix" />
            <ul className="contactos">
             {result
             .filter(contact => filter === '' 
             || contact.name.toLowerCase().includes(filter)
             || contact.email.toLowerCase().includes(filter)
             || contact.name.toUpperCase().includes(filter)
             || contact.email.toUpperCase().includes(filter))
             .map((contact, i) => 
                <li key={i}>
                  <label>
                    <input type="checkbox"  
                    checked={contact.checked} 
                    onChange={handleChecked}
                    name="checked"
                    value={i}
                    />
                    <span>{contact.name}</span>
                    <div className={style['email']}>{contact.email}</div>
                  </label>
                </li> 
             )}
                
            </ul>
            <div className="row cont-inf-seleccionados">
             <div className="col s5 contactos-seleccionados">{sum}/{result.length} {i18n.t('contacts.selected')}</div>
                   <div className="col s7 right-align">
                        <button className={`${style['btn-modal']} ${style['btn-gen-border']}`}
                        onClick={props.dialogClose} >
                          {i18n.t('expirationWidget.cancelButton')} 
                        </button>
                        <button className={`${style['btn-modal']} ${style['btn-gen']}`}
                        onClick={getContactsInfo} >
                          {i18n.t('expirationWidget.acceptButton')}
                        </button>
                   </div>
            </div>
            <div className="clearfix"></div>
           <style jsx global>
              {` 
                #contactDialog_dialog-content {
                  padding: 0px !important;
                  overflow: hidden;
                } 
                .position-icon {
                  top: -31px;
                  position: relative;
                  left: 8px;
                }
                .right {
                  text-align: right;  
                }
                .contactos-seleccionados {
                  font-size: 12px;
                  color: #001978;
                  margin-top: 15px;
                }
             `}
           </style>
        </div>
    )
}

export default Contacts;