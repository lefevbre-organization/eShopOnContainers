import React from 'react';
import { useState } from 'react';
import PropTypes from "prop-types";
import i18n from 'i18next';
import materialize from '../../../styles/signature/materialize.scss';
import style from './rol-selector.scss';
import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';

export class RolSelector extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      newRecipients: [],
      photo: 1,
    }
    this.roles = [
      { 'Id': 'signer', 'Rol': i18n.t('messageEditor.grid.signer') }, 
      { 'Id': 'validator', 'Rol': i18n.t('messageEditor.grid.validator') }
    ];
    this.roleFields = { text: 'Rol', value: 'Id' };
    this.roleValue = 'signer';
    this.listObject = {};

    this.signatureTypes = [
      {
        'Id': 'advanced', 'Type': i18n.t('messageEditor.grid.advancedSignature') },
      { 'Id': 'certificate', 'Type': i18n.t('messageEditor.grid.userCertificate') }
    ];
    this.signTypesFields = {text: 'Type', value: 'Id'};
    this.signTypeValue = 'advanced';
    this.listObjectSignTypes = {};

    this.doubleAuth = [
      { 'Id': 'none', 'Value': i18n.t('messageEditor.grid.none') },
      //{ 'Id': 'sms', 'Value': i18n.t('messageEditor.grid.sms') },
      { 'Id': 'photo', 'Value': i18n.t('messageEditor.grid.photo') }
    ];
    this.dobleAuthFields = { text: 'Value', value: 'Id'};
    this.dobleAuthValue = 'none';
    this.listObjectDoubleAuth = {};
  
  }

  onChange(index, event) {
    console.log('componentDidMount', this.props.recipients);
    console.log('onChange', event, index)
   
    if(event.value == 'none' 
    || event.value == 'sms' 
    || event.value == 'photo'){
      if(this.state.newRecipients.length == 0) {
        let newRecipients = [];
        this.props.recipients.forEach((user, i) => {
          let value = i == index ? event.value : 'none';
          newRecipients.push(
            {
              address: user.address, 
              name: user.name,
              role: (document.getElementById(`rol_${i}`)) ? document.getElementById(`rol_${i}`).ej2_instances[0].itemData.Id : null, 
              signatureType: (document.getElementById(`signatureType_${i}`)) ? document.getElementById(`signatureType_${i}`).ej2_instances[0].itemData.Id : null, 
              doubleAuth: value 
            }
          );
        });
        this.setState({newRecipients: newRecipients});
      } else {
        let newRecipients = this.state.newRecipients;
        newRecipients[index].doubleAuth = event.value
        this.setState({
          newRecipients: newRecipients
        });
      }
    } 
    else if(event.value == 'signer' || event.value == 'validator'){
      if(this.state.newRecipients.length == 0) {
        let newRecipients = [];
        this.props.recipients.forEach((user, i) => {
          let value = i == index ? event.value : 'signer';
          newRecipients.push(
            {
              address: user.address, 
              name: user.name, 
              role: value,
              signatureType: (document.getElementById(`signatureType_${i}`)) ? document.getElementById(`signatureType_${i}`).ej2_instances[0].itemData.Id : null,
              doubleAuth: (document.getElementById(`doubleAuth_${i}`)) ? document.getElementById(`doubleAuth_${i}`).ej2_instances[0].itemData.Id : null 
            });
        });
        this.setState({newRecipients: newRecipients});
      } else {
        let newRecipients = this.state.newRecipients;
        newRecipients[index].role = event.value
        newRecipients[index].signatureType = 'advanced'
        this.setState({
          newRecipients: newRecipients
        });
      }
    }
    else if (event.value == 'advanced' || event.value == 'certificate'){
      if(this.state.newRecipients.length == 0) {
        let newRecipients = [];
        this.props.recipients.forEach((user, i) => {
          let value = i == index ? event.value : 'advanced';
          newRecipients.push(
            {
              address: user.address, 
              name: user.name,
              role: (document.getElementById(`rol_${i}`)) ? document.getElementById(`rol_${i}`).ej2_instances[0].itemData.Id : null,
              signatureType: value,
              doubleAuth: (document.getElementById(`doubleAuth_${i}`)) ? document.getElementById(`doubleAuth_${i}`).ej2_instances[0].itemData.Id : null 
            });
        });
        this.setState({newRecipients: newRecipients});
      } else {
        let newRecipients = this.state.newRecipients;
        console.log(newRecipients);
        newRecipients[index].signatureType = event.value;
        newRecipients[index].doubleAuth = 'none';
        this.setState({
          newRecipients: newRecipients
        });
      }
    }

    //let value = document.getElementById('value');
    // let value = document.getElementById('rol').ej2_instances[0]
    //let text = document.getElementById('text');
    // update the text and value property values in property panel based on selected item in DropDownList
    // value.innerHTML = this.listObject.value === null ? 'null' : this.listObject.value.toString();
    // text.innerHTML = this.listObject.text === null ? 'null' : this.listObject.text;
  }
  
  setPhotos(event) {
    console.log('setPhotos', event.currentTarget.valueAsNumber)
    this.setState({photo: event.currentTarget.valueAsNumber});
  }

  setName(event) {

  }

  gatherInfo(){
    var info = [];  
    var i = 0;

    this.props.recipients.forEach(recipient => {
      var signerInfo = {};
      signerInfo.name = document.getElementById(`first_name_${i}`) ? document.getElementById(`first_name_${i}`).value : null;
      signerInfo.email =  recipient.address;
      signerInfo.role = document.getElementById(`rol_${i}`) ? document.getElementById(`rol_${i}`).ej2_instances[0].itemData.Id : null;
      signerInfo.signatureType = document.getElementById(`signatureType_${i}`) ? document.getElementById(`signatureType_${i}`).ej2_instances[0].itemData.Id : null;
      signerInfo.doubleAuthType = document.getElementById(`doubleAuth_${i}`) ? document.getElementById(`doubleAuth_${i}`).ej2_instances[0].itemData.Id : null;

      switch (signerInfo.doubleAuthType ) {
        case 'none':
          signerInfo.doubleAuthInfo = null
          break;
        case 'photo':
          signerInfo.doubleAuthInfo = document.getElementById(`n_photo_${i}`) ? document.getElementById(`n_photo_${i}`).value : null;
          break;
        case 'sms':
          signerInfo.doubleAuthInfo = document.getElementById(`n_phone_${i}`) ? document.getElementById(`n_phone_${i}`).value : null;
          break;
        default:
          break;
      }
      info.push(signerInfo);
      i+= 1;
    });

    this.props.onFinishRoles(info);
    this.props.dialogClose();
  }

  render(){
    const {photo, newRecipients} = this.state;
   let recipients = newRecipients.length > 0 
   ? newRecipients 
   : this.props.recipients;
    console.log('render', newRecipients);
    return (
      <div id="main-rol-selector" className="container">
          <div className={`${style['table-scrollbar']} mb-3`}>
              {/* <p className="title-modal">ROL DE LOS DESTINATARIOS</p> */}
              <table className={style['detail-rol']}>
                  <thead>
                    <tr>
                        <th>{i18n.t('messageEditor.grid.name')}</th>
                        <th>{i18n.t('messageEditor.grid.email')}</th>
                        <th>{i18n.t('messageEditor.grid.role')}</th>
                        <th>{i18n.t('messageEditor.grid.signatureType')}</th>
                        <th colSpan="3">{i18n.t('messageEditor.grid.doubleAuthentication')}</th>
                    </tr>
                  </thead>
                  <tbody>
                  {recipients.map((user, i) => {
                  return(
                      <tr key={i}>
                        <td className="name">
                          <input className={style['border-input']} 
                          placeholder={i18n.t('messageEditor.grid.name')} 
                          id={`first_name_${i}`} 
                          type="text" 
                          defaultValue={`${newRecipients.length > 0 
                            ? user.name : user.name}`} 
                           />
                        </td>
                        <td>
                          <input 
                           value={`${newRecipients.length > 0 
                            ? user.address : user.address}`} 
                           id={`email_${i}`}
                           className={style['border-input']}
                           type="text" 
                           disabled
                            />
                        </td>
                        <td>
                            <div className="input-field col s5">
                                <div className="select-wrapper">
                                  <DropDownListComponent 
                                  id={`rol_${i}`}
                                  className={style['selector-rol']} 
                                  dataSource={this.roles} 
                                  ref={(dropdownlist) => { this.listObject = dropdownlist }} 
                                  fields={this.roleFields} 
                                  change={this.onChange.bind(this, i)} 
                                  placeholder="Select a role" 
                                  value={this.roleValue} 
                                  popupHeight="220px" />
                                </div>
                            </div>
                        </td>
                        <td>
                          <div className="select-wrapper">
                            <DropDownListComponent 
                            id={`signatureType_${i}`}
                            dataSource={this.signatureTypes} 
                            ref={(dropdownlist) => { this.listObject= dropdownlist }} 
                            fields={this.signTypesFields} 
                            change={this.onChange.bind(this, i)} 
                            placeholder="Select a type of signature" 
                            value={`${newRecipients.length > 0 
                              ? user.signatureType 
                              : this.signTypeValue}`} 
                            popupHeight="220px"
                            enabled={(user.role === 'signer' || user.role === undefined)}
                            />
                          </div>
                        </td>
                        <td>
                            <div className="select-wrapper left s3">
                              <DropDownListComponent 
                              id={`doubleAuth_${i}`}
                              dataSource={this.doubleAuth} 
                              ref={(dropdownlist) => { this.listObject = dropdownlist }} 
                              fields={this.dobleAuthFields} 
                              change={this.onChange.bind(this, i)} 
                              placeholder="Select a double authentication method"
                              value={`${newRecipients.length > 0 
                                ? user.doubleAuth 
                                : this.dobleAuthValue}`} 
                              popupHeight="220px" 
                              enabled={(user.signatureType === 'advanced' || user.signatureType === undefined)}/>
                            </div>
                        </td>
                        { (user.doubleAuth === "photo") ? 
                          <>
                          <td>
                              <a className={style.tooltipped} > 
                               {i18n.t('messageEditor.grid.photoNumber')}
                               <span className={`${style.tooltipped} lf-icon-information`}></span>
                               <span className={style.tooltiptext}>{i18n.t('messageEditor.grid.photoInfo')}</span>
                              
                              </a>
                          </td>
  
                          <td>
                            <div className="select-wrapper left s3">
                            <input 
                             id={`n_photo_${i}`}
                             className={`${style['border-input']} ${style['photo-input']}`} 
                             type="number" 
                             min="1" 
                            //  disabled={option !== 1} 
                             value={photo} 
                             onChange={this.setPhotos.bind(this)}
                            />
                            </div>
                          </td>
                          </>
                        : null
                        }
  
                         { (user.doubleAuth === "sms" ) ? 
                          <>
                          <td>
                              <a className="tooltipped" 
                               data-position="bottom" 
                               data-delay="50" 
                               data-tooltip="phone" 
                               data-tooltip-id="tooltip1"> {i18n.t('messageEditor.grid.phone')}
                               <span className="lf-icon-information"></span>
                              </a>
                          </td>
  
                          <td>
                            <div className="select-wrapper left s3">
                            <input 
                             id={`n_phone_${i}`}
                             className={`${style['border-input']}`} 
                             type="text" 
                            />
                            </div>
                          </td>
                          </>
                        : null
                        }
  
                      { (user.doubleAuth === "none" ) ? 
                          <>
                          <td></td>
                          <td></td>
                          </>
                        : null
                        }
                        
                      </tr>
                    );
                  })}
                  </tbody>
              </table>
          </div>
          <div className="center-align mb-3 action">
            <button 
            className={style['btn-gen']} 
            //href="#demo-modal"
            onClick={this.gatherInfo.bind(this)}>{i18n.t('messageEditor.grid.finish')}
            </button>
          </div>
      </div>
    );
  }


}

export default RolSelector;