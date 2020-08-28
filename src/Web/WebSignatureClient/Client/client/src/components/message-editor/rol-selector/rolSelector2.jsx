import React from 'react';
import PropTypes from "prop-types";
import i18n from 'i18next';
import materialize from '../../../styles/signature/materialize.scss';
import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';

function onChange() {
    let value = document.getElementById('value');
    let text = document.getElementById('text');
    // update the text and value property values in property panel based on selected item in DropDownList
    value.innerHTML = this.listObj.value === null ? 'null' : this.listObj.value.toString();
    text.innerHTML = this.listObj.text === null ? 'null' : this.listObj.text;
  };
  
  
  const RolSelector2 = (props) => {
  
    const roles = [
      { 'Id': 'signer', 'Rol': 'Signer' }, 
      { 'Id': 'validator', 'Rol': 'Validator' }
    ]
    const signatureTypes = [
      {
        'Id': 'advanced', 'Type': 'Advanced Signature' },
      { 'Id': 'certificate', 'Type': 'User Certificate' }
    ]
  
    const doubleAuth = [
      { 'Id': 'none', 'Value': 'None' },
      { 'Id': 'sms', 'Value': 'SMS' },
      { 'Id': 'photo', 'Value': 'Photo' }
    ]
  
    const roleFields = { text: 'Rol', value: 'Id' };
    const signTypesFields = {text: 'Type', value: 'Id'};
    const dobleAuthFields = { text: 'Value', value: 'Id'};
    const roleValue = 'signer';
    const signTypeValue = 'advanced';
    const dobleAuthValue = 'none'
  
    var listObj ;
    
    return (
      <div className="container">
          <div className="contenido-central">
              <p className="title-modal">ROL DE LOS DESTINATARIOS</p>
              <table className="resumen-firma">
                  <tr>
                      <th>Nombre</th>
                      <th>Email</th>
                      <th>Rol</th>
                      <th>Tipo de firma</th>
                      <th colspan="3">Doble autenticación</th>
                  </tr>
                  {props.recipients.map( user => {
                    return(
                    <tr>
                      <td className="name"><input placeholder="Nombre" id="first_name" type="text" /></td>
                      <td><input placeholder={`${user}`} id="email" type="text" readonly /></td>
                      <td>
                          <div className="input-field col s5">
                              <div className="select-wrapper">
                                  {/* <span className="caret">▼</span>
                                  <input type="text" className={`${materialize['select-dropdown']}`} readonly="true" data-activates="select-options-1e289437-8b3a-0816-307d-d85fb91e66ac" value="Rol" />
                                  <ul id="select-options-1e289437-8b3a-0816-307d-d85fb91e66ac" className={`${materialize['dropdown-content']} ${materialize['select-dropdown']} ${materialize['select-dropdown']} ${materialize['multiple-select-dropdown']}`}>
                                      <li className="disabled"><span><input type="checkbox" disabled="" /><label></label>Firmante</span></li>
                                      <li className=""><span><input type="checkbox" /><label></label>Validador</span></li>
                                  </ul>
                                  <select multiple="" data-select-id="1e289437-8b3a-0816-307d-d85fb91e66ac" className="initialized">
                                      <option value="" disabled="" selected="">Firmante</option>
                                      <option value="1">Validador</option>
                                  </select> */}
                                <DropDownListComponent id="rol" dataSource={roles} ref={(dropdownlist) => { listObjRoles = dropdownlist }} fields={roleFields} change={onChange.bind(this)} placeholder="Select a role" value={roleValue} popupHeight="220px" />
                              </div>
                          </div>
                      </td>
                      <td>
                          <div className="select-wrapper">
                              {/* <span className="caret">▼</span>
                              <input type="text" className="select-dropdown" readonly="true" data-activates="select-options-1e289437-8b3a-0816-307d-d85fb91e66ac" value="Tipo de Firma"/>
                              <ul id="select-options-1e289437-8b3a-0816-307d-d85fb91e66ac" className="dropdown-content select-dropdown multiple-select-dropdown">
                                  <li className="disabled"><span><input type="checkbox" disabled=""/><label></label>Firmante</span></li>
                                  <li className=""><span><input type="checkbox"/><label></label>Validador</span></li>
                              </ul>
                              <select multiple="" data-select-id="1e289437-8b3a-0816-307d-d85fb91e66ac" className="initialized">
                                  <option value="" disabled="" selected="">Firma avanzada</option>
                                  <option value="1">Certificado electrónico</option>
                              </select> */}
                            <DropDownListComponent id="signatureType" dataSource={signatureTypes} ref={(dropdownlist) => { listObjectSignTypes = dropdownlist }} fields={signTypesFields} change={onChange.bind(this)} placeholder="Select a type of signature" value={signTypeValue} popupHeight="220px" />
                          </div>
                      </td>
                      <td>
                          <div className="select-wrapper left s3">
                              {/* <span className="caret">▼</span>
                              <input className="text" className="select-dropdown" readonly="true" data-activates="select-options-1e289437-8b3a-0816-307d-d85fb91e66ac" value="Doble autenticación"/>
                              <ul id="select-options-1e289437-8b3a-0816-307d-d85fb91e66ac" className="dropdown-content select-dropdown multiple-select-dropdown">
                                  <li className="disabled"><span><input type="checkbox" disabled=""/><label></label>Foto</span></li>
                                  <li className=""><span><input type="checkbox"/><label></label>SMS</span></li>
                                  <li className=""><span><input type="checkbox"/><label></label>NO</span></li>
                              </ul>
                              <select multiple="" data-select-id="1e289437-8b3a-0816-307d-d85fb91e66ac" className="initialized">
                                  <option value="" disabled="" selected="">Foto</option>
                                  <option value="1">SMS</option>
                                  <option value="1">No</option>
                              </select> */}
                            <DropDownListComponent id="doubleAuth" dataSource={doubleAuth} ref={(dropdownlist) => { listObjectDoubleAuth = dropdownlist }} fields={dobleAuthFields} change={onChange.bind(this)} placeholder="Select a double authentication method" value={dobleAuthValue} popupHeight="220px" />
                          </div>
                      </td>
  
                      <td>
                          <a className="tooltipped" data-position="bottom" data-delay="50" data-tooltip="Número de fotos adjuntas" data-tooltip-id="tooltip1">  Número de fotos <span className="lf-icon-information"></span></a>
                      </td>
  
                      <td>
                          <div className="select-wrapper left s3">
                              <span className="caret">▼</span>
                              <input type="text" className="select-dropdown" readonly="true" data-activates="select-options-1e289437-8b3a-0816-307d-d85fb91e66ac" value="Num. de fotos"/>
                              <ul id="select-options-1e289437-8b3a-0816-307d-d85fb91e66ac" className="dropdown-content select-dropdown multiple-select-dropdown">
                                  <li className="disabled"><span><input type="checkbox" disabled=""/><label></label>1</span></li>
                                  <li className=""><span><input type="checkbox"/><label></label>2</span></li>
                                  <li className=""><span><input type="checkbox"/><label></label>3</span></li>
                              </ul>
                              <select multiple="" data-select-id="1e289437-8b3a-0816-307d-d85fb91e66ac" className="initialized">
                                  <option value="" disabled="" selected="">1</option>
                                  <option value="1">2</option>
                                  <option value="1">3</option>
                              </select>
                          </div>
                      </td>
                    </tr>
                    );
                  })}
                  
                  {/* <tr>
                      <td className="name"><input placeholder="Juan López García" id="first_name" type="text" /></td>
                      <td><input placeholder="juanlopez@email.com" id="email" type="text" readonly /></td>
                      <td>
                          <div className="input-field col s5">
                              <div className="select-wrapper">
                                  <span className="caret">▼</span>
                                  <input type="text" className="select-dropdown" readonly="true" data-activates="select-options-1e289437-8b3a-0816-307d-d85fb91e66ac" value="Rol"/>
                                  <ul id="select-options-1e289437-8b3a-0816-307d-d85fb91e66ac" className="dropdown-content select-dropdown multiple-select-dropdown">
                                      <li className="disabled"><span><input type="checkbox" disabled=""/><label></label>Firmante</span></li>
                                      <li className=""><span><input type="checkbox"/><label></label>Validador</span></li>
                                  </ul>
                                  <select multiple="" data-select-id="1e289437-8b3a-0816-307d-d85fb91e66ac" className="initialized">
                                      <option value="" disabled="" selected="">Firmante</option>
                                      <option value="1">Validador</option>
                                  </select>
                              </div>
                          </div>
                      </td>
                      <td>
                          <div className="select-wrapper">
                              <span className="caret">▼</span>
                              <input type="text" className="select-dropdown" readonly="true" data-activates="select-options-1e289437-8b3a-0816-307d-d85fb91e66ac" value="Tipo de Firma"/>
                              <ul id="select-options-1e289437-8b3a-0816-307d-d85fb91e66ac" className="dropdown-content select-dropdown multiple-select-dropdown">
                                  <li className="disabled"><span><input type="checkbox" disabled=""/><label></label>Firmante</span></li>
                                  <li className=""><span><input type="checkbox"/><label></label>Validador</span></li>
                              </ul>
                              <select multiple="" data-select-id="1e289437-8b3a-0816-307d-d85fb91e66ac" className="initialized">
                                  <option value="" disabled="" selected="">Firma avanzada</option>
                                  <option value="1">Certificado electrónico</option>
                              </select>
                          </div>
                      </td>
                      <td>
                          <div className="select-wrapper left s3">
                              <span className="caret">▼</span>
                              <input type="text" className="select-dropdown" readonly="true" data-activates="select-options-1e289437-8b3a-0816-307d-d85fb91e66ac" value="Doble autenticación"/>
                              <ul id="select-options-1e289437-8b3a-0816-307d-d85fb91e66ac" className="dropdown-content select-dropdown multiple-select-dropdown">
                                  <li className="disabled"><span><input type="checkbox" disabled=""/><label></label>Foto</span></li>
                                  <li className=""><span><input type="checkbox"/><label></label>SMS</span></li>
                                  <li className=""><span><input type="checkbox"/><label></label>NO</span></li>
                              </ul>
                              <select multiple="" data-select-id="1e289437-8b3a-0816-307d-d85fb91e66ac" className="initialized">
                                  <option value="" disabled="" selected="">Foto</option>
                                  <option value="1">SMS</option>
                                  <option value="1">No</option>
                              </select>
                          </div>
                      </td>
                      <td>
                          <a className="tooltipped" data-position="bottom" data-delay="50" data-tooltip="Número de teléfono que recibirá el PIN" data-tooltip-id="tooltip1">  Número de teléfono <span className="lf-icon-information"></span></a>
                      </td>
  
                      <td>
                          <input id="tel" type="text" />
                      </td>
                  </tr>
                  <tr>
                      <td className="name"><input placeholder="Juan López García" id="first_name" type="text" /></td>
                      <td><input placeholder="juanlopez@email.com" id="email" type="text" readonly /></td>
                      <td>
                          <div className="input-field col s5">
                              <div className="select-wrapper">
                                  <span className="caret">▼</span>
                                  <input type="text" className="select-dropdown" readonly="true" data-activates="select-options-1e289437-8b3a-0816-307d-d85fb91e66ac" value="Rol"/>
                                  <ul id="select-options-1e289437-8b3a-0816-307d-d85fb91e66ac" className="dropdown-content select-dropdown multiple-select-dropdown">
                                      <li className="disabled"><span><input type="checkbox" disabled=""/><label></label>Firmante</span></li>
                                      <li className=""><span><input type="checkbox"/><label></label>Validador</span></li>
                                  </ul>
                                  <select multiple="" data-select-id="1e289437-8b3a-0816-307d-d85fb91e66ac" className="initialized">
                                      <option value="" disabled="" selected="">Firmante</option>
                                      <option value="1">Validador</option>
                                  </select>
                              </div>
                          </div>
                      </td>
                      <td>
                          <div className="select-wrapper">
                              <span className="caret">▼</span>
                              <input type="text" className="select-dropdown" readonly="true" data-activates="select-options-1e289437-8b3a-0816-307d-d85fb91e66ac" value="Tipo de firma"/>
                              <ul id="select-options-1e289437-8b3a-0816-307d-d85fb91e66ac" className="dropdown-content select-dropdown multiple-select-dropdown">
                                  <li className="disabled"><span><input type="checkbox" disabled=""/><label></label>Firmante</span></li>
                                  <li className=""><span><input type="checkbox"/><label></label>Validador</span></li>
                              </ul>
                              <select multiple="" data-select-id="1e289437-8b3a-0816-307d-d85fb91e66ac" className="initialized">
                                  <option value="" disabled="" selected="">Firma avanzada</option>
                                  <option value="1">Certificado electrónico</option>
                              </select>
                          </div>
                      </td>
                      <td>
  
                      </td>
                      <td>
  
                      </td>
  
                      <td>
  
                      </td>
                  </tr> */}
  
              </table>
              <div className="center-align"><button className="btn-gen modal-trigger" href="#demo-modal">FINALIZAR</button></div>
          </div>
      </div>
  
    );
  }
  
  export default RolSelector2;