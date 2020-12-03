import React, { useState, useEffect } from "react";
import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';
import i18n from 'i18next';
import { getContactsCentinela, getContactsLexon, getBBDDLexon } from '../../../services/api-signaturit';
import style from './contacts.scss';
import Checkbox from "../../form/checkbox/checkbox";

const Contacts = (props) => {
  
  const [contacts, setContacts] = useState([]);

  const [contactsCentinela, setContactsCentinela] = useState([]);

  const [contactsLexon, setContactsLexon] = useState([]);

  const [isData, setIsdata] = useState(true);

  const [numberCheckeds, setNumberCheckeds] = useState(0);

  const [numberCheckedsLexon, setNumberCheckedsLexon] = useState(0);

  const [filter, setFilter] = useState('');

  const centinela = props.lefebvre.roles.some(rol => rol === 'Centinela');

  const lexon = props.lefebvre.roles.some(rol => rol === 'Lexon');

  //const [selectContact, setSelectContact] = useState([]);

  const [fetchData, setFetchData] = useState(true);

  const validData = (contacts) => {
    if(contacts.data.length === 0) {
      setIsdata(false);
    }
  }

  const getDataCentinela = async () => {
    const selectContactCen = [{ 'Id': 'centinela', 'SelectContact': i18n.t('contacts.centinela') }];
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
      //setSelectContact([...selectContact, ...selectContactCen]);
      setContacts([...newContactsCentinela]);
      setContactsCentinela([...newContactsCentinela]);
      console.log('Se ejecute getDataCentinela');
      console.log('SelectContact:');
      console.log(selectContact);
      console.log('ContactsCentinela:');
      console.log(contacts);        
    }
  }

  const getDataLexon = async () => {
    if (contacts.length === 0 && isData){
      //const user = props.lefebvre.idUserApp;
      //const bbdd = "lexon_admin_02"; //props.lefebvre.bbdd;
      const env = "QA"; //props.lefebvre.env;
      let selectContactLex = [];

      getBBDDLexon(props.lefebvre.userId)
      .then(lexDataBases => {
        if (lexDataBases && lexDataBases.data !== null){
          const lexUserId = lexDataBases.data.idUser;
          const contactsLexon = [];
          
          lexDataBases.data.companies.forEach( company => {  
            
            getContactsLexon(lexUserId, company.bbdd, env)
            .then(contacts => {
              //contactsLexon.push({name: company.name, bbdd: company.bbdd, contacts: contacts.data});
              //selectContactLex.push({ 'Id':  `${i18n.t('contacts.lexon')}_${company.bbdd}`, 'SelectContact': `${i18n.t('contacts.lexon')}_${company.bbdd}` });

              //validData(contactsLexon.contacts);
              //const newContactsGlobalLexon = [];
              
              // contactsLexon.forEach(company => {
              //   const newContactsCompanyLexon = [];
              //   company.contacts.forEach(contact => {
              //     const emailExists = props.addresses.some(address => {
              //       return (address.address === contact.email)
              //     });
              //     contact.checked = emailExists;
              //     newContactsCompanyLexon.push(contact);
              //   })
              //   newContactsGlobalLexon.push(company)
              // });
              //setSelectContact([...selectContact, ...selectContactLex]);

              contacts.data.forEach(contact => {
                if (contact.email && contact.email !== null){
                  const emailExists = props.addresses.some(address => {
                    return (address.address === contact.email)
                  });
                  contact.checked = emailExists;
                  contactsLexon.push(contact);
                }
              })

              //setContactsLexon([...newContactsGlobalLexon]);
              setContactsLexon([...contactsLexon]);
              console.log('Se ejecute getDataLexon');
              console.log('SelectContact:');
              console.log(selectContact);
              console.log('ContactsLexon:');
              console.log(contactsLexon);
            });
          });
        }
        //const contactsLexon = await getContactsLexon(user, bbdd, env);
        
      })
      .catch();
      
      //setContactsLexon([...newContactsLexon]);
    }
  }

  // useEffect(() => {
  //   const numberCheckeds = contacts.filter(contact => contact.checked == true);
  //   const numberCheckedsLexon = contactsLexon.filter(contact => contact.checked === true);
  //   setNumberCheckeds(numberCheckeds.length);
  //   setNumberCheckedsLexon(numberCheckedsLexon.length)
  //   getDataCentinela();
  //   getDataLexon();
  // }, [numberCheckeds, numberCheckedsLexon, selectContact, setNumberCheckeds, setNumberCheckedsLexon, getDataCentinela, getDataLexon]);

  useEffect(() => {
    const numberCheckeds = contacts.filter(contact => contact.checked == true);
    setNumberCheckeds(numberCheckeds.length);
  }, [numberCheckeds]);

  useEffect(() => {
    const numberCheckedsLexon = contactsLexon.filter(contact => contact.checked == true);
    setNumberCheckedsLexon(numberCheckedsLexon.length);
  }, [numberCheckedsLexon]);

  useEffect(() => {
   if (centinela && lexon){
     getDataCentinela()
     getDataLexon();
   } else if (centinela) {
     getDataCentinela();
   } else {
     getDataLexon();
   }
  }, []);

  // useEffect(() => {
  //   (lexon) ? getDataLexon() : null; 
  // }, []);
 
  const selectContact =
    (centinela && lexon)
      ? [{ 'Id': 'lexon', 'SelectContact': i18n.t('contacts.lexon')}, {'Id': 'centinela', 'SelectContact': i18n.t('contacts.centinela')}]
      : (centinela) 
        ? [{'Id': 'centinela', 'SelectContact': i18n.t('contacts.centinela')}]
        : [{ 'Id': 'lexon', 'SelectContact': i18n.t('contacts.lexon')}];
          

  const contactFields = { text: 'SelectContact', value: 'Id' };

  const contactValue = 'centinela';

  const onChangeContacts = (e) => {
    console.log(e.value);
    if (e.value === 'lexon'){
      setContacts(contactsLexon);
    } else if (e.value === 'centinela'){
      setContacts(contactsCentinela);
    }
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
          setTimeout(() => {
            props.onAddressAdd(props.id, contact.email, contact.name);
          });
        }
    });
    contactsLexon.forEach(contact => {
      if(contact.checked) {
        setTimeout(() => {
          props.onAddressAdd(props.id, contact.email, contact.name);
        });
      }
    })
    setContacts([]); 
    props.dialogClose();
  }

  const dialogClose = () => {
    setContacts([]);
    setContactsLexon([]); 
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
              <li key={i}>
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