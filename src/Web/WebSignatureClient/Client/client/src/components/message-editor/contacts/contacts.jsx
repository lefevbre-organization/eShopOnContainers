import React, { useState } from "react";
import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';
import i18n from 'i18next';
import style from './contacts.scss';

const Contacts = () => {
   const [contactValue, setContact] = useState('lexon');
   const selectContact = [
        { 'Id': 'lexon', 'SelectContact': i18n.t('contacts.lexon') }, 
        { 'Id': 'centinela', 'SelectContact': i18n.t('contacts.centinela') }
    ];
    const contactFields = { text: 'SelectContact', value: 'Id' };
     
    return (
        <div>
            <div className="contact row">
                <div className="input-field col s7 left">
                    <input placeholder="Buscar un contacto" className="serch-contacts" />
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
                <li>
                    <label>
                        <input type="checkbox"  />
                        <span>María Cruces</span>
                        <div className="email">mariacruces@gmail.com</div>
                    </label>
                </li>
                <li>
                    <label>
                        <input type="checkbox" />
                        <span>Emilio Lopez</span>
                        <div className="email">emil@gmail.com</div>
                    </label>
                </li>
                <li>
                    <label>
                        <input type="checkbox" />
                        <span>Aleberto María Garrido</span>
                        <div className="email">gesssasa@esgl.com</div>
                    </label>
                </li>
                <li>
                    <label>
                        <input type="checkbox" />
                        <span>María Cruces</span>
                        <div className="email">mariacruces@gmail.com</div>
                    </label>
                </li>
                <li>
                    <label>
                        <input type="checkbox" />
                        <span>María Cruces</span>
                        <div className="email">mariacruces@gmail.com</div>
                    </label>
                </li>
                <li>
                    <label>
                        <input type="checkbox"  />
                        <span>Emilio Lopez</span>
                        <div className="email">emil@gmail.com</div>
                    </label>
                </li>
                <li>
                    <label>
                        <input type="checkbox"  />
                        <span>Aleberto María Garrido</span>
                        <div className="email">gesssasa@esgl.com</div>
                    </label>
                </li>
            </ul>
            <div className="row cont-inf-seleccionados">
                <div className="col s5 contactos-seleccionados">3/100seleccionados</div>
                   <div className="col s7 right-align">
                        <button className="btn-modal btn-gen-border">Cancelar</button>
                        <button className="btn-modal btn-gen">Aceptar</button>
                   </div>
                </div>
            <div className="clearfix"></div>
           <style jsx global>
              {` 
                hr {
                   border: 0;
                   border-bottom: 1px solid #001978;
                   margin: 0;
                }
                .serch-contacts {
                  padding-left: 25px !important;
                  background: #ebedf4 !important;
                  border: none !important;
                  height: 39px !important;
                }
                .serch-contacts:focus {
                  border: none !important;
                  box-shadow: 0 1px 0 0 #26a69a00;
                }
                .position-icon {
                  top: -31px;
                  position: relative;
                  left: 8px;
                }
                .right {
                  text-align: right;  
                }
                ::placeholder { 
                  color: gray;
                }

                li {
                  padding: 15px;
                  border-bottom: 1px solid #ccd1e4;
                }
                [type="checkbox"] + span:not(.lever___3ADj_) {
                    height: 18px;
                }
                .email {
                  clear: both;
                  color: #777;
                  font-weight: 400;
                  font-size: 14px;
                  margin-left: 32px;
                  padding: 4px;
                }
                .btn-modal {
                  text-decoration: none;
                  letter-spacing: .5px;
                  font-size: 14px;
                  box-shadow: none;
                  border-radius: 0;
                  padding: 11px 20px;
                  text-transform: uppercase;
                  border: 2px solid #001978;
                  cursor: pointer;
                  font-weight: 600;
                  display: inline-block;
                }
                .btn-gen-border {
                  background: #ffffff;
                  color: #001978;                   
                }
                .btn-gen {
                  background: #001978;
                  color: #FFFFFF;
                  margin-left: 9px;
                }
                button:focus {
                  outline: none;
                  background-color: #9a9a9a;
                  border: 2px solid #9a9a9a;
                  color: #FFF;
                }
                .btn-gen-border:hover {
                  background: #ffffff;
                  color: #9a9a9a;
                  border: 2px solid #9a9a9a;
                }
                .btn-gen:hover, .btn-gen:active, .btn-gen:focus {
                  background: #9a9a9a;
                  border: 2px solid #9a9a9a;
                  color: #FFF;
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