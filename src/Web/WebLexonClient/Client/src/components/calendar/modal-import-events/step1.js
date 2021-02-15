import React, { Fragment } from 'react';
import { loadCldr, L10n, setCulture } from '@syncfusion/ej2-base';
import currencies from 'cldr-data/main/es/currencies.json';
import gregorian from 'cldr-data/main/es/ca-gregorian.json';
import numbers from 'cldr-data/main/es/numbers.json';
import timeZoneNames from 'cldr-data/main/es/timeZoneNames.json';
import numberingSystems from 'cldr-data/supplemental/numberingSystems.json';
import weekData from 'cldr-data/supplemental/weekData.json';// To load the culture based first day of week
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

    this.state = {
      typeSelected: 0
    }
    this.companiesFields = { text: 'name', value: 'bbdd'};
    this.calendarsFields = { text: 'summary', value: 'id'}
    this.startDate = new Date;
    this.endDate = new Date;
    this.onChangeType = this.onChangeType.bind(this);
    this.onChangeStartDate = this.onChangeStartDate.bind(this);
    this.onChangeEndDate = this.onChangeEndDate.bind(this);
    this.onCalendarTemplate = this.onCalendarTemplate.bind(this)
  }

  async componentDidMount() {
    window.addEventListener('getContactListResult', this.contactListLoaded);
    window.dispatchEvent(new CustomEvent('getContactList'));
    // Syncfusion component translation
    this.setGlobalization();
  }

  componentWillUnmount() {
    window.removeEventListener('getContactListResult', this.contactListLoaded);
  }

  setGlobalization() {
    if (window.navigator.language.includes("es-")
        || (window.navigator.language === "es")
        || (window.navigator.language === "ca")
        || (window.navigator.language === "ga")
        || (window.navigator.language === "eu")) {
        loadCldr(numberingSystems, gregorian, numbers, timeZoneNames, weekData);
        // const data = await import('../../../syncfusion-resources/calendar-es.json')
        setCulture('es');
        L10n.load({
          'es': {
              'datepicker': { 
               today: 'hoy' 
            }
          }
        });
    }
}

  onChangeType(event) {
    let val = 0;
    switch(event.value) {
      case 'date': val = 0; break;
      case 'all': val = 1; break;
      case 'future': val = 2; break;
    }

    this.setState({typeSelected: val})
    this.props.onChangeType(val);
  }

  onChangeStartDate(event) {
    this.startDate = event.value;
    this.props.onChangeDates(this.startDate, this.endDate);
  }

  onChangeEndDate(event) {
    this.endDate = event.value;
    this.props.onChangeDates(this.startDate, this.endDate);
  }

  onCalendarTemplate(data) {
    console.log(data)
    return (
      <div>
        <span style={{background: data.backgroundColor, padding: '0px 10px 3px', marginRight: '5px' }}>
        </span>
        <span style={{paddingRight: '5px'}}>{data.summary}</span>
      </div>
    );
  }

  render() {
    const { companies, calendars } = this.props;
    return (
      <Fragment>
        <div><p className="ie-title">Añade los eventos que ya tienes planificados en Lex-on a tus calendarios. Decide qué eventos quieres migrar y en qué calendarios deben visualizarse.</p></div>
        <div className="ie-dialogborder">
          <div className="ie-dropwrapper">
            {/* <label htmlFor="companies" className="control-label">Selecciona la base de datos de origen</label> */}
            <DropDownListComponent 
              floatLabelType="Always" 
              id="companies" 
              dataSource={companies}
              fields={this.companiesFields} 
              placeholder="Selecciona la base de datos de origen" 
              popupHeight="220px" 
              change={ (ddbb) => { this.props.onChangeDDBB(ddbb.value); } } />
          </div>
          <div className="ie-dropwrapper">
            <DropDownListComponent 
              floatLabelType="Always"  
              id="calendars" 
              dataSource={calendars} 
              fields={this.calendarsFields} 
              placeholder="Selecciona el calendario de destino" 
              popupHeight="220px"
              itemTemplate={this.onCalendarTemplate} 
              change={ (cal) => { this.props.onChangeCalendar(cal.value); } }
             />
          </div>
          <div className="ie-dateswrapper">
            <div>
              <p>Tipo de evento</p>
              <RadioButtonComponent change={ this.onChangeType } checked={true} label='Fecha' name='eventType' value="date"></RadioButtonComponent>
              <RadioButtonComponent change={ this.onChangeType } label='Todos los eventos' name='eventType' value="all"></RadioButtonComponent>
              <RadioButtonComponent change={ this.onChangeType } label='Eventos futuros' name='eventType' value="future"></RadioButtonComponent>
            </div>
            <div>
              <DatePickerComponent 
                disabled={this.state.typeSelected === 1} 
                format='dd/MM/yyyy' 
                placeholder='Comienzo'
                change={this.onChangeStartDate} 
                value={this.startDate}
                // locale='es'
                floatLabelType='Always'/>
            
            </div>
            <div>
            <DatePickerComponent  
              disabled={this.state.typeSelected === 1} 
              format='dd/MM/yyyy' 
              placeholder='Fin'
              // locale='es'
              change={this.onChangeEndDate} 
              value={this.endDate}
              floatLabelType='Always' />
        
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

          label.e-float-text, .e-float-input label.e-float-text, .e-float-input.e-control-wrapper label.e-float-text {
            font-size: 14px !important;
            font-family: MTTMilano-Medium;
          }

          input[type='radio'] + label:before {
            border: 2px solid #757575;
          }

          .e-calendar, .e-bigger.e-small .e-calendar {
            max-width: 246px !important;
            min-width: 240px !important;
            padding: 0;
          }
          
        `} </style>
      </Fragment>
    );
  }
}



