import React, { useState, useEffect } from "react";
import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';
import i18n from 'i18next';
import { getContactsCentinela } from '../../../services/api-signaturit';
import style from './contacts.scss';
import Checkbox from "../../form/checkbox/checkbox";

const Contacts = (props) => {
  
  const [contacts, setContacts] = useState([]);

  const [isData, setIsdata] = useState(true);

  const [numberCheckeds, setNumberCheckeds] = useState(0);

  const [filter, setFilter] = useState('');

  const validData = (contactsCentinela) => {
    if(contactsCentinela.data.length === 0) {
      setIsdata(false);
    }
  }

  const getDataCentinela = async () => {
    if(contacts.length == 0 && isData) {
      const user = props.lefebvre.userId;
      const contactsCentinela = await getContactsCentinela(user);
      validData(contactsCentinela);
      const newContactsCentinela = [];
       contactsCentinela.data.forEach(contact => {
        const emailExists = props.addresses.some(address => {
           return (address.address === contact.email)
         });
        contact.checked = emailExists;
        newContactsCentinela.push(contact);
      });
      console.log(newContactsCentinela);
      setContacts([...newContactsCentinela]);        
    }
  }

  useEffect(() => {
    const numberCheckeds = contacts.filter(contact => contact.checked == true);
    setNumberCheckeds(numberCheckeds.length);
    getDataCentinela();
  }, [numberCheckeds, setNumberCheckeds, getDataCentinela]);

  const selectContact = [
    // { 'Id': 'lexon', 'SelectContact': i18n.t('contacts.lexon') }, 
    { 'Id': 'centinela', 'SelectContact': i18n.t('contacts.centinela') }
  ];

  const contactFields = { text: 'SelectContact', value: 'Id' };

  const contactValue = 'centinela';

  const onChangeContacts = (e) => {
   console.log(e.value);
  }

  
  const filterContact = (e) => {
    setFilter(e.target.value);
  }

  const handleChecked = (e) => {
    let isCheck = !e.target.checked ? false : true;
    let contactId = e.target.value;
    contacts.forEach(contact => {
        if(contact.contactId == contactId) {
          contact.checked = isCheck;
        }
    });
    setContacts([...contacts]);
  }

  const getContactsInfo = () => {
    contacts.forEach(contact => {
        if(contact.checked) {
          let email = props.sendingType != 'smsCertificate' 
          ? contact.email : `${contact.email} ${contact.phoneNumber1}`;
          setTimeout(() => {
            props.onAddressAdd(props.id, email, contact.name);
          });
        }
    });
    setContacts([]); 
    props.dialogClose();
  }

  const dialogClose = () => {
    setContacts([]); 
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
           || contact.name.includes(filter)
           || contact.email.includes(filter)
           || contact.name.toLowerCase().includes(filter)
           || contact.email.toLowerCase().includes(filter)
           || contact.name.toUpperCase().includes(filter)
           || contact.email.toUpperCase().includes(filter))
           .map((contact, i) => 
              <li className={style['container-list-contacts']} key={i}>
                <div><p className="light-blue-text">{contact.phoneNumber1}</p></div>
                <div className={style['list-checked']}>
                <label>
                  <input 
                  type="checkbox"  
                  checked={contact.checked} 
                  onChange={handleChecked}
                  name="checked"
                  value={contact.contactId}
                  />
                   <Checkbox
                   checked={contact.checked} 
                   onChange={handleChecked}
                   name="checked"
                   value={contact.contactId}
                />
                  <span>{contact.name}</span>
                  <div className={style['email']}>{contact.email}</div>
                </label>
                </div>
              </li> 
           )}
          </ul>
          <div className="row cont-inf-seleccionados">
           <div className="col s5 select-contacts">{numberCheckeds}/{contacts.length} {i18n.t('contacts.selected')}</div>
                 <div className="col s7 right-align">
                      <button className={`${style['btn-modal']} ${style['btn-gen-border']}`}
                      onClick={dialogClose} >
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
              .e-input-group:not(.e-float-icon-left):not(.e-float-input)::before, 
             .e-input-group:not(.e-float-icon-left):not(.e-float-input)::after, 
              .e-input-group.e-control-wrapper:not(.e-float-icon-left):not(.e-float-input)::before, 
              .e-input-group.e-control-wrapper:not(.e-float-icon-left):not(.e-float-input)::after
              {
                background: #001970;
              }
              .e-input-group.e-control-wrapper.e-ddl.e-lib.e-keyboard.e-valid-input {
                background: #ebedf4;
                border: none;
                height: 39px;
                padding: 5px;
                font-weight: 700;
              }
              .e-control.e-dropdownlist.e-lib.e-input {
                color: #001978 !important;
              }
              .e-ddl.e-input-group.e-control-wrapper .e-ddl-icon::before {
                color: #001978;
              }
              .e-dropdownbase .e-list-item.e-active, .e-dropdownbase 
              .e-list-item.e-active.e-hover {
                background-color: #eee;
                border-color: #fff;
                color: #001970;
              }
              .position-icon {
                position: absolute;
                left: 18px;
                top: 17px;
              }
              .right {
                text-align: right;  
              }
              .select-contacts {
                font-size: 12px;
                color: #001978;
                margin-top: 15px;
              }
              .e-ddl.e-input-group.e-control-wrapper .e-ddl-icon::before {
                content: '\e90b';
                font-family: 'lf-font' !important;
              }
           `}
         </style>
      </div>
    )
}

export default Contacts;