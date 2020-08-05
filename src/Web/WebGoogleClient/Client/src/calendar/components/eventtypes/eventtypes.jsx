import * as React from "react";
import { TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { ButtonComponent, ChangeEventArgs as CheckBoxChange } from '@syncfusion/ej2-react-buttons';
import { ToastComponent } from '@syncfusion/ej2-react-notifications';
import i18n from 'i18next';
import { ListViewComponent } from '@syncfusion/ej2-react-lists';
import { ComboBoxComponent } from '@syncfusion/ej2-react-dropdowns';
import { getEventTypes, addOrUpdateEventType, deleteEventType } from "../../../api/accounts";
import { ColorPickerComponent } from '@syncfusion/ej2-react-inputs';
import './eventtypes.scss';


export class Eventtypes extends React.Component {
    constructor(props) {

        super(props);
        this.state = {
            errorName: "",
            errorColor: "",
            color: undefined,
            name:""
        }; 


        this.roundedPaletteColors = {
            'custom1': ['#914150', '#435850', '#b69e70','#5c4b98'
                , '#bc4594', '#d8da62', '#ddc9a2', '#466ab0',
                '#eb9fb3', '#879096', '#dec365', '#68c5c3',]
        };      

       
        this.position = { X: 'Center', Y: 'Bottom' };  
        this.fieldsList = { text: "text", iconCss: "icon", id:"id" };

        //this.eventTypeData = [
        //    { "Id": "1", "Text": "personal", "Color": "#dec365"},
        //    { "Id": "2", "Text": "meeting", "Color": "#ddc9a2"},
        //    { "Id": "3", "Text": "gym", "Color": "#bc4594" }          
        //];

        this.toasts = [
            { content: i18n.t("schedule.toast-processing"), cssClass: 'e-toast-black', icon: '' },
            { content: i18n.t("schedule.toast-process-complete"), cssClass: 'e-toast-black', icon: '' },
            { content: i18n.t("schedule.toast-process-error"), cssClass: 'e-toast-danger', icon: 'e-error toast-icons' }
        ] 
    }

    toastCusAnimation = {
        hide: { duration: '1' },
        show: {  duration: '200' }
    };

    beforeRoundedTileRender(args) {
        args.element.classList.add('e-rounded-palette');
    }

    roundedPaletteChange(args) {
        //var color = this.colorObj.value.substr(0, 7);
      //  this.props.onCalendarColorModify(this.props.id, args.currentValue.hex)
        this.setState({ color: args.currentValue.hex })

    }


    onChange() {
        let value = document.getElementById('value');
        let text = document.getElementById('text');
    }

    listTemplate(data) {
        return (<div className="text-content"> 
            <span Style={`background-color: ${data.Color}; margin-right: 20px`} className='dot'></span>
            {data.Text} 
            <span className="delete-icon" onClick={this.deleteEventTypem.bind(this)} />
            <span className="delete-icon" onClick={this.deleteEventTypem.bind(this)} />
        </div>);
    }  
   
    onAddEventType(args) {

        if (this.TitleTypeEventObj.value == undefined) {
            this.setState({ errorName: 'Dato obligatorio' })
            return
        }
        else {
            this.setState({ errorName: '' })
        }

        if (this.state.color === undefined) {
            this.setState({ errorColor: 'Debe seleccionar un color' })
            return
        }
        else {
            this.setState({ errorColor: '' })
        }
        
      
        let dataEventType = {
            "Text": this.TitleTypeEventObj.value,
            "Color": this.state.color,  
            "Id": "id"
        }

        this.toastObj.timeOut = 10000;
        this.toastObj.showProgressBar = true;
        this.toastObj.show(this.toasts[0]);
        addOrUpdateEventType("", "", dataEventType)
            .then(result => {

                this.toastObj.hide('All');
                this.toastObj.showProgressBar = false;
                this.toastObj.timeOut = 1000;
                this.toastObj.show(this.toasts[1]);


                //let dataEventTypeTemplate = {
                //    Test: this.TitleTypeEventObj.value,
                //    Color: this.state.color,
                //    Id: "id"                                  
                //};
                this.listEventType.addItem([dataEventType]);

            })
            .catch(error => {
                console.log('error ->', error);
                if (this.toastObj != undefined) {
                    this.toastObj.showProgressBar = false;
                    this.toastObj.hide('All');
                    this.toastObj.timeOut = 1000;
                    this.toastObj.show(this.toasts[2]);
                }

            });
    }

    deleteEventTypem(args) {
        args.stopPropagation();
        let liItem = args.target.parentElement.parentElement;
        this.listEventType.removeItem(liItem);
       

        //this.toastObj.timeOut = 10000;
        //this.toastObj.showProgressBar = true
        //this.toastObj.show(this.toasts[0]);
        //deleteEventType(this.state.calendarid, liItem.dataset.uid)
        //    .then(result => {
        //        this.toastObj.hide('All');
        //        this.toastObj.showProgressBar = false
        //        this.toastObj.timeOut = 1000;
        //        this.toastObj.show(this.toasts[1]);
        //        this.listEventType.removeItem(liItem);
        //    })
        //    .catch(error => {
        //        console.log('error ->', error);
        //        if (this.toastObj != undefined) {
        //            this.toastObj.showProgressBar = false;
        //            this.toastObj.hide('All');
        //            this.toastObj.timeOut = 1000;
        //            this.toastObj.show(this.toasts[2]);
        //        }
        //    });

    }

    onChange() {
        let value = document.getElementById('value');
        let text = document.getElementById('text');
    }

    componentDidMount() {  

        //let dataEventTypeTemplate = {
        //    text: this.TitleTypeEventObj.value,
        //    color: this.colorObj.value,
        //    id: "id",
        //    iconDelete: "delete-icon"
        //};
        //this.listEventType.addItem([dataEventTypeTemplate]);

        //this.colorObj.value ="#914150"
            //getEventTypes("id","account")
            //    .then(result => {
            //        this.nameObj.value = result.summary;
            //        if (result.description !== undefined) {
            //            this.descriptionObj.value = result.description;
            //        }
            //    })
            //    .catch(error => {
            //        console.log('error ->', error);
            //    });           
       
    }

    render() {      

        return (
            <div className="row custom-margin custom-padding-5 material2">
                <div className="col-xs-12 col-sm-12 col-lg-12 col-md-12">
                    <div className="form-group">
                        <div className="e-float-input">
                           <TextBoxComponent
                              required= 'true'
                              id='name'
                              placeholder={i18n.t("eventtype.name")}
                              floatLabelType="Always"
                              ref={(scope) => { this.TitleTypeEventObj = scope }}
                            />
                        </div>
                        <div id="nameError">{this.state.errorName}</div>
                    </div> 
                    <div className="form-group">
                        <div className="e-float-input">
                            <div className='e-rounded-wrap'>
                                <ColorPickerComponent id='rounded-palette' value={this.state.color} mode='Palette' ref={(scope) => { this.colorObj = scope; }} modeSwitcher={false} inline={true} showButtons={false} columns={4} presetColors={this.roundedPaletteColors} beforeTileRender={this.beforeRoundedTileRender.bind(this)} change={this.roundedPaletteChange.bind(this)}></ColorPickerComponent>
                            </div> 
                            </div>
                            <div id="nameColor">{this.state.errorColor}</div>
                    </div> 
                       
                        {/*<div className="col-xs-2 col-sm-2 col-lg-2 col-md-2">
                            <div className="e-float-input buttonadd">
                                <ButtonComponent
                                    cssClass='e-flat e-primary'
                                    floatLabelType="Always"
                                    onClick={this.onAddPermission}
                                >Add</ButtonComponent>
                            </div>
                        </div>*/}
                  
                    <ListViewComponent
                        id="sample-list"
                        dataSource={this.eventTypeData}
                        fields={this.fieldsList}
                        template={this.listTemplate.bind(this)} ref={listview => {
                            this.listEventType = listview;
                        }} />

                    <div className="e-footer-content">                       
                        <ButtonComponent
                           id="add"
                           //disabled={this.state.buttonDisabled}
                           cssClass='e-control e-btn e-lib e-primary e-event-save e-flat'
                            onClick={this.onAddEventType.bind(this)}
                           ref={(scope) => { this.addBtn = scope }}
                        > {i18n.t("eventtype.add")}</ButtonComponent> 

                        <ButtonComponent
                            id="cancel"
                            //disabled={this.state.buttonDisabled}
                            cssClass='e-control e-btn e-lib e-event-cancel e-flat'
                            onClick={this.onAddEventType.bind(this)}
                            ref={(scope) => { this.addBtn = scope }}
                        > {i18n.t("eventtype.cancel")}</ButtonComponent> 
                    </div>

                    <ToastComponent ref={(toast) => { this.toastObj = toast; }}
                        id='toast_pos'
                        content='Action successfully completed.'
                        position={this.position}
                        target={this.target}
                        animation={this.toastCusAnimation}
                        timeOut={1000}
                    >
                    </ToastComponent>
                </div>
            </div>
        )
    }
}

export default Eventtypes;




