import React, { useState, useEffect } from "react";
import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';
import i18n from 'i18next';
import { getContactsCentinela } from '../../../services/api-signaturit';
import style from './contacts.scss';

const Contacts = (props) => {
  
  const [contacts, setContacts] = useState([]);

  const [numberCheckeds, setNumberCheckeds] = useState(0);

  const [filter, setFilter] = useState('');

  useEffect(() => {
    const numberCheckeds = contacts.filter(conatct => conatct.checked == true);
    setNumberCheckeds(numberCheckeds.length);
    getDataCentinela();
  });

  const selectContact = [
    // { 'Id': 'lexon', 'SelectContact': i18n.t('contacts.lexon') }, 
    { 'Id': 'centinela', 'SelectContact': i18n.t('contacts.centinela') }
  ];

  const contactFields = { text: 'SelectContact', value: 'Id' };

  const contactValue = 'centinela';

  const onChangeContacts = (e) => {
   console.log(e.value);
  }

  const getDataCentinela = async () => {
    if(contacts.length == 0 ) {
      const user = props.lefebvre.userId;
      const contactsCentinela = await getContactsCentinela(user);
      const newContactsCentinela = [];
      contactsCentinela.data.forEach(contact => {
      contact.checked = false;
      newContactsCentinela.push(contact);
      });
      setContacts([...newContactsCentinela]);        
    }
  }
  
  const filterContact = (e) => {
    setFilter(e.target.value);
  }

  const handleChecked = (e) => {
    const isCheck = !e.target.checked ? false : true;
    const index = e.target.value;
    contacts[index].checked = isCheck;
    setContacts([...contacts]);
  }

  const getContactsInfo = () => {
    contacts.forEach(contact => {
        if(contact.checked) {
          setTimeout(() => {
            props.onAddressAdd(props.id, contact.email, contact.name);
          });
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
                change={onChangeContacts}  
                value={contactValue} 
                popupHeight="220px" />
              </div>
          </div>
          <hr className="clearfix" />
          <ul className="contactos">
           {contacts
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
           <div className="col s5 select-contacts">{numberCheckeds}/{contacts.length} {i18n.t('contacts.selected')}</div>
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
                overflow: auto;
              } 
              .position-icon {
                top: -31px;
                position: relative;
                left: 8px;
              }
              .right {
                text-align: right;  
              }
              .select-contacts {
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