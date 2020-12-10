import React, { useState, useEffect, useRef } from "react";
import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';
import i18n from 'i18next';
import { getContactsCentinela, getContactsLexon, getBBDDLexon } from '../../../services/api-signaturit';
import style from './contacts.scss';
import Checkbox from "../../form/checkbox/checkbox";

const Contacts = (props) => {
  
  const [contacts, setContacts] = useState([]);

  const [selectedOption, setSelectedOption] = useState('centinela');

  const [contactsCentinela, setContactsCentinela] = useState([]);

  const [contactsLexon, setContactsLexon] = useState([]);

  const [isData, setIsdata] = useState(true);

  const [numberCheckeds, setNumberCheckeds] = useState(0);

  const [selectContact, setSelectContact] = useState([]);

  const prevAddress = usePrevious(props.addresses);

  function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
      ref.current = value;
    });
    return ref.current;
  }

  const [filter, setFilter] = useState('');

  const centinela = props.lefebvre.roles.some(rol => rol === 'Centinela');

  const lexon = props.lefebvre.roles.some(rol => rol === 'Lexon');

  const validData = (contacts) => {
    if(contacts.data.length === 0) {
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
      setContacts([...newContactsCentinela]);
      setContactsCentinela([...newContactsCentinela]);
      // console.log('Se ejecute getDataCentinela');
      // console.log('SelectContact:');
      // console.log(selectContact);
      // console.log('ContactsCentinela:');
      // console.log(contacts);        
    }
  }

  const getDataLexon = async () => {
    if (contacts.length === 0 && isData){
      //const user = props.lefebvre.idUserApp;
      //const bbdd = "lexon_admin_02"; //props.lefebvre.bbdd;
      const env = "DEV"; //props.lefebvre.env;

      getBBDDLexon(props.lefebvre.userId, env)
      .then(lexDataBases => {
        if (lexDataBases && lexDataBases.data !== null){
          const lexUserId = lexDataBases.data.idUser;
          const contactsLexon = [];

          lexDataBases.data.companies.forEach( company => {  
            getContactsLexon(lexUserId, company.bbdd, env)
            .then(contacts => {
              contacts.data.forEach(contact => {
                if (contact.email && contact.email !== null){
                  const emailExists = props.addresses.some(address => {
                    return (address.address === contact.email)
                  });
                  contact.id = `${contact.id}_${contact.idType}_${contact.entityType}_${company.bbdd}`
                  contact.checked = emailExists;
                  //if (contactsLexon.length < 350){
                    contactsLexon.push(contact);
                  //}
                }
              })
              setContactsLexon([...contactsLexon]);
              // console.log('Se ejecute getDataLexon');
              // console.log('SelectContact:');
              // console.log(selectContact);
              // console.log('ContactsLexon:');
              // console.log(contactsLexon);
            });
          });
        }
        //const contactsLexon = await getContactsLexon(user, bbdd, env);
        
      })
      .catch(err => console.log(err));
      
      //setContactsLexon([...newContactsLexon]);
    }
  }

  useEffect(() => {
    const numberCheckeds = contacts.filter(contact => contact.checked == true);
    setNumberCheckeds(numberCheckeds.length);
  }, [numberCheckeds, contacts]);

  function findRemovedContact(currentValue, index, arr) {
    var ret = false;
    this.forEach(address => {
      if (currentValue.checked === true && currentValue.email === address.address){
        ret = true;
      }
    });
    return ret;
  }

  useEffect(() => {
    if (prevAddress && props.addresses && prevAddress.length > props.addresses.length){
      let contactFound = false;
      if (centinela && contactsCentinela && contactsCentinela.length){
        const cenCheckedContactsOriginal = contactsCentinela.filter(c => c.checked === true);
        let cenCheckedContactsFormated = [];
        cenCheckedContactsOriginal.map(c => cenCheckedContactsFormated.push({address: c.email, name: c.name}))
        if (cenCheckedContactsOriginal){
          const cenRemovedContacts = cenCheckedContactsFormated.filter(({ address: id1 }) => !props.addresses.some(({ address: id2 }) => id2 === id1));
          const removedIndex = contactsCentinela.findIndex(findRemovedContact, cenRemovedContacts);
          if (prevAddress.length > props.addresses.length){
            if (removedIndex !== -1){
              contactsCentinela[removedIndex].checked = false
              contactFound = true;
            }
          }

          setContactsCentinela([...contactsCentinela]);
        }
      }
      
      if (!contactFound && lexon && contactsLexon && prevAddress.length > props.addresses.length){
        const lexCheckedContactsOriginal = contactsLexon.filter(c => c.checked === true);
        let lexCheckedContactsFormated = [];
        lexCheckedContactsOriginal.map(c => lexCheckedContactsFormated.push({address: c.email, name: c.name}))
        if (lexCheckedContactsOriginal){
          const lexRemovedContacts = lexCheckedContactsFormated.filter(({ address: id1 }) => !props.addresses.some(({ address: id2 }) => id2 === id1));
          const removedIndexLex = contactsLexon.findIndex(findRemovedContact, lexRemovedContacts);
          if (prevAddress.length > props.addresses.length){
            if (removedIndexLex !== -1){
              contactsLexon[removedIndexLex].checked = false
              contactFound = true;
            }          
          }          
          setContactsLexon([...contactsLexon]);
        }
      }
      setContacts([...contacts]);
    }
  }, [props.addresses.join(",")])

  useEffect(() => {
   if (centinela && lexon){
     getDataCentinela()
     getDataLexon();
     setSelectedOption('centinela');
   } else if (centinela) {
     getDataCentinela();
     setSelectedOption('centinela');
   } else {
     getDataLexon();
     setSelectedOption('lexon');
   }
  }, []);

  useEffect(() => {
    if (centinela && lexon){
      setSelectContact([{ 'Id': 'lexon', 'SelectContact': i18n.t('contacts.lexon')}, {'Id': 'centinela', 'SelectContact': i18n.t('contacts.centinela')}])
    } else if (centinela) {
      setSelectContact([{'Id': 'centinela', 'SelectContact': i18n.t('contacts.centinela')}]);
    } else {
      setSelectContact([{ 'Id': 'lexon', 'SelectContact': i18n.t('contacts.lexon')}]);
    }
  }, []);   
  
  useEffect(() =>{
    if (selectedOption === 'centinela'){
      setSelectedOption('centinela');
      setContacts(contactsCentinela);
    } else if (selectedOption === 'lexon'){
      setSelectedOption('lexon');
      setContacts(contactsLexon);
    }
    console.log('Renderiza');
  })

  const contactFields = { text: 'SelectContact', value: 'Id' };

  const contactValue = 'centinela';

  const onChangeContacts = (e) => {
    console.log(e.value);
    setSelectedOption(e.value);
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
      if (selectedOption === 'lexon'){
        if (contact.id === contactId){
          contact.checked = isCheck;
        }
      } else if(selectedOption === 'centinela'){
        if(contact.contactId == contactId) {
          contact.checked = isCheck;
        }
      }
    });
    setContacts([...contacts]);
  }

  const getContactsInfo = () => {
    let newContacts = [];
    contactsCentinela.forEach(contact => {
      if(contact.checked) {
        let address = props.sendingType === 'smsCertificate' ? contact.phoneNumber1 : contact.email; 
        let name = contact.name;
        let email = contact.email;
        let phone = contact.phoneNumber1;
        setTimeout(() => {
          //newContacts.push(props.id, contact.email, contact.name);
          //props.onAddressAdd(props.id, address, name, email, phone);
          newContacts.push(props.id, address, name, email, phone);
          props.onAddressAdd(props.id, address, name, email, phone);
        });
      }
    });
    contactsLexon.forEach(contact => {
      if(contact.checked) {
        let address = props.sendingType === 'smsCertificate' ? contact.mobilePhone : contact.email; 
        let name = contact.name;
        let email = contact.email;
        let phone = contact.mobilePhone;
        setTimeout(() => {
          // newContacts.push(props.id, contact.email, contact.name);
          // props.onAddressAdd(props.id, contact.email, contact.name);
          newContacts.push(props.id, address, name, email, phone);
          props.onAddressAdd(props.id, address, name, email, phone);
        });
      }
    })
    //setContacts([]); 
    //setAddresses([...props.addresses, ...newContacts])
    //setSelectedOption('');
    props.dialogClose();
  }

  const dialogClose = () => {
    //setContacts([]);
    //setContactsLexon([]); 
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
           .slice(0, 100)
           .map((contact, i) => 
              <li className={style['container-list-contacts']} key={(selectedOption === 'centinela') ? i : `${i}_${contact.id}`}>
                <div>
                  <p className="light-blue-text font-weight-bold">{(selectedOption === 'centinela' ? contact.phoneNumber1 : contact.mobilePhone)}</p>
                </div>
                <div className={style['list-checked']}>
                  <label>
                    <input 
                    type="checkbox"  
                    checked={contact.checked} 
                    onChange={handleChecked}
                    name="checked"
                    value={(selectedOption === 'centinela') ? contact.contactId : `${contact.id}`}
                    />
                    <Checkbox
                    checked={contact.checked} 
                    onChange={handleChecked}
                    name="checked"
                    value={(selectedOption === 'centinela') ? contact.contactId  : `${contact.id}`}
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
                padding: 5px 20px 0px 16px !important;
                font-weight: 700;
                font-family: 'MTTMilano';
                width: 76% !important;
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
                left: 20px;
                top: 9px;
                font-size: 19px;
                color: #8A91B5;
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
                font-size: 15px;
              }
           `}
         </style>
      </div>
    )
}

export default Contacts;