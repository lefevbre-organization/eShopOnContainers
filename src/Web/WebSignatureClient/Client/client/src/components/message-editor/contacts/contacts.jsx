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
           return (address.email === contact.email)
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
          
          let address = props.sendingType === 'smsCertificate' ? contact.phoneNumber1 : contact.email; 
          let name = contact.name;
          let email = contact.email;
          let phone = contact.phoneNumber1;

          // let email = props.sendingType != 'smsCertificate' 
          // ? contact.email : `${contact.email} ${contact.phoneNumber1}`;
          setTimeout(() => {
            props.onAddressAdd(props.id, address, name, email, phone);
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
      <div id="main-contact" className={style['main-contact']}>
          <div className="contact row">
              <div className="input-field col s7 left">
                  <input 
                  name='search'
                  type='text'
                  placeholder={i18n.t('contacts.search')} 
                  className={style['serch-contacts']} 
                  onChange={filterContact}  
                   />
                  <span className={`${style['position-icon']} lf-icon-search`}></span>
              </div>
              <div className={`${style['right']} input-field col s5`}>
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
                <div><p className={`${style['font-size-phone']} light-blue-text font-weight-bold`}>{contact.phoneNumber1}</p></div>
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
                  <span 
                    className={contact.checked 
                    ? 'light-blue-text font-weight-bold' : 
                    'grey-text font-weight-bold'} >
                      {contact.name}
                  </span>
                  <div className={`${style['email']} grey-text`}>{contact.email}</div>
                </label>
                </div>
              </li> 
           )}
          </ul>
          <div className="row cont-inf-seleccionados">
            <div className={`${style['select-contact-length']} col s5 light-blue-text`}>
                {numberCheckeds}/{contacts.length} {i18n.t('contacts.selected')}
            </div>
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
      </div>
    )
}

export default Contacts;