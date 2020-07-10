import * as React from "react";
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { ListViewComponent } from '@syncfusion/ej2-react-lists';
import { addAcl, listAcl, deleteAcl } from "../../../../api/calendar-api";
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
        this.fields = { text: 'Text', value: 'Id' };
        this.value = "minutes";
        this.fieldsList = { title: "text", iconCss: "icon" };
        this.onAddReminder = this.onAddReminder.bind(this);   
        

        this.datetimeData = [
            { "Id": "1", "Text": "Minutes", "Value": "60"},
            { "Id": "2", "Text": "Hours", "Value": "60"},
            { "Id": "3", "Text": "Days", "Value": "60"},
            { "Id": "4", "Text": "Weeks", "Value": "60"}
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
        let dataReminder = {
            title: this.typeObj.value,
            value: this.numObj.value,
            id: "n",
            icon: "delete-icon"
        };
        this.listviewInstance.addItem([dataReminder]);           
    }

    deleteItem(args) {
        args.stopPropagation();
        let liItem = args.target.parentElement.parentElement;           
        this.listviewInstance.removeItem(liItem); 
    }

    onChange() {
        let value = document.getElementById('value');
        let text = document.getElementById('text');
    }

       
    listTemplate(data) {   
        return (<div className="text-content">    
            {data.title} ({data.value})
         <span className="delete-icon" onClick={this.deleteItem.bind(this)} />   
        </div>);
    }   

    //componentDidUpdate(prevProps, prevState) {
       
    //    this.listviewInstance.dataSource = this.props.reminders;
    //    this.listviewInstance.dataBind();
    //}

   render() {
        return (<div>
            <ListViewComponent
                id="reminder-list"
                dataSource={this.props.reminders}
                fields={this.fieldsList}
                template={this.listTemplate.bind(this)} ref={listview => {
                    this.listviewInstance = listview;
                }} />

            <div className="row">                
                <div className="col-xs-2 col-sm-2 col-lg-2 col-md-2">
                    <div className="form-group">
                        <div className="e-float-input">
                            <NumericTextBoxComponent
                                format=''
                                value={60}
                                ref={(nun) => { this.numObj = nun; }}>
                            </NumericTextBoxComponent>
                        </div>
                        <div id="noError" />
                    </div>
                </div>
                <div className="col-xs-4 col-sm-4 col-lg-4 col-md-4">
                    <div className="form-group">
                        <div className="e-float-input">
                            <ComboBoxComponent
                                id="type"
                                floatLabelType="None"
                                dataSource={this.datetimeData}
                                ref={(combobox) => { this.typeObj = combobox; }}
                                fields={this.fields}
                                change={this.onChange.bind(this)}                               
                                value={this.value}
                                popupHeight="220px" />
                        </div>
                        <div id="noError" />
                    </div>
                </div>
                <div className="col-xs-6 col-sm-6 col-lg-6 col-md-6">
                    <div className="e-float-input">
                        <ButtonComponent
                            cssClass='e-flat e-primary'
                            floatLabelType="None"
                            onClick={this.onAddReminder}
                        >Añadir Recordatorio</ButtonComponent>
                    </div>
                </div>
            </div>            
      </div>);
    }
}

export default Reminder;



