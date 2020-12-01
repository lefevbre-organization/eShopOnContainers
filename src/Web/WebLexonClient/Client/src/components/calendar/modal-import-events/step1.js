import React, { Fragment } from 'react';
import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';
import { RadioButtonComponent } from '@syncfusion/ej2-react-buttons';
import { DatePickerComponent } from '@syncfusion/ej2-react-calendars';

import i18n from 'i18next';
import PerfectScrollbar from 'react-perfect-scrollbar';
import _ from 'lodash';

import {getCompanies, getUserContacts} from '../../../services/services-lexon';

export class Step1 extends React.Component {
  constructor(props) {
    super(props);

    this.companiesFields = { text: 'name', value: 'bbdd'};
    this.calendarsFields = { text: 'summary', value: 'id'}
    this.startDate = new Date();
    this.endDate = new Date();
  }

  async componentDidMount() {
    window.addEventListener('getContactListResult', this.contactListLoaded);
    window.dispatchEvent(new CustomEvent('getContactList'));
  }

  componentWillUnmount() {
    window.removeEventListener('getContactListResult', this.contactListLoaded);
  }

  render() {
    const { companies, calendars } = this.props;

    return (
      <Fragment>
        <div><p className="ie-title">Añade los eventos que ya tienes planificados en Lex-on a tus calendarios. Decide qué eventos quieres migrar y en qué calendarios deben visualizarse.</p></div>
        <div className="ie-dialogborder">
          <div className="ie-dropwrapper">
            <p>Selecciona la base de datos de origen</p>
            <DropDownListComponent id="companies" dataSource={companies} fields={this.companiesFields} placeholder="" popupHeight="220px" />
          </div>
          <div className="ie-dropwrapper">
            <p>Selecciona el calendario de destino</p>
            <DropDownListComponent id="calendars" dataSource={calendars} fields={this.calendarsFields} placeholder="" popupHeight="220px" />
          </div>
          <div className="ie-dateswrapper">
            <div>
              <p>Tipo de evento</p>
              <RadioButtonComponent checked={true} label='Fecha' name='eventType' value="date"></RadioButtonComponent>
              <RadioButtonComponent label='Todos los eventos' name='eventType' value="all"></RadioButtonComponent>
              <RadioButtonComponent label='Eventos futuros' name='eventType' value="future"></RadioButtonComponent>
            </div>
            <div>
              <p>Comienzo</p>
              <DatePickerComponent value={this.startDate}></DatePickerComponent>
            </div>
            <div>
              <p>Fin</p>
              <DatePickerComponent value={this.endDate}></DatePickerComponent>
            </div>
          </div>
        </div>
        <style jsx>{`
          p {
            color: #333333;
            font-family: MTTMilano-Medium;
            font-size: 14px;
            font-weight: 500;
            letter-spacing: 0;
            line-height: 19px;
          }
          
          .ie-title {
            text-align: justify;
          }
          
          .ie-dialogborder {
            border: 1px solid #d2d2d2;
            width: 100%;
            height: 389px;
            margin-bottom: 20px;
            padding: 20px;
          }
          
          .ie-buttonwrapper {
            width: 100%;
            text-align: right;
          }
          
          .ie-buttonwrapper > button:first-child {
            margin: 0 20px;
          }
            
          .ie-dropwrapper {
          margin-bottom: 20px;
          }
          
          .ie-dateswrapper {
            padding-top: 20px;
            display: flex;
          }
          
          .ie-dateswrapper > div {
            flex: 1;
            padding: 0 20px;
          }
        `} </style>
      </Fragment>
    );
  }
}



