import * as React from 'react';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { ListViewComponent } from '@syncfusion/ej2-react-lists';
import { addAcl, listAcl, deleteAcl } from '../../../../api/calendar-api';
import { TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { ComboBoxComponent } from '@syncfusion/ej2-react-dropdowns';
import { ToastComponent } from '@syncfusion/ej2-react-notifications';
import { NumericTextBoxComponent } from '@syncfusion/ej2-react-inputs';
import i18n from 'i18next';
import './reminder.scss';

export class Reminder extends React.Component {
  constructor(props) {
    super(props);
    this.temp = 'roleData';
    this.fields = { text: 'Text', value: 'Id', minutesvalue : '0' };
    this.value = 'minutes';
    this.fieldsList = { text: 'title', iconCss: 'icon' };
    this.onAddReminder = this.onAddReminder.bind(this);
    this.dataSource = [];

    this.datetimeData = [
      { Id: '1', Text: 'Minutes', Value: '60' },
      { Id: '2', Text: 'Hours', Value: '60' },
      { Id: '3', Text: 'Days', Value: '60' },
      { Id: '4', Text: 'Weeks', Value: '60' },
    ];

    // this.dataSource = this.props.reminders

    //this.dataSource =
    //[
    //    {
    //        title: 'hello',
    //        value: 'world',
    //        id: "n",
    //        icon: "delete-icon"
    //    }
    //]
    }


    onAddReminder(args) {   
        let valueM = this.timeLogicTypetoMinutes(this.ReminType.value, this.numObj.value);
        

    let dataReminder = {
      title: "email",
        value: valueM,
        minutesvalue: valueM,
      id: 'n',
      icon: 'delete-icon',
    };
    this.listviewInstance.addItem([dataReminder]);
  }

  deleteItem(args) {
    args.stopPropagation();
    let liItem = args.target.parentElement.parentElement;
    this.listviewInstance.removeItem(liItem);
  }

  onChange() {
    //let value = document.getElementById('value');
    //let text = document.getElementById('text');
      switch (this.ReminType.value) {
          case '1':
              //minutes
              this.numObj.max = 40320;
              return
          case '2':  
              //hours
              this.numObj.max = 672;
              return
          case '3':   
              //days
              this.numObj.max = 28;
              return
          case '4':
              //weeks
              this.numObj.max = 4;
              return
          default:  
              this.numObj.max = 40320;
      }  
      

  }

    componentDidUpdate(prevProps, prevState) {   
        this.ReminType.value="1"
        if (prevProps.reminders !== this.props.reminders) {
            this.listviewInstance.dataSource = []
        setTimeout(() => {
            if (this.props.reminders.length > 0) {
                const items = this.props.reminders;
                this.listviewInstance.addItem(items);
            }           
      });
    }
    }

    timeLogicTypetoMinutes(type, value) {
        switch (type) {
            case '1':
                return value
            case '2':
                //hours to minutes
                return value * 60;

            case '3':
                //days to minutes
                return value * 1440

            case '4':
                //weeks to minutes
                return value * 10080

        }

    }

    timeMinutestoLogicType(time) { 
       
        if (time / 24 / 60 / 7 >= 1 && Number.isInteger(time / 24 / 60 / 7 )) {                 
                return time / 24 / 60 / 7 + " weeks";
            }

        if (time / 24 / 60 >= 1 && Number.isInteger(time / 24 / 60)) {
                return time / 24 / 60 + " days";
            }

        if (time / 60 % 24 >= 1 && Number.isInteger(time / 60 % 24)) {
           // return time / 60 % 24 + " hours";
            return time / 60 + " hours";
            }
            
        return time  + " " + this.ReminType.text ;  
       
    }

    listTemplate(data) {
        //let value;
        //if (this.ReminType.value == 1) {
          let  value = this.timeMinutestoLogicType(data.value);
        //}
        //else {
        //    value = data.value + " " + this.ReminType.text ;
        //}
        return (
          <div className='e-list-wrapper'>
            <span className='e-list-content'>
                  {value}
            </span>
            <span className='delete-icon' onClick={this.deleteItem.bind(this)} />
          </div>
        );
  }

  render() {
    return (
      <div>
           
          <div >
              <ListViewComponent
                  id='reminder-list'
                  dataSource={this.dataSource}
                  fields={this.fieldsList}
                  template={this.listTemplate.bind(this)}
                  ref={(listview) => {
                            this.listviewInstance = listview;
                  }}
              />
          </div>
               
          <div className='row'>
              <div className='col-xs-3 col-sm-3 col-lg-3 col-md-3'>
                            <div className='form-group'>
                                <div className='e-float-input'>
                                    <NumericTextBoxComponent
                                        format=''
                                        value={60}
                                        min='0'
                                        max= '4320'
                                        ref={(nun) => {
                                            this.numObj = nun;
                                        }}></NumericTextBoxComponent>
                                </div>
                                <div id='noError' />
                            </div>
                        </div>
              <div className='col-xs-3 col-sm-3 col-lg-3 col-md-3'>
                            <div className='form-group'>
                                <div className='e-float-input'>
                                    <ComboBoxComponent
                                        id='type'
                                        floatLabelType='None'
                                        dataSource={this.datetimeData}
                                        ref={(combobox) => {
                                            this.ReminType = combobox;
                                        }}
                                        fields={this.fields}
                                        change={this.onChange.bind(this)}
                                        value={this.value}
                                        popupHeight='220px'
                                    />
                                </div>
                                <div id='noError' />
                            </div>
                        </div>
              <div className='col-xs-4 col-sm-4 col-lg-4 col-md-4'>
                            <div className='e-float-input'>
                                <ButtonComponent
                                    cssClass='e-flat e-primary'
                                    floatLabelType='None'
                                    onClick={this.onAddReminder}>
                                    Añadir Recordatorio
                  </ButtonComponent>
                            </div>
                            </div>
          </div>
              
             
        
      </div>
    );
  }
}

export default Reminder;
