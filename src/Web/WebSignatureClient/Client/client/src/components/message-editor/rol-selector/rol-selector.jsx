import React from 'react';
import PropTypes from "prop-types";
import i18n from 'i18next';
import materialize from '../../../styles/signature/materialize.scss';
import style from './rol-selector.scss';
import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';

export class RolSelector extends React.Component {
  constructor(props){
    super(props);
    this.roles = [
      { 'Id': 'signer', 'Rol': i18n.t('messageViewer.grid.signer') }, 
      { 'Id': 'validator', 'Rol': i18n.t('messageViewer.grid.validator') }
    ];
    this.roleFields = { text: 'Rol', value: 'Id' };
    this.roleValue = 'signer';
    this.listObject = {};

    this.signatureTypes = [
      {
        'Id': 'advanced', 'Type': i18n.t('messageViewer.grid.advancedSignature') },
      { 'Id': 'certificate', 'Type': i18n.t('messageViewer.grid.userCertificate') }
    ];
    this.signTypesFields = {text: 'Type', value: 'Id'};
    this.signTypeValue = 'advanced';
    this.listObjectSignTypes = {};

    this.doubleAuth = [
      { 'Id': 'none', 'Value': i18n.t('messageViewer.grid.none') },
      { 'Id': 'sms', 'Value': i18n.t('messageViewer.grid.sms') },
      { 'Id': 'photo', 'Value': i18n.t('messageViewer.grid.photo') }
    ];
    this.dobleAuthFields = { text: 'Value', value: 'Id'};
    this.dobleAuthValue = 'none';
    this.listObjectDoubleAuth = {};
  
  }

  render(){
    return (
      <div className="container">
          <div className="contenido-central">
              {/* <p className="title-modal">ROL DE LOS DESTINATARIOS</p> */}
              <table className={style['detail-rol']}>
                  <tr>
                      <th>{i18n.t('messageViewer.grid.name')}</th>
                      <th>{i18n.t('messageViewer.grid.email')}</th>
                      <th>{i18n.t('messageViewer.grid.role')}</th>
                      <th>{i18n.t('messageViewer.grid.signatureType')}</th>
                      <th colspan="3">{i18n.t('messageViewer.grid.doubleAuthentication')}</th>
                  </tr>
                  {this.props.recipients.map( user => {
                    return(
                    <tr>
                      <td className="name">
                        <input className={style['border-input']} 
                        placeholder={i18n.t('messageViewer.grid.name')} 
                        id="first_name" 
                        type="text" />
                      </td>
                      <td>
                        <input 
                         placeholder={`${user}`} 
                         id="email" 
                         type="text" 
                         disabled />
                      </td>
                      <td>
                          <div className="input-field col s5">
                              <div className="select-wrapper">
                                <DropDownListComponent 
                                id="rol" 
                                className={style['border-input']} 
                                dataSource={this.roles} 
                                ref={(dropdownlist) => { this.listObject = dropdownlist }} 
                                fields={this.roleFields} 
                                change={this.onChange.bind(this)} 
                                placeholder="Select a role" 
                                value={this.roleValue} 
                                popupHeight="220px" />
                              </div>
                          </div>
                      </td>
                      <td>
                          <div className="select-wrapper">
                            <DropDownListComponent 
                            id="signatureType" 
                            dataSource={this.signatureTypes} 
                            ref={(dropdownlist) => { this.listObject= dropdownlist }} 
                            fields={this.signTypesFields} 
                            change={this.onChange.bind(this)} 
                            placeholder="Select a type of signature" 
                            value={this.signTypeValue} 
                            popupHeight="220px" />
                          </div>
                      </td>
                      <td>
                          <div className="select-wrapper left s3">
                            <DropDownListComponent 
                            id="doubleAuth" 
                            dataSource={this.doubleAuth} 
                            ref={(dropdownlist) => { this.listObject = dropdownlist }} 
                            fields={this.dobleAuthFields} 
                            change={this.onChange.bind(this)} 
                            placeholder="Select a double authentication method"
                            value={this.dobleAuthValue} popupHeight="220px" />
                          </div>
                      </td>
                      { (document.getElementById('doubleAuth') 
                      && document.getElementById('doubleAuth').id === "photo") ? 
                        <>
                        <td>
                            <a className="tooltipped" 
                             data-position="bottom" 
                             data-delay="50" 
                             data-tooltip="Número de fotos adjuntas" 
                             data-tooltip-id="tooltip1"> {i18n.t('messageViewer.grid.photoNumber')}
                             <span className="lf-icon-information"></span>
                            </a>
                        </td>

                        <td>
                          <div className="select-wrapper left s3">
                            <span className="caret">▼</span>
                              <input 
                              type="text" 
                              className="select-dropdown" 
                              readonly="true" 
                              data-activates="select-options-1e289437-8b3a-0816-307d-d85fb91e66ac" 
                              value="Num. de fotos"
                              />
                              <ul 
                               id="select-options-1e289437-8b3a-0816-307d-d85fb91e66ac" 
                               className="dropdown-content select-dropdown multiple-select-dropdown">
                                  <li className="disabled">
                                    <span>
                                      <input type="checkbox" disabled=""/>
                                      <label></label>1
                                    </span>
                                  </li>
                                  <li className="">
                                    <span>
                                      <input type="checkbox"/>
                                      <label></label>2
                                    </span>
                                  </li>
                                  <li className="">
                                    <span>
                                      <input type="checkbox"/>
                                      <label></label>3
                                    </span>
                                  </li>
                              </ul>
                              <select 
                               multiple="" 
                               data-select-id="1e289437-8b3a-0816-307d-d85fb91e66ac" 
                               className="initialized">
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
              <div className="center-align">
                <button 
                className={style['btn-gen']} 
                href="#demo-modal">{i18n.t('messageViewer.grid.finish')}
                </button>
              </div>
          </div>
          <style jsx global>
          {` 
            .e-input-group:not(.e-float-icon-left):not(.e-float-input)::before, 
            .e-input-group:not(.e-float-icon-left):not(.e-float-input)::after, 
            .e-input-group.e-control-wrapper:not(.e-float-icon-left):not(.e-float-input)::before, 
            .e-input-group.e-control-wrapper:not(.e-float-icon-left):not(.e-float-input)::after
            {
              background: #001970;
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
          `}
        </style>
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