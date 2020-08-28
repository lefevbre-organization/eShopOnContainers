import React from 'react';
import PropTypes from "prop-types";
import i18n from 'i18next';
import materialize from '../../../styles/signature/materialize.scss';
import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';

export class RolSelector extends React.Component {
  constructor(props){
    super(props);
    this.roles = [
      { 'Id': 'signer', 'Rol': 'Signer' }, 
      { 'Id': 'validator', 'Rol': 'Validator' }
    ];
    this.roleFields = { text: 'Rol', value: 'Id' };
    this.roleValue = 'signer';
    this.listObject = {};

    this.signatureTypes = [
      {
        'Id': 'advanced', 'Type': 'Advanced Signature' },
      { 'Id': 'certificate', 'Type': 'User Certificate' }
    ];
    this.signTypesFields = {text: 'Type', value: 'Id'};
    this.signTypeValue = 'advanced';
    this.listObjectSignTypes = {};

    this.doubleAuth = [
      { 'Id': 'none', 'Value': 'None' },
      { 'Id': 'sms', 'Value': 'SMS' },
      { 'Id': 'photo', 'Value': 'Photo' }
    ];
    this.dobleAuthFields = { text: 'Value', value: 'Id'};
    this.dobleAuthValue = 'none';
    this.listObjectDoubleAuth = {};
  
    
  }

  render(){
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
                  {this.props.recipients.map( user => {
                    return(
                    <tr>
                      <td className="name"><input placeholder="Nombre" id="first_name" type="text" /></td>
                      <td><input placeholder={`${user}`} id="email" type="text" readonly /></td>
                      <td>
                          <div className="input-field col s5">
                              <div className="select-wrapper">
                                <DropDownListComponent id="rol" dataSource={this.roles} ref={(dropdownlist) => { this.listObject = dropdownlist }} fields={this.roleFields} change={this.onChange.bind(this)} placeholder="Select a role" value={this.roleValue} popupHeight="220px" />
                              </div>
                          </div>
                      </td>
                      <td>
                          <div className="select-wrapper">
                            <DropDownListComponent id="signatureType" dataSource={this.signatureTypes} ref={(dropdownlist) => { this.listObject= dropdownlist }} fields={this.signTypesFields} change={this.onChange.bind(this)} placeholder="Select a type of signature" value={this.signTypeValue} popupHeight="220px" />
                          </div>
                      </td>
                      <td>
                          <div className="select-wrapper left s3">
                            <DropDownListComponent id="doubleAuth" dataSource={this.doubleAuth} ref={(dropdownlist) => { this.listObject = dropdownlist }} fields={this.dobleAuthFields} change={this.onChange.bind(this)} placeholder="Select a double authentication method" value={this.dobleAuthValue} popupHeight="220px" />
                          </div>
                      </td>
                      { (document.getElementById('doubleAuth') && document.getElementById('doubleAuth').value === "Photo") ? 
                        <>
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
                        </>
                      : null
                      }
                      
                    </tr>
                    );
                  })}
              </table>
              <div className="center-align"><button className="btn-gen modal-trigger" href="#demo-modal">FINALIZAR</button></div>
          </div>
      </div>
    );
  }


  onChange(props) {
    //let value = document.getElementById('value');
    debugger;
    let value = document.getElementById('rol').ej2_instances[0]
    //let text = document.getElementById('text');
    // update the text and value property values in property panel based on selected item in DropDownList
    // value.innerHTML = this.listObject.value === null ? 'null' : this.listObject.value.toString();
    // text.innerHTML = this.listObject.text === null ? 'null' : this.listObject.text;
  };
}

export default RolSelector;